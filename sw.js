// filepath: /sw.js
const cacheName = 'blake-portfolio-v2'; // Increment version for updates
const assetsToCache = [
    '/',
    '/index.md',
    '/assets/css/custom.css',
    '/assets/js/filter.js',
    '/assets/images/Blake-O-scaled.jpg',
    // Add additional assets as needed
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
            return caches.delete(name); // Delete old caches
          }
        })
      );
    })
  );
});

// Fetch event: Serve cached assets, fallback to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return (
        response ||
        fetch(e.request).then(networkResponse => {
          // Optionally cache new network responses
          return caches.open(cacheName).then(cache => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        })
      );
    }).catch(() => {
      // Fallback for offline (optional)
      if (e.request.destination === 'document') {
        return caches.match('/offline.html'); // Add an offline.html page to your project
      }
    })
  );
});

// Add offline fallback
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request).catch(() => {
        if (e.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});