---
layout: page
title: 友链
permalink: /link/
---

<h1>友链</h1>

<div class="link-grid">
{% for link in site.data.link %}
<div class="link-card">
  <img src="{{ link.avatar }}" alt="{{ link.name }}的头像" loading="lazy">
  <div class="link-card-body">
    <a href="{{ link.url }}" target="_blank" rel="noopener noreferrer">{{ link.name }}</a>
    <div class="link-desc">{{ link.desc }}</div>
    {% if link.note %}
    <span class="link-note">{{ link.note }}</span>
    {% endif %}
  </div>
</div>
{% endfor %}
</div>

<hr>

{% include link.html %}

<h2>本站信息</h2>

<div class="card-list">
<div class="card">
  <div class="card-meta">
    <span>名称：xf_blog</span>
  </div>
  <div class="card-meta">
    <span>链接：<a href="https://xfcnl.github.io">https://xfcnl.github.io</a></span>
  </div>
  <div class="card-meta">
    <span>头像：<a href="https://github.com/xfcnl/xfcnl.github.io/blob/main/image/MEITU_20260128_220225596.jpg?raw=true">GitHub 直链</a></span>
  </div>
  <div class="card-meta">
    <span>签名：立志用 cloudflare workers，GitHub pages 和 vercel 做出整个互联网的 up（虽然不会成功</span>
  </div>
</div>
</div>

<hr>

<h3>留言墙</h3>

<script src="https://giscus.app/client.js"
        data-repo="xfcnl/xfcnl.github.io"
        data-repo-id="R_kgDORKpEPA"
        data-category="General"
        data-category-id="DIC_kwDORKpEPM4C3Lg_"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="dark"
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
</script>
