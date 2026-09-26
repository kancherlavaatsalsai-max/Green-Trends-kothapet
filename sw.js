// Green Trends Kothapet - PWA Service Worker (v4)
const CACHE_NAME = 'gt-kothapet-cache-v4';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Cache core assets
      await cache.addAll(STATIC_ASSETS);
      // 2. Opportunistically cache icon files if present (never fail SW if missing)
      for (const icon of ['./icon-192.png', './icon-512.png']) {
        try {
          const resp = await fetch(icon);
          if (resp && resp.ok) await cache.put(icon, resp);
        } catch (e) {}
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Let Firestore & Google APIs go direct to network
  const url = new URL(event.request.url);
  if (url.origin.includes('firestore.googleapis.com') || 
      url.origin.includes('firebase') || 
      url.origin.includes('gstatic.com') ||
      url.origin.includes('identitytoolkit')) {
    return;
  }

  // Network-first with Cache fallback for app shell
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
