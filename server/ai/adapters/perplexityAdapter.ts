/**
 * Perplexity Service Adapter
 * 
 * This adapter implements the AIServiceAdapter interface for Perplexity,
 * providing access to Perplexity's models for text generation, chat, and knowledge-based answers.
 */

import { AIServiceAdapter, AIAdapterStatus, AIAdapterMetrics } from './baseAdapter';
import {
  AIChatMessage,
  AIImageGenerationOptions,
  AIRequestOptions,
  AIResponse
} from '../aiTypes';
import { logger } from '../../utils/logger';
import { getConfig } from '../../../config/globalConfig';
import fetch from 'node-fetch';

export interface PerplexityAdapterConfig {
  apiKey?: string;
  baseURL?: string;
  defaultModels?: {
    text?: string;
    chat?: string;
  };
  priority?: number;
}

/**
 * Perplexity adapter implementation
 */
export class PerplexityAdapter implements AIServiceAdapter {
  private baseURL: string;
  private apiKey: string | undefined;
  private config: PerplexityAdapterConfig;
  private status: AIAdapterStatus;
  private metrics: AIAdapterMetrics;

  /**
   * Create a new Perplexity adapter
   * @param config Adapter configuration
   */
  constructor(config: PerplexityAdapterConfig = {}) {
    // Get API key from config or env
    const apiKey = config.apiKey || 
      getConfig().ai?.perplexity?.apiKey || 
      process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
      this.status = {
        available: false,
        error: 'Perplexity API key not found',
        lastChecked: new Date()
      };
      logger.warn('Perplexity adapter initialized without API key');
    } else {
      this.status = {
        available: true,
        lastChecked: new Date()
      };
    }

    // Set base URL
    this.baseURL = config.baseURL || 'https://api.perplexity.ai';
    this.apiKey = apiKey;

    // Store config
    this.config = {
      ...config,
      apiKey,
      defaultModels: {
        text: 'llama-3.1-sonar-small-128k-online',
        chat: 'llama-3.1-sonar-small-128k-online',
        ...config.defaultModels
      },
      priority: config.priority || 60 // Lower than OpenAI and Anthropic
    };

