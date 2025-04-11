/**
 * Mistral AI Integration Service
 * 
 * This module provides functions for interacting with the Mistral AI API
 * for chat completions and code assistance.
 */

const axios = require('axios');
let config;

try {
  // Try to load the centralized config
  config = require('../../config/environment.js');
} catch (error) {
  console.warn('Could not load centralized config, falling back to environment variables');
  // Minimal fallback config if centralized config is unavailable
  config = {
    apiKeys: {
      mistral: process.env.MISTRAL_API_KEY || 'MISTRAL_API_KEY_NOT_SET',
      codestral: process.env.CODESTRAL_API_KEY || 'CODESTRAL_API_KEY_NOT_SET'
    },
    features: {
      aiChat: process.env.MISTRAL_API_KEY ? true : false,
      codeAssistance: process.env.CODESTRAL_API_KEY ? true : false
    }
  };
}

// API Endpoints
const MISTRAL_CHAT_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';
const CODESTRAL_CHAT_ENDPOINT = 'https://codestral.mistral.ai/v1/chat/completions';
const CODESTRAL_FIM_ENDPOINT = 'https://codestral.mistral.ai/v1/fim/completions';

/**
 * Generate a chat completion using Mistral AI
 * @param {string} prompt - The user's prompt/question
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The response from Mistral AI
 */
async function generateChatCompletion(prompt, options = {}) {
  // Check if Mistral AI is configured
  if (!config.features.aiChat) {
    return {
      error: 'Mistral AI not configured',
      message: 'The Mistral AI API key is not set. Please configure it to use AI chat features.'
    };
  }
  
  try {
    const response = await axios.post(
      MISTRAL_CHAT_ENDPOINT,
      {
        model: options.model || 'mistral-tiny',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 200,
        temperature: options.temperature || 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKeys.mistral}`
        }
      }
    );
    
    return {
      text: response.data.choices[0].message.content,
      usage: response.data.usage,
      model: response.data.model
    };
  } catch (error) {
    console.error('Error calling Mistral AI:', error.message);
    return {
      error: 'Failed to generate response',
      message: error.message,
      status: error.response?.status
    };
  }
}

/**
 * Generate code completion using Codestral
 * @param {string} prompt - The code-related prompt
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The response from Codestral
 */
async function generateCodeCompletion(prompt, options = {}) {
  // Check if Codestral is configured
  if (!config.features.codeAssistance) {
    return {
      error: 'Codestral not configured',
      message: 'The Codestral API key is not set. Please configure it to use code assistance features.'
    };
  }
  
  try {
    const response = await axios.post(
      CODESTRAL_CHAT_ENDPOINT,
      {
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 300,
        temperature: options.temperature || 0.2 // Lower temperature for more deterministic code generation
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKeys.codestral}`
        }
      }
    );
    
    return {
      code: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  } catch (error) {
    console.error('Error calling Codestral:', error.message);
    return {
      error: 'Failed to generate code',
      message: error.message,
      status: error.response?.status
    };
  }
}

/**
 * Generate code completion using Codestral Fill-in-the-Middle (FIM)
 * This is ideal for completing partial code snippets or filling gaps in existing code
 * 
 * @param {string} prefix - The code before the gap to complete
 * @param {string} suffix - The code after the gap to complete (optional)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The response from Codestral FIM
 */
async function generateFimCompletion(prefix, suffix = "", options = {}) {
  // Check if Codestral is configured
  if (!config.features.codeAssistance) {
    return {
      error: 'Codestral not configured',
      message: 'The Codestral API key is not set. Please configure it to use code assistance features.'
    };
  }
  
  try {
    const response = await axios.post(
      CODESTRAL_FIM_ENDPOINT,
      {
        prompt: {
          prefix: prefix,
          suffix: suffix
        },
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.1, // Even lower temperature for more precise code completion
        response_format: { type: options.responseFormat || "text" }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKeys.codestral}`
        }
      }
    );
    
    return {
      completion: response.data.choices[0].text,
      usage: response.data.usage,
      model: response.data.model
    };
  } catch (error) {
    console.error('Error calling Codestral FIM:', error.message);
    return {
      error: 'Failed to generate code completion',
      message: error.message,
      status: error.response?.status
    };
  }
}

/**
 * Test the Mistral AI connection
 * @returns {Promise<boolean>} - True if connection is successful, false otherwise
 */
async function testMistralConnection() {
  try {
    // Simple health check using a minimal query
    const result = await generateChatCompletion('Hello, are you operational?', { maxTokens: 10 });
    return !result.error;
  } catch (error) {
    console.error('Mistral AI connection test failed:', error.message);
    return false;
  }
}

/**
 * Get system status for Mistral AI services
 * @returns {Object} - Status information for Mistral AI services
 */
function getServiceStatus() {
  return {
    mistralChat: {
      available: config.features.aiChat,
      endpoint: MISTRAL_CHAT_ENDPOINT,
      keyConfigured: config.apiKeys.mistral !== 'MISTRAL_API_KEY_NOT_SET'
    },
    codeAssistance: {
      available: config.features.codeAssistance,
      endpoint: CODESTRAL_CHAT_ENDPOINT,
      keyConfigured: config.apiKeys.codestral !== 'CODESTRAL_API_KEY_NOT_SET'
    },
    codeFim: {
      available: config.features.codeAssistance,
      endpoint: CODESTRAL_FIM_ENDPOINT,
      keyConfigured: config.apiKeys.codestral !== 'CODESTRAL_API_KEY_NOT_SET'
    }
  };
}

module.exports = {
  generateChatCompletion,
  generateCodeCompletion,
  generateFimCompletion,
  testMistralConnection,
  getServiceStatus
};