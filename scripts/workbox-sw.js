/**
 * 构建后用 workbox-build 生成 dist 下的 sw.js
 * 策略（对齐迁移方案第五节）：
 *  - cacheId 带构建时间戳，等价于旧的版本化缓存名
 *  - skipWaiting + clientsClaim
 *  - 预缓存：首页、各 tab 页、核心 CSS/JS
 *  - 运行时：HTML => NetworkFirst（旧站全 cache-first 容易导致文章不更新）
 *           静态资源 => CacheFirst
 */
const fs = require("fs");
const path = require("path");
const { generateSW } = require("workbox-build");

async function waitForFiles(dir, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (fs.existsSync(path.join(dir, "index.html"))) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

hexo.on("generateAfter", async () => {
  const cacheId = `xf-blog-${Date.now()}`;
  const outDir = hexo.public_dir; // public/

  // generateAfter 触发时 hexo 可能还没把文件写盘完成，等待
  const ok = await waitForFiles(outDir);
  if (!ok) {
    hexo.log.warn("[workbox] 等待产物写盘超时，跳过 sw.js 生成");
    return;
  }

  // 清理上一次构建残留的 workbox runtime 文件
  for (const f of fs.readdirSync(outDir)) {
    if (/^workbox-[\da-f]+\.js(\.map)?$/.test(f)) {
      fs.rmSync(path.join(outDir, f), { force: true });
    }
  }

  const swConfig = {
    swDest: path.join(outDir, "sw.js"),
    cacheId,
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,

    // 预缓存：tab 页 + 核心静态资源
    globDirectory: outDir,
    globPatterns: [
      "index.html",
      "{archives,archive,classify,categories,tags,about,search,link}/index.html",
      "css/**/*.css",
      "js/**/*.js",
      "img/**/*.{png,jpg,jpeg,webp,svg,ico}", // 站点目前无本地 img 目录，加上也不影响
    ],
    globIgnores: ["sw.js", "**/*.map"],

    navigateFallback: "/index.html",
    // 搜索页导航带 ?q= 参数，precache 的 directoryIndex 变体会带 query 导致无法命中，
    // 会被 navigateFallback 无脑替换成首页（URL 变了但页面不跳）。
    // 因此把 /search/ 排除出 fallback，让它走 NetworkFirst 页面路由从网络取真实搜索页。
    navigateFallbackDenylist: [/^\/api\//, /\.json$/, /\/search\//],

    runtimeCaching: [
      // 页面导航 / HTML：网络优先，离线回退缓存
      {
        urlPattern: ({ request }) =>
          request.mode === "navigate" ||
          request.destination === "document",
        handler: "NetworkFirst",
        options: {
          cacheName: `${cacheId}-pages`,
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 80, maxAgeSeconds: 7 * 24 * 3600 },
        },
      },
      // 静态资源：缓存优先
      {
        urlPattern: ({ request }) =>
          ["style", "script", "image", "font"].includes(request.destination),
        handler: "CacheFirst",
        options: {
          cacheName: `${cacheId}-assets`,
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 3600 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  };

  try {
    const { count, size, warnings } = await generateSW(swConfig);
    warnings.forEach((w) => hexo.log.warn("[workbox] " + w));
    hexo.log.info(
      `[workbox] sw.js 生成完成，预缓存 ${count} 个文件（${(size / 1024).toFixed(1)} KB），cacheId=${cacheId}`,
    );
  } catch (err) {
    hexo.log.error("[workbox] sw.js 生成失败：" + err.message);
  }
});
