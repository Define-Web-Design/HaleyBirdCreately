
// Apple-inspired color system

// Standard Apple UI colors
export const appleColors = {
  blue: {
    light: '#007AFF',
    dark: '#0A84FF',
    lightAlpha: (alpha: number) => `rgba(0, 122, 255, ${alpha})`,
    darkAlpha: (alpha: number) => `rgba(10, 132, 255, ${alpha})`,
  },
  green: {
    light: '#34C759',
    dark: '#30D158',
    lightAlpha: (alpha: number) => `rgba(52, 199, 89, ${alpha})`,
    darkAlpha: (alpha: number) => `rgba(48, 209, 88, ${alpha})`,
  },
  indigo: {
    light: '#5856D6',
    dark: '#5E5CE6',
    lightAlpha: (alpha: number) => `rgba(88, 86, 214, ${alpha})`,
    darkAlpha: (alpha: number) => `rgba(94, 92, 230, ${alpha})`,
  },
  orange: {
    light: '#FF9500',
    dark: '#FF9F0A',
    lightAlpha: (alpha: number) => `rgba(255, 149, 0, ${alpha})`,
    darkAlpha: (alpha: number) => `rgba(255, 159, 10, ${alpha})`,
  },
  pink: {
    light: '#FF2D55',
    dark: '#FF375F',
    lightAlpha: (alpha: number) => `rgba(255, 45, 85, ${alpha})`,
    darkAlpha: (alpha: number) => `rgba(255, 55, 95, ${alpha})`,
  },
  purple: {
    light: '#AF52DE',
    dark: '#BF5AF2',
    lightAlpha: (alpha: number) => `rgba(175, 82, 222, ${alpha})`,
    darkAlpha: (alpha: number) => `rgba(191, 90, 242, ${alpha})`,
  },
  red: {
    light: '#FF3B30',
    dark: '#FF453A',
    lightAlpha: (alpha: number) => `rgba(255, 59, 48, ${alpha})`,
    darkAlpha: (alpha: number) => `rgba(255, 69, 58, ${alpha})`,
  },
  teal: {
    light: '#5AC8FA',
    dark: '#64D2FF',
    lightAlpha: (alpha: number) => `rgba(90, 200, 250, ${alpha})`,
    darkAlpha: (alpha: number) => `rgba(100, 210, 255, ${alpha})`,
  },
  yellow: {
    light: '#FFCC00',
    dark: '#FFD60A',
    lightAlpha: (alpha: number) => `rgba(255, 204, 0, ${alpha})`,
    darkAlpha: (alpha: number) => `rgba(255, 214, 10, ${alpha})`,
  },
  gray: {
    light: {
      1: '#8E8E93',
      2: '#AEAEB2',
      3: '#C7C7CC',
      4: '#D1D1D6',
      5: '#E5E5EA',
      6: '#F2F2F7',
    },
    dark: {
      1: '#8E8E93',
      2: '#636366',
      3: '#48484A',
      4: '#3A3A3C',
      5: '#2C2C2E',
      6: '#1C1C1E',
    },
  },
};

// System colors for backgrounds and text
export const systemColors = {
  light: {
    background: '#FFFFFF',
    secondaryBackground: '#F2F2F7',
    tertiaryBackground: '#E5E5EA',
    groupedBackground: '#F2F2F7',
    label: '#000000',
    secondaryLabel: 'rgba(60, 60, 67, 0.6)',
    tertiaryLabel: 'rgba(60, 60, 67, 0.3)',
    quaternaryLabel: 'rgba(60, 60, 67, 0.18)',
    fill: 'rgba(120, 120, 128, 0.2)',
    secondaryFill: 'rgba(120, 120, 128, 0.16)',
    tertiaryFill: 'rgba(118, 118, 128, 0.12)',
    quaternaryFill: 'rgba(116, 116, 128, 0.08)',
    separator: 'rgba(60, 60, 67, 0.29)',
    opaqueSeparator: '#C6C6C8',
    link: '#007AFF',
    darkText: '#000000',
    lightText: '#FFFFFF',
    systemBackground: '#FFFFFF',
    secondarySystemBackground: '#F2F2F7',
    tertiarySystemBackground: '#FFFFFF',
    systemGroupedBackground: '#F2F2F7',
    secondarySystemGroupedBackground: '#FFFFFF',
    tertiarySystemGroupedBackground: '#F2F2F7',
  },
  dark: {
    background: '#000000',
    secondaryBackground: '#1C1C1E',
    tertiaryBackground: '#2C2C2E',
    groupedBackground: '#1C1C1E',
    label: '#FFFFFF',
    secondaryLabel: 'rgba(235, 235, 245, 0.6)',
    tertiaryLabel: 'rgba(235, 235, 245, 0.3)',
    quaternaryLabel: 'rgba(235, 235, 245, 0.16)',
    fill: 'rgba(120, 120, 128, 0.36)',
    secondaryFill: 'rgba(120, 120, 128, 0.32)',
    tertiaryFill: 'rgba(118, 118, 128, 0.24)',
    quaternaryFill: 'rgba(116, 116, 128, 0.18)',
    separator: 'rgba(84, 84, 88, 0.6)',
    opaqueSeparator: '#38383A',
    link: '#0984FF',
    darkText: '#000000',
    lightText: '#FFFFFF',
    systemBackground: '#000000',
    secondarySystemBackground: '#1C1C1E',
    tertiarySystemBackground: '#2C2C2E',
    systemGroupedBackground: '#000000',
    secondarySystemGroupedBackground: '#1C1C1E',
    tertiarySystemGroupedBackground: '#2C2C2E',
  },
};

