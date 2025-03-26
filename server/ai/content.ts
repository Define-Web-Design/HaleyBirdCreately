import openai from './openai';
import { Content, InsertMoodBoard } from '@shared/schema';

interface ContentAnalysis {
  sentiment: number;
  engagementPrediction: number;
  audienceMatch: number;
  tags: string[];
  improvementSuggestions: string[];
  bestTimeToPost?: string;
  contentScore?: number;
  imageInsights?: string;
  visualScore?: number;
}

interface MoodBoardImage {
  url: string;
  description: string;
}

/**
 * Analyzes an image to extract visual insights
 */
async function analyzeImage(imageUrl: string, options?: any): Promise<string> {
  try {
    // Check if OpenAI is configured
    if (!openai.isConfigured) {
      console.warn("OpenAI API key not configured. Using placeholder for image analysis.");
      return "Image analysis not available (OpenAI API key not configured)";
    }

    // In a production environment, we would fetch the image as base64
    // For now, we'll use the OpenAI text API to simulate image analysis
    const prompt = `
      Analyze this image URL: ${imageUrl}

      Provide visual insights about this image that could help a content creator optimize it for social media,
      including color palette, composition, focal points, and potential audience appeal.
    `;

    // In a real implementation with image data:
    // return await openai.analyzeImage(base64Image, prompt);

    // Text-based simulation for development:
    const result = await openai.generateText(prompt, { temperature: 0.5, maxTokens: 300 });
    return result || "No insights available for this image";
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Error analyzing image. Please try again later.";
  }
}

/**
 * Analyzes content using AI to provide insights
 */
export async function analyzeContent(content: Content): Promise<ContentAnalysis> {
  try {
    // Check if OpenAI is configured
    if (!openai.isConfigured) {
      console.warn("OpenAI API key not configured. Using placeholder for content analysis.");
      return {
        sentiment: Math.floor(Math.random() * 30) + 50, // 50-80 range
        engagementPrediction: Math.floor(Math.random() * 40) + 40, // 40-80 range
        audienceMatch: Math.floor(Math.random() * 30) + 55, // 55-85 range
        tags: ["content", content.platform?.toLowerCase() || "social", "creativity"],
        improvementSuggestions: [
          "Add more engaging visuals to your content",
          "Try using questions to engage your audience",
          "Include a call to action at the end",
          "Test different posting times to find your optimal schedule"
        ],
        bestTimeToPost: "Weekdays between 9 AM and 6 PM",
        contentScore: Math.floor(Math.random() * 20) + 60, // 60-80 range
      };
    }

    const prompt = `
      Analyze this social media content:

      Title: ${content.title}
      Description: ${content.description || 'No description'}
      Platform: ${content.platform || 'Not specified'}
      Status: ${content.status}
      Image: ${content.imageUrl ? 'Yes' : 'No'}

      Provide comprehensive analysis for content optimization and performance prediction.
    `;

    const systemPrompt = `
      You are an expert social media content analyst specializing in visual and textual content optimization.
      Analyze the content holistically and return a detailed JSON response with:
      {
        "sentiment": number 0-100 representing emotional impact,
        "engagementPrediction": number 0-100 based on historical patterns,
        "audienceMatch": number 0-100 for target demographic fit,
        "tags": array of relevant hashtags and keywords,
        "improvementSuggestions": array of actionable improvements,
        "bestTimeToPost": string suggesting optimal posting time,
        "contentScore": number 0-100 for overall quality
      }
    `;

    const analysis = await openai.generateJsonResponse<ContentAnalysis>(prompt, systemPrompt, { 
      temperature: 0.4,
      maxTokens: 500
    });

    // Enhance analysis with image-specific insights if image present
    if (content.imageUrl) {
      const imageAnalysis = await analyzeImage(content.imageUrl);
      return {
        ...analysis,
        imageInsights: imageAnalysis
      };
    }

    return analysis;
  } catch (error) {
    console.error("Error analyzing content:", error);
    // Fallback to basic analysis if AI fails
    return {
      sentiment: 65,
      engagementPrediction: 60,
      audienceMatch: 70,
      tags: ["content", content.platform?.toLowerCase() || "social"],
      improvementSuggestions: ["AI analysis failed. Try again later."],
      bestTimeToPost: "Weekdays during business hours",
      contentScore: 65
    };
  }
}

/**
 * Generates a caption for content
 */
