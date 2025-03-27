
import { generateJsonResponse } from './openai';

export interface ContentItem {
  id: string | number;
  title?: string;
  description?: string;
  imageUrl?: string;
  platform?: string;
  type?: string;
  tags?: string[];
}

export interface MoodAnalysis {
  mood: string;
  intensity: number; // 0-100
  keywords: string[];
}

export interface MoodCapsule {
  id?: string;
  title: string;
  subtitle: string;
  caption: string;
  mood: string;
  items: ContentItem[];
  createdAt?: Date;
}

/**
 * Analyzes content to detect mood and emotional tone
 */
export async function analyzeMood(contentItems: ContentItem[]): Promise<ContentItem[]> {
  try {
    const prompt = `
      Analyze the following content items for their emotional tone and mood:
      ${JSON.stringify(contentItems.map(item => ({
        title: item.title,
        description: item.description,
        platform: item.platform
      })))}
      
      For each item, determine the primary emotional tone (e.g., joyful, reflective, energetic, calm, nostalgic).
    `;
    
    const systemPrompt = `
      You are an expert in sentiment analysis and emotional intelligence for creative content.
      Analyze each content item and return the original array with an additional 'moodAnalysis' property for each item containing:
      {
        "mood": primary emotional tone (string),
        "intensity": emotional intensity (number 0-100),
        "keywords": array of mood-related keywords found in the content
      }
      Return the full array with these additions.
    `;

    const analyzedItems = await generateJsonResponse<(ContentItem & { moodAnalysis: MoodAnalysis })[]>(
      prompt, 
      systemPrompt,
      { temperature: 0.4 }
    );
    
    return analyzedItems;
  } catch (error) {
    console.error("Error analyzing mood:", error);
    // Return items with default mood analysis on error
    return contentItems.map(item => ({
      ...item,
      moodAnalysis: {
        mood: "neutral",
        intensity: 50,
        keywords: ["content"]
      }
    }));
  }
}

/**
 * Groups content items based on mood and creates themed capsules
 */
export async function createMoodCapsules(contentItems: (ContentItem & { moodAnalysis?: MoodAnalysis })[], selectedMood?: string): Promise<MoodCapsule[]> {
  try {
    // Filter by selected mood if provided
    const filteredItems = selectedMood 
      ? contentItems.filter(item => item.moodAnalysis?.mood === selectedMood)
      : contentItems;
    
    // Group items by mood
    const moodGroups: Record<string, ContentItem[]> = {};
    
    filteredItems.forEach(item => {
      const mood = item.moodAnalysis?.mood || 'unclassified';
      if (!moodGroups[mood]) {
        moodGroups[mood] = [];
      }
      moodGroups[mood].push(item);
    });
    
    // Generate capsules for each mood group
    const capsules: MoodCapsule[] = [];
    
    for (const [mood, items] of Object.entries(moodGroups)) {
      if (items.length === 0) continue;
      
      const prompt = `
        Create a mood capsule for content with the emotional tone: ${mood}.
        Content items: ${JSON.stringify(items.map(item => ({
          title: item.title,
          description: item.description
        })))}
        
        Create an engaging title, subtitle, and caption that captures the essence of this mood.
      `;
      
      const systemPrompt = `
        You are a creative storyteller specializing in emotional narratives.
        Generate a mood capsule with these properties:
        {
          "title": catchy title for this mood collection,
          "subtitle": brief supporting text expanding on the title,
          "caption": longer evocative description that tells a story about these items as a collection,
          "mood": the emotional tone
        }
      `;
      
      const capsule = await generateJsonResponse<Omit<MoodCapsule, 'items'>>(
        prompt,
        systemPrompt,
        { temperature: 0.7 }
      );
      
      capsules.push({
        ...capsule,
        items
      });
    }
    
    return capsules;
  } catch (error) {
    console.error("Error creating mood capsules:", error);
    // Return a default capsule on error
    return [{
      title: "Mixed Emotions",
      subtitle: "A collection of your creative content",
      caption: "A journey through your creative expressions, capturing various moments and feelings.",
      mood: "mixed",
      items: contentItems
    }];
  }
}

/**
 * Generate an AI caption for a mood capsule
 */
export async function generateCapsuleCaption(capsule: Partial<MoodCapsule>): Promise<string> {
  try {
    const prompt = `
      Generate a creative, evocative caption for a collection of content with the mood: ${capsule.mood}.
      Collection title: ${capsule.title}
      Content items: ${JSON.stringify(capsule.items?.map(item => ({
        title: item.title,
        description: item.description
      })))}
    `;
    
    const systemPrompt = `
      You are a poetic writer specializing in emotional storytelling.
      Create a captivating caption (2-3 sentences) that captures the essence of this content collection.
      The caption should evoke the emotional tone and create a narrative thread connecting the items.
    `;
    
    const response = await generateJsonResponse<{ caption: string }>(
      prompt,
      systemPrompt,
      { temperature: 0.8 }
    );
    
    return response.caption;
  } catch (error) {
    console.error("Error generating caption:", error);
    return "A thoughtfully curated collection of your creative moments, capturing the essence of your journey.";
  }
}
