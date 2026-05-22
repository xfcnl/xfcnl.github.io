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

在部署之前，你需要
