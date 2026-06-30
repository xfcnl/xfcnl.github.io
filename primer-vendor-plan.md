---
layout: page
title: 解除 Primer 主题依赖方案
permalink: /primer-vendor-plan/
---

## 现状

- `remote_theme: pages-themes/primer@v0.6.0` + `jekyll-remote-theme` 插件
- 仅有 2 样东西来自上游：**`_layouts/home.html`** + **`_sass/` 全部 42 个 SCSS 文件**
- 所有 layout / include / style.scss 入口已被本地覆盖

## 步骤

### Step 1 — 拷贝上游文件到本地

从 `C:\Users\Admin\Documents\repo\temp\primer\` 拷贝：

| 源路径                | 目标路径             | 说明                          |
| --------------------- | -------------------- | ----------------------------- |
| `_layouts\home.html`  | `_layouts\home.html` | 唯一未覆盖的上游布局          |
| `_sass\` **全部内容** | `_sass\`             | 42 个 SCSS 文件，维持目录结构 |

### Step 2 — 修改 `_config.yml`

1. **删除** `remote_theme: pages-themes/primer@v0.6.0`
2. **删除** `plugins` 中的 `- jekyll-remote-theme`
3. 可保留 `theme: jekyll-theme-primer` 或留空

### Step 3 — 修改 `assets/css/style.scss`

将 `@import "{{ site.theme }}"` 改为 `@import "jekyll-theme-primer"`（硬编码，彻底解耦 theme 配置项）。

### 验证

```powershell
bundle exec jekyll serve
```

检查页面渲染、暗色模式、终端无 `jekyll-remote-theme` 相关日志。
