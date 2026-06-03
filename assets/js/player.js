(function () {
  var footer = document.querySelector(".footer");
  if (!footer) return;

  function adjust() {
    var p = document.querySelector(".aplayer.aplayer-fixed");
    if (!p) return false;
    // Position main player at top-left with a safe offset
    p.style.position = "fixed";
    p.style.top = "16px";
    p.style.left = "16px";
    p.style.right = "auto";
    p.style.bottom = "auto";
    p.style.zIndex = 10002;

    // Also move any mini switcher / control widgets to sit next to the main player
    var minis = document.querySelectorAll('.aplayer-miniswitcher, .aplayer .aplayer-miniswitcher');
    if (minis && minis.length) {
      minis.forEach(function(m){
        try {
          // Place minis to the right of the main player (safe fallback: align with top)
          var rect = p.getBoundingClientRect();
          m.style.position = 'fixed';
          m.style.top = (rect.top + 4) + 'px';
          // if minis is small, place it to the right of main player, otherwise align left
          var leftPos = rect.right + 8;
          // if leftPos would overflow viewport, keep it aligned under main player
          if (leftPos + m.offsetWidth > window.innerWidth) {
            m.style.left = (rect.left) + 'px';
          } else {
            m.style.left = leftPos + 'px';
          }
          m.style.right = 'auto';
          m.style.bottom = 'auto';
          m.style.zIndex = 10003;
        } catch (e) {
          // ignore and continue if measurement fails
        }
      });
    }

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
