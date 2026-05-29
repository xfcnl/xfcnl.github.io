---
layout: page
title: 搜索
permalink: /search/
---

# 搜索

<input id="searchInput" type="text" placeholder="输入关键词搜索..."
style="width:70%;padding:8px;margin-bottom:20px;">
<button onclick="doSearch()" style="padding:8px 16px;background:#161b22;color:#c9d1d9;border:1px solid rgba(148,163,184,0.2);border-radius:6px;cursor:pointer;">搜索</button>

<div id="searchResults"></div>

{% assign tech_posts = site.posts | where_exp:"post","post.path contains '_posts/'" %}
{% assign all_posts = tech_posts | concat: site.note | sort:"date" | reverse %}

<script>
var POSTS = [
  {% for post in all_posts %}
  {% assign teaser = post.excerpt | strip_html | truncatewords:50 %}
  {% if teaser == "" %}
  {% assign teaser = post.content | strip_html | truncatewords:50 %}
  {% endif %}
  {% capture content_str %}{{ post.title }} - {{ teaser }}{% endcapture %}
  {
    title: {{ post.title | jsonify }},
    url: "{{ post.url | relative_url }}",
    date: "{{ post.date | date: '%Y-%m-%d' }}",
    content: {{ content_str | jsonify }},
    type: "{% if post.path contains '_posts/' %}tech{% else %}note{% endif %}"
  }{% unless forloop.last %},{% endunless %}
  {% endfor %}
];

var urlParams = new URLSearchParams(window.location.search);
var query = urlParams.get('q');
if (query) {
  document.getElementById('searchInput').value = query;
  doSearch();
}

function doSearch() {
  var keyword = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!keyword) {
    document.getElementById('searchResults').innerHTML = '';
    return;
  }

  var results = POSTS.filter(function(post) {
    return post.title.toLowerCase().indexOf(keyword) !== -1 ||
           post.content.toLowerCase().indexOf(keyword) !== -1;
  });

  var container = document.getElementById('searchResults');
  if (results.length === 0) {
    container.innerHTML = '<p>未找到相关文章</p>';
    return;
  }

  var html = '<p>共找到 ' + results.length + ' 篇相关文章</p><ul>';
  results.forEach(function(post) {
    html += '<li>' +
      '<span style="color:gray;">' + post.date + '</span> ' +
      '<a href="' + post.url + '">' + post.title + '</a> ' +
      '<span style="color:#999;font-size:13px;">[' + post.type + ']</span>' +
    '</li>';
  });
  html += '</ul>';
  container.innerHTML = html;
}

document.getElementById('searchInput').addEventListener('keyup', function(e) {
  if (e.key === 'Enter') {
    doSearch();
  }
});
</script>
