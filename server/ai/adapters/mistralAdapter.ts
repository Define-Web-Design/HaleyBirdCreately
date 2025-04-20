
import { MistralClient } from '@mistralai/mistralai';
import { AIServiceAdapter, AIRequestOptions, AIResponse } from './baseAdapter';
import { ServiceRegistry } from '../../services/registry';

export class MistralAdapter implements AIServiceAdapter {
  private client: MistralClient;
  private apiKey: string;
  private available: boolean = false;
  private lastCheck: Date | null = null;
  
  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY || '';
    this.client = new MistralClient(this.apiKey);
    
    // Register self in the service registry
    const registry = ServiceRegistry.getInstance();
    registry.registerService('ai:mistral', this);
    
    // Test connection on initialization
    this.testConnection().then(available => {
      this.available = available;
      console.log(`Mistral adapter availability: ${available}`);
    });
  }
  
  async generateText(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<string>> {
    const startTime = Date.now();
    
    const defaultOptions = {
      model: 'mistral-large-latest',
      temperature: 0.7,
      maxTokens: 500
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
      const messages = [
        ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
        { role: 'user' as const, content: prompt }
      ];
      
      const response = await this.client.chat({
        model: mergedOptions.model,
        messages: messages,
        temperature: mergedOptions.temperature,
        maxTokens: mergedOptions.maxTokens
      });
      
      return {
        content: response.choices[0]?.message?.content || '',
        metadata: {
          model: mergedOptions.model,
          processingTime: Date.now() - startTime,
          tokenCount: {
            input: response.usage?.promptTokens || 0,
            output: response.usage?.completionTokens || 0,
            total: response.usage?.totalTokens || 0
          },
          provider: 'mistral'
        }
      };
    } catch (error) {
      console.error('Mistral adapter error:', error);
      throw new Error(`Mistral service failed: ${error.message}`);
    }
  }
  
  async generateJson<T>(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse<T>> {
    const jsonOptions = {
      ...options,
      systemPrompt: options.systemPrompt 
        ? `${options.systemPrompt}\nYou must respond with valid JSON only, no other text.`
        : 'You must respond with valid JSON only, no other text.'
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
        console.log('Mistral API key not configured');
        this.available = false;
        this.lastCheck = new Date();
        return false;
      }
      
      const response = await this.generateText('Test connection to Mistral API. Respond with "OK".', {
        maxTokens: 10,
        temperature: 0.1
      });
      
      this.available = true;
      this.lastCheck = new Date();
      return true;
    } catch (error) {
      console.error('Mistral connection test failed:', error);
      this.available = false;
      this.lastCheck = new Date();
      return false;
    }
  }
  
  getStatus() {
    return {
      available: this.available,
      name: 'Mistral AI',
      priority: 1, // Primary provider
      lastCheck: this.lastCheck || undefined
    };
  }
}
