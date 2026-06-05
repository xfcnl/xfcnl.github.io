---
layout: page
title: 标签
permalink: /tag/
---

# 标签云

<div class="tag-cloud">
{% include merged-posts.html %}

{% assign all_tags = "" | split: "" %}

{% for post in all_posts %}
{% if post.tags %}
{% assign all_tags = all_tags | concat: post.tags %}
{% endif %}
{% endfor %}

{% assign sorted_tags = all_tags | uniq | sort %}

{% for tag in sorted_tags %}
<a href="#{{ tag }}" style="margin-right:10px;">
{{ tag }}
</a>
{% endfor %}

</div>

<hr>

{% for tag in sorted_tags %}

## {{ tag }}

<ul>
{% for post in all_posts %}
  {% if post.tags contains tag %}
  <li>
    <span style="color:gray">{{ post.date | date:"%Y-%m-%d" }}</span>
    <a href="{{ post.url }}">{{ post.title }}</a>
  </li>
  {% endif %}
{% endfor %}
</ul>

{% endfor %}
