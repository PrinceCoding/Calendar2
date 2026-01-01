// CANVAS Service Worker
const CACHE_NAME = 'canvas-v1';
const RUNTIME_CACHE = 'canvas-runtime-v1';

// Files to cache immediately
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/themes.css',
  './css/base.css',
  './css/header.css',
  './css/calendar.css',
  './css/notes.css',
  './css/web-browser.css',
  './css/clock.css',
  './css/pomodoro.css',
  './css/todo.css',
  './css/countdown.css',
  './css/events.css',
  './css/widgets.css',
  './css/mobile.css',
  './css/dragging.css',
  './css/canvas-tabs.css',
  './css/app-launcher.css',
  './css/settings.css',
  './css/app-store.css',
  './apps/clock.js',
  './apps/pomodoro.js',
  './apps/todo.js',
  './apps/countdown.js',
  './apps/calculator.js',
  './apps/notes.js',
  './apps/web-browser.js',
  './apps/canvas-manager.js',
  './apps/settings.js',
  './apps/ambient-sounds.js',
  './apps/app-store.js'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip Firebase and external APIs
  if (event.request.url.includes('firebasestorage.googleapis.com') ||
      event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME_CACHE).then((cache) => {
          return fetch(event.request).then((response) => {
            // Only cache successful responses
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      })
      .catch(() => {
        // Return offline page if available
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
