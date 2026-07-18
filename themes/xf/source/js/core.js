/* ============================================
   core.js — xf_blog 核心脚本（合并版）
   包含: xf-blog + pjax + search + link + mailto
   ============================================ */

/* ---- xf-blog.js: 主脚本 ---- */
;(function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function(reg) {
      if (reg.active) {
        reg.active.postMessage({ type: 'CACHE_URLS', urls: window.SW_CACHE_URLS || ['/', '/archive/', '/tag/', '/classify/', '/link/', '/about/', '/search/'] })
      } else {
        reg.addEventListener('updatefound', function() {
          var sw = reg.installing || reg.waiting
          if (sw) {
            sw.addEventListener('statechange', function() {
              if (this.state === 'activated') {
        reg.active.postMessage({ type: 'CACHE_URLS', urls: window.SW_CACHE_URLS || ['/', '/archive/', '/tag/', '/classify/', '/link/', '/about/', '/search/'] })
              }
            })
          }
        })
      }
    })
    navigator.serviceWorker.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'PRECACHE_DONE' && e.data.count > 0) {
        showCacheTip('已缓存首页、归档及全部共 ' + e.data.count + ' 个页面，离线可用')
      }
    })
  }

  function showCacheTip(msg) {
    if (sessionStorage.getItem('sw-cache-tip')) return
    sessionStorage.setItem('sw-cache-tip', '1')
    var tip = document.createElement('div')
    tip.className = 'cache-tip'
    tip.textContent = msg
    document.body.appendChild(tip)
    setTimeout(function() { tip.classList.add('show') }, 500)
    setTimeout(function() {
      tip.classList.remove('show')
      setTimeout(function() { tip.remove() }, 400)
    }, 6000)
  }

  var banner = document.getElementById('offlineBanner')
  if (banner) {
    window.addEventListener('offline', function() { banner.classList.add('show') })
    window.addEventListener('online', function() { banner.classList.remove('show') })
    if (!navigator.onLine) banner.classList.add('show')
  }

  document.addEventListener('click', function(e) {
    var link = e.target.closest ? e.target.closest('a') : null
    if (link && link.hostname && link.hostname !== window.location.hostname && !link.target) {
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
    }
  }, true)

  document.addEventListener('DOMContentLoaded', function() {
    var codeBlocks = document.querySelectorAll('pre')
    codeBlocks.forEach(function(pre) {
      var container = document.createElement('div')
      container.className = 'code-block-container'
      pre.parentNode.insertBefore(container, pre)
      container.appendChild(pre)

      var button = document.createElement('button')
      button.className = 'copy-button'
      button.textContent = '复制'
      button.addEventListener('click', function() {
        var code = pre.querySelector('code') ? pre.querySelector('code').textContent : pre.textContent
        navigator.clipboard.writeText(code).then(function() {
          button.textContent = '已复制'
          button.classList.add('copied')
          setTimeout(function() {
            button.textContent = '复制'
            button.classList.remove('copied')
          }, 2000)
        })
      })
      container.appendChild(button)
    })

    if (typeof anchors !== 'undefined') {
      anchors.add()
    }

    var toggle = document.getElementById('navToggle')
    var links = document.getElementById('navLinks')
    if (toggle && links) {
      toggle.addEventListener('click', function() {
        this.classList.toggle('active')
        links.classList.toggle('open')
        var expanded = this.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
        this.setAttribute('aria-expanded', expanded)
      })
    }
  })
})()

/* ---- pjax.js: Barba 导航 ---- */
(function(){
  if (typeof barba === 'undefined') return;

  function reinitContent() {
    var codeBlocks = document.querySelectorAll('pre');
    codeBlocks.forEach(function(pre){
      if (pre.parentNode && pre.parentNode.querySelector('.copy-button')) return;
      var container = document.createElement('div');
      container.className = 'code-block-container';
      pre.parentNode.insertBefore(container, pre);
      container.appendChild(pre);
      var button = document.createElement('button');
      button.className = 'copy-button';
      button.textContent = '复制';
      button.addEventListener('click', function(){
        var code = pre.querySelector('code') ? pre.querySelector('code').textContent : pre.textContent;
        navigator.clipboard.writeText(code).then(function(){
          button.textContent = '已复制';
          button.classList.add('copied');
          setTimeout(function(){ button.textContent = '复制'; button.classList.remove('copied'); }, 2000);
        });
      });
      container.appendChild(button);
    });

    if (typeof anchors !== 'undefined' && anchors.add) anchors.add();
  }

  barba.hooks.afterEnter(function() {
    reinitContent();
    document.dispatchEvent(new Event('meting:loaded'));
  });

  barba.init({
    sync: true,
    transitions: [{
      name: 'fade',
      leave(data) {
        return gsap ? gsap.to(data.current.container, {opacity:0}) : Promise.resolve();
      },
      enter(data) {
        if (typeof gsap !== 'undefined') gsap.from(data.next.container, {opacity:0});
      }
    }]
  });
})();

/* ---- search.js: 搜索功能 ---- */
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

