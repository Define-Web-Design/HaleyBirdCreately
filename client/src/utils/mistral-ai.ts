
import { MistralClient } from '@mistralai/mistralai';

// Initialize the Mistral AI client with your API key
// Store this securely in environment variables
const API_KEY = process.env.VITE_MISTRAL_API_KEY || '';

// Create an instance of the Mistral client
const mistralClient = new MistralClient(API_KEY);

// Function to generate text using Mistral AI
export async function generateText(prompt: string, options = {}) {
  try {
    const defaultOptions = {
      model: 'mistral-large-latest', // or other models like 'mistral-small', 'mistral-medium'
      temperature: 0.7,
      maxTokens: 1000
    };

    const mergedOptions = { ...defaultOptions, ...options };

    const chatResponse = await mistralClient.chat({
      model: mergedOptions.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: mergedOptions.temperature,
      maxTokens: mergedOptions.maxTokens
    });

    return chatResponse.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating text with Mistral AI:', error);
    throw new Error(`Failed to generate text: ${(error as Error).message}`);
  }
}

// Function to generate structured JSON data
export async function generateStructuredData<T>(prompt: string, systemPrompt = '', options = {}) {
  try {
    const defaultOptions = {
      model: 'mistral-large-latest',
      temperature: 0.3,
      maxTokens: 1500
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Create system message that enforces JSON output
    const finalSystemPrompt = 
      `${systemPrompt}\nYou must respond with valid JSON only, no other text.`;

    const chatResponse = await mistralClient.chat({
      model: mergedOptions.model,
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: mergedOptions.temperature,
      maxTokens: mergedOptions.maxTokens
    });

    const content = chatResponse.choices[0]?.message?.content || '{}';
    
    // Parse JSON response
    return JSON.parse(content) as T;
  } catch (error) {
    console.error('Error generating JSON with Mistral AI:', error);
    throw new Error('Failed to generate valid JSON response');
  }
}

// Export the client for advanced usage
export { mistralClient };

export default {
  generateText,
  generateStructuredData,
  client: mistralClient
};
