const CACHE_NAME = 'upwell-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
]

// Install — cache static shell
self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
  )
})

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch — Network first for API, Cache first for assets
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Always go network for API calls
  if (url.pathname.startsWith('/api') || url.hostname !== self.location.hostname) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ message: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    )
    return
  }

  // For navigation requests — serve cached shell (SPA)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match('/index.html')
      )
    )
    return
  }

  // For static assets — cache first, then network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res
        const clone = res.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone))
        return res
      }).catch(() => caches.match('/index.html'))
    })
  )
})

// Push notifications (future use)
self.addEventListener('push', (e) => {
  if (!e.data) return
  const data = e.data.json()
  e.waitUntil(
    self.registration.showNotification(data.title || 'UpWell', {
      body: data.body || '',
      icon: '/icon.svg',
      badge: '/icon.svg',
      dir: 'rtl',
      lang: 'he',
      tag: data.tag || 'upwell',
      data: { url: data.url || '/' }
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data?.url || '/'
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      const match = clients.find(c => c.url === url)
      return match ? match.focus() : self.clients.openWindow(url)
    })
  )
})
