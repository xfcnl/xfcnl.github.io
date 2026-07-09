---
layout: home
title: xf_blog
permalink: /
---

{% include merged-posts.html %}
{% assign recent_posts = all_posts | sort: "date" | reverse %}

{% assign tags = "" | split: "" %}
{% for post in all_posts %}
{% if post.tags %}
{% assign tags = tags | concat: post.tags %}
{% endif %}
{% endfor %}
{% assign sorted_tags = tags | uniq | sort %}

<div class="home-grid">

  <div class="home-left">
    <div class="profile-card">
      <img src="/image/MEITU_20260128_220225596.jpg" alt="avatar" class="avatar">
      <h1>Hi, I am xiaofen</h1>
      <p class="bio">初二生 · 折腾开发/生活 · AI 辅助型选手</p>
      <div class="profile-stats">
        <span>{{ all_posts | size }} 篇文章</span>
        <span>{{ sorted_tags | size }} 个标签</span>
      </div>
      <div class="profile-social">
        {::nomarkdown}
        {% include social-links.html %}
        {:/nomarkdown}
      </div>
      <div class="profile-counter">
        <img src="https://count.getloli.com/@xf_blog?name=xf_blog&theme=miku&padding=10&offset=0&align=top&scale=1&pixelated=1&darkmode=1" alt="visitor count">
      </div>
    </div>
  </div>

  <div class="home-right">
    <h2>近期更新</h2>
    <div class="post-card-list">
    {% for post in recent_posts limit:6 %}
      {% if post.path contains '_posts/' %}
        {% assign category = "tech" %}
        {% assign category_label = "技术" %}
      {% else %}
        {% assign category = "note" %}
        {% assign category_label = "随笔" %}
      {% endif %}
      {% assign words = post.content | strip_html | number_of_words %}
      {% assign read_time = words | divided_by: 200 | plus: 1 %}
      <div class="post-card">
        <span class="category-pill category-{{ category }}">{{ category_label }}</span>
        <a href="{{ post.url }}" class="post-card-title">{{ post.title }}</a>
        <div class="post-card-meta">
          <span>{{ post.date | date: "%Y-%m-%d" }}</span>
          <span>{{ read_time }} 分钟</span>
        </div>
      </div>
    {% endfor %}
    </div>
    <a href="/archive/" class="view-all">查看全部文章 →</a>
  </div>

</div>

<div class="home-tags">
  <h2>热门标签</h2>
  <div class="tag-cloud">
  {% for tag in sorted_tags limit:8 %}
    <a href="/tag/#{{ tag }}" class="tag-pill">{{ tag }}</a>
  {% endfor %}
  </div>
</div>
