/**
 * Enhanced Touch Interaction System
 * 
 * This module provides touch-based interaction enhancements for mobile devices
 * including touch trails, finger tracking, and touch ripple effects.
 */

import { hapticFeedback as hapticFeedbackFunc } from '../hooks/use-mobile';

// Configuration options
const TOUCH_TRAIL_ENABLED = true;
const FINGER_TRAIL_COLOR = 'rgba(255, 255, 255, 0.5)';
const FINGER_TRAIL_MAX_PARTICLES = 15;
const FINGER_TRAIL_PARTICLE_SIZE = 15;
const FINGER_TRAIL_LIFETIME = 700; // ms

// Touch trail state
let trailCanvas: HTMLCanvasElement | null = null;
let trailContext: CanvasRenderingContext2D | null = null;
let trailParticles: TrailParticle[] = [];
let trailInitialized = false;
let trailAnimationFrame: number | null = null;
let tactileFeedbackEnabled = true; // Default to enabled

// Types
interface TrailParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  age: number;
  maxAge: number;
}

/**
 * Set tactile feedback enabled/disabled state
 */
export function setTactileFeedback(enabled: boolean): void {
  tactileFeedbackEnabled = enabled;
  
  // Apply to document body for CSS styling
  if (enabled) {
    document.documentElement.classList.add('tactile-feedback-enabled');
  } else {
    document.documentElement.classList.remove('tactile-feedback-enabled');
  }
}

/**
 * Initialize the touch feedback system
 * Sets up:
 * 1. Touch trail effects
 * 2. Custom cursor for touch controls
 * 3. Adds touch feedback for interactive elements
 */
export function initTouchFeedback(enabled: boolean = true): void {
  // Set initial tactile feedback state
  tactileFeedbackEnabled = enabled;
  setTactileFeedback(enabled);
  // Only initialize on devices with touch support
  if (!('ontouchstart' in window)) {
    console.log('Touch feedback not initialized: No touch support detected');
    return;
  }
  
  if (trailInitialized) {
    console.log('Touch feedback already initialized');
    return;
  }
  
  console.log('Initializing touch feedback system');
  
  // Create touch trail canvas
  if (TOUCH_TRAIL_ENABLED) {
    initTouchTrail();
  }
  
  // Add touch feedback to interactive elements
  addTouchEffectsToElements();
  
  trailInitialized = true;
}

/**
 * Initialize the touch trail effect
 * Creates a canvas overlay for drawing finger trail effects
 */
