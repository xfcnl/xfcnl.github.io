---
layout: page
title: 随记
permalink: /note/
---

# 随记

共有 {{ site.note | size }} 文章

{% assign notes = site.note | sort: "date" | reverse %}

<ul>
{% for post in notes %}
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
