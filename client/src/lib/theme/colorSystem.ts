
/**
 * Custom color system with CMYK-inspired vibrant colors
 * Creates a unique visual identity while maintaining professional appeal
 */

// Core vibrant palette inspired by CMYK but with unique twists
export const CORE_PALETTE = {
  // Primary colors
  PURPLE: {
    main: "#6200EA", // Deep purple for primary actions/brand
    light: "#B388FF",
    dark: "#4A148C",
    ambient: "rgba(98, 0, 234, 0.15)"
  },
  MAGENTA: {
    main: "#FF4081", // Energetic magenta (inspired by CMYK magenta but unique)
    light: "#FF80AB",
    dark: "#C51162",
    ambient: "rgba(255, 64, 129, 0.15)"
  },
  CYAN: {
    main: "#00BCD4", // Refreshing cyan (inspired by CMYK cyan)
    light: "#80DEEA",
    dark: "#006064",
    ambient: "rgba(0, 188, 212, 0.15)"
  },
  YELLOW: {
    main: "#FFAB00", // Vibrant yellow (inspired by CMYK yellow but warmer)
    light: "#FFD740",
    dark: "#FF6F00",
    ambient: "rgba(255, 171, 0, 0.15)"
  },
  GREEN: {
    main: "#00E676", // Energetic green accent
    light: "#69F0AE",
    dark: "#00C853",
    ambient: "rgba(0, 230, 118, 0.15)"
  },
  
  // Neutrals
  NEUTRAL: {
    white: "#FFFFFF",
    light: "#F5F7FA",
    medium: "#B0BEC5",
    dark: "#37474F",
    black: "#121212"
  }
};

// Functional color mapping
export const FUNCTIONAL_COLORS = {
  primary: CORE_PALETTE.PURPLE.main,
  secondary: CORE_PALETTE.MAGENTA.main,
  accent: CORE_PALETTE.GREEN.main,
  info: CORE_PALETTE.CYAN.main,
  warning: CORE_PALETTE.YELLOW.main,
  success: CORE_PALETTE.GREEN.main,
  error: "#F44336" // Rich red for errors
};

// Ambient lighting effect helpers
export const createAmbientGlow = (color: string, intensity = 0.15) => {
  return `0 0 20px ${intensity * 100}% ${color}`;
};

// Interactive state colors
export const INTERACTIVE_STATES = {
  hover: {
    opacity: 0.85,
    scale: 1.02,
    transition: "0.2s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  active: {
    opacity: 0.7,
    scale: 0.97,
    transition: "0.1s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  focus: {
    outlineColor: CORE_PALETTE.PURPLE.light,
    outlineWidth: "2px",
    outlineOffset: "2px"
  }
};

// Gradient presets
export const GRADIENTS = {
  purpleMagenta: `linear-gradient(135deg, ${CORE_PALETTE.PURPLE.main} 0%, ${CORE_PALETTE.MAGENTA.main} 100%)`,
  cyanGreen: `linear-gradient(135deg, ${CORE_PALETTE.CYAN.main} 0%, ${CORE_PALETTE.GREEN.main} 100%)`,
  yellowCyan: `linear-gradient(135deg, ${CORE_PALETTE.YELLOW.main} 0%, ${CORE_PALETTE.CYAN.main} 100%)`,
  vibrantRainbow: `linear-gradient(135deg, 
    ${CORE_PALETTE.PURPLE.main} 0%, 
    ${CORE_PALETTE.MAGENTA.main} 25%, 
    ${CORE_PALETTE.YELLOW.main} 50%, 
    ${CORE_PALETTE.CYAN.main} 75%, 
    ${CORE_PALETTE.GREEN.main} 100%)`
};
