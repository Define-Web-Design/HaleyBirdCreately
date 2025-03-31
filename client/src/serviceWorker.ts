
// Service Worker for offline capabilities and performance
const CACHE_NAME = 'creative-symbiosis-cache-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_ASSETS = [
  OFFLINE_URL,
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/logo.svg',
  '/assets/offline-illustration.svg'
];

// Cache durations in milliseconds
const CACHE_DURATIONS = {
  images: 7 * 24 * 60 * 60 * 1000, // 7 days for images
  fonts: 30 * 24 * 60 * 60 * 1000, // 30 days for fonts
  static: 24 * 60 * 60 * 1000, // 24 hours for static assets
  api: 15 * 60 * 1000 // 15 minutes for API responses
};

// Assets that should use cache-first strategy
const CACHE_FIRST_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.eot'];

// Function to determine if a URL should use cache-first strategy
const shouldUseCacheFirst = (url: string): boolean => {
  const extension = url.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase();
  if (!extension) return false;
  return CACHE_FIRST_EXTENSIONS.includes(`.${extension}`);
};

// Function to determine cache expiration time for a URL
const getCacheExpiration = (url: string): number => {
  const now = Date.now();
  if (url.includes('/api/')) return now + CACHE_DURATIONS.api;
  if (url.includes('/assets/fonts/')) return now + CACHE_DURATIONS.fonts;
  if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) return now + CACHE_DURATIONS.images;
  return now + CACHE_DURATIONS.static;
};

// Remove expired items from cache
const removeExpiredItems = async (cacheName: string) => {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  
  for (const request of requests) {
    // Get cache metadata
    const response = await cache.match(request);
    if (!response) continue;
    
    const expires = response.headers.get('sw-expires');
    if (expires && parseInt(expires, 10) < Date.now()) {
      await cache.delete(request);
    }
  }
};

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache offline page and critical assets
      await cache.addAll(OFFLINE_ASSETS);
      
      // Skip waiting to activate the new service worker immediately
      await (self as any).skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      
      // Claim clients so the service worker is in control immediately
      await (self as any).clients.claim();
      
      // Clean expired items from the cache
      await removeExpiredItems(CACHE_NAME);
    })()
  );
});

self.addEventListener('fetch', (event: any) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Don't cache cross-origin requests to prevent CORS issues
  if (url.origin !== self.location.origin && !url.href.includes('fonts.googleapis.com')) return;

  // Special handling for navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first for navigation
          const networkResponse = await fetch(request);
          return networkResponse;
        } catch (error) {
          // If network fails, show offline page
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse || new Response('You are offline', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
          });
        }
      })()
    );
    return;
  }

  // For API requests, use network-first but cache responses
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          
          // Cache a copy of the response with expiration info
          const cache = await caches.open(CACHE_NAME);
          const clonedResponse = networkResponse.clone();
          const expiresAt = getCacheExpiration(url.href);
          
          // Create a new response with expiration header
          const responseToCache = new Response(await clonedResponse.blob(), {
            headers: new Headers({
              ...Object.fromEntries(clonedResponse.headers.entries()),
              'sw-expires': expiresAt.toString()
            })
          });
          
          cache.put(request, responseToCache);
          return networkResponse;
        } catch (error) {
          // If network fails, try cache
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(request);
          if (cachedResponse) return cachedResponse;
          
          // If there's no cached response either, return a JSON error
          return new Response(JSON.stringify({ 
            error: 'Network error', 
            offline: true 
          }), { 
            status: 503, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }
      })()
    );
    return;
  }

  // For assets that benefit from cache-first strategy (images, fonts, etc.)
  if (shouldUseCacheFirst(url.href)) {
    event.respondWith(
      (async () => {
        // Check cache first
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
          // Check if cached response is expired
          const expires = cachedResponse.headers.get('sw-expires');
          if (!expires || parseInt(expires, 10) > Date.now()) {
            return cachedResponse;
          }
        }
        
        // If not in cache or expired, fetch from network
        try {
          const networkResponse = await fetch(request);
          
          // Cache the new response with expiration
          const clonedResponse = networkResponse.clone();
          const expiresAt = getCacheExpiration(url.href);
          
          const responseToCache = new Response(await clonedResponse.blob(), {
            headers: new Headers({
              ...Object.fromEntries(clonedResponse.headers.entries()),
              'sw-expires': expiresAt.toString()
            })
          });
          
          cache.put(request, responseToCache);
          return networkResponse;
        } catch (error) {
          // If network fails but we have an expired cached response, use it as fallback
          if (cachedResponse) return cachedResponse;
          
          // Otherwise, return error response depending on content type
          if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return cache.match('/assets/image-placeholder.svg') || 
                   new Response('Image not available offline', { 
                     status: 503, 
                     headers: { 'Content-Type': 'text/plain' } 
                   });
          }
          
          return new Response('Resource not available offline', { 
            status: 503, 
            headers: { 'Content-Type': 'text/plain' } 
          });
        }
      })()
    );
    return;
  }

  // Default: network-first strategy with cache fallback
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        return cache.match(request) || new Response('Not available offline', { 
          status: 503, 
          headers: { 'Content-Type': 'text/plain' } 
        });
      }
    })()
  );
});