    // Initialize metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      lastUsed: null
    };

    logger.info('Perplexity adapter initialized', {
      available: this.status.available,
      models: this.config.defaultModels
    });
  }

  /**
   * Get current status
   * @returns Adapter status
   */
  getStatus(): AIAdapterStatus {
    return { ...this.status };
  }

  /**
   * Test connection to Perplexity
   * @returns Promise resolving to true if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        this.status = {
          available: false,
          error: 'Perplexity API key not found',
          lastChecked: new Date()
        };
        return false;
      }

      // Simple chat completion to test connection
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.defaultModels?.chat || 'llama-3.1-sonar-small-128k-online',
          messages: [{ role: 'user', content: 'Hello, are you available?' }],
          max_tokens: 10,
          temperature: 0.7,
          stream: false
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.id) {
          this.status = {
            available: true,
            lastChecked: new Date()
          };
          logger.info('Perplexity connection test successful');
          return true;
        } else {
          throw new Error('Invalid response from Perplexity');
        }
      } else {
        throw new Error(`Perplexity API returned status ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.status = {
        available: false,
        error: error instanceof Error ? error.message : String(error),
        lastChecked: new Date()
      };
      logger.error('Perplexity connection test failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  /**
   * Generate text using Perplexity
   * @param prompt Text prompt
   * @param options Request options
   * @returns Promise resolving to generated text
   */
  async generateText(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<string>> {
    return await this.chatCompletion([
      { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
      { role: 'user', content: prompt }
    ], options).then(response => {
      return {
        ...response,
        text: response.text.content
      };
    });
  }

  /**
   * Generate JSON using Perplexity
   * @param prompt Text prompt
   * @param options Request options
   * @returns Promise resolving to generated JSON
   */
  async generateJson<T>(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<T>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Enhance the prompt to request JSON output
      const jsonPrompt = `${prompt}\n\nProvide your response as valid JSON without any explanations or markdown formatting.`;
      
      // Add system message to ensure JSON output
      const systemPrompt = options.systemPrompt || '';
      const jsonSystemPrompt = `${systemPrompt ? systemPrompt + '\n' : ''}You must respond with valid JSON only. No other text, explanations, or markdown.`;
      
      const model = options.model || this.config.defaultModels?.text || 'llama-3.1-sonar-small-128k-online';
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: jsonSystemPrompt },
            { role: 'user', content: jsonPrompt }
          ],
          max_tokens: options.maxTokens,
          temperature: options.temperature || 0.2, // Lower temperature for deterministic JSON
          top_p: 0.9,
          frequency_penalty: 1,
          presence_penalty: 0,
          stream: false,
          return_images: false,
          return_related_questions: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API returned status ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || '';
      
      // Extract JSON from the response
      let jsonResult: T;
      try {
        // Try to parse the entire response as JSON
        jsonResult = JSON.parse(content);
      } catch (parseError) {
        // If that fails, try to extract JSON using regex
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/```\n([\s\S]*?)\n```/) ||
                          content.match(/\{[\s\S]*\}/);
                          
        if (jsonMatch) {
          try {
            jsonResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch (e) {
            throw new Error('Failed to parse JSON from response');
          }
        } else {
          throw new Error('No valid JSON found in response');
        }
      }

      const latency = Date.now() - startTime;
      
      this.updateLatency(latency);
      this.metrics.successfulRequests++;
      this.metrics.lastUsed = new Date();

      return {
        text: jsonResult as T,
        model,
        usage: {
          promptTokens: result.usage?.prompt_tokens || 0,
          completionTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0
        },
        latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metrics.failedRequests++;

      logger.error('Perplexity JSON generation failed', { 
        error: error instanceof Error ? error.message : String(error),
        prompt: prompt.slice(0, 100) // Log only the beginning of the prompt
      });

      throw new Error(`Perplexity JSON generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get embeddings for text - Not supported by Perplexity directly
   * @param text Text to get embeddings for
   * @param options Request options
   * @returns Promise resolving to vector embedding
   */
  async getEmbeddings(text: string, options: AIRequestOptions = {}): Promise<AIResponse<number[]>> {
    throw new Error('Embeddings are not supported by the Perplexity API');
  }

  /**
   * Generate image - Not supported by Perplexity
   * @param options Image generation options
   * @returns Promise resolving to image data
   */
  async generateImage(options: AIImageGenerationOptions): Promise<any> {
    throw new Error('Image generation is not supported by the Perplexity API');
  }

  /**
   * Get chat completion
   * @param messages Chat message history
   * @param options Request options
   * @returns Promise resolving to chat completion
   */
  async chatCompletion(messages: AIChatMessage[], options: AIRequestOptions = {}): Promise<AIResponse<AIChatMessage>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Determine model to use
      const model = options.model || this.config.defaultModels?.chat || 'llama-3.1-sonar-small-128k-online';

      // Perplexity requires alternating user/assistant roles ending with user
      // https://docs.perplexity.ai/reference/post_chat-completions
      
      // First normalize the messages to ensure proper format
      const normalizedMessages = this.normalizeMessages(messages);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: normalizedMessages,
          max_tokens: options.maxTokens,
          temperature: options.temperature,
          top_p: 0.9,
          frequency_penalty: 1,
          presence_penalty: 0,
          search_recency_filter: options.searchRecency || "month",
          stream: false,
          return_images: false,
          return_related_questions: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API returned status ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || '';
      const latency = Date.now() - startTime;
      
      this.updateLatency(latency);
      this.metrics.successfulRequests++;
      this.metrics.lastUsed = new Date();

      // Format response in standard format
      const chatMessage: AIChatMessage = {
        role: 'assistant',
        content: content,
        name: 'perplexity'
      };

      // Include citations if available
      if (result.citations && result.citations.length > 0) {
        chatMessage.citations = result.citations;
      }

      return {
        text: chatMessage,
        model,
        usage: {
          promptTokens: result.usage?.prompt_tokens || 0,
          completionTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0
        },
        latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metrics.failedRequests++;

      logger.error('Perplexity chat completion failed', { 
        error: error instanceof Error ? error.message : String(error),
        messages: messages.slice(0, 2) // Log only the first few messages
      });

      throw new Error(`Perplexity chat completion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get performance metrics
   * @returns Adapter metrics
   */
  getMetrics(): AIAdapterMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      lastUsed: null
    };
  }

  /**
   * Update average latency calculation
   * @param latency New latency value in milliseconds
   */
  private updateLatency(latency: number): void {
    if (this.metrics.totalRequests <= 1) {
      this.metrics.averageLatency = latency;
    } else {
      // Calculate running average
      const totalResponsesUsed = this.metrics.successfulRequests + this.metrics.failedRequests;
      this.metrics.averageLatency = 
        (this.metrics.averageLatency * (totalResponsesUsed - 1) + latency) / totalResponsesUsed;
    }
  }

  /**
   * Normalize messages for Perplexity API
   * Perplexity has specific requirements:
   * - After the (optional) system message, user and assistant roles MUST alternate with `user` then `assistant`
   * - Messages array MUST end with a `user` message
   * 
   * @param messages Array of chat messages
   * @returns Normalized array of messages for Perplexity
   */
  private normalizeMessages(messages: AIChatMessage[]): Array<{role: string, content: string}> {
    // Extract system messages
    const systemMessages = messages.filter(msg => msg.role === 'system');
    
    // Start with a system message if present
    const normalizedMessages: Array<{role: string, content: string}> = [];
    
    if (systemMessages.length > 0) {
      normalizedMessages.push({
        role: 'system',
        content: systemMessages.map(msg => msg.content).join('\n')
      });
    }
    
    // Filter out system messages and process user/assistant messages
    const userAssistantMessages = messages.filter(msg => msg.role !== 'system');
    
    // Ensure alternating user/assistant pattern ending with user
    let expectedRole = 'user';
    let pendingUserMessage = '';
    let pendingAssistantMessage = '';
    
    for (const msg of userAssistantMessages) {
      if (msg.role === 'user') {
        if (expectedRole === 'assistant' && pendingAssistantMessage) {
          normalizedMessages.push({
            role: 'assistant',
            content: pendingAssistantMessage
          });
          pendingAssistantMessage = '';
        }
        
        pendingUserMessage = pendingUserMessage 
          ? `${pendingUserMessage}\n\n${msg.content}` 
          : msg.content;
        
        expectedRole = 'assistant';
      } else if (msg.role === 'assistant') {
        if (expectedRole === 'user' && pendingUserMessage) {
          normalizedMessages.push({
            role: 'user',
            content: pendingUserMessage
          });
          pendingUserMessage = '';
        }
        
        pendingAssistantMessage = pendingAssistantMessage 
          ? `${pendingAssistantMessage}\n\n${msg.content}` 
          : msg.content;
        
        expectedRole = 'user';
      }
    }
    
    // Add any pending assistant message
    if (pendingAssistantMessage) {
      normalizedMessages.push({
        role: 'assistant',
        content: pendingAssistantMessage
      });
    }
    
    // Add any pending user message
    if (pendingUserMessage) {
      normalizedMessages.push({
        role: 'user',
        content: pendingUserMessage
      });
    }
    
    // If the last message is not from a user, add a user prompt to satisfy Perplexity's requirements
    if (normalizedMessages.length === 0 || normalizedMessages[normalizedMessages.length - 1].role !== 'user') {
      normalizedMessages.push({
        role: 'user',
        content: 'Please continue.'
      });
    }
    
    return normalizedMessages;
  }
}