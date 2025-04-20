
/**
 * Base Adapter Interface for AI Services
 * 
 * This defines the common interface that all AI service adapters must implement,
 * enabling seamless switching between different AI providers.
 */

import { EventEmitter } from 'events';

// Model-specific configuration
export interface AIModelConfig {
  model: string;                // Name of the model to use
  temperature?: number;         // Randomness parameter (0-1)
  maxTokens?: number;           // Maximum number of tokens to generate
  topP?: number;                // Top-p sampling parameter
  frequencyPenalty?: number;    // Penalty for token frequency
  presencePenalty?: number;     // Penalty for token presence
}

// Request-specific options
export interface AIRequestOptions extends AIModelConfig {
  systemPrompt?: string;        // System-level instruction
  responseFormat?: 'text' | 'json' | 'markdown';
  stream?: boolean;             // Whether to stream the response
  user?: string;                // User identifier for API
  timeout?: number;             // Request timeout in milliseconds
  retries?: number;             // Number of retry attempts
  trackMetrics?: boolean;       // Whether to track performance metrics
}

// Response metadata
export interface AIResponseMetadata {
  model: string;                // Model used for generation
  processingTime: number;       // Time taken in milliseconds
  tokenCount?: {                // Token usage statistics
    input: number;
    output: number;
    total: number;
  };
  provider: string;             // Provider name (e.g., 'openai', 'mistral')
  requestId?: string;           // Provider's request ID if available
  finishReason?: string;        // Reason for completion (e.g., 'stop', 'length')
  created?: number;             // Timestamp when created
  metricsCollected?: boolean;   // Whether metrics were collected
}

// Standard response format
export interface AIResponse<T = any> {
  content: T;                   // Response content
  metadata: AIResponseMetadata;
}

// Response for streaming requests
export interface AIStreamResponse<T = string> extends EventEmitter {
  on(event: 'data', listener: (chunk: T) => void): this;
  on(event: 'metadata', listener: (metadata: AIResponseMetadata) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
  on(event: 'end', listener: () => void): this;
}

// Image generation options
export interface AIImageGenerationOptions {
  prompt: string;               // Image description
  n?: number;                   // Number of images to generate
  size?: string;                // Image size (e.g., '1024x1024')
  quality?: string;             // Image quality (e.g., 'standard', 'hd')
  format?: 'url' | 'b64_json';  // Response format
}

// Image generation response
export interface AIImageResponse {
  images: string[];             // Array of image URLs or base64 data
  metadata: AIResponseMetadata;
}

// Adapter status information
export interface AIAdapterStatus {
  available: boolean;           // Whether the adapter is available
  name: string;                 // Adapter name
  priority: number;             // Priority for fallback order
  lastCheck?: Date;             // Last status check time
  errorMessage?: string;        // Last error message
  capabilities?: {              // Supported capabilities
    textGeneration: boolean;
    jsonGeneration: boolean;
    imageGeneration: boolean;
    streaming: boolean;
    functionCalling: boolean;
  };
}

// Adapter metrics for monitoring
export interface AIAdapterMetrics {
  requestCount: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  successRate: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  errorCount: number;
  lastError?: Error;
}

// Main adapter interface
export interface AIServiceAdapter {
  /**
   * Generate text completion from the AI model
   * @param prompt The prompt text to send to the model
   * @param options Request configuration options
   * @returns Promise with the generated text response
   */
  generateText(prompt: string, options?: AIRequestOptions): Promise<AIResponse<string>>;
  
  /**
   * Generate structured JSON data from the AI model
   * @param prompt The prompt text to send to the model
   * @param options Request configuration options
   * @returns Promise with the generated JSON data
   */
  generateJson<T>(prompt: string, options?: AIRequestOptions): Promise<AIResponse<T>>;
  
  /**
   * Stream text completion from the AI model
   * @param prompt The prompt text to send to the model
   * @param options Request configuration options
   * @returns An event emitter that streams response chunks
   */
  streamText?(prompt: string, options?: AIRequestOptions): AIStreamResponse;
  
  /**
   * Generate an image from a text description
   * @param options Image generation configuration
   * @returns Promise with generated image data
   */
  generateImage?(options: AIImageGenerationOptions): Promise<AIImageResponse>;
  
  /**
   * Check if the service is available and working
   * @returns Promise resolving to connection status
   */
  testConnection(): Promise<boolean>;
  
  /**
   * Get the current status of this adapter
   * @returns Status information object
   */
  getStatus(): AIAdapterStatus;
  
  /**
   * Get performance metrics for this adapter
   * @returns Metrics data or null if not available
   */
  getMetrics?(): AIAdapterMetrics | null;
  
  /**
   * Reset the metrics counters
   */
  resetMetrics?(): void;
}
