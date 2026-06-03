(function () {
  var footer = document.querySelector(".footer");
  if (!footer) return;

  function adjust() {
    // Find any elements with classes containing 'aplayer' and move those that are fixed
    var els = Array.prototype.slice.call(document.querySelectorAll('[class*="aplayer"]'));
    if (!els.length) return false;
    var moved = false;
    els.forEach(function(el){
      try {
        var cs = window.getComputedStyle(el);
        if (cs.position !== 'fixed') return;
        // Move fixed aplayer elements to top-left
        el.style.position = 'fixed';
        el.style.top = '16px';
        el.style.left = '16px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        // keep stacked order
        el.style.zIndex = 10002;
        moved = true;
      } catch (e) {
        // ignore measurement errors
      }
    });
    return moved;
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
