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
