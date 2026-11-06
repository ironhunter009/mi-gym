// Service worker de Mi Gym:
// - La app (HTML, datos, íconos) se sirve desde caché y se actualiza en segundo plano.
// - Cada miniatura y animación se descarga una sola vez y queda guardada en el celular.
const APP = 'migym-app-v2';
const MEDIA = 'migym-media-v1';
const SHELL = ['./', 'index.html', 'data.json', 'coach.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== APP && k !== MEDIA).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Imágenes del dataset: versión fija en la URL, nunca cambian -> caché primero.
  if (url.hostname === 'raw.githubusercontent.com') {
    e.respondWith(caches.open(MEDIA).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') c.put(req, res.clone());
      return res;
    }));
    return;
  }

  // Archivos propios y fuentes: responde desde caché y refresca en segundo plano.
  if (url.origin === location.origin || url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(caches.open(APP).then(async c => {
      const hit = await c.match(req, {ignoreSearch: true});
      const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; });
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net;
    }));
  }
});
