(function () {
  var footer = document.querySelector(".footer");
  if (!footer) return;

  function adjust() {
    var h = footer.offsetHeight;
    var p = document.querySelector(".aplayer.aplayer-fixed");
    if (!p) return false;
    // Lift player further above footer to avoid overlap on some layouts
    p.style.bottom = h + 16 + "px";
    // Ensure it's above the footer and other fixed elements
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
