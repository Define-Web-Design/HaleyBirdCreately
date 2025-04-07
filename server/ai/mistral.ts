
import { MistralClient } from '@mistralai/mistralai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Mistral AI client with API key from environment
const mistralClient = new MistralClient(process.env.MISTRAL_API_KEY || '');

/**
 * Generate text using Mistral AI
 */
export async function generateText(prompt: string, options = {}) {
  try {
    const defaultOptions = {
      model: 'mistral-large-latest',
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

/**
 * Generate structured JSON data with Mistral AI
 */
export async function generateJsonResponse<T>(prompt: string, systemPrompt = '', options = {}) {
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
    console.error('Error generating JSON from Mistral AI:', error);
    throw new Error('Failed to generate valid JSON response');
  }
}

/**
 * Analyze content and provide insights
 */
export async function analyzeContent(content: string) {
  const prompt = `
    Analyze the following content and provide an assessment of:
    1. The overall sentiment (positive, negative, neutral)
    2. Key topics covered
    3. Important keywords for categorization

    Content: ${content}
  `;

  const systemPrompt = `
    You are an AI content analyst. Provide a JSON response with these fields:
    - sentiment: string (positive, negative, or neutral)
    - topics: string[] (array of main topics)
    - keywords: string[] (array of relevant keywords)
  `;

  return generateJsonResponse(prompt, systemPrompt);
}

export default {
  generateText,
  generateJsonResponse,
  analyzeContent,
  client: mistralClient
};
