import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
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
import LegalPage from "./pages/legal";
import PrivacyPage from "./pages/privacy";
import CookieConsent from "./components/common/CookieConsent";
import { ThemeProvider } from "./lib/ThemeContext";
import { TaskVerificationProvider } from "./context/task-verification-context";

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
    }
    
    // Prevent overscroll behavior on mobile
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
      document.body.classList.remove('mobile-device');
      document.body.style.overscrollBehavior = 'auto';
    };
  }, [isMobile]);

  return (
    <AppShell>
      <AutoDismissToaster defaultDuration={5000} />
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
        <Route path="/profile" component={Profile} />
        <Route path="/profile/accessibility" component={Profile} />
        <Route path="/profile/integrations" component={Profile} />
        <Route path="/legal" component={LegalPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms-of-service" component={LegalPage} />
        <Route path="/nav-test" component={NavigationTest} />
        <Route component={NotFound} />
      </Switch>
      <CookieConsent 
        privacyPolicyUrl="/privacy"
        termsOfServiceUrl="/terms-of-service"
      />
    </AppShell>
  );
}

function App() {
  // Try to register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TaskVerificationProvider>
          <Router />
        </TaskVerificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;