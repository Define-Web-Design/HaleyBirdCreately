
import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Sun, Moon, ZoomIn, ZoomOut, Eye } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isDark, toggleTheme } = useTheme();
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [fontSize, highContrast]);

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
      
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setFontSize(s => Math.min(s + 2, 24))}
          aria-label="Increase font size"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setFontSize(s => Math.max(s - 2, 12))}
          aria-label="Decrease font size"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setHighContrast(h => !h)}
          aria-label="Toggle high contrast"
        >
          <Eye className="h-5 w-5" />
        </Button>
      </div>

      <main id="main-content" className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
