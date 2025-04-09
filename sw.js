// filepath: /sw.js
const cacheName = 'blake-portfolio-v3'; // Increment version for updates
const assetsToCache = [
  '/',
  '/index.md',
  '/offline.html', // Ensure offline fallback page is cached
  '/assets/css/custom.css',
  '/assets/js/filter.js',
  '/assets/js/nav.js',
  '/assets/images/Blake-O-scaled.jpg',
  '/assets/images/favicon.png',
  '/assets/images/icon-192x192.png',
  '/assets/images/icon-512x512.png',
];

// Install event: Cache assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== cacheName) {
            console.log(`Deleting old cache: ${name}`);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Fetch event: Serve cached assets, fallback to network
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const clonedResponse = networkResponse.clone();
        caches.open(cacheName).then(cache => {
          cache.put(e.request, clonedResponse);
        });
        return networkResponse;
      }).catch(error => {
          console.error('Fetch failed; returning offline page instead.', error);
          if (e.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});