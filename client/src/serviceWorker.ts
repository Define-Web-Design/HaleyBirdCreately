
const CACHE_NAME = 'app-cache-v1';

const self = (globalThis as any) as ServiceWorkerGlobalScope;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/static/js/main.js',
        '/static/css/main.css',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  const offlineData = await caches.match('offline-data');
  if (offlineData) {
    // Sync data with server
    await fetch('/api/sync', {
      method: 'POST',
      body: await offlineData.text(),
    });
    await caches.delete('offline-data');
  }
}

export {};
