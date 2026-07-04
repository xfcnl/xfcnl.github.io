---
layout: page
title: 技术博客
permalink: /tech/
---

# 技术博客

<p>共有 {{ site.posts | size }} 篇</p>

<ul>
{% for post in site.posts %}
  <li class="post-list-item">
    <span class="post-date">
      {{ post.date | date: "%Y-%m-%d" }}
    </span>
    <a href="{{ post.url }}" class="post-link">
      {{ post.title }}
    </a>
  </li>
{% endfor %}
</ul>
