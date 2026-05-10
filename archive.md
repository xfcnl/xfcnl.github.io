---
layout: page
title: 归档
permalink: /archive/
---

# 归档

{% include search.html %}

{% assign tech_posts = site.posts | where_exp:"post","post.path contains '_posts/'" %}
{% assign all_posts = tech_posts | concat: site.note | sort:"date" | reverse %}

{% assign months = all_posts | group_by_exp:"post","post.date | date: '%Y-%m'" %}

<div id="archiveList">

{% for month in months %}
<h2>{{ month.name }} ({{ month.items.size }})</h2>

<ul>
{% for post in month.items %}
<li class="post-item">
  <span style="color:gray;">
    {{ post.date | date: "%Y-%m-%d" }}
  </span>
  <a href="{{ post.url }}">{{ post.title }}</a>
</li>
{% endfor %}
</ul>

{% endfor %}

</div>

<script>
const input = document.getElementById("searchInput");
const items = document.querySelectorAll(".post-item");

input.addEventListener("keyup", function() {
  const keyword = input.value.toLowerCase();

  items.forEach(item => {
    const text = item.innerText.toLowerCase();
    item.style.display = text.includes(keyword) ? "" : "none";
  });
});
</script>
