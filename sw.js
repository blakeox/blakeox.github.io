// filepath: /sw.js
const cacheName = 'blake-portfolio-v1';
const assetsToCache = [
    '/',
    '/index.md',
    '/assets/css/custom.css',
    '/assets/js/filter.js',
    '/assets/images/Blake-O-scaled.jpg',
    // add additional assets as needed
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});