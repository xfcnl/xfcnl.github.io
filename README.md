# Xf

[GitHub](https://xfcnl.github.io)　[Cloudflare](https://husd.cc.cd)　[EdgeOne](https://blog.sfvg.de5.net)

基于 [Hexo](https://hexo.io) 构建的自用博客，主题为自制的 `Omagari Hare`
同一份构建产物通过三个入口访问：GitHub Pages 主站 + Cloudflare / EdgeOne 备用站点

## 本地预览

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生成静态文件
npm run build

# 清理缓存
npm run clear
```

浏览器打开 `http://localhost:4000` 即可预览

## 自动部署

push 到 `main` 后由 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 自动构建并部署到 GitHub Pages：
构建完成后上传 Pages artifact → `pages/deploy-pages` 部署 → push 触发时额外运行 `scripts/indexnow.js` 向 IndexNow 提交新 URL（覆盖 GitHub / Cloudflare / EdgeOne 三个域名，需配置 `INDEXNOW_KEY`）
也可在 Actions 页手动触发，或执行 `gh workflow run deploy.yml`

## AI 自动发文

每周一 / 三 / 五（UTC 04:00）由 [`.github/workflows/auto-post.yml`](.github/workflows/auto-post.yml) 调用 AI 自动生成文章并推送到 `main`，随后联动触发部署

- 生成脚本：[`tools/ai-post.mjs`](tools/ai-post.mjs)（AI 文章会自动带 `AI` 标签、开头声明与文末署名）
- 手动触发指定主题：`gh workflow run auto-post.yml -f topic="某主题"`（留空则自由发挥）
- 依赖 Secrets：`AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL`

## 自动友链审核

想交换友链不用私聊，直接在仓库提 [Issue](https://github.com/xfcnl/xfcnl.github.io/issues/new/choose) 选择「友链申请」模板填表即可
[`.github/workflows/add-link.yml`](.github/workflows/add-link.yml) 会运行 [`tools/add-link.mjs`](tools/add-link.mjs) 自动校验并上线：

1. 字段齐全、URL 格式合法
2. 友链页面与可访问链接域名一致
3. 可访问链接、头像均可访问
4. 友链页面必须包含指向本站的链接
5. 已存在的友链自动去重

全部通过 → 写入 `source/_data/link.yaml` → push → 联动部署，评论并关闭 Issue；不通过则在 Issue 里说明原因，改完触发 `edited` 自动重试

## 其他功能

- **PWA / Service Worker**：构建后由 [`scripts/workbox-sw.js`](scripts/workbox-sw.js) 自动生成 `sw.js`，页面 NetworkFirst、静态资源 CacheFirst，可离线访问
- **RSS 订阅**：`/feed.xml`（[`_config.yml`](_config.yml) 的 `feed` 项）
- **站点地图**：`/sitemap.xml`，构建时同时给 SEO 与 IndexNow 使用
- **统计**：Umami 访问统计（`umami_url` / `umami_website_id`）
- **网易云音乐播放器**：左下角固定迷你播放器（`netease_player` 配置项）
- **B 站动态**：博客侧边栏展示最新动态（`dynamic_url` 指向动态 JSON）

## 目录结构

```
source/_posts/        — 博客文章
source/_data/         — 配置数据（link.yaml 友链、social.yml 社交链接等）
source/*.md           — 独立页面（友链、搜索、关于、动态、404 等）
themes/omagari-hare/  — 自制主题
tools/                — AI 发文、友链审核脚本（ESM）
scripts/              — IndexNow 提交、PWA Service Worker 构建（CJS，构建时挂载到 Hexo）
.github/workflows/    — 自动部署、AI 发文、友链审核工作流
```

## 许可证

Apache 2.0
