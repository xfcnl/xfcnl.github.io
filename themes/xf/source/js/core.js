/* ---- Service Worker ---- */
(function () {
  if (!("serviceWorker" in navigator)) return;

  const DEFAULT_URLS = [
    "/",
    "/archive/",
    "/tag/",
    "/classify/",
    "/link/",
    "/about/",
    "/search/",
  ];

  const sendCacheUrls = (reg) => {
    if (reg.active) {
      reg.active.postMessage({
        type: "CACHE_URLS",
        urls: window.SW_CACHE_URLS || DEFAULT_URLS,
      });
    }
  };

  navigator.serviceWorker.register("/sw.js").then((reg) => {
    if (reg.active) {
      sendCacheUrls(reg);
    } else {
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing || reg.waiting;
        if (sw) {
          sw.addEventListener("statechange", () => {
            if (sw.state === "activated") sendCacheUrls(reg);
          });
        }
      });
    }
  });

  navigator.serviceWorker.addEventListener("message", (e) => {
    if (e.data && e.data.type === "PRECACHE_DONE" && e.data.count > 0) {
      showCacheTip(`已缓存首页、归档及全部共 ${e.data.count} 个页面，离线可用`);
    }
  });

  function showCacheTip(msg) {
    if (sessionStorage.getItem("sw-cache-tip")) return;
    sessionStorage.setItem("sw-cache-tip", "1");
    const tip = document.createElement("div");
    tip.className = "cache-tip";
    tip.textContent = msg;
    document.body.appendChild(tip);
    requestAnimationFrame(() => tip.classList.add("show"));
    setTimeout(() => {
      tip.classList.remove("show");
      setTimeout(() => tip.remove(), 400);
    }, 6000);
  }

  const banner = document.getElementById("offlineBanner");
  if (banner) {
    const toggle = (on) => banner.classList.toggle("show", on);
    window.addEventListener("offline", () => toggle(true));
    window.addEventListener("online", () => toggle(false));
    if (!navigator.onLine) toggle(true);
  }
})();

/* ---- 外部链接自动新窗口 ---- */
document.addEventListener(
  "click",
  (e) => {
    const link = e.target.closest?.("a");
    if (
      link &&
      link.hostname &&
      link.hostname !== window.location.hostname &&
      !link.target
    ) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  },
  true,
);

/* ---- DOMContentLoaded 任务 ---- */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      links.classList.toggle("open");
      const expanded =
        toggle.getAttribute("aria-expanded") === "true" ? "false" : "true";
      toggle.setAttribute("aria-expanded", expanded);
    });
  }

  if (typeof anchors !== "undefined") anchors.add();

  /* ---- 代码块复制按钮 ---- */
  document.querySelectorAll("pre").forEach((pre) => {
    const container = document.createElement("div");
    container.className = "code-block-container";
    pre.parentNode.insertBefore(container, pre);
    container.appendChild(pre);

    const btn = document.createElement("button");
    btn.className = "copy-button";
    btn.textContent = "复制";
    btn.addEventListener("click", () => {
      const code = pre.querySelector("code")?.textContent || pre.textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "已复制";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "复制";
          btn.classList.remove("copied");
        }, 2000);
      });
    });
    container.appendChild(btn);
  });
});

/* ---- 搜索 ---- */
(function () {
  var POSTS = [];

  function doSearch() {
    var input = document.getElementById("searchInput");
    var container = document.getElementById("searchResults");
    if (!input || !container) return;

    var keyword = input.value.trim().toLowerCase();
    if (!keyword) {
      container.innerHTML = "";
      return;
    }

    var results = POSTS.filter(function (post) {
      return (
        post.title.toLowerCase().indexOf(keyword) !== -1 ||
        post.content.toLowerCase().indexOf(keyword) !== -1
      );
    });

    if (results.length === 0) {
      container.innerHTML = "<p>未找到相关文章</p>";
      return;
    }

    var html =
      "<p>共找到 " +
      results.length +
      ' 篇相关文章</p><div class="card-list">';
    results.forEach(function (post) {
      var typeLabel = post.type === "tech" ? "技术" : "随笔";
      var typeClass = post.type === "tech" ? "category-tech" : "category-note";
      html +=
        '<div class="card">' +
        '<div class="card-meta">' +
        '<span class="category-pill ' +
        typeClass +
        '">' +
        typeLabel +
        "</span>" +
        "<span>" +
        post.date +
        "</span>" +
        "</div>" +
        '<a href="' +
        post.url +
        '" class="card-title">' +
        post.title +
        "</a>" +
        "</div>";
    });
    html += "</div>";
    container.innerHTML = html;
  }

  function initSearch() {
    var input = document.getElementById("searchInput");
    if (!input) return;

    var q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      input.value = q;
      doSearch();
    }

    input.addEventListener("keyup", function (e) {
      if (e.key === "Enter") doSearch();
    });

    document.addEventListener("click", function (e) {
      if (e.target.classList.contains("search-btn")) doSearch();
    });
  }

  fetch("/search.json")
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      POSTS = data.posts || [];
      initSearch();
    })
    .catch(function () {
      initSearch();
    });
})();