export async function generateCaption(
  content: Content, 
  tone: string = 'engaging', 
  length: string = 'medium'
): Promise<string> {
  try {
    // Check if OpenAI is configured
    if (!openai.isConfigured) {
      console.warn("OpenAI API key not configured. Using placeholder for caption generation.");
      const platform = content.platform?.toLowerCase() || "social";
      return `Check out my latest ${content.title || "content"}! Let me know what you think in the comments below. #${platform} #content #creative`;
    }

    const prompt = `
      Generate a social media caption for this content:

      Title: ${content.title}
      Description: ${content.description || 'No description'}
      Platform: ${content.platform || 'Not specified'}

      The caption should be ${length} in length and have a ${tone} tone.
      Include appropriate hashtags at the end.
    `;

    const caption = await openai.generateText(prompt, { temperature: 0.7 });
    return caption || `Check out my latest ${content.title || "content"}! #content`;
  } catch (error) {
    console.error("Error generating caption:", error);
    return `Check out my latest ${content.title || "content"}! #content`;
  }
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
  try {
    // Check if OpenAI is configured
    if (!openai.isConfigured) {
      console.warn("OpenAI API key not configured. Using placeholder for mood board creation.");
      // Generate placeholder images
      const images = [
        `https://picsum.photos/seed/${title.replace(/\s+/g, '')}/400/300`,
        `https://picsum.photos/seed/${theme.replace(/\s+/g, '')}/400/300`,
        `https://picsum.photos/seed/${keywords[0] || 'creative'}/400/300`,
        `https://picsum.photos/seed/${Date.now()}/400/300`,
        `https://picsum.photos/seed/${userId}/400/300`
      ];

      return {
        userId,
        title,
        description,
        images,
        tags: keywords,
      };
    }

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
  } catch (error) {
    console.error("Error creating mood board:", error);

    // Fallback to generic images in case of error
    const images = [
      "https://picsum.photos/seed/mood1/400/300",
      "https://picsum.photos/seed/mood2/400/300",
      "https://picsum.photos/seed/mood3/400/300",
      "https://picsum.photos/seed/mood4/400/300"
    ];

    return {
      userId,
      title,
      description,
      images,
      tags: keywords,
    };
  }
}

/**
 * Generate content ideas based on a theme
 */
export async function generateContentIdeas(
  theme: string,
  platform: string = "social media",
  count: number = 5
): Promise<string[]> {
  try {
    // Check if OpenAI is configured
    if (!openai.isConfigured) {
      console.warn("OpenAI API key not configured. Using placeholder for content ideas.");
      return [
        `${theme} inspiration for your next post`,
        `How to incorporate ${theme} into your daily routine`,
        `The best ${theme} tips for beginners`,
        `${theme} trends to watch in 2025`,
        `Why ${theme} matters for your audience`
      ].slice(0, count);
    }

    // Use new OpenAI function to generate content ideas
    const prompt = `Generate ${count} creative content ideas for ${platform} about "${theme}". 
                   Make these ideas specific, attention-grabbing, and tailored to ${platform}'s audience.`;

    const systemPrompt = `You are a professional content strategist who understands what performs well on different social media platforms. 
                         Provide engaging, platform-specific content ideas that will resonate with the audience. 
                         Return a JSON array of strings with each idea.`;

    const ideas = await openai.generateJsonResponse<string[]>(prompt, systemPrompt, { temperature: 0.9 });
    return ideas || [];
  } catch (error) {
    console.error("Error generating content ideas:", error);
    return Array(count).fill("Could not generate ideas. Please try again later.");
  }
}

/**
 * Suggests optimal posting times based on platform
 */
export async function suggestPostingTimes(
  platform: string,
  userEngagementData: any[] = []
): Promise<{ day: string; time: string; confidence: number }[]> {
  try {
    // Check if OpenAI is configured
    if (!openai.isConfigured) {
      console.warn("OpenAI API key not configured. Using placeholder for posting times.");
      return [
        { day: "Monday", time: "9:00 AM", confidence: 75 },
        { day: "Wednesday", time: "12:00 PM", confidence: 80 },
        { day: "Friday", time: "5:00 PM", confidence: 85 }
      ];
    }

    return await openai.suggestPostingTimes(platform, userEngagementData);
  } catch (error) {
    console.error("Error suggesting posting times:", error);
    return [
      { day: "Monday", time: "9:00 AM", confidence: 60 },
      { day: "Wednesday", time: "12:00 PM", confidence: 60 },
      { day: "Friday", time: "5:00 PM", confidence: 60 }
    ];
  }
}

export default {
  analyzeContent,
  generateCaption,
  createMoodBoard,
  generateContentIdeas,
  suggestPostingTimes
};