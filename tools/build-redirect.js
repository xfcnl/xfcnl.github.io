#!/usr/bin/env node
// 构建最小重定向站点给 GitHub Pages
// 输出到 ./public-redirect 目录

const fs = require('fs');
const path = require('path');

const REDIRECT_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>正在跳转到新域名...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f5f5f5; color: #333; }
    .container { text-align: center; padding: 2rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e0e0e0; border-top-color: #4285f4; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    a { color: #4285f4; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner" aria-hidden="true"></div>
    <p>博客已迁移至新域名，正在跳转...</p>
    <p><a id="manualLink" href="https://xfchannel.top">点击这里手动跳转</a></p>
  </div>
  <script>
    (function() {
      var newHost = 'xfchannel.top';
      var currentPath = window.location.pathname + window.location.search + window.location.hash;
      var newUrl = 'https://' + newHost + currentPath;
      document.getElementById('manualLink').href = newUrl;
      window.location.replace(newUrl);
    })();
  </script>
</body>
</html>`;

const outDir = path.join(__dirname, '../public-redirect');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'index.html'), REDIRECT_HTML);
// 也创建 404.html 以防万一
fs.writeFileSync(path.join(outDir, '404.html'), REDIRECT_HTML);

console.log('Redirect site built to', outDir);