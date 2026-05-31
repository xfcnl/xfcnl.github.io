---
---

var CACHE_NAME = 'xf-blog-v1'

self.addEventListener('install', function() {
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME }).map(function(k) { return caches.delete(k) })
      )
    })
  )
})

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        var urls = event.data.urls
        var cached = 0
        var p = Promise.resolve()
        urls.forEach(function(url) {
          p = p.then(function() {
            return fetch(url).then(function(resp) {
              if (resp.ok) {
                return cache.put(url, resp).then(function() { cached++ })
              }
            }).catch(function() {})
          })
        })
        return p.then(function() {
          event.source.postMessage({ type: 'PRECACHE_DONE', count: cached })
        })
      })
    )
  }
})

self.addEventListener('fetch', function(event) {
  var request = event.request
  var url = new URL(request.url)

  if (url.origin !== location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
  } else if (/\.(css|js|jpg|jpeg|png|gif|svg|webp|woff2?|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request))
  }
})

function networkFirst(request) {
  return fetch(request).then(function(resp) {
    return caches.open(CACHE_NAME).then(function(cache) {
      cache.put(request, resp.clone())
      return resp
    })
  }).catch(function() {
    return caches.match(request)
  })
}

function cacheFirst(request) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached
    return fetch(request).then(function(resp) {
      return caches.open(CACHE_NAME).then(function(cache) {
        cache.put(request, resp.clone())
        return resp
      })
    }).catch(function() {
      return new Response('Offline', { status: 503 })
    })
  })
}
