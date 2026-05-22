---
layout: post
title: "2026-05-22-用vitepress构建一个专业的文档站"
date: 2026-05-22
tags: [vitepress, 文档站]
---

vitepress，最开始是我从 GitHub 用户 **@CoteNite** 看到的

## 如何在本地构建一个 vitepress

这部分的内容参考至
[快速开始 │ VitePress](https://vitepress.dev/zh/guide/getting-started)

### 你需要准备什么

- Node.js 20 及以上的版本
- 可以访问 vitepress 的终端
- 支持 markdown 语法的文本编辑器

### 安装vitepress

vitepress 可以通过 **npm** **pnpm** **yarn** 和 **bun**

这里用 **npm** 做演示

在终端运行

```npm
npm add -D vitepress@next
```

### 初始化 vitepress

```npm
npx vitepress init
```

在运行之后会问你几个几个简单的问题

```text
┌  Welcome to VitePress!
│
◇  Where should VitePress initialize the config?
│  ./
│
◇  Where should VitePress look for your markdown files?
│  ./
│
◇  Site title:
│  My Awesome Project
│
◇  Site description:
│  A VitePress Site
│
◇  Theme:
│  Default Theme
│
◇  Use TypeScript for config and theme files?
│  Yes
│
◇  Add VitePress npm scripts to package.json?
│  Yes
│
◇  Add a prefix for VitePress npm scripts?
│  Yes
│
◇  Prefix for VitePress npm scripts:
│  docs
│
└  Done! Now run pnpm run docs:dev and start writing.
```

这样，vitepress 会在项目的根目录新建一个 vitepress 项目

### 在本地启动一个具有即时热更新的本地开发服务器

你可以运行以下两条命令中的任意一条来启动具有即时热更新的本地开发服务器

```npm
npm run docs:dev
```

```npm
npx vitepress dev docs
```

### 简单讲一下路由

vitepress 使用基于文件的路由，这意味着生成的 HTML 页面是从源 markdown 文件的目录结构映射而来的

例如

```text
.
├─ guide
│  ├─ getting-started.md
│  └─ index.md
├─ index.md
└─ prologue.md
```

结果是

```text
index.md                  -->  /index.html (可以通过 / 访问)
prologue.md               -->  /prologue.html
guide/index.md            -->  /guide/index.html (可以通过 /guide/ 访问)
guide/getting-started.md  -->  /guide/getting-started.html
```

### 路径跳转

在页面之间链接时，可以使用绝对路径和相对路径。请注意，虽然 .md 和 .html 扩展名都可以使用，但最佳做法是省略文件扩展名，以便 VitePress 可以根据配置生成最终的 URL

```html
<!-- 建议的写法 -->
[Getting Started](./getting-started) [Getting Started](../guide/getting-started)

<!-- 不建议的写法 -->
[Getting Started](./getting-started.md) [Getting
Started](./getting-started.html)
```

## 部署

当你写好之后，就需要将网站部署到 **cfpages / eopages / vercel / netlify / ghpages**这样的平台上

在部署之前，你需要将源代码提交到 GitHub 这样的平台上，方便部署

### ghpages

既然提交到了 GitHub ，不如直接部署到 GitHub

新建文件 .github/workflows/deploy.yml

文件内容为

```yaml
# 构建 VitePress 站点并将其部署到 GitHub Pages 的示例工作流程
#
name: Deploy VitePress site to Pages

on:
  # 在针对 `main` 分支的推送上运行。如果你
  # 使用 `master` 分支作为默认分支，请将其更改为 `master`
  push:
    branches: [main]

  # 允许你从 Actions 选项卡手动运行此工作流程
  workflow_dispatch:

# 设置 GITHUB_TOKEN 的权限，以允许部署到 GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# 只允许同时进行一次部署，跳过正在运行和最新队列之间的运行队列
# 但是，不要取消正在进行的运行，因为我们希望允许这些生产部署完成
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  # 构建工作
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5
        with:
          fetch-depth: 0 # 如果未启用 lastUpdated，则不需要
      # - uses: pnpm/action-setup@v4 # 如果使用 pnpm，请取消此区域注释
      #   with:
      #     version: 9
      # - uses: oven-sh/setup-bun@v1 # 如果使用 Bun，请取消注释
      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm # 或 pnpm / yarn
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Install dependencies
        run: npm ci # 或 pnpm install / yarn install / bun install
      - name: Build with VitePress
        run: npm run docs:build # 或 pnpm docs:build / yarn docs:build / bun run docs:build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  # 部署工作
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

文件内容来自 [部署 VitePress 站点 │ VitePress](https://vitepress.dev/zh/guide/deploy#github-pages)

### 其他平台

构建命令

```npm
  npm install vitepress && npx vitepress build
```

输出目录

```text
.vitepress/dist
```

其他的你就不需要动了
