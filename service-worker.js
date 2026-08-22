// Minimal service worker — just enough to make the app installable and
// let it open when offline. Only the app shell is cached.
const CACHE_NAME = 'points-shell-v1';
const SHELL_FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first for everything, falling back to cache (covers the offline case
  // without risking stale session content while online).
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
