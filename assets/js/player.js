// ===== APlayer 位置和交互微调 =====

document.addEventListener("DOMContentLoaded", function () {
  // 等待 MetingJS 初始化完成
  setTimeout(function () {
    adjustPlayerPosition();
    adjustPlayerIcons();
  }, 500);
});

// 初始化完成后再调整一次
window.addEventListener("load", function () {
  setTimeout(function () {
    adjustPlayerPosition();
    adjustPlayerIcons();
  }, 1000);
});

/**
 * 强制锁定播放器位置
 * 解决 MetingJS 异步初始化后可能覆盖位置的问题
 */
function adjustPlayerPosition() {
  const container = document.getElementById("music-player-container");
  if (!container) return;

  const player = container.querySelector(".aplayer");
  if (!player) return;

  // 强制设置容器位置
  container.style.position = "fixed";
  container.style.left = "16px";
  container.style.top = "120px";
  container.style.zIndex = "2000";

  // 强制设置播放器为 static，避免内部 position: fixed 冲突
  player.style.position = "static";
  player.style.bottom = "auto";
  player.style.right = "auto";
  player.style.left = "auto";
  player.style.top = "auto";
}

/**
 * 调整播放器图标大小
 * 解决 APlayer 中控制栏小图标被放大的问题
 * 通过区分播放按钮和控制栏按钮
 */
function adjustPlayerIcons() {
  const player = document.querySelector("#music-player-container .aplayer");
  if (!player) return;

  // 缩小控制栏按钮
  const controlButtons = player.querySelectorAll(
    ".aplayer-control .aplayer-button",
  );
  controlButtons.forEach((btn) => {
    btn.style.fontSize = "14px";
    btn.style.width = "32px";
    btn.style.height = "32px";
    btn.style.lineHeight = "32px";
    btn.style.textAlign = "center";
  });

  // 保持播放列表按钮合理大小
  const listBtn = player.querySelector(".aplayer-control .aplayer-list-button");
  if (listBtn) {
    listBtn.style.fontSize = "14px";
  }
}

// 监听窗口 resize，确保位置正确
window.addEventListener("resize", function () {
  adjustPlayerPosition();
});

// 监听播放器模式切换（mini ↔ full）
document.addEventListener("aplayer-mini", function () {
  adjustPlayerPosition();
});

document.addEventListener("aplayer-full", function () {
  adjustPlayerPosition();
});

// 监听 DOM，等 meting-js 创建 aplayer 节点后展开完整控制栏
(function watchForAPlayer() {
  function expandControls(player) {
    try {
      player.classList.remove("aplayer-mini");
      const info = player.querySelector(".aplayer-info");
      const ctrl = player.querySelector(".aplayer-control");
      if (info) info.style.display = "";
      if (ctrl) ctrl.style.display = "flex";

      // 保证控制按钮可见且大小合理
      const buttons = player.querySelectorAll(
        ".aplayer-control .aplayer-button",
      );
      buttons.forEach((b) => {
        b.style.display = "inline-flex";
        b.style.fontSize = "14px";
        b.style.width = "32px";
        b.style.height = "32px";
        b.style.alignItems = "center";
        b.style.justifyContent = "center";
      });

      // 确保封面不成为唯一可见项
      const pic = player.querySelector(".aplayer-pic");
      if (pic) {
        pic.style.width = "";
        pic.style.height = "";
      }
    } catch (e) {
      // ignore
    }
  }

  const observer = new MutationObserver((muts) => {
    const player = document.querySelector("#music-player-container .aplayer");
    if (player) {
      expandControls(player);
      observer.disconnect();
    }
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
  });
})();
