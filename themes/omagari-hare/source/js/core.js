/* ========================================
   Blue Archive Blog — Core JS
   功能：动态fetch、移动端菜单、友链表单、侧边栏B站动态
   ======================================== */

(function () {
  // ---- Service Worker 注册（静态资源缓存） ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }

  // ---- Hero 标题终端打字效果 ----
  var typewriterEl = document.querySelector(".hero-title.typewriter");
  if (typewriterEl) {
    var fullText = typewriterEl.textContent.trim();
    var typeSpeed = 180;
    var deleteSpeed = 90;
    var holdMs = 3000;
    var typedLen = 0;

    function typeTick() {
      if (typedLen < fullText.length) {
        typedLen++;
        typewriterEl.textContent = fullText.slice(0, typedLen);
        setTimeout(typeTick, typeSpeed);
      } else {
        setTimeout(deleteTick, holdMs);
      }
    }

    function deleteTick() {
      if (typedLen > 0) {
        typedLen--;
        typewriterEl.textContent = fullText.slice(0, typedLen);
        setTimeout(deleteTick, deleteSpeed);
      } else {
        setTimeout(typeTick, 400);
      }
    }

    typewriterEl.textContent = "";
    setTimeout(typeTick, 400);
  }

  // ---- Nav Toggle (移动端汉堡菜单) ----
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", !expanded);
      this.classList.toggle("active");
      navLinks.classList.toggle("show");

      // 切换 body 滚动
      if (!expanded) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    });

    // 点击页面其他地方关闭
    document.addEventListener("click", function (e) {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.classList.remove("active");
        navLinks.classList.remove("show");
        document.body.style.overflow = "";
      }
    });
  }

  // ---- 侧边栏 B站动态 加载（URL 与条数均由 _config.yml 注入的 BA_CONFIG 管理）----
  var sidebarDyn = document.getElementById("sidebarDynamics");
  var dynamicUrl = window.BA_CONFIG && window.BA_CONFIG.dynamicUrl;
  var sidebarCount = (window.BA_CONFIG && window.BA_CONFIG.sidebarCount) || 2;
  if (sidebarDyn && dynamicUrl) {
    fetch(dynamicUrl)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (!data.dynamics || !data.dynamics.length) {
          sidebarDyn.innerHTML = '<p class="ba-text-muted">暂无动态~</p>';
          return;
        }
        // 侧边栏只取最新 N 条（条数来自 config）
        var html = "";
        var items = data.dynamics.slice(0, sidebarCount);
        items.forEach(function (d) {
          var typeClass =
            d.type === "置顶"
              ? "ba-dyn-pin"
              : d.type === "视频"
                ? "ba-dyn-video"
                : d.type === "转发"
                  ? "ba-dyn-repost"
                  : "ba-dyn-normal";
          html +=
            '<div class="sidebar-dyn-pill" style="' +
            "padding:.5rem .75rem;margin-bottom:.5rem;border-radius:6px;" +
            "background:var(--ba-glass-bg);font-size:.78rem;line-height:1.4;" +
            'border-left:3px solid var(--ba-primary)">' +
            '<span class="' +
            typeClass +
            '" style="font-size:.65rem;display:inline-block;margin-bottom:.2rem">' +
            d.type +
            "</span>" +
            '<p style="color:var(--ba-text-secondary);word-break:break-all">' +
            d.content +
            "</p>" +
            '<span style="font-size:.7rem;color:var(--ba-text-muted)">' +
            d.time +
            "</span>" +
            "</div>";
        });
        sidebarDyn.innerHTML = html;
      })
      .catch(function () {
        sidebarDyn.innerHTML = '<p class="ba-text-muted">加载失败</p>';
      });
  }

  // ---- 文章页 Hero 随机背景（从 ba-assets img/{pc|mb} 随机选一张，刷新即换） ----
  (function () {
    var heroBg = document.querySelector(".hero-post .hero-bg");
    if (!heroBg) return;

    var isMobile = window.matchMedia("(max-width: 768px)").matches;
    var folder = isMobile ? "mb" : "pc";
    var apiUrl =
      "https://api.github.com/repos/xfcnl/ba-assets/contents/img/" + folder;
    var rawBase =
      "https://raw.gh.1s.fan/xfcnl/ba-assets/refs/heads/main/img/" +
      folder +
      "/";
    var cacheKey = "ba-assets-" + folder + "-list";
    var ttl = 6 * 60 * 60 * 1000; // 缓存 6 小时，避免频繁调 GitHub API

    function applyBg(names) {
      if (!names || !names.length) return;
      var name = names[Math.floor(Math.random() * names.length)];
      var url = rawBase + encodeURIComponent(name);
      heroBg.style.backgroundImage = 'url("' + url + '")';
    }

    try {
      var cached = JSON.parse(localStorage.getItem(cacheKey));
      if (
        cached &&
        cached.time &&
        Date.now() - cached.time < ttl &&
        cached.names &&
        cached.names.length
      ) {
        applyBg(cached.names);
        return;
      }
    } catch (e) {}

    fetch(apiUrl)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) return;
        var names = data
          .filter(function (f) {
            return f.type === "file";
          })
          .map(function (f) {
            return f.name;
          });
        if (!names.length) return;
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ time: Date.now(), names: names }),
          );
        } catch (e) {}
        applyBg(names);
      })
      .catch(function () {});
  })();

  // ---- 返回顶部 ----
  (function () {
    var btn = document.createElement("button");
    btn.id = "ba-back-top";
    btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    btn.style.cssText =
      "position:fixed;bottom:2rem;right:2rem;z-index:999;" +
      "width:40px;height:40px;border-radius:50%;" +
      "background:var(--ba-primary);color:#fff;border:none;" +
      "font-size:1.1rem;cursor:pointer;opacity:0;" +
      "pointer-events:none;transition:all .3s ease;box-shadow:0 4px 12px rgba(210,224,4,.5);display:none";
    document.body.appendChild(btn);

    var timer;
    window.addEventListener("scroll", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var st = window.scrollY || document.documentElement.scrollTop;
        if (st > 500) {
          btn.style.display = "block";
          requestAnimationFrame(function () {
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
          });
        } else {
          btn.style.opacity = "0";
          btn.style.pointerEvents = "none";
          setTimeout(function () {
            if (btn.style.opacity === "0") btn.style.display = "none";
          }, 300);
        }
      }, 100);
    });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  })();

  // ---- 哔哩哔哩小图标替换 B站为品牌色 ----
  document.querySelectorAll(".fa-bilibili").forEach(function (el) {
    el.style.color = "var(--ba-primary)";
  });

  // ---- 站内搜索 (search.json 全文检索) ----
  var searchInput = document.getElementById("searchInput");
  var searchResults = document.getElementById("searchResults");
  var searchBtn = document.querySelector(".search-btn");
  if (searchInput && searchResults && searchBtn) {
    var searchIndex = null;

    function loadSearchIndex(cb) {
      if (searchIndex) {
        cb(searchIndex);
        return;
      }
      fetch("/search.json")
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          searchIndex = data.posts || [];
          cb(searchIndex);
        })
        .catch(function () {
          searchResults.innerHTML = '<p class="ba-text-muted">搜索数据加载失败~</p>';
        });
    }

    function stripHtml(html) {
      var div = document.createElement("div");
      div.innerHTML = html || "";
      return (div.textContent || "").replace(/\s+/g, " ").trim();
    }

    function escapeHtml(s) {
      return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function doSearch() {
      var keyword = searchInput.value.trim().toLowerCase();
      if (!keyword) {
        searchResults.innerHTML = '<p class="ba-text-muted">请先输入关键词讷~</p>';
        return;
      }
      loadSearchIndex(function (posts) {
        posts.forEach(function (p) {
          if (!p._text) p._text = stripHtml(p.content);
        });

        var hits = [];
        posts.forEach(function (p) {
          var titleHit =
            p.title && p.title.toLowerCase().indexOf(keyword) !== -1;
          var contentHit =
            p._text && p._text.toLowerCase().indexOf(keyword) !== -1;
          if (titleHit || contentHit) hits.push({ post: p, titleHit: titleHit });
        });

        hits.sort(function (a, b) {
          if (a.titleHit !== b.titleHit) return a.titleHit ? -1 : 1;
          return 0;
        });

        if (!hits.length) {
          searchResults.innerHTML =
            '<p class="ba-text-muted">没有找到包含「' +
            escapeHtml(keyword) +
            '」的文章~</p>';
          return;
        }

        searchResults.innerHTML =
          '<p class="ba-search-count">共找到 ' + hits.length + ' 篇文章</p>';
        var list = document.createElement("div");
        hits.forEach(function (h) {
          var item = document.createElement("div");
          item.className = "ba-search-item";

          var header = document.createElement("div");
          header.className = "ba-search-item-head";
          var a = document.createElement("a");
          a.className = "ba-search-title";
          a.href = h.post.url;
          a.textContent = h.post.title || "无标题";
          var type = document.createElement("span");
          type.className = "ba-search-type";
          type.textContent = h.post.type || "";
          header.appendChild(a);
          header.appendChild(type);
          item.appendChild(header);

          var meta = document.createElement("div");
          meta.className = "ba-search-meta";
          meta.textContent = h.post.date || "";
          item.appendChild(meta);

          var text = h.post._text;
          var idx = text.toLowerCase().indexOf(keyword);
          var start = Math.max(0, idx - 20);
          var end = Math.min(text.length, idx + keyword.length + 40);
          var snippet =
            (start > 0 ? "..." : "") +
            text.slice(start, end) +
            (end < text.length ? "..." : "");
          var snip = document.createElement("div");
          snip.className = "ba-search-snippet";
          snip.textContent = snippet;
          item.appendChild(snip);

          list.appendChild(item);
        });
        searchResults.appendChild(list);
      });
    }

    searchBtn.addEventListener("click", doSearch);
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") doSearch();
    });

    // 从 URL ?q= 参数自动填充并搜索（导航栏搜索框跳转带参）
    var urlParam = new URLSearchParams(window.location.search).get("q");
    if (urlParam) {
      searchInput.value = urlParam;
      doSearch();
    }
  }

  // ---- Nav active state (根据当前 URL 高亮导航) ----
  var path = window.location.pathname.replace(/\/$/, "");
  document
    .querySelectorAll(".ba-nav-links .ba-nav-link")
    .forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === "/" && (path === "" || path === "/")) {
        link.style.color = "var(--ba-primary-hover) !important";
      } else if (href !== "/" && path.startsWith(href)) {
        link.style.color = "var(--ba-primary-hover) !important";
        link.style.background = "var(--ba-glass-bg)";
      }
    });
})();
