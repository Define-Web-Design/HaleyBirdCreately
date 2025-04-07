import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Using the latest OpenAI models for best performance
const MODEL = "gpt-4o"; // Latest model for text-based features
const VISION_MODEL = "gpt-4o"; // Latest model with vision capabilities

// Attempt to get API key from different possible sources
const apiKey = process.env.OPENAI_API_KEY || 
               process.env.OPENAI_API_KEY_ENV_VAR || 
               "PLACEHOLDER_REPLACE_WITH_YOUR_OPENAI_API_KEY";
               
// Initialize OpenAI client with API key
const openai = new OpenAI({ 
  apiKey: apiKey
});

// Check if API key is valid (not the placeholder)
const isConfigured = apiKey !== "PLACEHOLDER_REPLACE_WITH_YOUR_OPENAI_API_KEY";

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
  systemPromptOrOptions?: string | { temperature?: number, maxTokens?: number },
  options?: { temperature?: number, maxTokens?: number }
): Promise<T> {
  try {
    // Handle different parameter formats
    let systemPrompt = "You are a helpful assistant that returns JSON data based on the user's request.";
    let resolvedOptions = options;

    // Check if second param is a system prompt or options
    if (typeof systemPromptOrOptions === 'string') {
      systemPrompt = systemPromptOrOptions;
    } else if (systemPromptOrOptions && typeof systemPromptOrOptions === 'object') {
      resolvedOptions = systemPromptOrOptions;
    }

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: resolvedOptions?.temperature || 0.7,
      max_tokens: resolvedOptions?.maxTokens || 1000,
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

/**
 * Generate content ideas based on a theme or topic
 */
export async function generateContentIdeas(
  topic: string,
  platform: string,
  count: number = 5
): Promise<string[]> {
  if (!isConfigured) {
    console.warn("OpenAI API key not configured. Using placeholder response.");
    return Array(count).fill("Sample content idea (OpenAI API key not configured)");
  }

  try {
    const prompt = `Generate ${count} creative content ideas for ${platform} about "${topic}". Make these ideas specific, attention-grabbing, and tailored to ${platform}'s audience. Format as a JSON array of strings.`;
    
    const systemPrompt = `You are a professional content strategist who understands what performs well on different social media platforms. Provide engaging, platform-specific content ideas that will resonate with the audience. Return ONLY a JSON array of strings without any explanation or additional text.`;
    
    const response = await generateJsonResponse<string[]>(prompt, systemPrompt, { temperature: 0.9 });
    return response;
  } catch (error) {
    console.error("Error generating content ideas:", error);
    return Array(count).fill("Could not generate ideas. Please try again later.");
  }
}

/**
 * Create a caption for an image that's optimized for a particular platform
 */
export async function generateCaption(
  imageDescription: string,
  platform: string,
  tone: string = "casual",
  includeHashtags: boolean = true
): Promise<string> {
  if (!isConfigured) {
    console.warn("OpenAI API key not configured. Using placeholder response.");
    return "Sample caption (OpenAI API key not configured)";
  }

  try {
    const prompt = `Create a ${tone} caption for ${platform} for an image that shows: "${imageDescription}". ${includeHashtags ? 'Include relevant hashtags at the end.' : 'Do not include hashtags.'}`;
    
    const systemPrompt = `You are a social media expert who creates engaging captions that drive engagement. Your captions should match the specified tone and platform conventions. Keep captions concise and appropriate for the platform.`;
    
    const caption = await generateText(prompt, { temperature: 0.7 });
    return caption || "Could not generate caption. Please try again.";
  } catch (error) {
    console.error("Error generating caption:", error);
    return "Could not generate caption. Please try again later.";
  }
}

/**
 * Analyze content performance and provide recommendations
 */
export async function analyzeContentPerformance(
  content: string,
  engagement: number,
  platform: string
): Promise<{
  insights: string[];
  recommendations: string[];
  audienceMatch: number;
}> {
  if (!isConfigured) {
    console.warn("OpenAI API key not configured. Using placeholder response.");
    return {
      insights: ["Placeholder insight (OpenAI API key not configured)"],
      recommendations: ["Placeholder recommendation (OpenAI API key not configured)"],
      audienceMatch: 50
    };
  }

  try {
    const prompt = `Analyze this ${platform} content: "${content}". It received ${engagement} engagements. Provide insights on why it performed this way and recommendations for improvement. Rate how well it matches the typical ${platform} audience on a scale of 0-100.`;
    
    const systemPrompt = `You are a data-driven content analyst who understands social media performance metrics. Analyze the content objectively and provide actionable recommendations based on platform-specific best practices. Return a JSON object with these keys: "insights" (array of strings), "recommendations" (array of strings), and "audienceMatch" (number between 0-100).`;
    
    const analysis = await generateJsonResponse<{
      insights: string[];
      recommendations: string[];
      audienceMatch: number;
    }>(prompt, systemPrompt);
    
    return analysis;
  } catch (error) {
    console.error("Error analyzing content performance:", error);
    return {
      insights: ["Could not analyze content. Please try again later."],
      recommendations: ["Could not generate recommendations. Please try again later."],
      audienceMatch: 50
    };
  }
}

/**
 * Suggest best times to post based on analytics and platform
 */
export async function suggestPostingTimes(
  platform: string,
  pastPerformance: { day: string; time: string; engagement: number }[] = []
): Promise<{ day: string; time: string; confidence: number }[]> {
  if (!isConfigured) {
    console.warn("OpenAI API key not configured. Using placeholder response.");
    return [
      { day: "Monday", time: "9:00 AM", confidence: 75 },
      { day: "Wednesday", time: "12:00 PM", confidence: 80 },
      { day: "Friday", time: "5:00 PM", confidence: 85 }
    ];
  }

  try {
    const pastPerformanceText = pastPerformance.length > 0 
      ? `Based on past performance data: ${JSON.stringify(pastPerformance)}`
      : "Without past performance data";
    
    const prompt = `${pastPerformanceText}, suggest the best 3 times to post on ${platform} for maximum engagement. Consider typical user behavior on this platform.`;
    
    const systemPrompt = `You are a social media analytics expert who understands optimal posting times for different platforms. Analyze any provided past performance data and combine it with your knowledge of general platform trends. Return a JSON array of objects with these keys: "day" (string), "time" (string in format "X:XX AM/PM"), and "confidence" (number between 0-100).`;
    
    const suggestions = await generateJsonResponse<{ day: string; time: string; confidence: number }[]>(prompt, systemPrompt);
    
    return suggestions;
  } catch (error) {
    console.error("Error suggesting posting times:", error);
    return [
      { day: "Monday", time: "9:00 AM", confidence: 60 },
      { day: "Wednesday", time: "12:00 PM", confidence: 60 },
      { day: "Friday", time: "5:00 PM", confidence: 60 }
    ];
  }
}

/**
 * Generate a color palette based on mood and description
 */
export async function generateColorPalette(
  mood: string,
  description?: string,
  count: number = 5
): Promise<{ colors: string[], explanation: string }> {
  if (!isConfigured) {
    console.warn("OpenAI API key not configured. Using placeholder response.");
    return {
      colors: ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#073B4C"],
      explanation: "A balanced color palette (OpenAI API key not configured)"
    };
  }

  try {
    const moodDesc = description ? `${mood} mood and this description: "${description}"` : `${mood} mood`;
    const prompt = `Generate a cohesive color palette of ${count} colors that represents a ${moodDesc}. The colors should work well together and convey the right emotional tone.`;
    
    const systemPrompt = `You are a professional color theory expert and designer who creates perfect color palettes based on moods and emotions. 
    Return a JSON object with these keys: 
    "colors" (array of exactly ${count} hex color codes like "#RRGGBB"), and 
    "explanation" (a brief description of the palette and how it relates to the requested mood).
    Ensure all colors work well together, have good contrast ratios when appropriate, and truly capture the essence of the requested mood.`;
    
    const palette = await generateJsonResponse<{
      colors: string[],
      explanation: string
    }>(prompt, systemPrompt, { temperature: 0.7 });
    
    // Ensure we have the right number of colors
    if (palette.colors.length !== count) {
      const defaultColors = ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#073B4C"];
      palette.colors = palette.colors.slice(0, count);
      
      // If we still don't have enough, add some default colors
      while (palette.colors.length < count) {
        palette.colors.push(defaultColors[palette.colors.length % defaultColors.length]);
      }
    }
    
    return palette;
  } catch (error) {
    console.error("Error generating color palette:", error);
    return {
      colors: ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#073B4C"],
      explanation: "Could not generate a palette. Please try again later."
    };
  }
}

export async function generateMoodPalette(mood: string): Promise<string[]> {
  try {
    // Check if OpenAI API key is configured
    if (!isConfigured) {
      console.warn("OpenAI API key not configured. Using fallback palette");
      return ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#073B4C"];
    }

    const prompt = `Generate a color palette of 5 colors that evokes the mood: ${mood}. Return only the hex codes in a JSON array format.`;
    
    const systemPrompt = `You are a color theory expert. Generate a color palette that captures the essence of the given mood. 
    Return ONLY a JSON array of exactly 5 hex color codes (e.g., ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"]).
    Do not include any explanation or additional text.`;
    
    const colors = await generateJsonResponse<string[]>(prompt, systemPrompt, { temperature: 0.7 });
    
    // Ensure we have exactly 5 colors
    if (Array.isArray(colors) && colors.length > 0) {
      // Trim to exactly 5 colors or pad with defaults if needed
      const result = colors.slice(0, 5);
      const defaults = ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#073B4C"];
      
      while (result.length < 5) {
        result.push(defaults[result.length % defaults.length]);
      }
      
      return result;
    }
    
    // Fallback palette
    return ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#073B4C"];
  } catch (error) {
    console.error("Error generating palette with OpenAI:", error);
    return ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#073B4C"];
  }
}

export default {
  isConfigured,
  generateText,
  generateJsonResponse,
  analyzeImage,
  generateContentIdeas,
  generateCaption,
  analyzeContentPerformance,
  suggestPostingTimes,
  generateColorPalette,
  generateMoodPalette
};