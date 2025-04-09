import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { HelmetProvider } from "react-helmet-async";
import { AutoDismissToaster } from "@/components/ui/auto-dismiss-toaster";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/dashboard";
import ContentLibrary from "./pages/content-library";
import ContentDetail from "./pages/content-detail";
import ContentCalendar from "./pages/content-calendar";
import Analytics from "./pages/analytics";
import MoodBoards from "./pages/mood-boards";
import ContentVault from "./pages/content-vault";
import ApplePhotos from "./pages/apple-photos";
import CreativeSymbiosis from "./pages/creative-symbiosis";
import ColorPalettes from "./pages/color-palettes";
import MoodCapsules from "./pages/mood-capsules";
import AIEnhancement from "./pages/ai-enhancement";
import CreativePrompts from "./pages/creative-prompts";
import CrossPlatformTools from "./pages/cross-platform-tools";
import CreativeTools from "./pages/CreativeTools";
import NavigationTest from "./pages/nav-test";
import NotFound from "./pages/not-found";
import Profile from './components/profile/Profile';
import FeaturesShowcase from "./pages/FeaturesShowcase";
import PerformanceAnalysis from "./pages/PerformanceAnalysis";
import LegalPage from "./pages/legal";
import PrivacyPage from "./pages/privacy";
import SettingsPage from "./pages/settings";
import DocumentationPage from "./pages/documentation";
import FeaturePage from "./pages/features";
import BlogPage from "./pages/blog";
import PricingPage from "./pages/pricing";
import AboutPage from "./pages/about";
import CookieConsent from "./components/common/CookieConsent";
import { ThemeProvider } from "./lib/ThemeContext";
import { TaskVerificationProvider } from "./context/task-verification-context";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import PageTransition from "@/components/ui/page-transition";
import { initTouchFeedback } from "@/lib/touchFeedback";
import { DevModeToggle } from "./components/dev/DevModeToggle";
import './styles/color-blindness.css'; // Added for color blindness styles
import './styles/transitions.css'; // Added for page transitions
import './styles/touchFeedback.css'; // Added for touch feedback effects

// Set up service worker for offline capabilities
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
}

