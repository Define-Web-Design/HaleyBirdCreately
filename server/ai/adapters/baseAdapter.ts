
/**
 * Base Adapter Interface for AI Services
 * 
 * This defines the common interface that all AI service adapters must implement,
 * enabling seamless switching between different AI providers.
 */

export interface AIModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface AIRequestOptions extends AIModelConfig {
  systemPrompt?: string;
  responseFormat?: 'text' | 'json';
}

export interface AIResponse<T = any> {
  content: T;
  metadata: {
    model: string;
    processingTime: number;
    tokenCount?: {
      input: number;
      output: number;
      total: number;
    };
    provider: string;
  };
}

export interface AIServiceAdapter {
  /**
   * Generate text completion from the AI model
   */
  generateText(prompt: string, options?: AIRequestOptions): Promise<AIResponse<string>>;
  
  /**
   * Generate structured JSON data from the AI model
   */
  generateJson<T>(prompt: string, options?: AIRequestOptions): Promise<AIResponse<T>>;
  
  /**
   * Check if the service is available and working
   */
  testConnection(): Promise<boolean>;
  
  /**
   * Get the status of this adapter
   */
  getStatus(): {
    available: boolean;
    name: string;
    priority: number;
    lastCheck?: Date;
  };
}
