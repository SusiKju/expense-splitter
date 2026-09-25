// Urlaubskasse Service Worker
const CACHE = 'urlaubskasse-v13';
const ASSETS = [
  './',
  './urlaubskasse.html',
  './settlement.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './avatars/long.jpg',
  './avatars/micha.jpg',
  './avatars/reddi.jpg',
  './avatars/ronny.jpg',
  './avatars/rudi.jpg',
  './avatars/thommy.jpg',
  './avatars/ulbert.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Network-first für Navigationen und Skripte (HTML und settlement.js müssen zusammenpassen), Cache-Fallback offline
  if (req.mode === 'navigate' || req.destination === 'script') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./urlaubskasse.html')))
    );
    return;
  }

  // Stale-while-revalidate für Assets
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
