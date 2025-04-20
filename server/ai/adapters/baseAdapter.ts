/**
 * Base AI Adapter Interface
 * 
 * This defines the common interface that all AI provider adapters must implement,
 * ensuring consistent interaction patterns regardless of the underlying AI provider.
 */

// Base AI Adapter interface
export interface AIAdapter {
  /**
   * Get the ID of the adapter
   */
  getId(): string;
  
  /**
   * Get current adapter status
   */
  getStatus(): AIAdapterStatus;
  
  /**
   * Get adapter statistics/metrics
   */
  getMetrics(): AIAdapterMetrics;
  
  /**
   * Get provider and model defaults for this adapter
   */
  getDefaults(): AIAdapterDefaults;
  
  /**
   * Check if the adapter is currently available
   */
  checkAvailability(): Promise<boolean>;
  
  /**
   * Generate text completion from a prompt
   */
  generateText(prompt: string, options?: AIRequestOptions): Promise<AIResponse>;
  
  /**
   * Generate a JSON response from a prompt
   */
  generateJson(prompt: string, options?: AIRequestOptions): Promise<AIJsonResponse>;
  
  /**
   * Generate chat completion from messages
   */
  chatCompletion(messages: AIChatMessage[], options?: AIRequestOptions): Promise<AIChatResponse>;
  
  /**
   * Generate an image from a text prompt
   */
  generateImage(prompt: string, options?: AIImageGenerationOptions): Promise<AIImageResponse>;
  
  /**
   * Analyze an image with a text prompt
   */
  analyzeImage(options: AIImageAnalysisOptions): Promise<AIResponse>;
  
  /**
   * Generate embedding for text
   */
  generateEmbedding(text: string, options?: AIRequestOptions): Promise<AIEmbeddingResponse>;
  
  /**
   * Reset adapter (clear caches, reset rate limiting, etc.)
   */
  reset(): Promise<void>;
}

// Status information for an AI adapter
export interface AIAdapterStatus {
  /** Whether the adapter is available for use */
  available: boolean;
  
  /** Provider of this adapter (openai, anthropic, etc.) */
  provider: string;
  
  /** Current operating status */
  status: 'operational' | 'degraded' | 'offline' | 'rate_limited' | 'error';
  
  /** Timestamp of last availability check */
  lastCheck: Date;
  
  /** Error message if status is error */
  errorMessage?: string;
  
  /** Human-readable name of the adapter */
  name?: string;
}

// Metrics for an AI adapter
export interface AIAdapterMetrics {
  /** Total number of requests made */
  totalRequests: number;
  
  /** Total number of successful requests */
  successfulRequests: number;
  
  /** Total number of failed requests */
  failedRequests: number;
  
  /** Timestamp of last request */
  lastRequest?: Date;
  
  /** Average latency in milliseconds */
  avgLatencyMs: number;
  
  /** Success rate (0-1) */
  successRate: number;
  
  /** Token usage metrics */
  tokenUsage?: {
    /** Total input tokens processed */
    totalTokensIn?: number;
    
    /** Total output tokens generated */
    totalTokensOut?: number;
  };
}

// Default configuration for an AI adapter
export interface AIAdapterDefaults {
  /** Default model to use for text generation */
  defaultTextModel: string;
  
  /** Default model to use for chat completion */
  defaultChatModel: string;
  
  /** Default model to use for embedding */
  defaultEmbeddingModel: string;
  
  /** Default model to use for image generation */
  defaultImageModel?: string;
  
  /** Whether this adapter can generate images */
  supportsImageGeneration: boolean;
  
  /** Whether this adapter can analyze images */
  supportsImageAnalysis: boolean;
  
  /** Whether this adapter supports JSON mode */
  supportsJsonMode: boolean;
  
  /** Whether this adapter supports streaming responses */
  supportsStreaming: boolean;
  
  /** Maximum context length (tokens) */
  maxContextLength: number;
}

// Base options for AI requests
export interface AIRequestOptions {
  /** Provider to use */
  provider?: string;
  
  /** Model to use */
  model?: string;
  
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  
  /** Temperature (0-1, higher = more random) */
  temperature?: number;
  
  /** Top p sampling (0-1) */
  topP?: number;
  
  /** Whether to stream the response */
  stream?: boolean;
  
  /** Additional provider-specific options */
  providerOptions?: Record<string, any>;
}

// Options for image generation
export interface AIImageGenerationOptions extends AIRequestOptions {
  /** Image size (width x height) */
  size?: string;
  
  /** Number of images to generate */
  n?: number;
  
  /** Image quality */
  quality?: string;
  
  /** Image style */
  style?: string;
}

// Options for image analysis
export interface AIImageAnalysisOptions {
  /** URL of image to analyze */
  imageUrl?: string;
  
  /** Base64-encoded image data */
  base64Image?: string;
  
  /** Prompt for analysis */
  prompt: string;
  
  /** Provider to use */
  provider?: string;
  
  /** Model to use */
  model?: string;
  
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  
  /** Temperature (0-1, higher = more random) */
  temperature?: number;
  
  /** Additional provider-specific options */
  providerOptions?: Record<string, any>;
}