// Generate color with transparency
export const withOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Already rgba or other format, try to extract and replace opacity
  if (color.startsWith('rgba')) {
    return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/, `rgba($1, $2, $3, ${opacity})`);
  }
  
  if (color.startsWith('rgb')) {
    return color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, `rgba($1, $2, $3, ${opacity})`);
  }
  
  // For other formats, just return with desired opacity
  return `${color}${Math.round(opacity * 100)}%`;
};

// Generate CSS variables for all colors
export const generateColorVariables = (isDark: boolean = false): Record<string, string> => {
  const variables: Record<string, string> = {};
  const mode = isDark ? 'dark' : 'light';
  
  // Add system colors
  Object.entries(systemColors[mode]).forEach(([key, value]) => {
    variables[`--system-${key}`] = value;
  });
  
  // Add Apple UI colors
  Object.entries(appleColors).forEach(([colorName, colorValues]) => {
    if (typeof colorValues === 'object' && !Array.isArray(colorValues)) {
      if ('light' in colorValues && 'dark' in colorValues) {
        variables[`--apple-${colorName}`] = colorValues[mode];
      }
    }
  });
  
  // Add gray scales
  Object.entries(appleColors.gray[mode]).forEach(([level, value]) => {
    variables[`--gray-${level}`] = value;
  });
  
  return variables;
};

// Generate a mood-based color palette
export const generateMoodPalette = (mood: string): Record<string, string> => {
  switch (mood.toLowerCase()) {
    case 'calm':
    case 'peaceful':
    case 'relaxed':
      return {
        primary: appleColors.blue.light,
        secondary: appleColors.teal.light,
        accent: appleColors.purple.light,
        background: '#F8FBFF',
        text: '#2C3E50',
      };
      
    case 'energetic':
    case 'vibrant':
    case 'excited':
      return {
        primary: appleColors.orange.light,
        secondary: appleColors.yellow.light,
        accent: appleColors.pink.light,
        background: '#FFFAF0',
        text: '#2C3E50',
      };
      
    case 'focused':
    case 'productive':
    case 'determined':
      return {
        primary: appleColors.indigo.light,
        secondary: appleColors.blue.light,
        accent: appleColors.purple.light,
        background: '#F9F9F9',
        text: '#2C3E50',
      };
      
    case 'creative':
    case 'inspired':
    case 'imaginative':
      return {
        primary: appleColors.purple.light,
        secondary: appleColors.pink.light,
        accent: appleColors.indigo.light,
        background: '#FDF8FF',
        text: '#2C3E50',
      };
      
    case 'happy':
    case 'joyful':
    case 'positive':
      return {
        primary: appleColors.yellow.light,
        secondary: appleColors.green.light,
        accent: appleColors.orange.light,
        background: '#FFFEF0',
        text: '#2C3E50',
      };
      
    case 'serious':
    case 'professional':
    case 'formal':
      return {
        primary: appleColors.blue.light,
        secondary: appleColors.gray.light[1],
        accent: appleColors.teal.light,
        background: '#FFFFFF',
        text: '#2C3E50',
      };
      
    default:
      // Default to a neutral palette
      return {
        primary: appleColors.blue.light,
        secondary: appleColors.gray.light[1],
        accent: appleColors.teal.light,
        background: '#FFFFFF',
        text: '#2C3E50',
      };
  }
};
