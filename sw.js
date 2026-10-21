/* Boutou — service worker : réseau d'abord pour la page, cache d'abord pour le reste. */
var C = 'boutou-v3';
var F = ['./', 'index.html', 'css/app.css', 'css/mascot.css', 'js/app.js', 'js/data.js', 'js/mascot.js',
  'fonts/fredoka.woff2', 'fonts/atkinson-400.woff2', 'fonts/atkinson-700.woff2',
  'manifest.webmanifest', 'icon-180.png', 'icon-512.png', 'favicon.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(C).then(function (c) { return c.addAll(F); })); self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== C; }).map(function (x) { return caches.delete(x); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(function (res) { var cp = res.clone(); caches.open(C).then(function (c) { c.put('index.html', cp); }); return res; })
      .catch(function () { return caches.match('index.html'); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (hit) {
    var net = fetch(r).then(function (res) { if (res.ok) { var cp = res.clone(); caches.open(C).then(function (c) { c.put(r, cp); }); } return res; }).catch(function () { return hit; });
    return hit || net;
  }));
});
