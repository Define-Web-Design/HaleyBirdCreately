
import { z } from 'zod';
import OpenAI from 'openai';
import { MoodTone } from '../../shared/schema';

// Define the schema for color palette
const ColorSchema = z.object({
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  name: z.string(),
  role: z.string(),
});

export type Color = z.infer<typeof ColorSchema>;

const PaletteSchema = z.object({
  colors: z.array(ColorSchema),
  moodName: z.string(),
  description: z.string().optional(),
});

export type Palette = z.infer<typeof PaletteSchema>;

/**
 * Generates a color palette based on a mood tone
 * @param mood The mood tone to generate a palette for
 * @returns A palette of colors
 */
export async function generateMoodPalette(mood: MoodTone): Promise<Palette> {
  // For now, use predefined palettes
  const palettes: Record<MoodTone, Palette> = {
    [MoodTone.ENERGETIC]: {
      colors: [
        { hex: '#FF5252', name: 'Vibrant Red', role: 'primary' },
        { hex: '#FFBC00', name: 'Sunshine Yellow', role: 'secondary' },
        { hex: '#FF914D', name: 'Energetic Orange', role: 'accent' },
        { hex: '#FFFFFF', name: 'Clean White', role: 'background' },
        { hex: '#333333', name: 'Deep Charcoal', role: 'text' },
      ],
      moodName: 'Energetic',
      description: 'A vibrant, high-energy palette that evokes movement and excitement',
    },
    [MoodTone.CALM]: {
      colors: [
        { hex: '#6FB5CE', name: 'Serene Blue', role: 'primary' },
        { hex: '#A4D4AE', name: 'Soft Mint', role: 'secondary' },
        { hex: '#F4F9F4', name: 'Whisper White', role: 'background' },
        { hex: '#D0E8CF', name: 'Pale Sage', role: 'accent' },
        { hex: '#445552', name: 'Deep Teal', role: 'text' },
      ],
      moodName: 'Calm',
      description: 'A peaceful, balanced palette that soothes and centers',
    },
    [MoodTone.PROFESSIONAL]: {
      colors: [
        { hex: '#2C3E50', name: 'Deep Navy', role: 'primary' },
        { hex: '#34495E', name: 'Slate Gray', role: 'secondary' },
        { hex: '#ECF0F1', name: 'Cloud White', role: 'background' },
        { hex: '#3498DB', name: 'Professional Blue', role: 'accent' },
        { hex: '#2C3E50', name: 'Navy Text', role: 'text' },
      ],
      moodName: 'Professional',
      description: 'A confident, polished palette that conveys expertise and trust',
    },
    [MoodTone.PLAYFUL]: {
      colors: [
        { hex: '#FF6B6B', name: 'Playful Coral', role: 'primary' },
        { hex: '#48DBFB', name: 'Sky Blue', role: 'secondary' },
        { hex: '#FFFFFF', name: 'Bright White', role: 'background' },
        { hex: '#FFF86B', name: 'Sunshine Yellow', role: 'accent' },
        { hex: '#333333', name: 'Deep Gray', role: 'text' },
      ],
      moodName: 'Playful',
      description: 'A whimsical, light-hearted palette that encourages creativity and joy',
    },
    [MoodTone.ELEGANT]: {
      colors: [
        { hex: '#8C7B72', name: 'Taupe', role: 'primary' },
        { hex: '#2C2C2C', name: 'Rich Black', role: 'secondary' },
        { hex: '#F9F6F2', name: 'Cream', role: 'background' },
        { hex: '#D7C9B8', name: 'Warm Beige', role: 'accent' },
        { hex: '#2C2C2C', name: 'Classic Black', role: 'text' },
      ],
      moodName: 'Elegant',
      description: 'A sophisticated, refined palette that conveys luxury and timelessness',
    },
    [MoodTone.NOSTALGIC]: {
      colors: [
        { hex: '#F9C58D', name: 'Vintage Gold', role: 'primary' },
        { hex: '#BF7B54', name: 'Aged Copper', role: 'secondary' },
        { hex: '#FAF3E4', name: 'Antique Paper', role: 'background' },
        { hex: '#8C8470', name: 'Faded Olive', role: 'accent' },
        { hex: '#5A5047', name: 'Sepia Brown', role: 'text' },
      ],
      moodName: 'Nostalgic',
      description: 'A warm, memory-evoking palette with a touch of vintage charm',
    },
    [MoodTone.MYSTERIOUS]: {
      colors: [
        { hex: '#484273', name: 'Midnight Purple', role: 'primary' },
        { hex: '#2B2231', name: 'Deep Violet', role: 'secondary' },
        { hex: '#0F0C1A', name: 'Enigmatic Black', role: 'background' },
        { hex: '#645E9D', name: 'Twilight Blue', role: 'accent' },
        { hex: '#E6E6FA', name: 'Misty White', role: 'text' },
      ],
      moodName: 'Mysterious',
      description: 'An intriguing, atmospheric palette that evokes curiosity and wonder',
    },
    [MoodTone.BOLD]: {
      colors: [
        { hex: '#FF1E56', name: 'Striking Red', role: 'primary' },
        { hex: '#FFAC41', name: 'Bold Orange', role: 'secondary' },
        { hex: '#FFFFFF', name: 'Stark White', role: 'background' },
        { hex: '#323232', name: 'Charcoal Gray', role: 'accent' },
        { hex: '#000000', name: 'Pure Black', role: 'text' },
      ],
      moodName: 'Bold',
      description: 'A powerful, attention-grabbing palette with high contrast and impact',
    },
  };

  return palettes[mood];
}

