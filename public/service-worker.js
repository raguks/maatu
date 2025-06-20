const CACHE_NAME = 'kannada-quiz-cache-v1';
const urlsToCache = [
  './',
  './index.html', // Assuming your main HTML file is index.html in the root
  './MaatuQuizPage.css', // Your CSS file
  './MaatuQuizPage.jsx', // Your React JSX (will be bundled as JS in production)
  // Add other assets like bundled JS files, images, etc.
  // For a React app, typically the build output (e.g., /static/js/*.js, /static/css/*.css)
  // would be explicitly listed or caught by a broader regex.
  // For development/simple bundling, you might cache the raw JSX/CSS.
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache during install:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request).catch(function(error) {
          // This catch block handles network errors
          console.log('Fetch failed:', event.request.url, error);
          // You could return an offline page here if desired
          // return caches.match('/offline.html');
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
