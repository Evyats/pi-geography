const CACHE = 'israel-geography-v1'
const ROOT = '/geography/'
const APP_SHELL = [ROOT, `${ROOT}manifest.webmanifest`, `${ROOT}icon-192.png`, `${ROOT}icon-512.png`]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))))
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const path = new URL(event.request.url).pathname
  if (event.request.method !== 'GET' || !path.startsWith(ROOT)) return
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(event.request, copy))
        return response
      })
      .catch(() => caches.match(event.request).then((response) => response || (event.request.mode === 'navigate' ? caches.match(ROOT) : Response.error()))),
  )
})
