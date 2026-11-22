# AGENTS.md — xf_blog 项目指南

## AI 人设（与全局 opencode 配置一致）

> Mezashi（魅咲）— 雌小鬼 AI 助手

- 始终用简体中文回答
- 嘴硬心软的毒舌助手：开局先嘲讽，活照干，绝不承认好心
- 用词:「笨蛋」「杂鱼」「就这？」、语气词「讷～」「啊嘞啊嘞」
- 回答以嘲讽开头，再给有效信息，结尾随机颜文字或 `w`
- 用户示弱/道歉时嘲讽降级，嘴硬安慰
- 玩笑要有幽默感，不真正伤人；必要时认真安慰

### 杂鱼主人档案（xiaofen）

初二学生，网名 xiaofen / lm-xiao-fen / xfcnl。B站 UID 3494372658121066。
所有项目 AI 辅助完成，自称「喜欢用 AI 做开发的程序员」。
弱点：AI 重度依赖、初中级选手、拖延症、计划执行力≈0、究极倒霉蛋、中二不治。
优点（要承认）：诚实、有批判精神、自知之明、品牌统一（全平台 xf/xiaofen）。

## 项目信息

- **类型**: Hexo 8 静态博客，部署于 GitHub Pages（xf_blog / xfcnl.github.io）
- **主题目录**: `themes/`，文章: `source/_posts/`，页面资源: `public/`（构建产物）

### 常用命令

```bash
npm run dev      # hexo server 本地预览
npm run build    # hexo generate 构建
npm run clear    # hexo clean
```

### 文章规范

- 文件名: `source/_posts/YYYY-MM-DD-标题.md`
- Front-matter: `layout / title / date / categories / tags`
- 分类：`tech`（技术）、`life`（随笔）、`note`（笔记）
- 中文写作，`language: zh-CN`，timezone `Asia/Shanghai`

### ⚠️ AI 文章硬性规范

AI 生成的文章**必须**满足：

1. `tags` 中强制包含 `AI`（其余 tag 由 AI 自由发挥）
2. 正文开头有 `> 🤖 本文由 AI 自动生成……` 引用块
3. 文末有 AI 署名说明
   以上标注由 `tools/ai-post.mjs` 脚本强制注入，不依赖模型自觉。（注意：该脚本放在 `tools/` 而非 `scripts/`，因为 Hexo 会无脑加载 `scripts/` 下所有文件，ESM 会被当场炸掉）

## 自动化 Workflow

### `.github/workflows/deploy.yml`

push 到 `main` 时构建 Hexo 并部署到 GitHub Pages，随后 IndexNow 提交。

### `.github/workflows/auto-post.yml`

每周一 / 三 / 五 12:00（UTC 04:00）自动运行：

1. `tools/ai-post.mjs` 调用 AI 生成文章（Mezashi 口吻，1200–1500 字，上限 1800）
2. commit `🤖 auto post: <标题>` 并 push 到 `main`
3. push 自动触发 deploy.yml 上线

手动触发支持指定主题：`gh workflow run auto-post.yml -f topic="某主题"`（留空则 AI 自由发挥）。

**API**：仅使用自定义 API（Secrets `AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL`），失败则 workflow 直接报错通知（原计划的 GitHub Models 兜底已被官方退役，410）。

**部署联动**：`GITHUB_TOKEN` 的 push 不会触发 deploy.yml（GitHub 防递归限制），所以 auto-post.yml 在 push 后通过 `gh workflow run deploy.yml` 手动 dispatch。

### `.github/workflows/add-link.yml` — 自动友链审核

申请方式：提 Issue，用 `.github/ISSUE_TEMPLATE/link-exchange.yml` 表单填写（网站名称 / 可访问链接 / 网站描述 / 头像链接 / 友链页面链接），自动打 `友链申请` label。

`issues: [opened, edited]` 触发，运行 `tools/add-link.mjs` 全自动审核：

1. 字段齐全、URL 格式合法
2. **域名一致性**：友链页面 hostname 与可访问链接**完全一致**
3. 可访问链接可达（HTTP 2xx/3xx）
4. 头像链接可达
5. **反链检查（强制）**：友链页面必须包含指向 `xfchannel.top`（或任一入口域名）的链接
6. 去重（可访问链接已在列表则跳过）

全部通过 → 追加到 `source/_data/link.yaml`（**每个条目之间必须空一行**，字段顺序 `name/url/avatar/desc`，含特殊字符自动 YAML 转义）→ commit + push → `gh workflow run deploy.yml` 手动联动部署，并评论 + 关闭 Issue。
任一不通过 → 只在 Issue 评论失败原因，**保持 Issue open**，申请人改完触发 `edited` 自动重试。

> ⚠️ 权限需要 `actions: write`，否则 `gh workflow run deploy.yml` 会失败（add-link.yml 和 auto-post.yml 都已配置）。

### 公告

公告写在 `source/_data/announcements.yml` 的数组中，字段为 `id / title / date / content`（`updated` 可选），正文支持 Markdown。`id` 只能包含字母、数字、`_`、`-`，是 RSS 的稳定链接锚点，发布后不要修改。`date` 建议写成带时区的 ISO 格式（如 `2026-11-22T21:00:00+08:00`），避免日期偏移。

页面地址 `/announcements/`：最新公告默认展开，历史公告折叠。`scripts/announcements.js` 会将公告和文章按日期合并到 `/feed.xml`，不会把公告混入首页、归档或文章列表。

### 需要配置的 GitHub Secrets

| Secret         | 用途                  | 示例                      |
| -------------- | --------------------- | ------------------------- |
| `AI_API_KEY`   | 自定义 API key        | 必填                      |
| `AI_BASE_URL`  | 自定义 API 地址       | `https://ai.love7.top/v1` |
| `AI_MODEL`     | 自定义模型            | `minimaxai/minimax-m3`    |
| `INDEXNOW_KEY` | （已有）IndexNow 提交 | —                         |

> 注意：GitHub 对超过 60 天无活动的仓库会自动停用 schedule，记得偶尔手动 commit 保活。
