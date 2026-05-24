---
layout: page
title: 邮箱跳转
permalink: /mailto/
---

邮件客户端正在打开

如果没有自动弹出，请[手动点击发送邮件](mailto:G114514g@yeah.net)

或手动复制邮箱

```text
G114514g@yeah.net
```

<script>
 (function () {
   var iframe = document.createElement("iframe");
   iframe.style.display = "none";
   iframe.src = "mailto:G114514g@yeah.net";
   document.body.appendChild(iframe);


   setTimeout(function () {
      iframe.parentNode && iframe.parentNode.removeChild(iframe);
   }, 3000);
 })();
</script>
