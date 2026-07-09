---
layout: page
title: 随记
permalink: /note/
---

<h1>随记</h1>
<p class="page-counter">{{ site.note | size }} 篇</p>

{% assign notes = site.note | sort: "date" | reverse %}

<div class="card-list">
{% for post in notes %}
  {% assign words = post.content | strip_html | number_of_words %}
  {% assign read_time = words | divided_by: 200 | plus: 1 %}
  <div class="card">
    <div class="card-meta">
      <span class="category-pill category-note">随笔</span>
      <span>{{ post.date | date: "%Y-%m-%d" }}</span>
      <span>{{ read_time }} 分钟</span>
    </div>
    <a href="{{ post.url }}" class="card-title">{{ post.title }}</a>
  </div>
{% endfor %}
</div>
