// Minimal Barba.js setup to keep player persistent across navigation
(function(){
  if (typeof barba === 'undefined') return;

  function reinitContent() {
    // Re-attach code copy buttons
    var codeBlocks = document.querySelectorAll('pre');
    codeBlocks.forEach(function(pre){
      if (pre.parentNode && pre.parentNode.querySelector('.copy-button')) return; // already added
      var container = document.createElement('div');
      container.className = 'code-block-container';
      pre.parentNode.insertBefore(container, pre);
      container.appendChild(pre);
      var button = document.createElement('button');
      button.className = 'copy-button';
      button.textContent = '复制';
      button.addEventListener('click', function(){
        var code = pre.querySelector('code') ? pre.querySelector('code').textContent : pre.textContent;
        navigator.clipboard.writeText(code).then(function(){
          button.textContent = '已复制';
          button.classList.add('copied');
          setTimeout(function(){ button.textContent = '复制'; button.classList.remove('copied'); }, 2000);
        });
      });
      container.appendChild(button);
    });

    // Re-run AnchorJS
    if (typeof anchors !== 'undefined' && anchors.add) anchors.add();

  }

  barba.hooks.afterEnter(function() {
    // after new container is in DOM
    reinitContent();

    // reset idle dock timer by dispatching an event
    document.dispatchEvent(new Event('meting:loaded'));
  });

  barba.init({
    sync: true,
    transitions: [{
      name: 'fade',
      leave(data) {
        return gsap ? gsap.to(data.current.container, {opacity:0}) : Promise.resolve();
      },
      enter(data) {
        if (typeof gsap !== 'undefined') gsap.from(data.next.container, {opacity:0});
      }
    }]
  });
})();
