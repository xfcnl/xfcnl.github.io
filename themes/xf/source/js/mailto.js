(function() {
  /* ---- copyEmail ---- */
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.copy-email-btn');
    if (!btn) return;
    var text = "G114514g" + "@" + "yeah.net";
    navigator.clipboard.writeText(text).then(function() {
      var orig = btn.textContent;
      btn.textContent = "✓ 已复制";
      setTimeout(function() { btn.textContent = orig; }, 2000);
    });
  });

  /* ---- auto-open mailto iframe (only on /mailto/) ---- */
  if (window.location.pathname.indexOf('/mailto/') === 0) {
    var iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = "mailto:" + "G114514g" + "@" + "yeah.net";
    document.body.appendChild(iframe);
    setTimeout(function() {
      iframe.parentNode && iframe.parentNode.removeChild(iframe);
    }, 3000);
  }
})();
