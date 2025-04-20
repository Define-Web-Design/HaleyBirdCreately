
import { createLazyComponent } from './lazyComponents';

// Define component categories for better organization
export type ComponentCategory = 
  | 'layout' 
  | 'ui' 
  | 'features' 
  | 'dashboard' 
  | 'auth' 
  | 'forms'
  | 'mood-capsules'
  | 'color-palettes';

// Component registry that maps names to lazy-loaded components
export const componentRegistry = {
  // Layout components
  'AppLayout': createLazyComponent(() => import('../components/layout/AppLayout'), 'AppLayout'),
  'Sidebar': createLazyComponent(() => import('../components/layout/Sidebar'), 'Sidebar'),
  'TopNavigation': createLazyComponent(() => import('../components/layout/TopNavigation'), 'TopNavigation'),
  'Footer': createLazyComponent(() => import('../components/layout/Footer'), 'Footer'),
  
  // Auth components
  'LoginForm': createLazyComponent(() => import('../components/auth/LoginForm'), 'LoginForm'),
  'RegisterForm': createLazyComponent(() => import('../components/auth/RegisterForm'), 'RegisterForm'),
  'ProtectedRoute': createLazyComponent(() => import('../components/auth/ProtectedRoute'), 'ProtectedRoute'),
  
  // Dashboard components
  'WelcomeSection': createLazyComponent(() => import('../components/dashboard/WelcomeSection'), 'WelcomeSection'),
  'MoodCapsules': createLazyComponent(() => import('../components/dashboard/MoodCapsules'), 'MoodCapsules'),
  'ContentAnalysis': createLazyComponent(() => import('../components/dashboard/ContentAnalysis'), 'ContentAnalysis'),
  'PerformanceInsights': createLazyComponent(() => import('../components/dashboard/PerformanceInsights'), 'PerformanceInsights'),
  
  // Feature components
  'ColorPaletteGenerator': createLazyComponent(() => import('../components/color/ColorPaletteGenerator'), 'ColorPaletteGenerator'),
  'AdaptiveThemeGenerator': createLazyComponent(() => import('../components/color-palettes/AdaptiveThemeGenerator'), 'AdaptiveThemeGenerator'),
  'MistralAIExample': createLazyComponent(() => import('../components/features/MistralAIExample'), 'MistralAIExample'),
  'OpenAIExample': createLazyComponent(() => import('../components/features/OpenAIExample'), 'OpenAIExample'),
  
  // Add more components as needed...
};

/**
 * Get component categories to preload based on the current route
 */
export function getComponentsForRoute(route: string): ComponentCategory[] {
  // Map routes to component categories
  const routeMap: Record<string, ComponentCategory[]> = {
    '/': ['layout', 'ui'],
    '/dashboard': ['layout', 'dashboard', 'ui'],
    '/login': ['auth', 'ui'],
    '/register': ['auth', 'ui'],
    '/color-palettes': ['layout', 'color-palettes', 'ui'],
    '/mood-capsules': ['layout', 'mood-capsules', 'ui'],
    '/ai-enhancement': ['layout', 'features', 'ui'],
  };
  
  // Return component categories for the route, or default categories
  return routeMap[route] || ['layout', 'ui'];
}

/**
 * Preload components for a specific category
 */
export function preloadComponentCategory(category: ComponentCategory): void {
  // Implement component preloading by category
  // This will be populated based on your component organization
}
