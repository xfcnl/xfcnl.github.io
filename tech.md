---
layout: page
title: 技术博客
permalink: /tech/
---

# 技术博客

<p>共有 {{ site.posts | size }} 篇</p>

<ul>
{% for post in site.posts %}
  <li style="margin-bottom:6px;">
    <span style="color:#8b949e; font-size:13px;">
      {{ post.date | date: "%Y-%m-%d" }}
    </span>
    <a href="{{ post.url }}" style="margin-left:6px;">
      {{ post.title }}
    </a>
  </li>
{% endfor %}
</ul>
