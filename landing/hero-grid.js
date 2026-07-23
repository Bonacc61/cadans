'use strict';

/* Interactive hero dot-grid — moves the indigo/teal "spotlight" (a CSS radial mask +
   colour bloom) to follow the cursor by writing --mx/--my onto .hero-grid. rAF-throttled;
   no dependencies. The base grid is pure CSS, so this only enhances an already-visible
   grid and needs no fallback of its own. */
(function () {
  const grid = document.querySelector('.hero-grid');
  const hero = document.querySelector('.hero');
  if (!grid || !hero) return;

  let raf = 0, x = 0, y = 0;
  const apply = () => {
    grid.style.setProperty('--mx', x + 'px');
    grid.style.setProperty('--my', y + 'px');
    raf = 0;
  };

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    x = e.clientX - r.left;
    y = e.clientY - r.top;
    if (!raf) raf = requestAnimationFrame(apply);
  });

  // Ease the spotlight back to a resting spot when the cursor leaves the hero.
  hero.addEventListener('pointerleave', () => {
    grid.style.setProperty('--mx', '50%');
    grid.style.setProperty('--my', '28%');
  });
})();
