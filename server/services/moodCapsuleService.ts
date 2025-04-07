import storage from '../storage';
import { ContentSentiment, MoodCapsule } from '../../shared/schema';
import { generateJsonResponse, generateText } from '../ai/openai';

export interface ContentWithSentiment {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  sentiment: ContentSentiment;
}

/**
 * Analyzes content and creates mood capsules based on emotional tone
 */
export async function createMoodCapsuleFromContent(
  userId: number,
  contentIds: number[],
  name: string,
  description?: string,
  emotionalTone?: string
): Promise<MoodCapsule> {
  // Fetch all the content items
  const contentItems = await Promise.all(
    contentIds.map(async (id) => {
      const content = await storage.getContentById(id);

      if (!content) {
        throw new Error(`Content with ID ${id} not found`);
      }

      // Get or create sentiment analysis for this content
      let sentiment = await storage.getContentSentimentByContentId(id);

      if (!sentiment) {
        // Perform AI sentiment analysis on content
        const analyzedSentiment = await analyzeContentSentiment(content);
        sentiment = await storage.createContentSentiment({
          contentId: id,
          userId: content.userId,
          dominantEmotion: analyzedSentiment.dominantEmotion,
          emotionIntensity: analyzedSentiment.emotionIntensity,
          emotionBreakdown: analyzedSentiment.emotionBreakdown,
          keywords: analyzedSentiment.keywords,
        });
      }

      return {
        id: content.id,
        title: content.title,
        description: content.description,
        imageUrl: content.imageUrl,
        sentiment
      };
    })
  );

  // Determine dominant emotion if not specified
  let capsuleEmotionalTone = emotionalTone;

  if (!capsuleEmotionalTone) {
    // Calculate the most common emotion across content
    const emotionCounts: Record<string, number> = {};
    contentItems.forEach(item => {
      const emotion = item.sentiment.dominantEmotion;
      if (emotion) {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }
    });

    // Find the most frequent emotion
    let maxCount = 0;
    let dominantEmotion = 'neutral';

    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    });

    capsuleEmotionalTone = dominantEmotion;
  }

  // Generate caption if needed
  const aiGeneratedCaption = await generateCaptionForContent(
    contentItems, 
    capsuleEmotionalTone
  );

  // Create the mood capsule
  const moodCapsule = await storage.createMoodCapsule({
    userId,
    name,
    description,
    emotionalTone: capsuleEmotionalTone,
    captionTone: 'balanced',
    aiGeneratedCaption,
    contentIds,
    thumbnailUrl: contentItems[0]?.imageUrl, // Use first content's image as thumbnail
    isArchived: false
  });

  // Track this as a user engagement
  await storage.createUserEngagement({
    userId,
    engagementType: 'mood_capsule_created',
    engagementDetails: {
      capsuleId: moodCapsule.id,
      contentCount: contentIds.length,
      emotionalTone: capsuleEmotionalTone
    },
    points: 15 // Award points for creating mood capsule
  });

  // Add evolution points for this creative activity
  await storage.addEvolutionPoints(userId, 15);

  return moodCapsule;
}

/**
 * Analyzes the emotional sentiment of content
 */
async function analyzeContentSentiment(content: any): Promise<{
  dominantEmotion: string;
  emotionIntensity: number;
  emotionBreakdown: Record<string, number>;
  keywords: string[];
}> {
  try {
    const prompt = `
      Analyze the emotional tone and sentiment of the following content:

      Title: ${content.title}
      Description: ${content.description || 'None'}
      Tags: ${content.tags?.join(', ') || 'None'}

      Provide a detailed emotional analysis.
    `;

    const systemPrompt = `
      You are an expert in sentiment analysis and emotional intelligence.
      Analyze the given content and determine its emotional characteristics.
      Return a JSON object with these properties:
      {
        "dominantEmotion": the primary emotion expressed (e.g., joy, nostalgia, excitement, calmness),
        "emotionIntensity": a number from 0-100 indicating how strong the emotional content is,
        "emotionBreakdown": an object mapping emotions to their intensity values (0-100),
        "keywords": an array of emotion-related keywords extracted from the content
      }
    `;

    const analysis = await generateJsonResponse<{
      dominantEmotion: string;
      emotionIntensity: number;
      emotionBreakdown: Record<string, number>;
      keywords: string[];
    }>(prompt, systemPrompt, { temperature: 0.4 });

    return {
      dominantEmotion: analysis.dominantEmotion || 'neutral',
      emotionIntensity: analysis.emotionIntensity || 50,
      emotionBreakdown: analysis.emotionBreakdown || { neutral: 100 },
      keywords: analysis.keywords || []
    };
  } catch (error) {
    console.error("Error analyzing content sentiment:", error);
    // Return default analysis if AI fails
    return {
      dominantEmotion: 'neutral',
      emotionIntensity: 50,
      emotionBreakdown: { neutral: 100 },
      keywords: []
    };
  }
}

/**
 * Generates a caption for content items based on emotional tone
 */
export async function generateCaptionForContent(
  contentItems: ContentWithSentiment[],
  emotionalTone: string,
  captionTone: string = 'balanced'
): Promise<string> {
  try {
    // Create a summary of the content for the AI
    const contentSummary = contentItems.map(item => ({
      title: item.title,
      description: item.description,
      emotion: item.sentiment.dominantEmotion,
      intensity: item.sentiment.emotionIntensity,
      keywords: item.sentiment.keywords
    }));

    const prompt = `
      Generate a thoughtful caption for a collection of content with the emotional tone: ${emotionalTone}.
      The caption tone should be: ${captionTone}.

      Content items: ${JSON.stringify(contentSummary)}

      Create a caption that captures the essence of this emotional theme and connects these items together.
      The caption should be 2-3 sentences long and reflect the emotional quality without being overly sentimental.
    `;

    const systemPrompt = `
      You are a creative writer who specializes in emotional storytelling and content curation.
      Create a meaningful caption that ties together content items with similar emotional tones.
      Your caption should be authentic, thoughtful, and appropriate for a creative professional platform.
      Avoid clichés and generic statements. Focus on creating a unique narrative that honors the emotional theme.
    `;

    const caption = await generateText(prompt, { temperature: 0.7 });
    return caption || "A collection of moments capturing the essence of " + emotionalTone;
  } catch (error) {
    console.error("Error generating caption for mood capsule:", error);
    // Return a simple fallback caption
    return "A collection of moments capturing the essence of " + emotionalTone;
  }
}

