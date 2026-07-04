---
---
(function() {
  var POSTS = [
    {% for post in site.posts %}
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
      type: "tech"
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
    {% for note in site.note %}
    {% assign teaser = note.excerpt | strip_html | truncatewords:50 %}
    {% if teaser == "" %}
    {% assign teaser = note.content | strip_html | truncatewords:50 %}
    {% endif %}
    {% capture content_str %}{{ note.title }} - {{ teaser }}{% endcapture %}
    {
      title: {{ note.title | jsonify }},
      url: "{{ note.url | relative_url }}",
      date: "{{ note.date | date: '%Y-%m-%d' }}",
      content: {{ content_str | jsonify }},
      type: "note"
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];

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
        '<span class="search-date">' + post.date + '</span> ' +
        '<a href="' + post.url + '">' + post.title + '</a> ' +
        '<span class="search-type">[' + post.type + ']</span>' +
      '</li>';
    });
    html += '</ul>';
    container.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', function() {
    var input = document.getElementById('searchInput');
    if (!input) return;

    var urlParams = new URLSearchParams(window.location.search);
    var query = urlParams.get('q');
    if (query) {
      input.value = query;
      doSearch();
    }

    input.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') doSearch();
    });
  });

  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('search-btn')) doSearch();
  });
})();
