---
layout: page
title: 友链
permalink: /link/
---

{% for link in site.data.link %}
<img src="{{ link.avatar }}" alt="{{ link.name }}的头像" width="32" height="32">
<a href="{{link.url}}" target="_blank">{{link.name}}</a>

_{{ link.desc }}_

{% if link.note %}
**{{ link.note }}**
{% endif %}

<br>
{% endfor %}

---

{% include link.html %}

## 本站信息

- 名称：xf_blog
- 链接：https://xfcnl.github.io
- 头像：https://github.com/xfcnl/xfcnl.github.io/blob/main/image/MEITU_20260128_220225596.jpg?raw=true
- 签名：立志用 cloudflare workers，GitHub pages 和 vercel 做出整个互联网的up（虽然不会成功

---

### 留言墙

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