// Periodically clean up expired cache items (every 24 hours)
self.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(removeExpiredItems(CACHE_NAME));
  }
});

// Create a client-side offline page
const createOfflinePage = () => {
  if ('caches' in self) {
    caches.open(CACHE_NAME).then(cache => {
      const offlineContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're Offline | Creative Symbiosis</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f7f8fa;
              color: #333;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            .container {
              max-width: 500px;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 1rem;
            }
            p {
              margin-bottom: 1.5rem;
              line-height: 1.5;
              color: #666;
            }
            .retry-btn {
              background: #6366f1;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s;
            }
            .retry-btn:hover {
              background: #4f46e5;
            }
            .offline-icon {
              width: 100px;
              height: 100px;
              margin-bottom: 2rem;
            }
            .cached-content {
              margin-top: 2rem;
              padding: 1rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <svg class="offline-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
            <h1>You're Offline</h1>
            <p>It looks like you've lost your internet connection. Don't worry, some content is still available offline.</p>
            <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
            <div class="cached-content">
              <h3>Available Offline</h3>
              <div id="offline-content">
                <p>You can still access previously visited pages and content that has been cached.</p>
              </div>
            </div>
          </div>
          <script>
            // If online status changes, refresh the page
            window.addEventListener('online', () => {
              window.location.reload();
            });
            
            // Check for available cached pages
            if ('caches' in window) {
              caches.open('${CACHE_NAME}').then(cache => {
                cache.keys().then(keys => {
                  const pages = keys
                    .map(req => req.url)
                    .filter(url => url.endsWith('.html') || url.endsWith('/'))
                    .map(url => {
                      const path = new URL(url).pathname;
                      const name = path === '/' ? 'Home' : path.split('/').filter(Boolean).pop();
                      return { name, url };
                    });
                  
                  if (pages.length > 0) {
                    const container = document.getElementById('offline-content');
                    container.innerHTML = '<p>You can access these pages offline:</p><ul>' + 
                      pages.map(page => '<li><a href="' + page.url + '">' + page.name + '</a></li>').join('') +
                      '</ul>';
                  }
                });
              });
            }
          </script>
        </body>
        </html>
      `;

      const offlineResponse = new Response(offlineContent, {
        headers: { 'Content-Type': 'text/html' }
      });
      
      cache.put(new Request(OFFLINE_URL), offlineResponse);
    });
  }
};

// Create the offline page during installation
self.addEventListener('install', (event: any) => {
  event.waitUntil(createOfflinePage());
});

export {};
