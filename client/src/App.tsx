import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import AutoDismissToaster from "@/components/ui/auto-dismiss-toaster";
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
import NavigationTest from "./pages/nav-test";
import NotFound from "./pages/not-found";
import Profile from './components/profile/Profile';
import PlatformIntegrations from './pages/platform-integrations'; // Added import
import ErrorBoundary from './components/ErrorBoundary'; // Added import


function Router() {
  return (
    <AppShell>
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
        <Route path="/cross-platform-tools" component={CrossPlatformTools} />
        <Route path="/profile" component={Profile} />
        <Route path="/profile/accessibility" component={Profile} />
        <Route path="/profile/integrations" component={Profile} />
        <Route path="/platform-integrations" component={PlatformIntegrations} /> {/* Added route for Platform Integrations */}
        <Route path="/nav-test" component={NavigationTest} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AutoDismissToaster defaultDuration={5000} />
        <Router />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;