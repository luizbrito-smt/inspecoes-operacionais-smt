const CACHE = 'inspecoes-smt-shell-v2';
const OFFLINE = new URL('./offline.html', self.location.href).href;
const ASSETS = ['./offline.html', './pwa.js', './manifest.webmanifest', './icons/icon-fs-v2-192.png', './icons/icon-fs-v2-512.png', './icons/icon-fs-v2-maskable-512.png', './icons/apple-touch-fs-v2.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('inspecoes-smt-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    // Never cache authenticated documents, inspection records or external API traffic.
    // Keep writes online using the application's existing Firebase behavior.
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE)));
    return;
  }
  if (ASSETS.some(asset => new URL(asset, self.location.href).href === url.href)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});
