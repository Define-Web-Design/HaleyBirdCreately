/**
 * OpenAI Integration Service
 * 
 * This service provides functions for interacting with the OpenAI API,
 * with robust error handling and logging.
 */

const https = require('https');

// API Configuration
let OPENAI_API_KEY;
try {
  // Try to load from environment or config
  OPENAI_API_KEY = process.env.OPENAI_API_KEY || require('../../config/environment.js').apiKeys.openai;
} catch (error) {
  OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
  console.warn('Could not load environment config, using environment variable directly');
}

// API Endpoints
const OPENAI_API_ENDPOINT = 'api.openai.com';
const OPENAI_COMPLETION_PATH = '/v1/chat/completions';

/**
 * Generate a chat completion from OpenAI
 * 
 * @param {string} prompt - The user prompt to send to OpenAI
 * @param {object} options - Additional options for the API call
 * @param {string} options.systemPrompt - System instructions to guide the AI's behavior
 * @param {string} options.model - The model to use (default: gpt-4)
 * @param {number} options.temperature - Controls randomness (0-1)
 * @param {number} options.maxTokens - Maximum tokens in response
 * @param {boolean} options.jsonMode - Whether to enforce JSON response
 * @returns {Promise<object>} - The parsed response
 */
function generateChatCompletion(prompt, options = {}) {
  return new Promise((resolve, reject) => {
    // Check if API key is available
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'OPENAI_API_KEY_NOT_SET') {
      return reject(new Error('OpenAI API key is not configured'));
    }
    
    // Set default options
    const defaultOptions = {
      systemPrompt: 'You are a helpful assistant.',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 500,
      jsonMode: false
    };
    
    // Merge defaults with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Prepare the request data
    const messages = [
      { role: 'system', content: mergedOptions.systemPrompt }
    ];
    
    // Add user message
    messages.push({ role: 'user', content: prompt });
    
    // Build request body
    const requestData = JSON.stringify({
      model: mergedOptions.model,
      messages: messages,
      max_tokens: mergedOptions.maxTokens,
      temperature: mergedOptions.temperature,
      response_format: mergedOptions.jsonMode ? { type: 'json_object' } : undefined
    });
    
    // Set up API request options
    const apiOptions = {
      hostname: OPENAI_API_ENDPOINT,
      path: OPENAI_COMPLETION_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(requestData)
      }
    };
    
    // Start timestamp for logging
    const startTime = Date.now();
    
    // Make API request
    const req = https.request(apiOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        // Calculate response time for logging
        const responseTime = Date.now() - startTime;
        
        try {
          const parsedResponse = JSON.parse(responseData);
          
          // Handle API errors
          if (res.statusCode !== 200) {
            console.error(`OpenAI API error (${res.statusCode}):`, parsedResponse.error || 'Unknown error');
            reject(new Error(parsedResponse.error ? parsedResponse.error.message : 'OpenAI API request failed'));
            return;
          }
          
          // Log success
          console.log(`OpenAI API call successful (${responseTime}ms, model: ${mergedOptions.model})`);
          
          // Extract text from the response
          if (parsedResponse.choices && parsedResponse.choices.length > 0) {
            // For monitoring usage and costs
            if (parsedResponse.usage) {
              console.log('OpenAI API usage:', parsedResponse.usage);
            }
            
            const content = parsedResponse.choices[0].message.content;
            
            // If JSON mode is enabled, try to parse the JSON response
            if (mergedOptions.jsonMode) {
              try {
                const jsonResponse = JSON.parse(content);
                resolve({
                  text: content,
                  json: jsonResponse,
                  model: parsedResponse.model,
                  usage: parsedResponse.usage,
                  response_time_ms: responseTime
                });
              } catch (jsonError) {
                console.error('Error parsing JSON from OpenAI response:', jsonError);
                reject(new Error('Failed to parse JSON from OpenAI response'));
              }
            } else {
              // Return text response
              resolve({
                text: content,
                model: parsedResponse.model,
                usage: parsedResponse.usage,
                response_time_ms: responseTime
              });
            }
          } else {
            reject(new Error('No response choices returned from OpenAI'));
          }
        } catch (error) {
          console.error('Error processing OpenAI response:', error);
          reject(error);
        }
      });
    });
    
    // Handle request errors
    req.on('error', (error) => {
      console.error('Error making OpenAI API request:', error);
      reject(error);
    });
    
    // Send request data
    req.write(requestData);
    req.end();
  });
}

/**
 * Generate JSON output with OpenAI
 * 
 * @param {string} prompt - The user prompt
 * @param {object} options - Additional options
 * @returns {Promise<object>} - Parsed JSON object
 */
