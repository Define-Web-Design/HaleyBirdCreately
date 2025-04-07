import OpenAI from 'openai';

// Configure OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-dev'
});

/**
 * Generate text response from OpenAI models
 */
export async function generateText(prompt: string, options = {}): Promise<string> {
  try {
    // Default options
    const defaultOptions = {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 500
    };

    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };

    const response = await openai.chat.completions.create({
      model: mergedOptions.model,
      messages: [
        { role: 'system', content: 'You are a helpful creative assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: mergedOptions.temperature,
      max_tokens: mergedOptions.max_tokens
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating text from OpenAI:', error);
    return '';
  }
}

/**
 * Generate JSON response with typechecking from OpenAI models
 */
export async function generateJsonResponse<T>(
  prompt: string, 
  systemPrompt: string = '', 
  options = {}
): Promise<T> {
  try {
    // Default options
    const defaultOptions = {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1000
    };

    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };

    // Create system message that enforces JSON output
    const finalSystemPrompt = 
      `${systemPrompt}\nYou must respond with valid JSON only, no other text.`;

    const response = await openai.chat.completions.create({
      model: mergedOptions.model,
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: mergedOptions.temperature,
      max_tokens: mergedOptions.max_tokens,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    // Parse JSON response
    return JSON.parse(content) as T;
  } catch (error) {
    console.error('Error generating JSON from OpenAI:', error);
    throw new Error('Failed to generate valid JSON response');
  }
}

// Functions for specific content-related tasks
export const analyzeContent = async (content: string) => {
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

  return generateJsonResponse<{
    sentiment: string;
    topics: string[];
    keywords: string[];
  }>(prompt, systemPrompt);
};

// Export default API
export default {
  generateText,
  generateJsonResponse,
  analyzeContent
};
