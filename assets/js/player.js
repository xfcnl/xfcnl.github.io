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
  container.style.zIndex = "998";

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
