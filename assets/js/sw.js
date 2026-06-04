---
permalink: /sw.js
---

/* ============================================
   xf_blog — Service Worker (permalink → /sw.js)
   输出位置: _site/sw.js（scope 覆盖全站）

   策略:
     - 导航页面: network-first + 3 秒超时回退缓存
     - 静态资源:  cache-first（CSS / JS / 图片）
     - 首次访问: 页面发送 URL 列表 → SW 逐个缓存全部文章
   ============================================ */

/* ---- 构建时间戳（每次构建变化，浏览器据此更新 SW） ---- */
/* build: {{ site.time | date_to_xmlschema }} */

/* ---- 缓存名称（改版本号清空全部缓存） ---- */
var CACHE_NAME = 'xf-blog-v1'

/* ---- 安装: 跳过等待，立即接管 ---- */
self.addEventListener('install', function() {
  self.skipWaiting()
})

/* ---- 激活: 删除旧版本缓存 ---- */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME }).map(function(k) { return caches.delete(k) })
      )
    })
  )
})

/* ---- 消息: 接收页面发来的 URL 列表并逐个缓存 ---- */
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

/* ---- 拦截请求: 按类型选择策略 ---- */
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

/* ---- 网络优先（带 3 秒超时）: 页面请求 ---- */
/* 先尝试网络，3 秒拿不到或失败则回退缓存 */
function networkFirst(request) {
  var timeout = 3000

  return Promise.race([
    fetch(request).then(function(resp) {
      return caches.open(CACHE_NAME).then(function(cache) {
        cache.put(request, resp.clone())
        return resp
      })
    }),
    new Promise(function(_, reject) {
      setTimeout(function() { reject(new Error('timeout')) }, timeout)
    })
  ]).catch(function() {
    return caches.match(request)
  })
}

/* ---- 缓存优先: 静态资源 ---- */
/* 有缓存直接用，没有才走网络并写入缓存 */
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
