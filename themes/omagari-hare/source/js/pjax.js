(function () {
  if (window.__pjaxLoaded) return;
  window.__pjaxLoaded = true;

  var mainSelector = ".page-main";
  var metingJsEl = null; // 缓存 meting-js 元素

  function getMainContainer() {
    return document.querySelector(mainSelector);
  }

  function updateNavActiveState() {
    var path = window.location.pathname.replace(/\/$/, "");
    document.querySelectorAll(".ba-nav-links .ba-nav-link").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === "/" && (path === "" || path === "/")) {
        link.style.color = "var(--ba-primary-hover) !important";
        link.style.background = "var(--ba-glass-bg)";
      } else if (href !== "/" && path.startsWith(href)) {
        link.style.color = "var(--ba-primary-hover) !important";
        link.style.background = "var(--ba-glass-bg)";
      } else {
        link.style.color = "";
        link.style.background = "";
      }
    });
  }

  // 移除并缓存 meting-js 元素，防止 pjax 后重复初始化
  function detachMeteringJs() {
    var el = document.querySelector("meting-js");
    if (el && !metingJsEl) {
      metingJsEl = el;
      // 保存当前播放器状态
      var playerState = savePlayerState();
      if (playerState) {
        metingJsEl._savedState = playerState;
      }
      el.remove();
    }
  }

  // 重新插入 meting-js 并手动初始化
  function reattachMeteringJs() {
    if (!metingJsEl) return;
    // 如果 body 已经有 meting-js 了（比如首次加载），不重复插入
    if (document.querySelector("meting-js")) {
      metingJsEl = null;
      return;
    }
    document.body.appendChild(metingJsEl);
    // 触发 meting-js 初始化（Web Component connectedCallback）
    // 如果已经初始化过，手动调用内部方法
    if (metingJsEl.aplayer) {
      // 已经初始化过，恢复状态
      var state = metingJsEl._savedState;
      if (state) {
        restorePlayerState(state);
      }
      metingJsEl = null;
    } else {
      // 未初始化，等待 meting-js 自动初始化
      var checkInit = setInterval(function () {
        if (metingJsEl.aplayer) {
          clearInterval(checkInit);
          var state = metingJsEl._savedState;
          if (state) {
            restorePlayerState(state);
          }
          metingJsEl = null;
        }
      }, 100);
    }
  }

  function initSearch() {
    var searchInput = document.getElementById("searchInput");
    var searchResults = document.getElementById("searchResults");
    var searchBtn = document.querySelector(".search-btn");
    if (!searchInput || !searchResults || !searchBtn) return;

    var searchIndex = null;

    function loadSearchIndex(cb) {
      if (searchIndex) { cb(searchIndex); return; }
      fetch("/search.json")
        .then(function (r) { return r.json(); })
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
      return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function doSearch() {
      var rawKeyword = searchInput.value.trim();
      var keyword = rawKeyword.toLowerCase();
      if (!keyword) {
        searchResults.innerHTML = '<p class="ba-text-muted">请先输入关键词讷~</p>';
        return;
      }
      loadSearchIndex(function (posts) {
        posts.forEach(function (p) { if (!p._text) p._text = stripHtml(p.content); });
        var hits = [];
        posts.forEach(function (p) {
          var titleHit = p.title && p.title.toLowerCase().indexOf(keyword) !== -1;
          var contentHit = p._text && p._text.toLowerCase().indexOf(keyword) !== -1;
          if (titleHit || contentHit) hits.push({ post: p, titleHit: titleHit });
        });
        hits.sort(function (a, b) { return a.titleHit ? -1 : 1; });
        if (!hits.length) {
          searchResults.innerHTML = '<p class="ba-text-muted">没有找到包含「' + escapeHtml(keyword) + '」的文章~</p>';
          return;
        }
        searchResults.innerHTML = '<p class="ba-search-count">共找到 ' + hits.length + ' 篇文章</p>';
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
          header.appendChild(a);
          item.appendChild(header);
          var meta = document.createElement("div");
          meta.className = "ba-search-meta";
          meta.textContent = h.post.date || "";
          item.appendChild(meta);
          var text = h.post._text;
          var idx = text.toLowerCase().indexOf(keyword);
          var start = Math.max(0, idx - 20);
          var end = Math.min(text.length, idx + keyword.length + 40);
          var snippet = (start > 0 ? "..." : "") + text.slice(start, end) + (end < text.length ? "..." : "");
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

    var urlParam = new URLSearchParams(window.location.search).get("q");
    if (urlParam) {
      searchInput.value = urlParam;
      doSearch();
    }
  }

  function initSidebarDynamics() {
    var sidebarDyn = document.getElementById("sidebarDynamics");
    var dynamicUrl = window.BA_CONFIG && window.BA_CONFIG.dynamicUrl;
    var sidebarCount = (window.BA_CONFIG && window.BA_CONFIG.sidebarCount) || 2;
    if (!sidebarDyn || !dynamicUrl) return;

    fetch(dynamicUrl)
      .then(function (r) { return r.arrayBuffer(); })
      .then(function (buf) {
        var text = new TextDecoder("utf-8").decode(buf);
        if (text.indexOf("\ufffd") !== -1) {
          text = new TextDecoder("gbk").decode(buf);
        }
        var data = JSON.parse(text);
        if (!data.dynamics || !data.dynamics.length) {
          sidebarDyn.innerHTML = '<p class="ba-text-muted">暂无动态~</p>';
          return;
        }
        var html = "";
        var items = data.dynamics.slice(0, sidebarCount);
        items.forEach(function (d) {
          var typeClass = d.type === "置顶" ? "ba-dyn-pin" : d.type === "视频" ? "ba-dyn-video" : d.type === "转发" ? "ba-dyn-repost" : "ba-dyn-normal";
          html += '<div class="sidebar-dyn-pill" style="padding:.5rem .75rem;margin-bottom:.5rem;border-radius:6px;background:var(--ba-glass-bg);font-size:.78rem;line-height:1.4;border-left:3px solid var(--ba-primary)">' +
            '<span class="' + typeClass + '" style="font-size:.65rem;display:inline-block;margin-bottom:.2rem">' + d.type + "</span>" +
            '<p style="color:var(--ba-text-secondary);word-break:break-all">' + d.content + "</p>" +
            '<span style="font-size:.7rem;color:var(--ba-text-muted)">' + d.time + "</span></div>";
        });
        sidebarDyn.innerHTML = html;
      })
      .catch(function () {
        sidebarDyn.innerHTML = '<p class="ba-text-muted">加载失败</p>';
      });
  }

  function initGiscus() {
    var giscusContainer = document.querySelector(".ba-giscus");
    if (!giscusContainer) return;
    var existingScript = giscusContainer.querySelector("script");
    if (existingScript) {
      existingScript.remove();
    }
    var script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "xfcnl/xfcnl.github.io");
    script.setAttribute("data-repo-id", "R_kgDORKpEPA");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDORKpEPM4C3Lg_");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "transparent_dark");
    script.setAttribute("data-lang", "zh-CN");
    script.crossOrigin = "anonymous";
    script.async = true;
    giscusContainer.appendChild(script);
  }

  function savePlayerState() {
    if (!window.aplayers || !window.aplayers.length) return null;
    var ap = window.aplayers[0];
    return {
      currentTime: ap.audio ? ap.audio.currentTime : 0,
      isPaused: ap.audio ? ap.audio.paused : true,
      volume: ap.audio ? ap.audio.volume : 0.5
    };
  }

  function restorePlayerState(state) {
    if (!state) return;
    var tryRestore = function (attempt) {
      if (!window.aplayers || !window.aplayers.length) {
        if (attempt < 20) {
          setTimeout(function () { tryRestore(attempt + 1); }, 100);
        }
        return;
      }
      var ap = window.aplayers[0];
      if (!ap.audio) {
        if (attempt < 20) {
          setTimeout(function () { tryRestore(attempt + 1); }, 100);
        }
        return;
      }
      ap.audio.currentTime = state.currentTime;
      ap.audio.volume = state.volume;
      if (state.isPaused) {
        ap.pause();
      } else {
        ap.play();
      }
    };
    tryRestore(0);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function loadPage(url, push) {
    if (push === undefined) push = true;
    var main = getMainContainer();
    if (!main) return;

    var playerState = savePlayerState();

    detachMeteringJs();

    fetch(url, { headers: { "X-PJAX": "true" } })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");

        var newMain = doc.querySelector(mainSelector);
        if (!newMain) {
          window.location.href = url;
          return;
        }

        var isPost = doc.body.classList.contains("ba-post-page");
        document.body.classList.toggle("ba-post-page", isPost);

        var oldHero = document.querySelector(".hero-banner");
        var newHero = doc.querySelector(".hero-banner");
        if (oldHero && newHero) {
          oldHero.outerHTML = newHero.outerHTML;
        } else if (newHero && !oldHero) {
          var header = document.querySelector("header");
          if (header) header.insertAdjacent("afterend", newHero);
        }

        var oldExtras = document.querySelector(".post-extras");
        var newExtras = doc.querySelector(".post-extras");
        if (oldExtras && newExtras) {
          oldExtras.outerHTML = newExtras.outerHTML;
        } else if (newExtras && !oldExtras) {
          var mainEl = getMainContainer();
          if (mainEl) mainEl.insertAdjacent("afterend", newExtras);
        } else if (oldExtras && !newExtras) {
          oldExtras.remove();
        }

        main.innerHTML = newMain.innerHTML;

        var pageTitle = doc.querySelector("title");
        if (pageTitle) document.title = pageTitle.textContent;

        if (push) {
          history.pushState({ pjax: true }, "", url);
        } else {
          history.replaceState({ pjax: true }, "", url);
        }

        updateNavActiveState();

        var mainScripts = main.querySelectorAll("script");
        mainScripts.forEach(function (s) {
          var newScript = document.createElement("script");
          if (s.src) {
            newScript.src = s.src;
          } else {
            newScript.textContent = s.textContent;
          }
          s.replaceWith(newScript);
        });

        var heroTitle = document.querySelector(".hero-title.typewriter");
        if (heroTitle) {
          var fullText = heroTitle.textContent.trim();
          var typedLen = 0;
          heroTitle.textContent = "";
          var typeInterval = setInterval(function () {
            if (typedLen < fullText.length) {
              typedLen++;
              heroTitle.textContent = fullText.slice(0, typedLen);
            } else {
              clearInterval(typeInterval);
            }
          }, 180);
        }

        scrollToTop();

        initSearch();
        initSidebarDynamics();
        initGiscus();
        restorePlayerState(playerState);
        reattachMeteringJs();

        window.dispatchEvent(new CustomEvent("pjax:complete", { detail: { url: url } }));
      })
      .catch(function () {
        window.location.href = url;
      });
  }

  function bindPjaxClick() {
    document.addEventListener("click", function (e) {
      try {
        var link = e.target.closest("a");
        if (!link) return;

        var href = link.getAttribute("href");
        if (!href) return;

        if (link.target === "_blank") return;
        if (link.hasAttribute("download")) return;
        if (href.startsWith("http") && !href.includes(location.hostname)) return;
        if (href.startsWith("#")) return;
        if (href.startsWith("javascript:")) return;
        if (href === location.pathname + location.search) return;

        e.preventDefault();
        loadPage(href, true);
      } catch (err) {
        console.error("[pjax] click error:", err);
      }
    }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindPjaxClick);
  } else {
    bindPjaxClick();
  }

  window.addEventListener("popstate", function (e) {
    if (e.state && e.state.pjax) {
      loadPage(location.pathname + location.search, false);
    }
  });

  updateNavActiveState();
  initSearch();
  initSidebarDynamics();
  initGiscus();
})();