async function generateJsonOutput(prompt, options = {}) {
  // Ensure JSON mode is enabled
  const jsonOptions = {
    ...options,
    jsonMode: true,
    systemPrompt: options.systemPrompt || 'You are a helpful assistant. You must respond with valid JSON only.'
  };
  
  try {
    const response = await generateChatCompletion(prompt, jsonOptions);
    return response.json;
  } catch (error) {
    console.error('Error generating JSON output with OpenAI:', error);
    throw error;
  }
}

/**
 * Analyze image with OpenAI Vision API
 * 
 * @param {string} imageUrl - URL of the image to analyze
 * @param {string} prompt - Instruction for image analysis
 * @param {object} options - Additional options
 * @returns {Promise<object>} - Analysis result
 */
function analyzeImage(imageUrl, prompt, options = {}) {
  return new Promise((resolve, reject) => {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'OPENAI_API_KEY_NOT_SET') {
      return reject(new Error('OpenAI API key is not configured'));
    }
    
    // Default options
    const defaultOptions = {
      systemPrompt: 'You are a visual analysis assistant.',
      model: 'gpt-4-vision-preview',
      temperature: 0.7,
      maxTokens: 500,
      jsonMode: false
    };
    
    // Merge defaults with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Prepare messages with image
    const messages = [
      { role: 'system', content: mergedOptions.systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ];
    
    // Prepare request data
    const requestData = JSON.stringify({
      model: mergedOptions.model,
      messages: messages,
      max_tokens: mergedOptions.maxTokens,
      temperature: mergedOptions.temperature,
      response_format: mergedOptions.jsonMode ? { type: 'json_object' } : undefined
    });
    
    // Set up API request options
    const apiOptions = {
      hostname: OPENAI_API_ENDPOINT,
      path: OPENAI_COMPLETION_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(requestData)
      }
    };
    
    // Start timestamp for logging
    const startTime = Date.now();
    
    // Make API request
    const req = https.request(apiOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        // Calculate response time for logging
        const responseTime = Date.now() - startTime;
        
        try {
          const parsedResponse = JSON.parse(responseData);
          
          // Handle API errors
          if (res.statusCode !== 200) {
            console.error(`OpenAI Vision API error (${res.statusCode}):`, parsedResponse.error || 'Unknown error');
            reject(new Error(parsedResponse.error ? parsedResponse.error.message : 'OpenAI Vision API request failed'));
            return;
          }
          
          // Log success
          console.log(`OpenAI Vision API call successful (${responseTime}ms, model: ${mergedOptions.model})`);
          
          // Extract text from the response
          if (parsedResponse.choices && parsedResponse.choices.length > 0) {
            // For monitoring usage and costs
            if (parsedResponse.usage) {
              console.log('OpenAI Vision API usage:', parsedResponse.usage);
            }
            
            const content = parsedResponse.choices[0].message.content;
            
            // If JSON mode is enabled, try to parse the JSON response
            if (mergedOptions.jsonMode) {
              try {
                const jsonResponse = JSON.parse(content);
                resolve({
                  text: content,
                  json: jsonResponse,
                  model: parsedResponse.model,
                  usage: parsedResponse.usage,
                  response_time_ms: responseTime
                });
              } catch (jsonError) {
                console.error('Error parsing JSON from OpenAI Vision response:', jsonError);
                reject(new Error('Failed to parse JSON from OpenAI Vision response'));
              }
            } else {
              // Return text response
              resolve({
                text: content,
                model: parsedResponse.model,
                usage: parsedResponse.usage,
                response_time_ms: responseTime
              });
            }
          } else {
            reject(new Error('No response choices returned from OpenAI Vision'));
          }
        } catch (error) {
          console.error('Error processing OpenAI Vision response:', error);
          reject(error);
        }
      });
    });
    
    // Handle request errors
    req.on('error', (error) => {
      console.error('Error making OpenAI Vision API request:', error);
      reject(error);
    });
    
    // Send request data
    req.write(requestData);
    req.end();
  });
}

/**
 * Test connection to OpenAI API
 * @returns {Promise<boolean>} - Whether connection was successful
 */
async function testConnection() {
  try {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'OPENAI_API_KEY_NOT_SET') {
      console.error('Cannot test connection: OpenAI API key is not configured');
      return false;
    }
    
    await generateChatCompletion('Test connection to OpenAI API. Respond with a brief message.', {
      maxTokens: 10
    });
    
    return true;
  } catch (error) {
    console.error('OpenAI API connection test failed:', error.message);
    return false;
  }
}

// Export API
module.exports = {
  generateChatCompletion,
  generateJsonOutput,
  analyzeImage,
  testConnection
};