function Router() {
  // Detect if running on a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Add mobile-specific body class
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('mobile-device');
      
      // Allow scrolling by setting body to not prevent touch action
      document.body.style.touchAction = 'auto';
      document.body.style.position = 'relative';
      document.body.style.overscrollBehavior = 'auto'; // Allow normal overscroll behavior
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'auto';
    } else {
      document.body.classList.remove('mobile-device');
    }

    return () => {
      document.body.classList.remove('mobile-device');
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.overscrollBehavior = '';
    };
  }, [isMobile]);

  return (
    <AppShell>
      <AutoDismissToaster defaultDuration={5000} />
      <PageTransition 
        duration={0.4}
        className="layered-transition"
      >
        <Switch>
          {/* Public Routes - No Authentication Required */}
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/unauthorized" component={UnauthorizedPage} />
          <Route path="/legal" component={LegalPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/terms-of-service" component={LegalPage} />
          <Route path="/documentation" component={DocumentationPage} />
          <Route path="/features" component={FeaturePage} />
          <Route path="/blog" component={BlogPage} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/about" component={AboutPage} />
          
          {/* Protected Routes - Authentication Required */}
          <Route path="/" component={LandingPage} />
          <Route path="/dashboard">
            {(params) => (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/auth-dashboard">
            {(params) => (
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/content-library">
            {(params) => (
              <ProtectedRoute>
                <ContentLibrary />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/content-library/all">
            {(params) => (
              <ProtectedRoute>
                <ContentLibrary />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/content-library/recent">
            {(params) => (
              <ProtectedRoute>
                <ContentLibrary />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/content-library/categories">
            {(params) => (
              <ProtectedRoute>
                <ContentLibrary />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/content-library/favorites">
            {(params) => (
              <ProtectedRoute>
                <ContentLibrary />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/content/:id">
            {(params) => (
              <ProtectedRoute>
                <ContentDetail />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/content-calendar">
            {(params) => (
              <ProtectedRoute>
                <ContentCalendar />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/analytics">
            {(params) => (
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/mood-boards">
            {(params) => (
              <ProtectedRoute>
                <MoodBoards />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/content-vault">
            {(params) => (
              <ProtectedRoute>
                <ContentVault />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/apple-photos">
            {(params) => (
              <ProtectedRoute>
                <ApplePhotos />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/creative-symbiosis">
            {(params) => (
              <ProtectedRoute>
                <CreativeSymbiosis />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/color-palettes">
            {(params) => (
              <ProtectedRoute>
                <ColorPalettes />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/color-palettes/all">
            {(params) => (
              <ProtectedRoute>
                <ColorPalettes />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/color-palettes/recent">
            {(params) => (
              <ProtectedRoute>
                <ColorPalettes />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/color-palettes/categories">
            {(params) => (
              <ProtectedRoute>
                <ColorPalettes />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/color-palettes/favorites">
            {(params) => (
              <ProtectedRoute>
                <ColorPalettes />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/mood-capsules">
            {(params) => (
              <ProtectedRoute>
                <MoodCapsules />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/ai-enhancement">
            {(params) => (
              <ProtectedRoute>
                <AIEnhancement />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/creative-prompts">
            {(params) => (
              <ProtectedRoute>
                <CreativePrompts />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/creative-tools">
            {(params) => (
              <ProtectedRoute>
                <CreativeTools />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/cross-platform-tools">
            {(params) => (
              <ProtectedRoute>
                <CrossPlatformTools />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/features-showcase">
            {(params) => (
              <ProtectedRoute>
                <FeaturesShowcase />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/performance-analysis">
            {(params) => (
              <ProtectedRoute>
                <PerformanceAnalysis />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/profile">
            {(params) => (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/profile/accessibility">
            {(params) => (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/profile/integrations">
            {(params) => (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/settings">
            {(params) => (
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/nav-test">
            {(params) => (
              <ProtectedRoute>
                <NavigationTest />
              </ProtectedRoute>
            )}
          </Route>
          <Route>
            {(params) => (
              <NotFound />
            )}
          </Route>
        </Switch>
      </PageTransition>
      <CookieConsent 
        privacyPolicyUrl="/privacy"
        termsOfServiceUrl="/terms-of-service"
      />
    </AppShell>
  );
}

function App() {
  // Try to register service worker and initialize touch feedback on mount
  useEffect(() => {
    try {
      registerServiceWorker();
      initTouchFeedback(); // Initialize the touch feedback system
    } catch (error) {
      console.error("Error initializing App:", error);
    }
  }, []);

  // Create a simplified app version with minimal components to debug rendering issues
  if (window.location.search.includes('simple=true')) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Creately - Simple Mode</h1>
        <p>Running in simplified mode for debugging</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{ padding: '10px', background: '#F2994A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Switch to Full Mode
        </button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <TaskVerificationProvider>
              <div className="color-blindness-filters"> {/* Added color blindness filters */}
                <svg xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="protanopia-filter">
                      <feColorMatrix in="SourceGraphic" type="matrix" values="0.567, 0.433, 0, 0, 0
                                                                              0.558, 0.442, 0, 0, 0
                                                                              0, 0.242, 0.758, 0, 0
                                                                              0, 0, 0, 1, 0" />
                    </filter>
                    <filter id="deuteranopia-filter">
                      <feColorMatrix in="SourceGraphic" type="matrix" values="0.625, 0.375, 0, 0, 0
                                                                              0.7, 0.3, 0, 0, 0
                                                                              0, 0.3, 0.7, 0, 0
                                                                              0, 0, 0, 1, 0" />
                    </filter>
                    <filter id="tritanopia-filter">
                      <feColorMatrix in="SourceGraphic" type="matrix" values="0.95, 0.05, 0, 0, 0
                                                                              0, 0.433, 0.567, 0, 0
                                                                              0, 0.475, 0.525, 0, 0
                                                                              0, 0, 0, 1, 0" />
                    </filter>
                    <filter id="achromatopsia-filter">
                      <feColorMatrix in="SourceGraphic" type="matrix" values="0.299, 0.587, 0.114, 0, 0
                                                                              0.299, 0.587, 0.114, 0, 0
                                                                              0.299, 0.587, 0.114, 0, 0
                                                                              0, 0, 0, 1, 0" />
                    </filter>
                  </defs>
                </svg>
              </div>
              <Router />
              <DevModeToggle />
            </TaskVerificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;