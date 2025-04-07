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
import CookieConsent from "./components/common/CookieConsent";
import { ThemeProvider } from "./lib/ThemeContext";
import { TaskVerificationProvider } from "./context/task-verification-context";
import { PageTransitionWrapper } from "@/components/ui/page-transition";
import { initTouchFeedback } from "@/lib/touchFeedback";
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
      <PageTransitionWrapper options={{ 
        type: 'layered', 
        duration: 400,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // More spring-like feel
      }}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/content-library" component={ContentLibrary} />
          <Route path="/content-library/all" component={ContentLibrary} />
          <Route path="/content-library/recent" component={ContentLibrary} />
          <Route path="/content-library/categories" component={ContentLibrary} />
          <Route path="/content-library/favorites" component={ContentLibrary} />
          <Route path="/content/:id" component={ContentDetail} />
          <Route path="/content-calendar" component={ContentCalendar} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/mood-boards" component={MoodBoards} />
          <Route path="/content-vault" component={ContentVault} />
          <Route path="/apple-photos" component={ApplePhotos} />
          <Route path="/creative-symbiosis" component={CreativeSymbiosis} />
          <Route path="/color-palettes" component={ColorPalettes} />
          <Route path="/color-palettes/all" component={ColorPalettes} />
          <Route path="/color-palettes/recent" component={ColorPalettes} />
          <Route path="/color-palettes/categories" component={ColorPalettes} />
          <Route path="/color-palettes/favorites" component={ColorPalettes} />
          <Route path="/mood-capsules" component={MoodCapsules} />
          <Route path="/ai-enhancement" component={AIEnhancement} />
          <Route path="/creative-prompts" component={CreativePrompts} />
          <Route path="/creative-tools" component={CreativeTools} />
          <Route path="/cross-platform-tools" component={CrossPlatformTools} />
          <Route path="/features-showcase" component={FeaturesShowcase} />
          <Route path="/performance-analysis" component={PerformanceAnalysis} />
          <Route path="/profile" component={Profile} />
          <Route path="/profile/accessibility" component={Profile} />
          <Route path="/profile/integrations" component={Profile} />
          <Route path="/legal" component={LegalPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/terms-of-service" component={LegalPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/nav-test" component={NavigationTest} />
          <Route component={NotFound} />
        </Switch>
      </PageTransitionWrapper>
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
    registerServiceWorker();
    initTouchFeedback(); // Initialize the touch feedback system
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
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
          </TaskVerificationProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;