/* ============================================
   xf_blog — 主脚本 (Hexo 移植版)
============================================ */

;(function() {
  /* ---- Service Worker 注册 ---- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function(reg) {
      if (reg.active) {
        reg.active.postMessage({ type: 'CACHE_URLS', urls: window.SW_CACHE_URLS || ['/', '/archive/', '/tag/', '/classify/', '/link/', '/about/', '/search/'] })
      } else {
        reg.addEventListener('updatefound', function() {
          var sw = reg.installing || reg.waiting
          if (sw) {
            sw.addEventListener('statechange', function() {
              if (this.state === 'activated') {
        reg.active.postMessage({ type: 'CACHE_URLS', urls: window.SW_CACHE_URLS || ['/', '/archive/', '/tag/', '/classify/', '/link/', '/about/', '/search/'] })
              }
            })
          }
        })
      }
    })
    navigator.serviceWorker.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'PRECACHE_DONE' && e.data.count > 0) {
        showCacheTip('已缓存首页、归档及全部共 ' + e.data.count + ' 个页面，离线可用')
      }
    })
  }

  function showCacheTip(msg) {
    if (sessionStorage.getItem('sw-cache-tip')) return
    sessionStorage.setItem('sw-cache-tip', '1')
    var tip = document.createElement('div')
    tip.className = 'cache-tip'
    tip.textContent = msg
    document.body.appendChild(tip)
    setTimeout(function() { tip.classList.add('show') }, 500)
    setTimeout(function() {
      tip.classList.remove('show')
      setTimeout(function() { tip.remove() }, 400)
    }, 6000)
  }

  /* ---- 离线状态提示 ---- */
  var banner = document.getElementById('offlineBanner')
  if (banner) {
    window.addEventListener('offline', function() { banner.classList.add('show') })
    window.addEventListener('online', function() { banner.classList.remove('show') })
    if (!navigator.onLine) banner.classList.add('show')
  }

  /* ---- 外部链接自动新标签页打开 ---- */
  document.addEventListener('click', function(e) {
    var link = e.target.closest ? e.target.closest('a') : null
    if (link && link.hostname && link.hostname !== window.location.hostname && !link.target) {
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
    }
  }, true)

  /* ---- DOM 就绪后的操作 ---- */
  document.addEventListener('DOMContentLoaded', function() {
    /* ---- 代码块复制按钮 ---- */
    var codeBlocks = document.querySelectorAll('pre')
    codeBlocks.forEach(function(pre) {
      var container = document.createElement('div')
      container.className = 'code-block-container'
      pre.parentNode.insertBefore(container, pre)
      container.appendChild(pre)

      var button = document.createElement('button')
      button.className = 'copy-button'
      button.textContent = '复制'
      button.addEventListener('click', function() {
        var code = pre.querySelector('code') ? pre.querySelector('code').textContent : pre.textContent
        navigator.clipboard.writeText(code).then(function() {
          button.textContent = '已复制'
          button.classList.add('copied')
          setTimeout(function() {
            button.textContent = '复制'
            button.classList.remove('copied')
          }, 2000)
        })
      })
      container.appendChild(button)
    })

    /* ---- 标题锚点（AnchorJS） ---- */
    if (typeof anchors !== 'undefined') {
      anchors.add()
    }

    /* ---- 导航汉堡菜单 ---- */
    var toggle = document.getElementById('navToggle')
    var links = document.getElementById('navLinks')
    if (toggle && links) {
      toggle.addEventListener('click', function() {
        this.classList.toggle('active')
        links.classList.toggle('open')
        var expanded = this.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
        this.setAttribute('aria-expanded', expanded)
      })
    }
  })
})()
