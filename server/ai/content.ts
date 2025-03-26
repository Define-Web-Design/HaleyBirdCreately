import openai from './openai';
import { Content, InsertMoodBoard } from '@shared/schema';

interface ContentAnalysis {
  sentiment: number;
  engagementPrediction: number;
  audienceMatch: number;
  tags: string[];
  improvementSuggestions: string[];
}

interface MoodBoardImage {
  url: string;
  description: string;
}

/**
 * Analyzes content using AI to provide insights
 */
export async function analyzeContent(content: Content): Promise<ContentAnalysis> {
  const prompt = `
    Analyze this social media content:
    
    Title: ${content.title}
    Description: ${content.description || 'No description'}
    Platform: ${content.platform || 'Not specified'}
    Status: ${content.status}
    
    Provide detailed analysis including sentiment score, engagement prediction,
    audience match, suggested tags, and improvement suggestions.
  `;
  
  const systemPrompt = `
    You are an expert social media content analyst. Analyze the given content and return a JSON response with the following structure:
    {
      "sentiment": number between 0-100,
      "engagementPrediction": number between 0-100,
      "audienceMatch": number between 0-100,
      "tags": array of string tags relevant to the content,
      "improvementSuggestions": array of string suggestions for improvement
    }
  `;
  
  return await openai.generateJsonResponse<ContentAnalysis>(prompt, systemPrompt, { temperature: 0.3 });
}

/**
 * Generates a caption for content
 */
export async function generateCaption(
  content: Content, 
  tone: string = 'engaging', 
  length: string = 'medium'
): Promise<string> {
  const prompt = `
    Generate a social media caption for this content:
    
    Title: ${content.title}
    Description: ${content.description || 'No description'}
    Platform: ${content.platform || 'Not specified'}
    
    The caption should be ${length} in length and have a ${tone} tone.
    Include appropriate hashtags at the end.
  `;
  
  return await openai.generateText(prompt, { temperature: 0.7 });
}

/**
 * Creates a mood board based on theme and keywords
 */
export async function createMoodBoard(
  userId: number,
  title: string,
  description: string,
  theme: string,
  keywords: string[] = []
): Promise<InsertMoodBoard> {
  const prompt = `
    Create a mood board for a social media content creator with the following details:
    
    Title: ${title}
    Description: ${description || 'No description'}
    Theme: ${theme}
    Keywords: ${keywords.join(', ') || 'None provided'}
    
    Provide a JSON response with an array of image recommendations including URLs and descriptions.
    These images should be freely usable stock photos that match the theme and evoke the right mood.
  `;
  
  const systemPrompt = `
    You are an expert visual designer and mood board creator. Create a mood board by recommending
    5 stock photos from free sources like Unsplash, along with descriptions of each image.
    Return a JSON object with the following structure:
    {
      "images": [
        { "url": "https://example.com/image.jpg", "description": "Description of the image" }
      ]
    }
  `;
  
  // Get AI-generated mood board images
  const result = await openai.generateJsonResponse<{ images: MoodBoardImage[] }>(
    prompt, 
    systemPrompt, 
    { temperature: 0.7 }
  );
  
  // Extract URLs for storage
  const imageUrls = result.images.map(img => img.url);
  
  // Create the mood board object
  const moodBoard: InsertMoodBoard = {
    userId,
    title,
    description,
    images: imageUrls,
    tags: keywords,
  };
  
  return moodBoard;
}

export default {
  analyzeContent,
  generateCaption,
  createMoodBoard
};