/* ---- 友链表单 ---- */
(function () {
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  document.addEventListener("submit", (e) => {
    if (!e.target.classList.contains("link-form")) return;
    e.preventDefault();

    const name = document.getElementById("link-name")?.value ?? "";
    const url = document.getElementById("link-url")?.value ?? "";
    const avatar = document.getElementById("link-avatar")?.value ?? "";
    const desc = document.getElementById("link-desc")?.value ?? "";

    const yaml = `\`\`\`yaml\n- name: ${name}\n  url: ${url}\n  avatar: ${avatar}\n  desc: ${desc}\n\`\`\``;

    document.getElementById("link-result").innerHTML = `
      <div class="link-result">
        <p>请复制以下代码添加到你的友链文件中：</p>
        <div class="code-block">
          <pre><code>${escapeHtml(yaml)}</code></pre>
          <button class="copy-btn">复制</button>
        </div>
        <p class="tip">添加后请在评论区或通过其他方式告知，我会尽快审核并添加你的友链</p>
      </div>`;
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;

    const code = btn.previousElementSibling.querySelector("code")?.textContent;
    if (!code) return;

    navigator.clipboard.writeText(code).then(() => {
      btn.textContent = "已复制";
      setTimeout(() => (btn.textContent = "复制"), 2000);
    });
  });
})();

/* ---- B站动态 ---- */
(function () {
  const DATA_URL =
    "https://raw.gh.1s.fan/xfcnl/get-bilibili-dynamic-for-ci/main/dynamic.json";

  const TYPE_MAP = {
    置顶: { cls: "pinned", icon: "fa-thumbtack" },
    视频: { cls: "video", icon: "fa-video" },
    转发: { cls: "forward", icon: "fa-retweet" },
    动态: { cls: "", icon: "fa-pen" },
  };

  function esc(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function renderCard(item) {
    const info = TYPE_MAP[item.type] || { cls: "", icon: "fa-pen" };
    return `
      <div class="dynamics-card">
        <div class="dynamics-card-body">
          <div class="dynamics-card-header">
            <span class="dynamics-card-type ${info.cls}">
              <i class="fa-solid ${info.icon}"></i> ${esc(item.type)}
            </span>
            <span class="dynamics-card-time">${esc(item.time)}</span>
          </div>
          <div class="dynamics-card-content">${esc(item.content)}</div>
          <div class="dynamics-card-footer">
            <a href="${item.url}" target="_blank" rel="noopener noreferrer">
              在 B 站查看 <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
        </div>
      </div>`;
  }

  function fetchDynamics() {
    const list = document.getElementById("dynamics-list");
    if (!list) return;

    list.innerHTML =
      '<div class="dynamics-loading"><i class="fa-solid fa-spinner fa-spin"></i> 加载中...</div>';

    const xhr = new XMLHttpRequest();
    xhr.timeout = 15000;
    xhr.open("GET", DATA_URL, true);

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        list.innerHTML = `<div class="dynamics-error"><p><i class="fa-solid fa-triangle-exclamation"></i> 加载失败（${xhr.status}）</p></div>`;
        return;
      }

      try {
        const json = JSON.parse(xhr.responseText);
        const items = json.dynamics || [];
        if (items.length === 0) {
          list.innerHTML = '<div class="dynamics-empty">暂无动态</div>';
          return;
        }

        const html = items.map(renderCard).join("");
        let fetched = json.fetched_at || "";
        if (fetched) fetched = fetched.replace("T", " ").replace(/\..*/, "");

        list.innerHTML = `${html}<div class="dynamics-footer">共 ${items.length} 条动态 · 上次更新 ${fetched}</div>`;
      } catch {
        list.innerHTML =
          '<div class="dynamics-error"><p><i class="fa-solid fa-triangle-exclamation"></i> 数据解析失败</p></div>';
      }
    };

    xhr.onerror = () =>
      (list.innerHTML =
        '<div class="dynamics-error"><p><i class="fa-solid fa-triangle-exclamation"></i> 网络请求失败</p></div>');

    xhr.ontimeout = () =>
      (list.innerHTML =
        '<div class="dynamics-error"><p><i class="fa-solid fa-triangle-exclamation"></i> 请求超时，请检查网络</p></div>');

    xhr.send();
  }

  function onDynamicsLoad() {
    if (document.getElementById("dynamics-list")) fetchDynamics();
  }

  document.addEventListener("DOMContentLoaded", onDynamicsLoad);
  document.addEventListener("dynamics:load", onDynamicsLoad);
})();

/* ---- 邮件 ---- */
(function () {
  const EMAIL = "G114514g" + "@" + "yeah.net";

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-email-btn");
    if (!btn) return;

    navigator.clipboard.writeText(EMAIL).then(() => {
      const orig = btn.textContent;
      btn.textContent = "✓ 已复制";
      setTimeout(() => (btn.textContent = orig), 2000);
    });
  });

  if (window.location.pathname.startsWith("/mailto/")) {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = "mailto:" + EMAIL;
    document.body.appendChild(iframe);
    setTimeout(() => iframe.remove(), 3000);
  }
})();