/**
 * Generate a color palette based on a description using AI
 * @param description Text description of the desired mood or theme
 * @returns A palette of colors
 */
export async function generateAIPalette(description: string): Promise<Palette> {
  // Cache implementation for frequent palette requests
  const cacheKey = `palette:${description.toLowerCase().trim()}`;
  const cachedResult = await getCachedPalette(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    // Check if OpenAI API key is configured and valid
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not found in environment. Using fallback palette.");
      throw new Error("OpenAI API key not configured");
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("OpenAI request timed out")), 10000);
    });

    const openaiPromise = openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use a more widely available model
      messages: [
        {
          role: "system",
          content: 
            "You are a color palette generator. Generate a 5-color palette based on the mood or theme described. " +
            "Return ONLY valid JSON with the following structure: " +
            "{ \"colors\": [" +
            "{ \"hex\": \"#HEXCODE\", \"name\": \"Color Name\", \"role\": \"primary\" }, " +
            "{ \"hex\": \"#HEXCODE\", \"name\": \"Color Name\", \"role\": \"secondary\" }, " +
            "{ \"hex\": \"#HEXCODE\", \"name\": \"Color Name\", \"role\": \"background\" }, " +
            "{ \"hex\": \"#HEXCODE\", \"name\": \"Color Name\", \"role\": \"accent\" }, " +
            "{ \"hex\": \"#HEXCODE\", \"name\": \"Color Name\", \"role\": \"text\" } " +
            "], " +
            "\"moodName\": \"Short name for the mood\", " +
            "\"description\": \"Brief description of the palette and how it evokes the mood\" }"
        },
        {
          role: "user",
          content: `Generate a color palette for: ${description}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Race between timeout and API request
    const response = await Promise.race([openaiPromise, timeoutPromise]);
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    try {
      const data = JSON.parse(content.trim());
      const palette = PaletteSchema.parse(data);
      
      // Cache successful result
      await cachePalette(cacheKey, palette);
      
      return palette;
    } catch (error) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid response format from AI");
    }
  } catch (error) {
    console.error("Error generating AI palette:", error);
    // Fallback to a default palette based on the description's characteristics
    const fallbackPalette = generateFallbackPalette(description);
    return fallbackPalette;
  }
}

// Helper function to get cached palette (to be implemented with actual caching solution)
async function getCachedPalette(key: string): Promise<Palette | null> {
  // This would normally use Redis or another caching system
  // For now, just return null to indicate no cache hit
  return null;
}

// Helper function to cache a palette (to be implemented with actual caching solution)
async function cachePalette(key: string, palette: Palette): Promise<void> {
  // This would normally store in Redis or another caching system
  // For now, it's a no-op
}

// Generate a fallback palette that's more tailored to the description
function generateFallbackPalette(description: string): Palette {
  const lowercaseDesc = description.toLowerCase();
  
  // Determine if description contains certain mood keywords
  const isEnergeticOrBold = /energ|bold|vibrant|bright|power/i.test(lowercaseDesc);
  const isCalmOrSoft = /calm|soft|gentle|peaceful|serene/i.test(lowercaseDesc);
  const isProfessionalOrCorporate = /professional|corporate|business|formal/i.test(lowercaseDesc);
  const isPlayfulOrFun = /playful|fun|creative|joy|happy/i.test(lowercaseDesc);
  const isElegantOrLuxury = /elegant|luxury|sophisticated|premium/i.test(lowercaseDesc);
  
  if (isEnergeticOrBold) {
    return {
      colors: [
        { hex: '#FF3B30', name: 'Dynamic Red', role: 'primary' },
        { hex: '#FF9500', name: 'Energetic Orange', role: 'secondary' },
        { hex: '#FFFFFF', name: 'Clean White', role: 'background' },
        { hex: '#FFCC00', name: 'Vibrant Yellow', role: 'accent' },
        { hex: '#1D1D1F', name: 'Bold Black', role: 'text' },
      ],
      moodName: 'Energetic',
      description: 'A high-energy palette with bold, attention-grabbing colors',
    };
  } else if (isCalmOrSoft) {
    return {
      colors: [
        { hex: '#90CAF9', name: 'Calm Blue', role: 'primary' },
        { hex: '#A5D6A7', name: 'Soft Green', role: 'secondary' },
        { hex: '#F5F5F5', name: 'Gentle Gray', role: 'background' },
        { hex: '#E1BEE7', name: 'Soft Lavender', role: 'accent' },
        { hex: '#455A64', name: 'Muted Blue-Gray', role: 'text' },
      ],
      moodName: 'Peaceful',
      description: 'A soothing palette that promotes tranquility and balance',
    };
  } else if (isProfessionalOrCorporate) {
    return {
      colors: [
        { hex: '#0A66C2', name: 'Professional Blue', role: 'primary' },
        { hex: '#2C3E50', name: 'Corporate Navy', role: 'secondary' },
        { hex: '#F9F9F9', name: 'Clean Gray', role: 'background' },
        { hex: '#00A0DC', name: 'Accent Blue', role: 'accent' },
        { hex: '#333333', name: 'Professional Gray', role: 'text' },
      ],
      moodName: 'Professional',
      description: 'A polished palette conveying trust and professionalism',
    };
  } else if (isPlayfulOrFun) {
    return {
      colors: [
        { hex: '#FF6B6B', name: 'Playful Coral', role: 'primary' },
        { hex: '#48DBFB', name: 'Fun Blue', role: 'secondary' },
        { hex: '#FFFFFF', name: 'Bright White', role: 'background' },
        { hex: '#FFDA79', name: 'Cheerful Yellow', role: 'accent' },
        { hex: '#546E7A', name: 'Balanced Gray', role: 'text' },
      ],
      moodName: 'Playful',
      description: 'A whimsical palette encouraging creativity and joy',
    };
  } else if (isElegantOrLuxury) {
    return {
      colors: [
        { hex: '#8E44AD', name: 'Rich Purple', role: 'primary' },
        { hex: '#2C3E50', name: 'Deep Navy', role: 'secondary' },
        { hex: '#F5F5F5', name: 'Soft Cream', role: 'background' },
        { hex: '#D4AF37', name: 'Elegant Gold', role: 'accent' },
        { hex: '#2C2C2C', name: 'Sophisticated Black', role: 'text' },
      ],
      moodName: 'Elegant',
      description: 'A sophisticated palette conveying luxury and refinement',
    };
  } else {
    // Default fallback palette with neutral, versatile colors
    return {
      colors: [
        { hex: '#3498DB', name: 'Default Blue', role: 'primary' },
        { hex: '#2ECC71', name: 'Default Green', role: 'secondary' },
        { hex: '#FFFFFF', name: 'Default White', role: 'background' },
        { hex: '#F1C40F', name: 'Default Yellow', role: 'accent' },
        { hex: '#34495E', name: 'Default Navy', role: 'text' },
      ],
      moodName: 'Default',
      description: 'A versatile palette suitable for various applications',
    };
  }
}
