
/**
 * Color utilities for accessibility and theme consistency
 */

/**
 * Calculate the relative luminance of a color
 * Based on WCAG 2.0 definitions
 * @param r Red channel (0-255)
 * @param g Green channel (0-255)
 * @param b Blue channel (0-255)
 * @returns Relative luminance value
 */
const relativeLuminance = (r: number, g: number, b: number): number => {
  // Convert to sRGB
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;
  
  // Convert to linear RGB
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

/**
 * Parse a hex color into RGB components
 * @param hex Hex color string (e.g. #RRGGBB or #RGB)
 * @returns Object with r, g, b values (0-255)
 */
export const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse as RGB
  let r, g, b;
  if (hex.length === 3) {
    // #RGB format
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else if (hex.length === 6) {
    // #RRGGBB format
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return null;
  }
  
  return { r, g, b };
};

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.0 formula
 * @param color1 First color in hex format
 * @param color2 Second color in hex format
 * @returns Contrast ratio (1-21)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const luminance1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const luminance2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  // Ensure lighter color is used as L1
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if a color combination meets WCAG contrast requirements
 * @param foreground Text color in hex format
 * @param background Background color in hex format
 * @param level Accessibility level ('AA' or 'AAA')
 * @param isLargeText Whether the text is considered large (>= 18pt or bold >= 14pt)
 * @returns Whether the combination passes the required contrast level
 */
export const isAccessible = (
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA', 
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AA') {
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  } else { // AAA
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
};

/**
 * Generate an accessible text color based on background
 * @param backgroundColor Background color in hex format
 * @returns Accessible text color in hex format
 */
export const getAccessibleTextColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#000000';
  
  const luminance = relativeLuminance(rgb.r, rgb.g, rgb.b);
  
  // Use white text on dark backgrounds, black text on light backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};
