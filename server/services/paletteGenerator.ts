
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
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4",
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

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    try {
      const data = JSON.parse(content.trim());
      const palette = PaletteSchema.parse(data);
      return palette;
    } catch (error) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid response format from AI");
    }
  } catch (error) {
    console.error("Error generating AI palette:", error);
    // Fallback to a default palette
    return {
      colors: [
        { hex: '#3498DB', name: 'Default Blue', role: 'primary' },
        { hex: '#2ECC71', name: 'Default Green', role: 'secondary' },
        { hex: '#FFFFFF', name: 'Default White', role: 'background' },
        { hex: '#F1C40F', name: 'Default Yellow', role: 'accent' },
        { hex: '#34495E', name: 'Default Navy', role: 'text' },
      ],
      moodName: 'Default',
      description: 'A fallback palette when AI generation fails',
    };
  }
}
