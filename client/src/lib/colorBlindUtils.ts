/**
 * Utility functions for color blind accessibility
 */

// Convert hex to RGB
export const hexToRgb = (hex: string): number[] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

// Convert RGB to hex
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Calculate luminance of a color
export const getLuminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// Calculate contrast ratio between two colors
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const luminance1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const luminance2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  
  const brighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (brighter + 0.05) / (darker + 0.05);
};

// Helper function: Convert HSL to RGB
const hslToRgb = (h: number, s: number, l: number): number[] => {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
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
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// Adjust a color to be more accessible for color blind users
export const makeColorAccessible = (color: string): string => {
  const rgb = hexToRgb(color);
  
  // Convert to HSL-like values for easier manipulation
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else if (max === b) {
      h = (r - g) / d + 4;
    }
    
    h /= 6;
  }
  
  // Increase contrast and adjust hue/saturation for color blind friendliness
  const adjustedS = Math.min(s * 1.2, 1); // Increase saturation
  const adjustedL = l < 0.5 ? Math.max(0.25, l) : Math.min(0.85, l); // Avoid very dark or very bright colors
  
  const adjustedRgb = hslToRgb(h, adjustedS, adjustedL);
  return rgbToHex(adjustedRgb[0], adjustedRgb[1], adjustedRgb[2]);
};

// Generate a color palette that's accessible for color blind users
export const generateAccessiblePalette = (baseColor: string, numColors = 5): string[] => {
  const result: string[] = [baseColor];
  const rgb = hexToRgb(baseColor);
  
  // Convert to HSL-like values
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else if (max === b) {
      h = (r - g) / d + 4;
    }
    
    h /= 6;
  }
  
  // Use the existing hslToRgb function defined earlier

  // Generate analogous colors with higher contrast
  for (let i = 1; i < numColors; i++) {
    // Adjust hue to create accessible analogous colors
    const hueStep = 0.1;
    const newHue = (h + hueStep * i) % 1;
    
    // Ensure good saturation and lightness
    const newSat = Math.min(0.85, s + (i % 2 === 0 ? 0.1 : -0.1));
    const newLight = Math.max(0.2, Math.min(0.8, l + (i % 3 === 0 ? 0.15 : -0.15)));
    
    const newRgb = hslToRgb(newHue, newSat, newLight);
    result.push(rgbToHex(newRgb[0], newRgb[1], newRgb[2]));
  }
  
  return result;
};

// Apply color-blind specific CSS variables to the document
export const applyColorBlindStyles = (isColorBlind: boolean) => {
  if (isColorBlind) {
    document.documentElement.style.setProperty('--color-contrast-high', '0.9'); // Higher contrast
    document.documentElement.style.setProperty('--accessible-font-size', '1.05em'); // Slightly larger text
    
    // Add CSS rules for color blind mode
    const style = document.createElement('style');
    style.id = 'color-blind-styles';
    style.textContent = `
      .color-blind-mode {
        /* Increase contrast for better visibility */
        --color-contrast-multiplier: 1.2;
        
        /* Ensure text has good contrast against backgrounds */
        --color-blind-text: #000000;
        --color-blind-text-inverse: #ffffff;
        
        /* Use patterns in addition to colors for charts and visualizations */
        --chart-pattern-1: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px);
        --chart-pattern-2: repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px);
        --chart-pattern-3: repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px);
      }
      
      /* Apply high contrast borders to interactive elements */
      .color-blind-mode button,
      .color-blind-mode a,
      .color-blind-mode input,
      .color-blind-mode select {
        outline: 2px solid transparent;
        transition: outline-color 0.2s ease-in-out;
      }
      
      .color-blind-mode button:focus,
      .color-blind-mode a:focus,
      .color-blind-mode input:focus,
      .color-blind-mode select:focus {
        outline-color: #000000;
      }
      
      /* Add symbols and patterns to distinguish data points in charts */
      .color-blind-mode .chart-item-1 {
        background-image: var(--chart-pattern-1);
      }
      
      .color-blind-mode .chart-item-2 {
        background-image: var(--chart-pattern-2);
      }
      
      .color-blind-mode .chart-item-3 {
        background-image: var(--chart-pattern-3);
      }
    `;
    
    if (!document.getElementById('color-blind-styles')) {
      document.head.appendChild(style);
    }
  } else {
    // Remove color blind styles
    const existingStyle = document.getElementById('color-blind-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Reset variables
    document.documentElement.style.removeProperty('--color-contrast-high');
    document.documentElement.style.removeProperty('--accessible-font-size');
  }
};

export default {
  hexToRgb,
  rgbToHex,
  getLuminance,
  getContrastRatio,
  makeColorAccessible,
  generateAccessiblePalette,
  applyColorBlindStyles,
};