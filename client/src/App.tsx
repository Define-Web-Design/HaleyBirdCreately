import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/dashboard";
import ContentLibrary from "./pages/content-library";
import ContentCalendar from "./pages/content-calendar";
import Analytics from "./pages/analytics";
import MoodBoards from "./pages/mood-boards";
import ContentVault from "./pages/content-vault";
import ApplePhotos from "./pages/apple-photos";
import CreativeSymbiosis from "./pages/creative-symbiosis";
import ColorPalettes from "./pages/color-palettes";
import MoodCapsules from "./pages/mood-capsules";
import NotFound from "./pages/not-found";
import Profile from './components/profile/Profile'; // Added import for Profile component


function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/content-library" component={ContentLibrary} />
        <Route path="/content-calendar" component={ContentCalendar} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/mood-boards" component={MoodBoards} />
        <Route path="/content-vault" component={ContentVault} />
        <Route path="/apple-photos" component={ApplePhotos} />
        <Route path="/creative-symbiosis" component={CreativeSymbiosis} />
        <Route path="/color-palettes" component={ColorPalettes} />
        <Route path="/mood-capsules" component={MoodCapsules} />
        <Route path="/profile" component={Profile} /> {/* Added route for Profile */}
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;