/* Boutou — service worker : réseau d'abord (toujours la dernière version en ligne), cache en secours hors ligne. */
var C = 'boutou-v5';
var F = ['./', 'index.html', 'css/app.css', 'css/mascot.css', 'css/anim.css', 'js/app.js', 'js/data.js', 'js/mascot.js', 'js/anim.js',
  'lib/noctis.css', 'lib/noctis.js', 'lib/brio.css', 'lib/brio.js',
  'fonts/fredoka.woff2', 'fonts/atkinson-400.woff2', 'fonts/atkinson-700.woff2',
  'manifest.webmanifest', 'icon-180.png', 'icon-512.png', 'favicon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(C).then(function (c) { return c.addAll(F.map(function (u) { return new Request(u, { cache: 'reload' }); })); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== C; }).map(function (x) { return caches.delete(x); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  var net = r.mode === 'navigate' ? fetch(r) : fetch(new Request(r.url, { cache: 'no-cache' }));
  e.respondWith(net.then(function (res) {
    if (res.ok) { var cp = res.clone(); caches.open(C).then(function (c) { c.put(r.mode === 'navigate' ? 'index.html' : r, cp); }); }
    return res;
  }).catch(function () {
    return caches.match(r, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('index.html'); });
  }));
});
