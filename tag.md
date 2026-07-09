---
layout: page
title: 标签
permalink: /tag/
---

<h1>标签云</h1>

{% include merged-posts.html %}

{% assign all_tags = "" | split: "" %}
{% for post in all_posts %}
{% if post.tags %}
{% assign all_tags = all_tags | concat: post.tags %}
{% endif %}
{% endfor %}
{% assign sorted_tags = all_tags | uniq | sort %}

<div class="tag-cloud">
{% for tag in sorted_tags %}
<a href="#{{ tag }}" class="tag-link">{{ tag }}</a>
{% endfor %}
</div>

<hr>

{% for tag in sorted_tags %}
<h2>{{ tag }}</h2>
<div class="card-list">
{% for post in all_posts %}
  {% if post.tags contains tag %}
  <div class="card">
    <div class="card-meta">
      <span>{{ post.date | date:"%Y-%m-%d" }}</span>
    </div>
    <a href="{{ post.url }}" class="card-title">{{ post.title }}</a>
  </div>
  {% endif %}
{% endfor %}
</div>
{% endfor %}
