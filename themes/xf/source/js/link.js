(function() {
  document.addEventListener('submit', function(e) {
    if (!e.target.classList.contains('link-form')) return;
    e.preventDefault();
    var name = document.getElementById("link-name").value;
    var url = document.getElementById("link-url").value;
    var avatar = document.getElementById("link-avatar").value;
    var desc = document.getElementById("link-desc").value;

    var yamlCode = "```yaml\n- name: " + name + "\n  url: " + url + "\n  avatar: " + avatar + "\n  desc: " + desc + "\n```";

    var resultHtml =
      '<div class="link-result">' +
        '<p>请复制以下代码添加到你的友链文件中：</p>' +
        '<div class="code-block">' +
          '<pre><code>' + escapeHtml(yamlCode) + '</code></pre>' +
          '<button class="copy-btn">复制</button>' +
        '</div>' +
        '<p class="tip">添加后请在评论区或通过其他方式告知，我会尽快审核并添加你的友链</p>' +
      '</div>';

    document.getElementById("link-result").innerHTML = resultHtml;
  });

  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.copy-btn');
    if (!btn) return;
    var code = btn.previousElementSibling.querySelector("code").textContent;
    navigator.clipboard.writeText(code).then(function() {
      btn.textContent = "已复制";
      setTimeout(function() { btn.textContent = "复制"; }, 2000);
    });
  });

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
})();
