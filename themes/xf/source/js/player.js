// ===== 调整 APlayer 位置和交互 =====

document.addEventListener("DOMContentLoaded", function () {
  // 等 MetingJS 初始化完
  setTimeout(function () {
    adjustPlayerPosition();
    adjustPlayerIcons();
  }, 500);
});

// 初始化完再调一次
window.addEventListener("load", function () {
  setTimeout(function () {
    adjustPlayerPosition();
    adjustPlayerIcons();
  }, 1000);
});

/**
 * 强制固定播放器位置
 * 解决 MetingJS 异步初始化后可能把位置覆盖掉的问题
 */
function adjustPlayerPosition() {
  const container = document.getElementById("music-player-container");
  if (!container) return;

  const player = container.querySelector(".aplayer");
  if (!player) return;

  // 强行固定容器位置
  container.style.position = "fixed";
  container.style.left = "16px";
  container.style.top = "120px";
  container.style.zIndex = "2000";

  // 强制播放器用 static，防止内部的 position: fixed 打架
  player.style.position = "static";
  player.style.bottom = "auto";
  player.style.right = "auto";
  player.style.left = "auto";
  player.style.top = "auto";
}

/**
 * 调播放器图标大小
 * 修复 APlayer 控制栏小图标被放大的问题
 * 通过区分播放按钮和控制栏按钮来处理
 */
function adjustPlayerIcons() {
  const player = document.querySelector("#music-player-container .aplayer");
  if (!player) return;

  // 缩小控制栏的按钮
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

  // 播放列表按钮保持合适大小
  const listBtn = player.querySelector(".aplayer-control .aplayer-list-button");
  if (listBtn) {
    listBtn.style.fontSize = "14px";
  }
}

// 窗口大小变化时重新调整位置
window.addEventListener("resize", function () {
  adjustPlayerPosition();
});

// 监听播放器模式切换（迷你 ↔ 完整）
document.addEventListener("aplayer-mini", function () {
  adjustPlayerPosition();
});

document.addEventListener("aplayer-full", function () {
  adjustPlayerPosition();
});

// 监听 DOM，等 meting-js 创建 aplayer 节点后展开完整的控制栏
(function watchForAPlayer() {
  function expandControls(player) {
    try {
      player.classList.remove('aplayer-mini');
      const info = player.querySelector('.aplayer-info');
      const ctrl = player.querySelector('.aplayer-control');
      if (info) info.style.display = '';
      if (ctrl) ctrl.style.display = 'flex';

      // 确保控制按钮可见且大小合适
      const buttons = player.querySelectorAll('.aplayer-control .aplayer-button');
      buttons.forEach(b => {
        b.style.display = 'inline-flex';
        b.style.fontSize = '14px';
        b.style.width = '32px';
        b.style.height = '32px';
        b.style.alignItems = 'center';
        b.style.justifyContent = 'center';
      });

      // 不要让封面变成唯一看得见的东西
      const pic = player.querySelector('.aplayer-pic');
      if (pic) {
        pic.style.width = '';
        pic.style.height = '';
      }

    } catch (e) {
      // 忽略
    }
  }

  const observer = new MutationObserver((muts) => {
    const player = document.querySelector('#music-player-container .aplayer');
    if (player) {
      expandControls(player);
      observer.disconnect();
    }
  });

  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
})();

