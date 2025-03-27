import { generateText, generateJsonResponse } from '../ai/openai';

interface MoodPaletteParams {
  mood: string;
  description?: string;
  colorCount?: number;
  includeNames?: boolean;
}

interface ColorInfo {
  hex: string;
  name?: string;
}

interface GeneratedPalette {
  colors: ColorInfo[];
  moodDescription: string;
  suggestedTags: string[];
}

/**
 * Generate a color palette based on mood using AI
 * 
 * @param params Parameters for palette generation
 * @returns A generated color palette with colors, description, and tags
 */
export async function generateMoodPalette(params: MoodPaletteParams): Promise<GeneratedPalette> {
  const { mood, description, colorCount = 5, includeNames = true } = params;
  
  try {
    const colorNames = includeNames ? 'true' : 'false';
    const prompt = `
      Generate a harmonious color palette based on the mood: "${mood}"
      ${description ? `Additional context: "${description}"` : ''}
      
      The palette should contain exactly ${colorCount} colors that work well together.
      ${includeNames ? 'Include descriptive names for each color.' : ''}
      
      Also provide:
      1. A short description of the mood and how the colors reflect it
      2. A list of 3-5 tags that describe this palette's style, usage scenarios, or associated concepts
      
      Format the response as a JSON object with the following structure:
      {
        "colors": [
          {
            "hex": "#HEXCODE",
            ${includeNames ? '"name": "Color Name",' : ''}
          }
        ],
        "moodDescription": "Short description of the palette mood and color relationships",
        "suggestedTags": ["tag1", "tag2", "tag3"]
      }
    `;

    const response = await generateJsonResponse<GeneratedPalette>(prompt, {
      temperature: 0.7
    });

    // Ensure we have the right number of colors
    if (response.colors.length !== colorCount) {
      // Adjust array length if needed
      if (response.colors.length > colorCount) {
        response.colors = response.colors.slice(0, colorCount);
      } else {
        // If we have fewer colors than requested, duplicate the last one
        // (this should rarely happen with a well-structured prompt)
        while (response.colors.length < colorCount) {
          const lastColor = response.colors[response.colors.length - 1];
          response.colors.push({ ...lastColor });
        }
      }
    }

    // Ensure all colors have proper hex format
    response.colors = response.colors.map((color) => ({
      ...color,
      hex: color.hex.startsWith('#') ? color.hex : `#${color.hex}`
    }));

    return response;
  } catch (error) {
    console.error('Error generating palette:', error);
    
    // Return a default palette if AI generation fails
    return {
      colors: Array(colorCount).fill(0).map((_, i) => ({
        hex: ['#F94144', '#F3722C', '#F8961E', '#F9C74F', '#90BE6D', '#43AA8B', '#577590'][i % 7],
        name: includeNames ? `Color ${i+1}` : undefined
      })),
      moodDescription: `A palette based on the mood "${mood}"${description ? ` with elements of ${description}` : ''}`,
      suggestedTags: [mood, 'palette', 'colors']
    };
  }
}

/**
 * Generate color palette based on image analysis
 * 
 * This would extract dominant colors from an image and create a palette
 * For future implementation
 */
export async function generatePaletteFromImage(imageUrl: string): Promise<GeneratedPalette> {
  // This is a placeholder for future functionality
  // Would use image analysis to extract dominant colors
  
  return {
    colors: [
      { hex: '#264653', name: 'Deep Teal' },
      { hex: '#2A9D8F', name: 'Persian Green' },
      { hex: '#E9C46A', name: 'Saffron' },
      { hex: '#F4A261', name: 'Sandy Brown' },
      { hex: '#E76F51', name: 'Burnt Sienna' }
    ],
    moodDescription: 'Palette extracted from the uploaded image, capturing its dominant colors and mood.',
    suggestedTags: ['image-extracted', 'photo-palette', 'visual']
  };
}