/* ============================================
   xf_blog — Service Worker
   策略:
     - 页面导航: 网络优先 + 3 秒超时，失败回退缓存（离线可浏览）
     - 静态资源: 缓存优先，后台更新（stale-while-revalidate）
     - 激活时预缓存核心页面
   ============================================ */

var CACHE_NAME = "xf-blog-v2";

// 激活时预缓存的核心页面
var PRECACHE_URLS = [
  "/",
  "/archive/",
  "/classify/",
  "/tag/",
  "/about/",
  "/link/",
  "/search/",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        // 逐个缓存，单个失败不影响其它
        return Promise.all(
          PRECACHE_URLS.map(function (url) {
            return cache.add(url).catch(function () {});
          }),
        );
      })
      .then(function () {
        return self.skipWaiting();
      }),
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) {
              return k !== CACHE_NAME;
            })
            .map(function (k) {
              return caches.delete(k);
            }),
        );
      })
      .then(function () {
        return self.clients.claim();
      }),
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  var url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== location.origin) return;

  // 页面导航：网络优先，超时/失败回退缓存
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静态资源：缓存优先，后台更新
  event.respondWith(staleWhileRevalidate(request));
});

function networkFirst(request) {
  var timeout = 3000;

  return Promise.race([
    fetch(request).then(function (resp) {
      if (resp.ok) {
        var clone = resp.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, clone);
        });
      }
      return resp;
    }),
    new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error("timeout"));
      }, timeout);
    }),
  ]).catch(function () {
    return caches.match(request).then(function (cached) {
      return (
        cached ||
        new Response("离线状态：此页面尚未缓存", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        })
      );
    });
  });
}

function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(request).then(function (cached) {
      var fetchPromise = fetch(request)
        .then(function (resp) {
          if (resp.ok) cache.put(request, resp.clone());
          return resp;
        })
        .catch(function () {
          return null;
        });

      // 有缓存先返回缓存，后台更新；没缓存等网络
      if (cached) return cached;
      return fetchPromise.then(function (resp) {
        if (resp) return resp;
        // 离线且没有缓存
        if (request.mode === "navigate") {
          return new Response("离线状态：此页面尚未缓存", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
        return new Response("Offline", { status: 503 });
      });
    });
  });
}
