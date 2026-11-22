# Xf

[xfchannel.top](https://xfchannel.top) **← 主域名（Cloudflare Pages）**
[xfcnl.github.io](https://xfcnl.github.io) ← 旧域名（仅重定向跳转）

基于 [Hexo](https://hexo.io) 构建的自用博客，主题为自制的 `Omagari Hare`

**部署架构：**

- `xfchannel.top` → Cloudflare Pages（主站，完整博客功能）
- `xfcnl.github.io` → GitHub Pages（极简 JS 重定向站点，所有路径 302 跳转到新域名同路径）

## 本地预览

```sh
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

push 到 `main` 后由 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 自动构建并部署到 **Cloudflare Pages**：

1. 构建静态文件到 `public/`
2. `cloudflare/pages-action` 部署到 Cloudflare Pages 项目 `xf-blog`
3. push 触发时额外运行 `scripts/indexnow.js` 向 IndexNow 提交新 URL（需配置 `INDEXNOW_KEY`）

也可在 Actions 页手动触发，或执行 `gh workflow run deploy.yml`

**GitHub Pages 重定向站点**：[`.github/workflows/gh-pages-redirect.yml`](.github/workflows/gh-pages-redirect.yml)

- 仅手动触发（`workflow_dispatch`）
- 运行 `tools/build-redirect.js` 生成极简跳转页（保留完整路径 + 查询参数 + hash）
- 部署到 `xfcnl.github.io`，所有访问自动 `window.location.replace` 到 `xfchannel.top`

## AI 自动发文

[`.github/workflows/auto-post.yml`](.github/workflows/auto-post.yml) **仅手动触发**（定时任务已禁用）

- 生成脚本：[`tools/ai-post.mjs`](tools/ai-post.mjs)（AI 文章会自动带 `AI` 标签、开头声明与文末署名）
- 手动触发指定主题：`gh workflow run auto-post.yml -f topic="某主题"`（留空则自由发挥）
- 生成后 push 到 `main` → 自动触发 `deploy.yml` 部署
- 依赖 Secrets：`AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL`

## 自动友链审核

想交换友链不用私聊，直接在仓库提 [Issue](https://github.com/xfcnl/xfcnl.github.io/issues/new/choose) 选择「友链申请」模板填表即可
[`.github/workflows/add-link.yml`](.github/workflows/add-link.yml) 会运行 [`tools/add-link.mjs`](tools/add-link.mjs) 自动校验并上线：

1. 字段齐全、URL 格式合法
2. 友链页面与可访问链接域名一致
3. 可访问链接、头像均可访问
4. 友链页面必须包含指向本站（`xfchannel.top` 或任一入口域名）的链接
5. 已存在的友链自动去重

全部通过 → 写入 `source/_data/link.yaml` → push → 联动触发 `deploy.yml` 部署，评论并关闭 Issue；不通过则在 Issue 里说明原因，改完触发 `edited` 自动重试

## 其他功能

- **公告**：`/announcements/`，最新公告默认展开、历史公告折叠；在 `source/_data/announcements.yml` 添加公告，支持 Markdown
- **RSS 订阅**：`/feed.xml`（[`_config.yml`](_config.yml) 的 `feed` 项），文章和公告按日期合并在同一个 Atom Feed 中
- **站点地图**：`/sitemap.xml`，构建时同时给 SEO 与 IndexNow 使用
- **统计**：Umami 访问统计（`umami_url` / `umami_website_id`）
- **网易云音乐播放器**：左下角固定迷你播放器（`netease_player` 配置项）
- **B 站动态**：博客侧边栏展示最新动态（`dynamic_url` 指向动态 JSON）
- **PWA / Service Worker**：~~构建后由 [`scripts/workbox-sw.js`](scripts/workbox-sw.js) 自动生成 `sw.js`，页面 NetworkFirst、静态资源 CacheFirst，可离线访问~~（已停用，代码已注释，保留脚本便于日后恢复）

## 目录结构

```text
source/_posts/        — 博客文章
source/_data/         — 配置数据（announcements.yml 公告、link.yaml 友链等）
source/*.md           — 独立页面（友链、搜索、关于、动态、404 等）
themes/omagari-hare/  — 自制主题
tools/                — AI 发文、友链审核、重定向站点构建脚本（ESM/CJS 混用）
scripts/              — IndexNow、公告与 RSS 生成、PWA、静态资源复制（构建时挂载）
.github/workflows/
  ├── deploy.yml              # Cloudflare Pages 部署
  ├── gh-pages-redirect.yml   # GitHub Pages 重定向站点（仅手动）
  ├── auto-post.yml           # AI 自动发文（仅手动）
  └── add-link.yml            # 友链自动审核
```

## 关键 Secrets（GitHub Settings → Secrets → Actions）

| Secret                                    | 用途                                               | 必填 |
| ----------------------------------------- | -------------------------------------------------- | ---- |
| `CLOUDFLARE_API_TOKEN`                    | Cloudflare Pages 部署 Token (Zone:Read, Page:Edit) | 必须 |
| `CLOUDFLARE_ACCOUNT_ID`                   | Cloudflare 账号 ID                                 | 必须 |
| `INDEXNOW_KEY`                            | IndexNow 提交密钥                                  | 必须 |
| `AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL` | AI 发文所需                                        | 可选 |

## 许可证

Apache 2.0
