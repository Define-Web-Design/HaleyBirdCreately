
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
/**
 * Color utility functions
 */

/**
 * Converts a hex color to RGB
 * @param hex Hex color string (e.g., "#ffffff")
 * @returns RGB object with r, g, b properties
 */
export function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle shorthand hex
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Validate hex
  const validHex = /^[0-9A-F]{6}$/i.test(hex);
  if (!validHex) return null;
  
  // Parse values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Converts RGB to hex
 * @param r Red (0-255)
 * @param g Green (0-255)
 * @param b Blue (0-255)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');
}

/**
 * Checks if a color is dark
 * @param hex Hex color string
 * @returns Boolean indicating if the color is dark
 */
export function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  
  // Calculate perceived brightness using YIQ formula
  const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
  return yiq < 128; // < 128 is dark, >= 128 is light
}

/**
 * Adjusts a color's lightness
 * @param hex Hex color string
 * @param amount Amount to adjust (-100 to 100)
 * @returns Adjusted hex color
 */
export function adjustColorLightness(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Convert to HSL
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Adjust lightness
  let newL = l + amount / 100;
  newL = Math.max(0, Math.min(1, newL));
  
  // Convert back to RGB
  const newRgb = hslToRgb(h, s, newL);
  
  // Convert to hex
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Converts RGB to HSL
 * @param r Red (0-255)
 * @param g Green (0-255)
 * @param b Blue (0-255)
 * @returns HSL object with h, s, l properties
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    
    h /= 6;
  }
  
  return { h, s, l };
}

/**
 * Converts HSL to RGB
 * @param h Hue (0-1)
 * @param s Saturation (0-1)
 * @param l Lightness (0-1)
 * @returns RGB object with r, g, b properties
 */
export function hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Generates a color palette from a base color
 * @param baseColor Base color in hex format
 * @param steps Number of steps in the palette
 * @returns Array of hex colors
 */
export function generateColorPalette(baseColor: string, steps = 5): string[] {
  const palette: string[] = [];
  const rgb = hexToRgb(baseColor);
  if (!rgb) return [baseColor];
  
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Generate lighter and darker shades
  for (let i = 0; i < steps; i++) {
    const newL = Math.max(0, Math.min(1, l - 0.3 + (i * 0.6 / (steps - 1))));
    const newRgb = hslToRgb(h, s, newL);
    palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }
  
  return palette;
}
