self.addEventListener('install', function(event) {
  // do nothing
});

self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});
