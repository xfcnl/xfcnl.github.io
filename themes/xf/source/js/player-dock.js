(function () {
  const IDLE_MS = 10000; // 10 秒
  const container = document.getElementById("music-player-container");
  if (!container) return;
  let idleTimer = null;
  // 反映初始 DOM 状态：容器可能以 "docked" 类开头
  let docked = container.classList.contains('docked');

  function dock() {
    if (docked) return;
    container.classList.add("docked");
    docked = true;
  }

  function undock() {
    if (!docked) return;
    container.classList.remove("docked");
    docked = false;
  }

  function resetTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => dock(), IDLE_MS);
  }

  // 加载完成后启动闲置计时器
  document.addEventListener("DOMContentLoaded", resetTimer);
  window.addEventListener("load", resetTimer);

  // 交互行为重置计时器并解除吸附
  ["mousemove", "keydown", "touchstart", "click"].forEach((ev) => {
    document.addEventListener(
      ev,
      function (e) {
        // 如果交互发生在容器内，立即解除吸附
        if (container.contains(e.target)) {
          undock();
        }
        resetTimer();
      },
      { passive: true },
    );
  });

  // 悬停行为：鼠标移入时展开，移出时启动计时器
  container.addEventListener("mouseenter", function () {
    undock();
    if (idleTimer) clearTimeout(idleTimer);
  });
  container.addEventListener("mouseleave", function () {
    resetTimer();
  });

  // 键盘焦点
  container.addEventListener("focusin", function () {
    undock();
    if (idleTimer) clearTimeout(idleTimer);
  });
  container.addEventListener("focusout", function () {
    resetTimer();
  });

  // 用户在容器内点击播放/暂停也算活动
  container.addEventListener("click", function () {
    resetTimer();
  });

  // 安全措施：如果 meting-js 或 aplayer 触发了初始化事件，重置计时器
  document.addEventListener("aplayer-init", resetTimer);
  document.addEventListener("meting:loaded", resetTimer);
})();
