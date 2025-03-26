import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "demo_key"
});

/**
 * Generates a response using OpenAI's chat completions API
 */
export async function generateText(prompt: string, options?: { temperature?: number, maxTokens?: number }) {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 500,
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error("Error generating text:", error.message);
    throw new Error(`Failed to generate text: ${error.message}`);
  }
}

/**
 * Generates a structured response in JSON format
 */
export async function generateJsonResponse<T>(
  prompt: string, 
  systemPrompt: string,
  options?: { temperature?: number, maxTokens?: number }
): Promise<T> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 1000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content || "{}") as T;
  } catch (error: any) {
    console.error("Error generating JSON response:", error.message);
    throw new Error(`Failed to generate JSON response: ${error.message}`);
  }
}

/**
 * Analyzes an image using OpenAI's vision capabilities
 */
export async function analyzeImage(base64Image: string, prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "";
  } catch (error: any) {
    console.error("Error analyzing image:", error.message);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

export default {
  generateText,
  generateJsonResponse,
  analyzeImage
};
