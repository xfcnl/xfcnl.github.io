---
layout: page
title: 归档
permalink: /archive/
---

# 归档

<form action="/search/" method="get" style="margin-bottom:20px;">
  <input type="text" name="q" placeholder="搜索文章..." 
  style="width:70%;padding:8px;">
  <button type="submit" style="padding:8px 16px;background:#161b22;color:#c9d1d9;border:1px solid rgba(148,163,184,0.2);border-radius:6px;cursor:pointer;">搜索</button>
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
  <span style="color:gray;">
    {{ post.date | date: "%Y-%m-%d" }}
  </span>
  <a href="{{ post.url }}">{{ post.title }}</a>
</li>
{% endfor %}
</ul>

{% endfor %}

</div>