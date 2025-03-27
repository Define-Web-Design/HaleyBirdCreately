
/**
 * Animation system for creating delightful, responsive interactions
 * Inspired by premium interfaces but with our own unique flair
 */

// Timing functions for natural movement
export const EASING = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  accelerate: "cubic-bezier(0.4, 0, 1, 1)",
  decelerate: "cubic-bezier(0, 0, 0.2, 1)",
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
};

// Duration constants
export const DURATION = {
  quick: 150,
  standard: 250,
  medium: 350,
  complex: 500
};

// Keyframe animations
export const KEYFRAMES = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  slideUp: {
    from: { transform: "translateY(20px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 }
  },
  pulse: {
    "0%": { boxShadow: "0 0 0 0 rgba(98, 0, 234, 0.4)" },
    "70%": { boxShadow: "0 0 0 10px rgba(98, 0, 234, 0)" },
    "100%": { boxShadow: "0 0 0 0 rgba(98, 0, 234, 0)" }
  },
  shimmer: {
    "0%": { backgroundPosition: "-100% 0" },
    "100%": { backgroundPosition: "100% 0" }
  },
  ambientGlow: {
    "0%": { boxShadow: "0 0 10px rgba(98, 0, 234, 0.2)" },
    "50%": { boxShadow: "0 0 20px rgba(98, 0, 234, 0.4)" },
    "100%": { boxShadow: "0 0 10px rgba(98, 0, 234, 0.2)" }
  }
};

// Reusable animation presets
export const ANIMATIONS = {
  buttonPress: {
    transition: `transform ${DURATION.quick}ms ${EASING.sharp}, 
                 box-shadow ${DURATION.quick}ms ${EASING.sharp}`,
    transform: "scale(0.97)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.15)"
  },
  cardHover: {
    transition: `transform ${DURATION.standard}ms ${EASING.standard}, 
                 box-shadow ${DURATION.standard}ms ${EASING.standard}`,
    transform: "translateY(-4px)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.1)"
  },
  ambientPulse: {
    animation: `ambientGlow 3s ${EASING.standard} infinite`
  },
  listItemEnter: {
    animation: `slideUp ${DURATION.standard}ms ${EASING.decelerate} forwards`
  },
  shimmerEffect: {
    backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
    backgroundSize: "200% 100%",
    animation: `shimmer 1.5s ${EASING.standard} infinite`
  }
};

// Interactive feedback helpers
export const createHapticFeedback = () => {
  // This is a placeholder for future haptic feedback implementation
  // Will need device-specific implementation in appropriate components
  console.log("Haptic feedback triggered");
};

// Utility to create staggered animations for lists
export const createStaggeredAnimation = (animation: string, itemCount: number, delayIncrement = 50) => {
  return Array.from({ length: itemCount }).map((_, index) => ({
    animation: animation,
    animationDelay: `${index * delayIncrement}ms`
  }));
};
