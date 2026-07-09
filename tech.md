---
layout: page
title: 技术博客
permalink: /tech/
---

<h1>技术博客</h1>
<p class="page-counter">{{ site.posts | size }} 篇</p>

<div class="card-list">
{% for post in site.posts %}
  {% assign words = post.content | strip_html | number_of_words %}
  {% assign read_time = words | divided_by: 200 | plus: 1 %}
  <div class="card">
    <div class="card-meta">
      <span class="category-pill category-tech">技术</span>
      <span>{{ post.date | date: "%Y-%m-%d" }}</span>
      <span>{{ read_time }} 分钟</span>
    </div>
    <a href="{{ post.url }}" class="card-title">{{ post.title }}</a>
  </div>
{% endfor %}
</div>
