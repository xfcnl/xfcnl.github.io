---
layout: page
title: 归档
permalink: /archive/
---

# 归档

<form action="/search/" method="get" class="search-form">
  <input type="text" name="q" placeholder="搜索文章..." class="search-input">
  <button type="submit" class="search-btn">搜索</button>
</form>

{% assign tech_posts = site.posts | where_exp:"post","post.path contains '_posts/'" %}
{% assign all_posts = tech_posts | concat: site.note | sort:"date" | reverse %}

{% assign months = all_posts | group_by_exp:"post","post.date | date: '%Y-%m'" %}

<div id="archiveList">

{% for month in months %}

<h2>{{ month.name }} ({{ month.items.size }})</h2>

<ul>
{% for post in month.items %}
<li>
  <span class="date-muted">
    {{ post.date | date: "%Y-%m-%d" }}
  </span>
  <a href="{{ post.url }}">{{ post.title }}</a>
</li>
{% endfor %}
</ul>

{% endfor %}

</div>
