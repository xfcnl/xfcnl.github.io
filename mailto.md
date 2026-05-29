---
layout: page
title: 邮箱跳转
permalink: /mailto/
---

邮件客户端正在打开

如果没有自动弹出，请<a href="mailto:&#71;&#49;&#49;&#52;&#53;&#49;&#52;&#103;&#64;&#121;&#101;&#97;&#104;&#46;&#110;&#101;&#116;">手动点击发送邮件</a>

或手动复制邮箱

<button onclick="copyEmail()" style="cursor:pointer; font-size:inherit; border:1px solid #4a9eff; background:#e8f4ff; color:#1a1a2e; padding:6px 16px; border-radius:6px;">复制邮箱 &#71;&#49;&#49;&#52;&#53;&#49;&#52;&#103;&#64;&#121;&#101;&#97;&#104;&#46;&#110;&#101;&#116;</button>
<script>
function copyEmail() {
  var text = "G114514g" + "@" + "yeah.net";
  navigator.clipboard.writeText(text).then(function () {
    var btn = event.target;
    var orig = btn.textContent;
    btn.textContent = "✓ 已复制";
    setTimeout(function () { btn.textContent = orig; }, 2000);
  });
}
</script>

<script>
 (function () {
   var iframe = document.createElement("iframe");
   iframe.style.display = "none";
    iframe.src = "mailto:" + "G114514g" + "@" + "yeah.net";
   document.body.appendChild(iframe);


   setTimeout(function () {
      iframe.parentNode && iframe.parentNode.removeChild(iframe);
   }, 3000);
 })();
</script>
