/**
 * AI Service Type Definitions
 * 
 * This module contains type definitions for the AI service adapter pattern
 * to ensure consistent interfaces across different AI providers.
 */

// Model provider types
export type AIProvider = 'openai' | 'anthropic' | 'perplexity' | 'gemini' | 'other';
export type ModelType = 'text' | 'chat' | 'embedding' | 'image' | 'multimodal';

// AI adapter status
export interface AIAdapterStatus {
  available: boolean;
  ready: boolean;
  healthy: boolean;
  lastCheck: Date;
  latency?: number;
  errorMessage?: string;
  errorCode?: string;
  models?: AIModelInfo[];
  name?: string;
}

// AI adapter metrics for tracking performance
export interface AIAdapterMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensIn?: number;
  totalTokensOut?: number;
  totalLatency: number;
  averageLatency: number;
  lastRequest?: {
    timestamp: Date;
    latency: number;
    success: boolean;
    error?: string;
  };
}

// Information about an AI model
export interface AIModelInfo {
  id: string;
  provider: AIProvider;
  type: ModelType;
  capabilities: string[];
  contextWindow: number;
  maxOutputTokens?: number;
  description?: string;
}

// Common request options
export interface AIRequestOptions {
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  timeout?: number;
  retries?: number;
  jsonMode?: boolean;
  includeMetadata?: boolean;
  stream?: boolean;
  extraParams?: Record<string, any>;
  apiKey?: string;
}

// Common response format
export interface AIResponse<T = any> {
  result: T;
  provider: AIProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: {
    latency: number;
    requestId?: string;
    finishReason?: string;
    retryCount?: number;
  };
}

// Chat message format
export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
}

// Image generation options
export interface AIImageGenerationOptions extends AIRequestOptions {
  size?: string;
  quality?: string;
  style?: string;
  responseFormat?: 'url' | 'base64';
}

// Image analysis options
export interface AIImageAnalysisOptions extends AIRequestOptions {
  imageUrl?: string;
  base64Image?: string;
  prompt: string;
  analysisType?: 'general' | 'ocr' | 'objects' | 'faces' | 'custom';
}

// Interface all AI adapters must implement
export interface AIAdapter {
  // Basic properties
  readonly provider: AIProvider;
  readonly defaultModel: string;
  
  // Status and metrics
  getStatus(): AIAdapterStatus;
  getMetrics(): AIAdapterMetrics;
  resetMetrics(): void;
  
  // Core functionality
  generateText(prompt: string, options?: AIRequestOptions): Promise<AIResponse<string>>;
  generateJson(prompt: string, options?: AIRequestOptions): Promise<AIResponse<any>>;
  chatCompletion(messages: AIChatMessage[], options?: AIRequestOptions): Promise<AIResponse<AIChatMessage>>;
  generateEmbedding(text: string, options?: AIRequestOptions): Promise<AIResponse<number[]>>;
  
  // Optional capabilities
  generateImage?(prompt: string, options?: AIImageGenerationOptions): Promise<AIResponse<string>>;
  analyzeImage?(options: AIImageAnalysisOptions): Promise<AIResponse<string>>;
  
  // Health check
  checkAvailability(): Promise<boolean>;
}

// Registry to store all available adapters
export interface AIAdapterRegistry {
  getAll(): AIAdapter[];
  get(provider: AIProvider): AIAdapter | undefined;
  getDefault(): AIAdapter;
  register(adapter: AIAdapter): void;
  unregister(provider: AIProvider): void;
}

// Fallback strategy interface
export interface AIFallbackStrategy {
  execute<T>(
    operation: (adapter: AIAdapter) => Promise<AIResponse<T>>,
    options?: AIRequestOptions
  ): Promise<AIResponse<T>>;
}