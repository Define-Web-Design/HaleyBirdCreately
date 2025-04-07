
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

// Initialize the Gemini API with your API key
// Note: In production, store this key securely using environment variables
const API_KEY = process.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// Available Gemini models
export const GEMINI_MODELS = {
  PRO: 'gemini-pro',
  PRO_VISION: 'gemini-pro-vision',
};

/**
 * Generate text content using Google's Gemini AI
 */
export async function generateText(
  prompt: string, 
  modelName: string = GEMINI_MODELS.PRO,
  config: Partial<GenerationConfig> = {}
): Promise<string> {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      console.error('Gemini API key is not configured');
      return 'Error: Gemini API key is not configured. Please add your API key to environment variables.';
    }

    // Get the model
    const model = genAI.getGenerativeModel({ model: modelName });

    // Set generation config with defaults
    const generationConfig: GenerationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
      ...config,
    };

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    return result.response.text();
  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    return `Error generating content: ${(error as Error).message}`;
  }
}

/**
 * Generate structured data using Google's Gemini AI
 */
export async function generateStructuredData<T>(
  prompt: string,
  systemPrompt: string = '',
  modelName: string = GEMINI_MODELS.PRO,
  config: Partial<GenerationConfig> = {}
): Promise<T | null> {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      console.error('Gemini API key is not configured');
      return null;
    }

    // Prepare the prompt to instruct the model to return JSON
    const jsonPrompt = `${systemPrompt ? systemPrompt + '\n\n' : ''}${prompt}\n\nReturn your response as valid JSON.`;
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Set generation config with defaults
    const generationConfig: GenerationConfig = {
      temperature: 0.2, // Lower temperature for more deterministic results
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
      ...config,
    };

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: jsonPrompt }] }],
      generationConfig,
    });

    const text = result.response.text();
    
    // Parse JSON from the response
    // Find JSON content within markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                      text.match(/\{[\s\S]*\}/);
                      
    const jsonContent = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    
    return JSON.parse(jsonContent) as T;
  } catch (error) {
    console.error('Error generating structured data with Gemini:', error);
    return null;
  }
}

/**
 * Analyze images using Gemini Pro Vision
 */
export async function analyzeImage(
  imageData: string, // Base64 encoded image
  prompt: string,
  modelName: string = GEMINI_MODELS.PRO_VISION
): Promise<string> {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      console.error('Gemini API key is not configured');
      return 'Error: Gemini API key is not configured';
    }

    // Get the vision model
    const model = genAI.getGenerativeModel({ model: modelName });

    // Create image part from base64 data
    const imageParts = [
      { text: prompt },
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg', // Adjust based on your image type
        },
      },
    ];

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: imageParts }],
    });

    return result.response.text();
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    return `Error analyzing image: ${(error as Error).message}`;
  }
}

export default {
  generateText,
  generateStructuredData,
  analyzeImage,
  MODELS: GEMINI_MODELS,
};
