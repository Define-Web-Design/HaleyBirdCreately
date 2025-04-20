/**
 * AI Service Type Definitions
 * 
 * This module defines common types used across AI service adapters
 * to ensure consistent interfaces and data structures.
 */

/**
 * Options for AI service requests
 */
export interface AIRequestOptions {
  /** Model to use (if not specified, adapter will use default) */
  model?: string;
  
  /** Temperature for controlling randomness (0-1, higher = more random) */
  temperature?: number;
  
  /** Max tokens to generate in the response */
  maxTokens?: number;
  
  /** System prompt to condition the model's behavior */
  systemPrompt?: string;
  
  /** Specific provider to use */
  provider?: string;
  
  /** Additional provider-specific parameters */
  [key: string]: any;
}

/**
 * Options for image generation
 */
export interface AIImageGenerationOptions {
  /** Text prompt describing the image to generate */
  prompt: string;
  
  /** Image size (e.g. "1024x1024") */
  size?: string;
  
  /** Image quality (e.g. "standard", "hd") */
  quality?: string;
  
  /** Number of images to generate */
  n?: number;
  
  /** Specific provider to use */
  provider?: string;
  
  /** Additional provider-specific parameters */
  [key: string]: any;
}

/**
 * Chat message structure for conversations
 */
export interface AIChatMessage {
  /** Message role (system, user, assistant, function) */
  role: 'system' | 'user' | 'assistant' | 'function';
  
  /** Message content */
  content: string;
  
  /** Optional message sender name */
  name?: string;
  
  /** Function call details (for function-calling capabilities) */
  functionCall?: {
    name: string;
    arguments: string;
  };
  
  /** Citation sources for knowledge responses */
  citations?: string[];
  
  /** Tool calls made by the assistant */
  toolCalls?: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
  
  /** Additional provider-specific message properties */
  [key: string]: any;
}

/**
 * Usage statistics from AI API calls
 */
export interface AIUsage {
  /** Number of tokens used in the prompt */
  promptTokens: number;
  
  /** Number of tokens generated in the completion */
  completionTokens: number;
  
  /** Total tokens used (prompt + completion) */
  totalTokens: number;
}

/**
 * Standard response format from AI service adapters
 */
export interface AIResponse<T> {
  /** The generated content */
  text: T;
  
  /** Model used for the request */
  model: string;
  
  /** Token usage statistics */
  usage: AIUsage;
  
  /** Request latency in milliseconds */
  latency: number;
  
  /** Additional provider-specific response data */
  [key: string]: any;
}

/**
 * Common error types from AI services
 */
export enum AIErrorType {
  AUTHENTICATION = 'authentication_error',
  AUTHORIZATION = 'authorization_error',
  RATE_LIMIT = 'rate_limit_error',
  QUOTA = 'quota_exceeded',
  INVALID_REQUEST = 'invalid_request',
  SERVER = 'server_error',
  MODEL_OVERLOADED = 'model_overloaded',
  CONTENT_FILTER = 'content_filter',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown_error'
}

/**
 * Structured error from AI services
 */
export interface AIError extends Error {
  /** Error type category */
  type: AIErrorType;
  
  /** HTTP status code (if applicable) */
  status?: number;
  
  /** Provider-specific error code */
  code?: string;
  
  /** Request ID for support reference */
  requestId?: string;
  
  /** Suggestion for resolving the error */
  suggestion?: string;
  
  /** Original error object */
  originalError?: any;
}