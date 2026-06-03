(function () {
  var footer = document.querySelector(".footer");
  if (!footer) return;

  function adjust() {
    var p = document.querySelector('.aplayer.aplayer-fixed');
    if (!p) return false;
    // Ensure main container is fixed at top-left
    p.style.position = 'fixed';
    p.style.top = '16px';
    p.style.left = '16px';
    p.style.right = 'auto';
    p.style.bottom = 'auto';
    p.style.zIndex = 10002;

    // Normalize body/layout to a compact horizontal layout
    var body = p.querySelector('.aplayer-body');
    if (body) {
      body.style.width = 'auto';
      body.style.minWidth = '320px';
      body.style.maxWidth = '420px';
      body.style.display = 'flex';
      body.style.alignItems = 'center';
      body.style.gap = '10px';
      body.style.padding = '8px';
      body.style.boxSizing = 'border-box';
    }

    // Force info area to behave as a flex container (prevents stacking below)
    var info = p.querySelector('.aplayer-info');
    if (info) {
      info.style.display = 'flex';
      info.style.alignItems = 'center';
      info.style.gap = '10px';
      info.style.flex = '1 1 auto';
      info.style.minWidth = '0';
    }

    // Reposition miniswitcher relative to main player (to the right)
    var minis = document.querySelectorAll('.aplayer-miniswitcher');
    minis.forEach(function(m){
      try {
        m.style.position = 'fixed';
        var rect = p.getBoundingClientRect();
        var mW = m.offsetWidth || 40;
        var mH = m.offsetHeight || 40;
        var top = rect.top + (rect.height - mH) / 2;
        var left = rect.left + rect.width + 8;
        // Avoid overflowing viewport
        if (left + mW > window.innerWidth) left = Math.max(8, rect.left + rect.width - mW);
        if (top < 8) top = 8;
        m.style.top = top + 'px';
        m.style.left = left + 'px';
        m.style.right = 'auto';
        m.style.bottom = 'auto';
        m.style.zIndex = 10003;
      } catch(e){}
    });

    return true;
  }

  if (adjust()) return;

  var timer = setInterval(function () {
    if (adjust()) clearInterval(timer);
  }, 200);

  window.addEventListener("load", function () {
    if (!document.querySelector(".aplayer.aplayer-fixed")) return;
    adjust();
  });
  window.addEventListener("resize", adjust);
})();
