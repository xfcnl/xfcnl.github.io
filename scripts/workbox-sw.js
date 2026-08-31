// =====================================================================
// ⚠️ Service Worker 生成已停用（整段注释）
// 如需恢复：删除本文件的所有注释标记（每行开头的 "// "）即可
// =====================================================================
// /**
//  * 构建后用 workbox-build 生成 dist 下的 sw.js
//  * 策略（对齐迁移方案第五节）：
//  *  - cacheId 带构建时间戳，等价于旧的版本化缓存名
//  *  - skipWaiting + clientsClaim
//  *  - 预缓存：首页、各 tab 页、核心 CSS/JS
//  *  - 运行时：HTML => NetworkFirst（旧站全 cache-first 容易导致文章不更新）
//  *           静态资源 => CacheFirst
//  */
// const fs = require("fs");
// const path = require("path");
// const { generateSW } = require("workbox-build");
//
// async function waitForFiles(dir, timeout = 15000) {
//   const start = Date.now();
//   while (Date.now() - start < timeout) {
//     if (fs.existsSync(path.join(dir, "index.html"))) return true;
//     await new Promise((r) => setTimeout(r, 500));
//   }
//   return false;
// }
//
// hexo.on("generateAfter", async () => {
//   const cacheId = `xf-blog-${Date.now()}`;
//   const outDir = hexo.public_dir; // public/
//
//   // generateAfter 触发时 hexo 可能还没把文件写盘完成，等待
//   const ok = await waitForFiles(outDir);
//   if (!ok) {
//     hexo.log.warn("[workbox] 等待产物写盘超时，跳过 sw.js 生成");
//     return;
//   }
//
//   // 清理上一次构建残留的 workbox runtime 文件
//   for (const f of fs.readdirSync(outDir)) {
//     if (/^workbox-[\da-f]+\.js(\.map)?$/.test(f)) {
//       fs.rmSync(path.join(outDir, f), { force: true });
//     }
//   }
//
//   const swConfig = {
//     swDest: path.join(outDir, "sw.js"),
//     cacheId,
//     skipWaiting: true,
//     clientsClaim: true,
//     cleanupOutdatedCaches: true,
//
//     // 预缓存：所有站内 HTML（含文章页 tech/*、note/*）+ 核心静态资源
//     globDirectory: outDir,
//     globPatterns: [
//       "**/*.html",
//       "{archives,archive,classify,categories,tags,about,search,link}/index.html",
//       "css/**/*.css",
//       "js/**/*.js",
//       "search.json",
//       // 本地静态图片：构建时 scripts/copy-image.js 把 image/ 复制进 public/image/
//       "image/**/*.{png,jpg,jpeg,webp,gif,svg,ico}",
//     ],
//     globIgnores: ["sw.js", "**/*.map"],
//
//     // 搜索 + 版本参数不参与 precache 匹配：
//     //  - ?q=      search 页导航参数，忽略后 /search/?q=xxx 才能命中预缓存的 search 页
//     //  - ?v=      layout.ejs 给 css/js 追加的版本号（如 /css/style.css?v=abc），
//     //             不忽略的话离线时带版本号的请求匹配不到预缓存的裸 URL，页面就会「没样式」
//     ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^q$/, /^v$/],
//
//     navigateFallback: "/index.html",
//     // 搜索页导航带 ?q= 参数，理论上应被 precache 命中；此处仍保留 denylist，
//     // 避免在极端情况下（precache miss）被无脑替换成首页。
//     navigateFallbackDenylist: [/^\/api\//, /\.json$/, /\/search\//],
//
//     runtimeCaching: [
//       // 页面导航 / HTML：网络优先，离线回退缓存
//       {
//         urlPattern: ({ request }) =>
//           request.mode === "navigate" ||
//           request.destination === "document",
//         handler: "NetworkFirst",
//         options: {
//           cacheName: `${cacheId}-pages`,
//           networkTimeoutSeconds: 3,
//           expiration: { maxEntries: 80, maxAgeSeconds: 7 * 24 * 3600 },
//           // 断网且 runtime 缓存 miss 时兜底到预缓存首页，避免浏览器直接显示无状态/连不上
//           precacheFallback: { fallbackURL: "/index.html" },
//         },
//       },
//       // 静态资源：缓存优先
//       {
//         urlPattern: ({ request }) =>
//           ["style", "script", "image", "font"].includes(request.destination),
//         handler: "CacheFirst",
//         options: {
//           cacheName: `${cacheId}-assets`,
//           expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 3600 },
//           cacheableResponse: { statuses: [0, 200] },
//         },
//       },
//     ],
//   };
//
//   try {
//     const { count, size, warnings } = await generateSW(swConfig);
//     warnings.forEach((w) => hexo.log.warn("[workbox] " + w));
//     hexo.log.info(
//       `[workbox] sw.js 生成完成，预缓存 ${count} 个文件（${(size / 1024).toFixed(1)} KB），cacheId=${cacheId}`,
//     );
//   } catch (err) {
//     hexo.log.error("[workbox] sw.js 生成失败：" + err.message);
//   }
// });
