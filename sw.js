// ZALAVRAI — Service Worker v4
// Placez ce fichier à côté de index.html sur votre serveur
const CACHE = 'zalavrai-v5';
const BYPASS = ['script.google.com', 'fonts.g', 'cdnjs', 'unpkg', 'googleapis'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return fetch(self.registration.scope)
        .then(r => c.put(self.registration.scope, r))
        .catch(() => {}); // silencieux si hors ligne
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  // Bypass APIs externes
  if (BYPASS.some(h => u.hostname.includes(h))) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(r => {
        if (r.ok) {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        }
        return r;
      }).catch(() => cached); // fallback cache si réseau absent
      return cached || net;
    })
  );
});
