---
layout: page
title: 归档
permalink: /archive/
---

<h1>归档</h1>

<form action="/search/" method="get" class="search-form">
  <input type="text" name="q" placeholder="搜索文章..." class="search-input">
  <button type="submit" class="search-btn">搜索</button>
</form>

{% include merged-posts.html %}
{% assign all_posts = all_posts | sort:"date" | reverse %}

{% assign months = all_posts | group_by_exp:"post","post.date | date: '%Y-%m'" %}

<div id="archiveList">
{% for month in months %}
<h2 class="archive-month">{{ month.name }} ({{ month.items.size }})</h2>
<div class="card-list">
{% for post in month.items %}
  <div class="card">
    <div class="card-meta">
      <span>{{ post.date | date: "%Y-%m-%d" }}</span>
    </div>
    <a href="{{ post.url }}" class="card-title">{{ post.title }}</a>
  </div>
{% endfor %}
</div>
{% endfor %}
</div>
