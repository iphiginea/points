// Minimal service worker for install support, offline fallback, and one small
// compatibility patch: Shén Mén uses the standard paced text session instead
// of the removed narration track.
const CACHE_NAME = 'points-shell-v2';
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

async function pageResponse(request) {
  const response = await fetch(request);
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;

  const html = (await response.text()).replace(
    'audio:"audio/shenmen.mp3",',
    '',
  );

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(pageResponse(event.request).catch(() => caches.match('./index.html')));
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
