# Xf

[GitHub](https://xfcnl.github.io)　[Cloudflare](https://husd.cc.cd)　[EdgeOne](https://blog.sfvg.de5.net)

基于 [Hexo](https://hexo.io) 构建的自用博客，主题为自制的 `Omagari Hare`。

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

浏览器打开 `http://localhost:4000` 即可预览。

## AI 自动发文

每周一 / 三 / 五由 GitHub Actions 调用 AI 自动生成文章并推送到 `main`，随后自动触发部署。

- 生成脚本：`scripts/ai-post.mjs`
- 工作流：`.github/workflows/auto-post.yml`
- 手动触发指定主题：`gh workflow run auto-post.yml -f topic="某主题"`

## 目录结构

```
source/_posts/        — 博客文章
source/_data/         — 配置数据（社交链接、友链等）
themes/omagari-hare/  — 自制主题
scripts/              — AI 发文、IndexNow 等自动化脚本
```

## 许可证

Apache 2.0
