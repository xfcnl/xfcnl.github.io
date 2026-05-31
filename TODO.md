# 博客待修复问题清单

## 🔴 P0 - 严重（必须修）

### ~~搜索页内联全部文章全文~~ ✅

- **文件**: `search.md:19-29`
- **问题**: `post.content` 完整嵌入到 JavaScript 数组 `POSTS` 中，每页加载都传输所有文章的全文 HTML。15 篇时还好，文章增多后页面体积暴涨，搜索性能也会下降。
- **方案**: 改为只索引 `post.title` + `post.excerpt`（或 `post.content | strip_html | truncatewords: 50`）。
- **状态**: 已修复 — 改用 `teaser`（`post.excerpt | strip_html | truncatewords:50`），不再内联全文。

### ~~三个统计脚本拖慢页面~~ ✅

- **文件**: `_includes/head-custom.html`
- **问题**: Google Analytics + Umami + Microsoft Clarity 三个同时加载，额外 3 个 HTTP 请求 + 3 段 JS 执行。对个人博客毫无必要。
- **方案**: 只保留 Umami（自部署、轻量、隐私友好），删除其他两个。
- **状态**: 已修复 — GA 与 Clarity 已注释，仅 Umami 保留。

---

## 🟠 P1 - 重要（应尽快修复）

### ~~没有 404 页面~~ ✅

- **文件**: 缺少 `404.md` 或 `404.html`
- **问题**: 访问不存在路径时显示 GitHub Pages 默认 404，体验差。
- **方案**: 添加一个 `404.md`，带返回首页链接和简单样式。
- **状态**: 已修复 — `404.md` 已存在，含返回首页链接。

### ~~邮箱明文暴露~~ ✅

- **文件**: `mailto.md:14`
- **问题**: `G114514g@yeah.net` 直接写在页面中，爬虫可轻松抓取。
- **方案**: 用 JS 拼合字符串或 `&#` HTML 实体编码，或者用 Cloudflare 的 Email Obfuscation。
- **状态**: 已修复 — 邮箱已用 HTML 实体编码 + JS 字符串拼接，不再明文暴露。

### ~~导航栏缺少 `aria-expanded`~~ ✅

- **文件**: `_layouts/default.html:17`
- **问题**: 汉堡菜单按钮切换 `open` 类但没有同步 `aria-expanded` 属性。
- **方案**: JS 中 toggle 时同步 `toggle.setAttribute('aria-expanded', ...)`。
- **状态**: 已修复 — 按钮已设 `aria-expanded="false"`，JS 切换时同步更新。

---

## 🟡 P2 - 代码质量（积攒技术债）

### ~~CSS 重复代码~~ ✅

- **文件**: `assets/css/style.scss:62-74`
- **问题**: `@media (min-width: 769px) { .footer { ... } }` 完全重复写了两次。
- **方案**: 删掉一组。
- **状态**: 已修复 — 已删除重复的 `@media (min-width: 769px)` 代码块。

### ~~`!important` 滥用~~ ✅

- **文件**: `assets/css/style.scss`，遍布几十处
- **问题**: 表格、代码块、列表 hover 等大量使用 `!important`。上游 theme 升级版本或引入新组件时极易冲突，难以排查。
- **方案**: 逐步用更高特异性选择器替换 `!important`。
- **状态**: 已修复 — 搜索确认没有找到任何 `!important` 使用。

### 行内样式分散在各页面 ❌

- **文件**: `index.md`, `archive.md`, `tag.md`, `note.md`, `tech.md`, `search.md`, `link.md`
- **问题**: 大量 `style="color:#8b949e; font-size:13px;"` 等行内样式，样式分散、难以统一维护。
- **方案**: 抽取为 CSS 类（如 `.post-meta`、`.post-item`、`.tag-link` 等），在 `style.scss` 中统一定义。
- **状态**: 未解决 — 检查发现大量行内样式存在，需要抽取为CSS类。

### ~~多个 `<script>` 块未合并~~ ✅

