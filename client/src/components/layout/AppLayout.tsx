import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../ui/Header';
import AccessibilityTools from '../ui/AccessibilityTools';
import { ThemeToggle } from '../ui/theme-toggle'; // Added import for ThemeToggle

export default function AppLayout() {
  const [showAccessibility, setShowAccessibility] = useState(false);

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900 transition-colors duration-200"> {/* Added dark mode class */}
      <Header />
      <div className="fixed top-4 right-4 z-50"> {/* Added position for ThemeToggle */}
        <ThemeToggle /> {/* Added ThemeToggle component */}
      </div>
      <div className="flex">
        {/* Sidebar (visible on larger screens) */}
        <aside className="hidden lg:block w-64 glass-panel min-h-screen border-r border-white/20 shadow-sm">
          <div className="p-4">
            <nav className="space-y-1">
              <a href="/dashboard" className="flex items-center px-3 py-2 text-foreground dark:text-white rounded-lg transition-all hover:bg-apple-blue/10 hover:text-apple-blue"> {/* Added dark mode text class */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-apple-blue/80 dark:text-white" viewBox="0 0 20 20" fill="currentColor"> {/* Added dark mode class */}
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Dashboard
              </a>

              <a href="/content" className="flex items-center px-3 py-2 text-foreground dark:text-white rounded-lg transition-all hover:bg-apple-purple/10 hover:text-apple-purple"> {/* Added dark mode text class */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-apple-purple/80 dark:text-white" viewBox="0 0 20 20" fill="currentColor"> {/* Added dark mode class */}
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Content
              </a>

              <a href="/mood-capsules" className="flex items-center px-3 py-2 text-foreground dark:text-white rounded-lg transition-all hover:bg-apple-pink/10 hover:text-apple-pink"> {/* Added dark mode text class */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-apple-pink/80 dark:text-white" viewBox="0 0 20 20" fill="currentColor"> {/* Added dark mode class */}
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                </svg>
                Mood Capsules
              </a>

              <a href="/analytics" className="flex items-center px-3 py-2 text-foreground dark:text-white rounded-lg transition-all hover:bg-apple-orange/10 hover:text-apple-orange"> {/* Added dark mode text class */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-apple-orange/80 dark:text-white" viewBox="0 0 20 20" fill="currentColor"> {/* Added dark mode class */}
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Analytics
              </a>

              <div className="pt-4 border-t border-white/10 mt-4">
                <h3 className="px-3 text-xs font-semibold text-foreground/70 dark:text-white/70 uppercase tracking-wider"> {/* Added dark mode text class */}
                  Settings
                </h3>

                <a href="/settings" className="flex items-center px-3 py-2 mt-2 text-foreground dark:text-white rounded-lg transition-all hover:bg-apple-teal/10 hover:text-apple-teal"> {/* Added dark mode text class */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-apple-teal/80 dark:text-white" viewBox="0 0 20 20" fill="currentColor"> {/* Added dark mode class */}
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Settings
                </a>

                <button 
                  onClick={() => setShowAccessibility(!showAccessibility)}
                  className="flex items-center w-full px-3 py-2 mt-1 text-foreground dark:text-white rounded-lg transition-all hover:bg-apple-green/10 hover:text-apple-green"
                > {/* Added dark mode text class */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-apple-green/80 dark:text-white" viewBox="0 0 20 20" fill="currentColor"> {/* Added dark mode class */}
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Accessibility
                </button>

                {showAccessibility && (
                  <div className="px-3 py-3">
                    <AccessibilityTools />
                  </div>
                )}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 text-foreground dark:text-white"> {/* Added dark mode text class */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}