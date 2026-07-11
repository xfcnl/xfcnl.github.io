(function() {
  var POSTS = [];

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

    var html = '<p>共找到 ' + results.length + ' 篇相关文章</p><div class="card-list">';
    results.forEach(function(post) {
      var typeLabel = post.type === 'tech' ? '技术' : '随笔';
      var typeClass = post.type === 'tech' ? 'category-tech' : 'category-note';
      html += '<div class="card">' +
        '<div class="card-meta">' +
          '<span class="category-pill ' + typeClass + '">' + typeLabel + '</span>' +
          '<span>' + post.date + '</span>' +
        '</div>' +
        '<a href="' + post.url + '" class="card-title">' + post.title + '</a>' +
      '</div>';
    });
    html += '</div>';
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