/**
 * Finds content with similar emotional tones
 */
export async function findSimilarEmotionalContent(
  userId: number,
  emotionalTone: string,
  limit: number = 10
): Promise<number[]> {
  // Get all content sentiment analyses for this user
  const sentiments = await storage.getContentSentimentsByUserId(userId);

  // Filter by the requested emotional tone
  const matchingSentiments = sentiments.filter(
    sentiment => sentiment.dominantEmotion?.toLowerCase() === emotionalTone.toLowerCase()
  );

  // Sort by emotion intensity (higher intensity first)
  matchingSentiments.sort((a, b) => (b.emotionIntensity || 0) - (a.emotionIntensity || 0));

  // Return the content IDs
  return matchingSentiments.slice(0, limit).map(sentiment => sentiment.contentId);
}

/**
 * Suggests emotion-based groupings for a user's content
 */
export async function suggestEmotionalGroups(
  userId: number
): Promise<Record<string, number[]>> {
  // Get all content sentiment analyses for this user
  const sentiments = await storage.getContentSentimentsByUserId(userId);

  // Group by dominant emotion
  const emotionGroups: Record<string, number[]> = {};

  sentiments.forEach(sentiment => {
    const emotion = sentiment.dominantEmotion || 'uncategorized';
    if (!emotionGroups[emotion]) {
      emotionGroups[emotion] = [];
    }
    emotionGroups[emotion].push(sentiment.contentId);
  });

  return emotionGroups;
}

// PostgreSQL-backed storage for mood capsules
let pool: any = null;

export const moodCapsuleService = {
  initialize: (dbPool: any) => {
    pool = dbPool;
  },

  getAllMoodCapsules: async (userId?: string) => {
    try {
      let query = 'SELECT * FROM mood_capsules';
      const params: any[] = [];

      if (userId) {
        query += ' WHERE user_id = $1';
        params.push(userId);
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching mood capsules:', error);
      throw error;
    }
  },

  getMoodCapsuleById: async (id: string) => {
    try {
      const result = await pool.query(
        'SELECT * FROM mood_capsules WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching mood capsule with id ${id}:`, error);
      throw error;
    }
  },

  createMoodCapsule: async (capsuleData: any) => {
    try {
      const { name, description, color, tags, content_ids, user_id, ai_generated } = capsuleData;

      const result = await pool.query(
        `INSERT INTO mood_capsules 
        (name, description, color, tags, content_ids, user_id, ai_generated, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
        RETURNING *`,
        [name, description, color, tags, content_ids, user_id, ai_generated || false]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating mood capsule:', error);
      throw error;
    }
  },

  updateMoodCapsule: async (id: string, updatedData: any) => {
    try {
      const existingCapsule = await this.getMoodCapsuleById(id);
      if (!existingCapsule) return null;

      const { name, description, color, tags, content_ids, ai_generated } = updatedData;

      const result = await pool.query(
        `UPDATE mood_capsules 
        SET name = $1, description = $2, color = $3, tags = $4, 
            content_ids = $5, ai_generated = $6, updated_at = NOW() 
        WHERE id = $7 
        RETURNING *`,
        [
          name || existingCapsule.name,
          description || existingCapsule.description,
          color || existingCapsule.color,
          tags || existingCapsule.tags,
          content_ids || existingCapsule.content_ids,
          ai_generated !== undefined ? ai_generated : existingCapsule.ai_generated,
          id
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error(`Error updating mood capsule with id ${id}:`, error);
      throw error;
    }
  },

  deleteMoodCapsule: async (id: string) => {
    try {
      const result = await pool.query(
        'DELETE FROM mood_capsules WHERE id = $1 RETURNING id',
        [id]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error deleting mood capsule with id ${id}:`, error);
      throw error;
    }
  },

  // New method for AI-powered content analysis and tagging
  analyzeAndTagContent: async (contentText: string, userId: string) => {
    try {
      // First, analyze the content using OpenAI (implemented in a separate service)
      const openaiService = (await import('../ai/openai')).default;
      const analysis = await openaiService.analyzeContent(contentText);

      // Store the analysis results
      const result = await pool.query(
        `INSERT INTO content_analysis
        (user_id, content_text, sentiment, topics, keywords, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *`,
        [userId, contentText, analysis.sentiment, analysis.topics, analysis.keywords]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw error;
    }
  },

  // Predictive content recommendations
  getContentRecommendations: async (userId: string) => {
    try {
      // Get user's past content interactions
      const result = await pool.query(
        `SELECT c.*, ca.sentiment, ca.topics, ca.keywords
        FROM content c
        JOIN content_analysis ca ON c.id = ca.content_id
        WHERE c.user_id = $1
        ORDER BY c.created_at DESC
        LIMIT 20`,
        [userId]
      );

      // Use the data to generate recommendations (simplified)
      // In a real implementation, this would use a recommendation algorithm
      return result.rows;
    } catch (error) {
      console.error('Error getting content recommendations:', error);
      throw error;
    }
  }
};