// Chat message format
export interface AIChatMessage {
  /** Role of the message sender */
  role: 'system' | 'user' | 'assistant' | 'function';
  
  /** Content of the message */
  content: string;
  
  /** Optional name of the sender */
  name?: string;
  
  /** Function call information */
  functionCall?: {
    name: string;
    arguments: string;
  };
}

// Base response interface
export interface AIResponse {
  /** Generated text content */
  content: string;
  
  /** Provider used for this response */
  provider: string;
  
  /** Model used for this response */
  model: string;
  
  /** Usage statistics */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  
  /** Whether the response was retrieved from cache */
  cached?: boolean;
  
  /** Time taken to generate response in milliseconds */
  timingMs?: number;
  
  /** Whether the response was truncated */
  truncated?: boolean;
}

// JSON response interface
export interface AIJsonResponse extends AIResponse {
  /** Generated JSON data */
  json: any;
}

// Chat completion response
export interface AIChatResponse extends AIResponse {
  /** Generated message */
  message: AIChatMessage;
  
  /** All messages in the conversation */
  conversation?: AIChatMessage[];
}

// Image generation response
export interface AIImageResponse {
  /** Generated image URLs */
  images: string[];
  
  /** Provider used for this response */
  provider: string;
  
  /** Model used for this response */
  model: string;
  
  /** Time taken to generate response in milliseconds */
  timingMs?: number;
}

// Embedding response
export interface AIEmbeddingResponse {
  /** Generated embeddings */
  embedding: number[];
  
  /** Dimensionality of the embedding */
  dimensions: number;
  
  /** Provider used for this response */
  provider: string;
  
  /** Model used for this response */
  model: string;
  
  /** Usage statistics */
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
  
  /** Time taken to generate response in milliseconds */
  timingMs?: number;
}

// Base class for AI adapters
export abstract class BaseAIAdapter implements AIAdapter {
  // Properties to store metrics and status
  protected metrics: AIAdapterMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    avgLatencyMs: 0,
    successRate: 1,
    tokenUsage: {
      totalTokensIn: 0,
      totalTokensOut: 0
    }
  };
  
  protected status: AIAdapterStatus = {
    available: false,
    provider: 'unknown',
    status: 'offline',
    lastCheck: new Date()
  };
  
  // Abstract methods that must be implemented by subclasses
  abstract getId(): string;
  abstract getDefaults(): AIAdapterDefaults;
  abstract checkAvailability(): Promise<boolean>;
  abstract generateText(prompt: string, options?: AIRequestOptions): Promise<AIResponse>;
  abstract generateJson(prompt: string, options?: AIRequestOptions): Promise<AIJsonResponse>;
  abstract chatCompletion(messages: AIChatMessage[], options?: AIRequestOptions): Promise<AIChatResponse>;
  abstract generateImage(prompt: string, options?: AIImageGenerationOptions): Promise<AIImageResponse>;
  abstract analyzeImage(options: AIImageAnalysisOptions): Promise<AIResponse>;
  abstract generateEmbedding(text: string, options?: AIRequestOptions): Promise<AIEmbeddingResponse>;
  
  // Common methods with default implementations
  getStatus(): AIAdapterStatus {
    return { ...this.status };
  }
  
  getMetrics(): AIAdapterMetrics {
    return { ...this.metrics };
  }
  
  async reset(): Promise<void> {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgLatencyMs: 0,
      successRate: 1,
      tokenUsage: {
        totalTokensIn: 0,
        totalTokensOut: 0
      }
    };
    
    // Update status and run availability check
    await this.checkAvailability();
  }
  
  // Helper method to update metrics after a request
  protected updateMetrics(success: boolean, latencyMs: number, tokensIn?: number, tokensOut?: number): void {
    this.metrics.totalRequests++;
    this.metrics.lastRequest = new Date();
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    
    // Update average latency using a weighted approach to avoid large spikes
    const oldWeight = 0.7;
    this.metrics.avgLatencyMs = (this.metrics.avgLatencyMs * oldWeight) + (latencyMs * (1 - oldWeight));
    
    // Update success rate
    this.metrics.successRate = this.metrics.totalRequests > 0
      ? this.metrics.successfulRequests / this.metrics.totalRequests
      : 1;
    
    // Update token usage if provided
    if (tokensIn !== undefined && this.metrics.tokenUsage) {
      this.metrics.tokenUsage.totalTokensIn = (this.metrics.tokenUsage.totalTokensIn || 0) + tokensIn;
    }
    
    if (tokensOut !== undefined && this.metrics.tokenUsage) {
      this.metrics.tokenUsage.totalTokensOut = (this.metrics.tokenUsage.totalTokensOut || 0) + tokensOut;
    }
  }
  
  // Helper method to update status
  protected updateStatus(available: boolean, status: AIAdapterStatus['status'], errorMessage?: string): void {
    this.status.available = available;
    this.status.status = status;
    this.status.lastCheck = new Date();
    
    if (errorMessage) {
      this.status.errorMessage = errorMessage;
    } else {
      delete this.status.errorMessage;
    }
  }
}