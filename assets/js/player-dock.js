(function(){
  const IDLE_MS = 10000; // 10 seconds
  const container = document.getElementById('music-player-container');
  if (!container) return;
  let idleTimer = null;
  let docked = false;

  function dock(){
    if (docked) return;
    container.classList.add('docked');
    docked = true;
  }

  function undock(){
    if (!docked) return;
    container.classList.remove('docked');
    docked = false;
  }

  function resetTimer(){
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(()=> dock(), IDLE_MS);
  }

  // Start idle timer after load
  document.addEventListener('DOMContentLoaded', resetTimer);
  window.addEventListener('load', resetTimer);

  // Interactions reset timer and undock
  ['mousemove','keydown','touchstart','click'].forEach(ev => {
    document.addEventListener(ev, function(e){
      // If interaction is inside container, undock immediately
      if (container.contains(e.target)) {
        undock();
      }
      resetTimer();
    }, {passive:true});
  });

  // Hover behavior: expand on hover, start timer on leave
  container.addEventListener('mouseenter', function(){ undock(); if (idleTimer) clearTimeout(idleTimer); });
  container.addEventListener('mouseleave', function(){ resetTimer(); });

  // Keyboard focus
  container.addEventListener('focusin', function(){ undock(); if (idleTimer) clearTimeout(idleTimer); });
  container.addEventListener('focusout', function(){ resetTimer(); });

  // If user clicks play/pause inside container, treat as activity
  container.addEventListener('click', function(){ resetTimer(); });

  // Safety: if meting-js or aplayer emits init events, reset
  document.addEventListener('aplayer-init', resetTimer);
  document.addEventListener('meting:loaded', resetTimer);
})();