/* ---- link.js: 友链表单 ---- */
(function() {
  document.addEventListener('submit', function(e) {
    if (!e.target.classList.contains('link-form')) return;
    e.preventDefault();
    var name = document.getElementById("link-name").value;
    var url = document.getElementById("link-url").value;
    var avatar = document.getElementById("link-avatar").value;
    var desc = document.getElementById("link-desc").value;

    var yamlCode = "```yaml\n- name: " + name + "\n  url: " + url + "\n  avatar: " + avatar + "\n  desc: " + desc + "\n```";

    var resultHtml =
      '<div class="link-result">' +
        '<p>请复制以下代码添加到你的友链文件中：</p>' +
        '<div class="code-block">' +
          '<pre><code>' + escapeHtml(yamlCode) + '</code></pre>' +
          '<button class="copy-btn">复制</button>' +
        '</div>' +
        '<p class="tip">添加后请在评论区或通过其他方式告知，我会尽快审核并添加你的友链</p>' +
      '</div>';

    document.getElementById("link-result").innerHTML = resultHtml;
  });

  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.copy-btn');
    if (!btn) return;
    var code = btn.previousElementSibling.querySelector("code").textContent;
    navigator.clipboard.writeText(code).then(function() {
      btn.textContent = "已复制";
      setTimeout(function() { btn.textContent = "复制"; }, 2000);
    });
  });

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
})();

/* ---- mailto.js: 邮件功能 ---- */
(function() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.copy-email-btn');
    if (!btn) return;
    var text = "G114514g" + "@" + "yeah.net";
    navigator.clipboard.writeText(text).then(function() {
      var orig = btn.textContent;
      btn.textContent = "✓ 已复制";
      setTimeout(function() { btn.textContent = orig; }, 2000);
    });
  });

  if (window.location.pathname.indexOf('/mailto/') === 0) {
    var iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = "mailto:" + "G114514g" + "@" + "yeah.net";
    document.body.appendChild(iframe);
    setTimeout(function() {
      iframe.parentNode && iframe.parentNode.removeChild(iframe);
    }, 3000);
  }
})();

/* ---- bilibili-dynamics.js: B站动态 ---- */
(function() {
  var DYNAMICS_CACHE_KEY = 'bili_dynamics_cache';
  var DYNAMICS_CACHE_TTL = 5 * 60 * 1000;

  function getCachedData() {
    try {
      var cached = sessionStorage.getItem(DYNAMICS_CACHE_KEY);
      if (!cached) return null;
      var parsed = JSON.parse(cached);
      if (Date.now() - parsed.time > DYNAMICS_CACHE_TTL) return null;
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  function setCachedData(data) {
    try {
      sessionStorage.setItem(DYNAMICS_CACHE_KEY, JSON.stringify({ time: Date.now(), data: data }));
    } catch (e) {}
  }

  function formatDate(dateStr) {
    try {
      var d = new Date(dateStr);
      var now = new Date();
      var diff = now - d;
      if (diff < 86400000) {
        return '今天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      } else if (diff < 172800000) {
        return '昨天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  }

  function getTypeIcon(item) {
    var title = item.title || '';
    if (title.indexOf('发布了视频') !== -1) return '<i class="fa-solid fa-video"></i>';
    if (title.indexOf('转发') !== -1) return '<i class="fa-solid fa-retweet"></i>';
    if (title.indexOf('投稿') !== -1) return '<i class="fa-solid fa-upload"></i>';
    if (title.indexOf('专栏') !== -1) return '<i class="fa-solid fa-file-lines"></i>';
    if (title.indexOf('音频') !== -1) return '<i class="fa-solid fa-music"></i>';
    return '<i class="fa-solid fa-satellite-dish"></i>';
  }

  function loadDynamics() {
    var containers = document.querySelectorAll('.bili-dynamics-list');
    if (!containers.length) return;

    var data = getCachedData();

    function render(data) {
      containers.forEach(function(container) {
        var parent = container.closest('.bili-dynamics');
        var limit = parent ? parseInt(parent.getAttribute('data-limit'), 10) || 0 : 0;
        var items = data.items || [];
        if (limit > 0) items = items.slice(0, limit);
        if (!items.length) {
          container.innerHTML = '<div class="bili-dynamics-empty">暂无动态</div>';
          return;
        }
        var html = '';
        items.forEach(function(item) {
          var icon = getTypeIcon(item);
          html += '<a href="' + (item.link || '#') + '" class="bili-dynamics-item" target="_blank" rel="noopener noreferrer">' +
            '<span class="bili-dynamics-item-icon">' + icon + '</span>' +
            '<span class="bili-dynamics-item-text">' +
              '<span class="bili-dynamics-item-title">' + (item.title || '') + '</span>' +
              '<span class="bili-dynamics-item-date">' + formatDate(item.pubDate || '') + '</span>' +
            '</span>' +
          '</a>';
        });
        container.innerHTML = html;
      });
    }

    if (data) {
      render(data);
      return;
    }

    containers.forEach(function(container) {
      container.innerHTML = '<div class="bili-dynamics-loading">加载中...</div>';
    });

    fetch('https://gff.ccwu.cc/bilibili/user/dynamic/3494372658121066?format=json')
      .then(function(r) { return r.json(); })
      .then(function(json) {
        setCachedData(json);
        render(json);
      })
      .catch(function() {
        containers.forEach(function(container) {
          container.innerHTML = '<div class="bili-dynamics-error">动态加载失败</div>';
        });
      });
  }

  document.addEventListener('DOMContentLoaded', loadDynamics);
  if (typeof barba !== 'undefined') {
    barba.hooks.afterEnter(loadDynamics);
  }
})();
