/**
 * Base AI Service Adapter Interface
 * 
 * This module defines the base interface for all AI service adapters,
 * establishing a common contract that all provider implementations must follow.
 */

import { 
  AIChatMessage, 
  AIImageGenerationOptions, 
  AIRequestOptions,
  AIResponse
} from '../aiTypes';

/**
 * Status of an AI service adapter
 */
export interface AIAdapterStatus {
  /** Is the service available and responding */
  available: boolean;
  
  /** Optional error message if service is unavailable */
  error?: string;
  
  /** Timestamp of last status check */
  lastCheck?: Date;
  
  /** Priority for fallback selection (lower = higher priority) */
  priority?: number;
  
  /** Supported model types/capabilities */
  capabilities?: string[];
}

/**
 * Performance metrics for an AI service adapter
 */
export interface AIAdapterMetrics {
  /** Total number of requests made */
  totalRequests: number;
  
  /** Number of successful requests */
  successfulRequests: number;
  
  /** Number of failed requests */
  failedRequests: number;
  
  /** Average request latency in milliseconds */
  averageLatency: number;
  
  /** Timestamp of last usage */
  lastUsed: Date | null;
}

/**
 * Interface for all AI service adapters
 * 
 * All AI provider implementations must implement this interface
 * to ensure consistent behavior across providers.
 */
export interface AIServiceAdapter {
  /**
   * Get current adapter status
   * @returns Adapter status object
   */
  getStatus(): AIAdapterStatus;
  
  /**
   * Test connection to the AI service
   * @returns Promise resolving to true if connection is successful
   */
  testConnection(): Promise<boolean>;
  
  /**
   * Generate text using the AI service
   * @param prompt Text prompt
   * @param options Request options
   * @returns Promise resolving to generated text
   */
  generateText(prompt: string, options?: AIRequestOptions): Promise<AIResponse<string>>;
  
  /**
   * Generate JSON data using the AI service
   * @param prompt Text prompt
   * @param options Request options
   * @returns Promise resolving to generated JSON
   */
  generateJson<T>(prompt: string, options?: AIRequestOptions): Promise<AIResponse<T>>;
  
  /**
   * Get embeddings for text
   * @param text Text to get embeddings for
   * @param options Request options
   * @returns Promise resolving to vector embedding
   */
  getEmbeddings(text: string, options?: AIRequestOptions): Promise<AIResponse<number[]>>;
  
  /**
   * Generate image using the AI service
   * @param options Image generation options
   * @returns Promise resolving to image data
   */
  generateImage(options: AIImageGenerationOptions): Promise<any>;
  
  /**
   * Get chat completion
   * @param messages Chat message history
   * @param options Request options
   * @returns Promise resolving to chat completion
   */
  chatCompletion(messages: AIChatMessage[], options?: AIRequestOptions): Promise<AIResponse<AIChatMessage>>;
  
  /**
   * Get performance metrics if supported
   * @returns Adapter metrics
   */
  getMetrics?(): AIAdapterMetrics;
  
  /**
   * Reset performance metrics if supported
   */
  resetMetrics?(): void;
}