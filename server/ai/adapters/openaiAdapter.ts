
import OpenAI from 'openai';
import { AIServiceAdapter, AIRequestOptions, AIResponse } from './baseAdapter';
import { ServiceRegistry } from '../../services/registry';

export class OpenAIAdapter implements AIServiceAdapter {
  private client: OpenAI;
  private apiKey: string;
  private available: boolean = false;
  private lastCheck: Date | null = null;
  
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.client = new OpenAI({
      apiKey: this.apiKey
    });
    
    // Register self in the service registry
    const registry = ServiceRegistry.getInstance();
    registry.registerService('ai:openai', this);
    
    // Test connection on initialization
    this.testConnection().then(available => {
      this.available = available;
      console.log(`OpenAI adapter availability: ${available}`);
    });
  }
  
  async generateText(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<string>> {
    const startTime = Date.now();
    
    const defaultOptions = {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 500
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
      const response = await this.client.chat.completions.create({
        model: mergedOptions.model,
        messages: [
          ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
          { role: "user", content: prompt }
        ],
        temperature: mergedOptions.temperature,
        max_tokens: mergedOptions.maxTokens,
        ...(options.responseFormat === 'json' ? { response_format: { type: "json_object" } } : {})
      });
      
      return {
        content: response.choices[0]?.message?.content || '',
        metadata: {
          model: mergedOptions.model,
          processingTime: Date.now() - startTime,
          tokenCount: {
            input: response.usage?.prompt_tokens || 0,
            output: response.usage?.completion_tokens || 0,
            total: response.usage?.total_tokens || 0
          },
          provider: 'openai'
        }
      };
    } catch (error) {
      console.error('OpenAI adapter error:', error);
      throw new Error(`OpenAI service failed: ${error.message}`);
    }
  }
  
  async generateJson<T>(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<T>> {
    const jsonOptions = {
      ...options,
      responseFormat: 'json' as const,
      systemPrompt: options.systemPrompt || 'You must respond with valid JSON only, no other text.'
    };
    
    const response = await this.generateText(prompt, jsonOptions);
    
    try {
      const jsonContent = JSON.parse(response.content) as T;
      return {
        ...response,
        content: jsonContent
      };
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error.message}`);
    }
  }
  
  async testConnection(): Promise<boolean> {
    try {
      if (!this.apiKey || this.apiKey === '') {
        console.log('OpenAI API key not configured');
        this.available = false;
        this.lastCheck = new Date();
        return false;
      }
      
      const response = await this.generateText('Test connection to OpenAI API. Respond with "OK".', {
        maxTokens: 10,
        temperature: 0.1
      });
      
      this.available = true;
      this.lastCheck = new Date();
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      this.available = false;
      this.lastCheck = new Date();
      return false;
    }
  }
  
  getStatus() {
    return {
      available: this.available,
      name: 'OpenAI',
      priority: 2, // Secondary provider
      lastCheck: this.lastCheck || undefined
    };
  }
}
