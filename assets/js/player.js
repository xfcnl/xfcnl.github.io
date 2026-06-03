(function () {
  var footer = document.querySelector(".footer");
  if (!footer) return;

  function adjust() {
    var p = document.querySelector(".aplayer.aplayer-fixed");
    if (!p) return false;
    // Position player at top-left with a safe offset
    p.style.top = "16px";
    p.style.left = "16px";
    p.style.right = "auto";
    p.style.bottom = "auto";
    // Ensure it's above other fixed elements
    p.style.zIndex = 10002;
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
