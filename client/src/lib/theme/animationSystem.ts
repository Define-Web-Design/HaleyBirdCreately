
// Animation presets inspired by Apple's design language
export const animations = {
  // Spring animations (iOS style)
  spring: {
    fast: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
    medium: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    },
    slow: {
      type: 'spring',
      stiffness: 100,
      damping: 30,
    },
  },
  
  // Durations for different animation types
  duration: {
    fast: 0.2,
    medium: 0.35,
    slow: 0.5,
    veryFast: 0.1,
    verySlow: 0.8,
  },
  
  // Timing functions
  easing: {
    standard: 'cubic-bezier(0.42, 0, 0.58, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    apple: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    appleEmphasized: 'cubic-bezier(0.17, 0.17, 0, 1)'
  },
  
  // Common animations
  fade: {
    in: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    out: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
  },
  
  slide: {
    up: {
      from: { transform: 'translateY(10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    down: {
      from: { transform: 'translateY(-10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    left: {
      from: { transform: 'translateX(10px)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
    },
    right: {
      from: { transform: 'translateX(-10px)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
    },
  },
  
  scale: {
    in: {
      from: { transform: 'scale(0.95)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
    out: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(0.95)', opacity: 0 },
    },
  },
  
  // iOS-specific animations
  ios: {
    modalPresent: {
      from: { transform: 'translateY(100%)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    modalDismiss: {
      from: { transform: 'translateY(0)', opacity: 1 },
      to: { transform: 'translateY(100%)', opacity: 0 },
    },
    buttonPress: {
      from: { transform: 'scale(1)' },
      to: { transform: 'scale(0.97)' },
    },
    buttonRelease: {
      from: { transform: 'scale(0.97)' },
      to: { transform: 'scale(1)' },
    },
    notificationBanner: {
      from: { transform: 'translateY(-100%)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
  },
};

// Helper function to generate CSS animation properties
export const generateAnimationCSS = (
  animationType: keyof typeof animations,
  variant: string,
  duration: keyof typeof animations.duration = 'medium',
  easing: keyof typeof animations.easing = 'apple'
) => {
  const animation = animations[animationType][variant];
  
  if (!animation) {
    console.error(`Animation ${animationType}.${variant} not found`);
    return {};
  }
  
  return {
    initial: animation.from,
    animate: animation.to,
    transition: {
      duration: animations.duration[duration],
      ease: animations.easing[easing],
    },
  };
};

// Generate CSS variables for animations
export const generateAnimationVariables = () => {
  const variables: Record<string, string> = {};
  
  // Generate variables for durations
  Object.entries(animations.duration).forEach(([key, value]) => {
    variables[`--animation-duration-${key}`] = `${value}s`;
  });
  
  // Generate variables for easing functions
  Object.entries(animations.easing).forEach(([key, value]) => {
    variables[`--animation-easing-${key}`] = value;
  });
  
  return variables;
};
