---
layout: home
title: xf_blog
permalink: /
---

# Hi, I am xiaofen

> 欢迎来到我的个人主页
>
> 这里记录我在 **开发 / 生活** 方面的内容

---

## 近期更新

{% assign all_posts = site.posts | concat: site.note | sort: "date" | reverse %}

<ul>
{% for post in all_posts limit:4 %}
  {% if post.path contains '_posts/' %}
    {% assign category = "tech" %}
  {% else %}
    {% assign category = "note" %}
  {% endif %}
  <li class="list-item">
    <span class="meta">
      {{ post.date | date: "%Y-%m-%d" }}
    </span>
    <a href="{{ post.url }}" class="post-link">
      {{ post.title }}
    </a>
    <span>
      {{ category }}
    </span>
  </li>
{% endfor %}
</ul>

---

## 热门标签

{% assign tech_posts = site.posts | where_exp:"post","post.path contains '_posts/'" %}
{% assign all_posts = tech_posts | concat: site.note %}

{% assign tags = "" | split: "" %}

{% for post in all_posts %}
{% if post.tags %}
{% assign tags = tags | concat: post.tags %}
{% endif %}
{% endfor %}

{% assign sorted_tags = tags | uniq | sort %}

<div class="tag-cloud">
{% for tag in sorted_tags limit:5 %}
  <a href="/tag/#{{ tag }}" class="tag-pill">
     {{ tag }}
  </a>
{% endfor %}
</div>

## 社交的

{% include social-links.html %}

## 全站访问量

![全站访问量的图片](https://count.getloli.com/@xf_blog?name=xf_blog&theme=miku&padding=10&offset=0&align=top&scale=1&pixelated=1&darkmode=1)