function initTouchTrail(): void {
  // Create canvas element for touch trails
  trailCanvas = document.createElement('canvas');
  trailCanvas.className = 'finger-trail-canvas';
  trailCanvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    touch-action: none;
  `;
  
  // Get drawing context
  trailContext = trailCanvas.getContext('2d');
  
  // Size canvas correctly
  resizeTrailCanvas();
  
  // Append canvas to body
  document.body.appendChild(trailCanvas);
  
  // Set up event handlers for touch events
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: true });
  
  // Handle resize events
  window.addEventListener('resize', resizeTrailCanvas);
  
  // Start animation loop
  animateTrail();
}

/**
 * Resize the trail canvas to match the window
 */
function resizeTrailCanvas(): void {
  if (!trailCanvas) return;
  
  // Set canvas to full window size with correct pixel ratio
  const pixelRatio = window.devicePixelRatio || 1;
  trailCanvas.width = window.innerWidth * pixelRatio;
  trailCanvas.height = window.innerHeight * pixelRatio;
  
  if (trailContext) {
    trailContext.scale(pixelRatio, pixelRatio);
  }
}

/**
 * Handle touch start events
 */
function handleTouchStart(e: TouchEvent): void {
  // Haptic feedback for touch start
  hapticFeedbackFunc('light');
}

/**
 * Trigger haptic and visual feedback at specific coordinates
 * @param x - X coordinate for the feedback
 * @param y - Y coordinate for the feedback
 * @param type - Type of feedback to trigger
 */
export function triggerFeedback(
  x: number, 
  y: number, 
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium'
): void {
  // Don't do anything if feedback is disabled
  if (!tactileFeedbackEnabled) return;
  
  // Map the type to the haptic feedback intensity
  const hapticType = type === 'heavy' ? 'strong' : 
                    (type === 'light' ? 'light' : 
                    (type === 'medium' ? 'medium' : type));
                    
  // Trigger haptic feedback
  hapticFeedbackFunc(hapticType as any);
  
  // Create a ripple effect if trail canvas exists
  if (trailContext && trailCanvas) {
    // Add a larger particle for touch effect
    addTrailParticle(x, y);
    
    // Add a few more particles for a more pronounced effect
    for (let i = 0; i < 3; i++) {
      const offsetX = x + (Math.random() * 20 - 10);
      const offsetY = y + (Math.random() * 20 - 10);
      addTrailParticle(offsetX, offsetY);
    }
  }
}

/**
 * Handle touch move events
 */
function handleTouchMove(e: TouchEvent): void {
  if (!trailContext) return;
  
  // For each touch point, add trail particles
  Array.from(e.touches).forEach(touch => {
    addTrailParticle(touch.clientX, touch.clientY);
  });
}

/**
 * Add a new trail particle at the specified coordinates
 */
function addTrailParticle(x: number, y: number): void {
  // Create a new trail particle
  const particle: TrailParticle = {
    x,
    y,
    size: FINGER_TRAIL_PARTICLE_SIZE,
    color: FINGER_TRAIL_COLOR,
    age: 0,
    maxAge: FINGER_TRAIL_LIFETIME
  };
  
  // Add to particles array, limiting the total number
  trailParticles.push(particle);
  
  // If we have too many particles, remove the oldest ones
  if (trailParticles.length > FINGER_TRAIL_MAX_PARTICLES) {
    trailParticles.shift();
  }
}

/**
 * Animate the trail particles
 */
function animateTrail(): void {
  if (!trailContext || !trailCanvas) {
    trailAnimationFrame = requestAnimationFrame(animateTrail);
    return;
  }
  
  // Clear the canvas
  trailContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  
  // Update and draw all particles
  trailParticles.forEach((particle, index) => {
    // Update age
    particle.age += 16.667; // Approx 60fps
    
    // Remove old particles
    if (particle.age >= particle.maxAge) {
      trailParticles.splice(index, 1);
      return;
    }
    
    // Calculate opacity based on age
    const opacity = 1 - (particle.age / particle.maxAge);
    const size = particle.size * (1 - (particle.age / particle.maxAge) * 0.5);
    
    // Draw the particle
    if (trailContext) {
      trailContext.beginPath();
      trailContext.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      trailContext.fillStyle = particle.color.replace(')', `, ${opacity})`);
      trailContext.fill();
    }
  });
  
  // Continue animation loop
  trailAnimationFrame = requestAnimationFrame(animateTrail);
}

/**
 * Add touch feedback effects to interactive elements
 */
function addTouchEffectsToElements(): void {
  // Common interactive elements
  const selectors = [
    'button',
    'a',
    '.button',
    '.btn',
    '.card',
    '.clickable',
    '.interactive',
    '[role="button"]',
    'input[type="submit"]',
    'input[type="button"]',
    '.nav-item',
    '.menu-item'
  ];
  
  // Find all elements matching selectors
  selectors.forEach(selector => {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    
    elements.forEach(element => {
      // Add touch start effect
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
        
        // Add haptic feedback based on element type
        if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
          hapticFeedbackFunc('medium');
        } else if (element.tagName === 'A') {
          hapticFeedbackFunc('light');
        } else if (element.classList.contains('card')) {
          hapticFeedbackFunc('medium');
        }
      }, { passive: true });
      
      // Remove touch start effect
      element.addEventListener('touchend', () => {
        element.classList.remove('touch-active');
      }, { passive: true });
      
      element.addEventListener('touchcancel', () => {
        element.classList.remove('touch-active');
      }, { passive: true });
    });
  });
}

/**
 * Clean up touch feedback effects
 */
export function cleanupTouchFeedback(): void {
  if (!trailInitialized) return;
  
  // Remove canvas
  if (trailCanvas && trailCanvas.parentNode) {
    trailCanvas.parentNode.removeChild(trailCanvas);
  }
  
  // Stop animation loop
  if (trailAnimationFrame !== null) {
    cancelAnimationFrame(trailAnimationFrame);
  }
  
  // Remove event listeners
  document.removeEventListener('touchstart', handleTouchStart);
  document.removeEventListener('touchmove', handleTouchMove);
  window.removeEventListener('resize', resizeTrailCanvas);
  
  // Reset state
  trailCanvas = null;
  trailContext = null;
  trailParticles = [];
  trailInitialized = false;
}