- **文件**: `_layouts/default.html:53-55`
- **问题**: copy-button、nav-toggle、external-link 分为 3 个独立的 `<script>` 块。
- **方案**: 合并为 1 个 `DOMContentLoaded` 回调，或提取为独立 `assets/js/main.js`。
- **状态**: 已修复 — 已合并到 `assets/js/xf-blog.js` 单个 `DOMContentLoaded` 回调中。

### ~~~文件名拼写错误~~ ✅

- **文件**: `_includes/head-custon-clarity-analytics.html`
- **问题**: `custon` → 应为 `custom`。
- **方案**: 重命名。
- **状态**: 已修复 — 确认文件名正确，没有拼写错误的文件。

### ~~相关文章不包含 note~~ ✅

- **文件**: `_layouts/post.html:40`
- **问题**: 相关文章只从 `site.posts`（tech 类）查找，`site.note` 永远不会出现在相关文章里。
- **方案**: 改为 `site.posts | concat: site.note`。
- **状态**: 已修复 — 已改用 `site.posts | concat: site.note` 合并查询。

---

## 🔵 P3 - 可维护性/架构

### ~~Jekyll 3.10.0 陈旧~~ 🟦 保留

- **文件**: `Gemfile.lock`（由 `Gemfile` 中 `github-pages ~> 232` 锁定）
- **问题**: GitHub Pages 强制锁定 Jekyll 3.10 生态，缺乏 4.x 的性能优化和功能。
- **方案**: 可考虑迁移到独立 Actions 构建流程使用 Jekyll 4.x，或接受现状（短期影响小）。
- **状态**: 保留不修 — 使用 Jekyll 3.10.0 是为了与 GitHub Pages 兼容。

### ~~社交链接在 4 个文件中硬编码~~ ✅

- **文件**: `index.md:68`, `_layouts/post.html:52-62`, `_layouts/page.html:13-23`, `about.md:23-25`
- **问题**: B站 / YouTube / Email 链接在 4 个地方各写一遍，改一个社交链接要改 4 处。
- **方案**: 将社交链接抽到 `_data/social.yaml`，通过 Liquid 遍历渲染。
- **状态**: 已修复 — 抽到 `_data/social.yml` + `_includes/social-links.html`，4 个页面统一调用。

### Liquid 逻辑重复 ❌

- **文件**: `index.md`, `archive.md`, `tag.md`, `search.md`
- **问题**: 合并 `site.posts` 和 `site.note` 的 Liquid 逻辑在多个文件中重复。
- **方案**: 抽取为 `_includes/` 或通过 Jekyll 插件封装。
- **状态**: 未解决 — 检查确认合并 `site.posts | concat: site.note` 的逻辑在4个文件中重复。

### ~~没有设置 `site.lang`~~ ✅

- **文件**: `_config.yml`
- **问题**: 未设置 `lang`，页面 fallback 到 `en-US`。中文博客的 lang 应该是 `zh-CN`。
- **方案**: 在 `_config.yml` 中添加 `lang: zh-CN`。
- **状态**: 已修复 — `_config.yml` 中已设置 `lang: zh-CN`。

### ~~硬编码副站 URL~~ 🟦 保留

- **文件**: `_layouts/default.html:24`（导航栏 `副站`），`:45`（footer VICP 链接）
- **问题**: 子站点 URL 和 VICP 代理 URL 硬编码在 layout 中。
- **方案**: 抽取到 `_config.yml`。
- **状态**: 一般来说，这些内容是不可能一直在变动的，而是很长时间都是那样，所以抽取到 `_config.yml` 意义不大

---

## ⚪ P4 - 低优先级

### 没有 Service Worker / PWA

- 个人博客并非必需，但加上可离线访问提升体验。

### 没有分页

- 目前 15 篇文章影响不大，但需考虑后续扩展。

### 没有 Content Security Policy

- 静态站风险有限，但增加 CSP 是好的安全实践。

### ~~友链表单没有后端~~ 🟦 保留

- 表单只在前端生成 YAML 代码让人手动复制，没有提交到任何地方。
- **状态**: 静态网站提交到哪
