'use strict';

/* Hero constellation net — a lightweight canvas "AI network" behind the hero.
   Indigo/teal nodes drift on the light canvas; nearby nodes link with lines that
   fade by distance, and the cursor draws temporary links to nearby nodes.
   Respects prefers-reduced-motion (renders a single static frame), pauses when
   off-screen or the tab is hidden, and stays low-opacity so hero text keeps its
   contrast. No dependencies. */
(function () {
  const canvas = document.querySelector('.hero-net');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const INDIGO = '79,70,229';   // --indigo #4F46E5
  const TEAL = '13,148,136';    // --teal   #0D9488
  const LINK_DIST = 140;        // px: node-to-node link radius
  const POINTER_R = 210;        // px: cursor link radius
  const SPEED = 0.14;           // px/frame drift

  let W = 0, H = 0, DPR = 1;
  let nodes = [];
  let raf = null;
  const pointer = { x: -9999, y: -9999, active: false };

  function size() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeNodes() {
    // Scale count to hero area, but keep it small for a clean, calm net.
    const target = Math.min(72, Math.max(22, Math.round((W * H) / 15000)));
    nodes = [];
    for (let i = 0; i < target; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * SPEED * 2,
        vy: (Math.random() - 0.5) * SPEED * 2,
        teal: Math.random() < 0.28,        // a minority teal, rest indigo
        r: 1.1 + Math.random() * 1.4,
      });
    }
  }

  function step() {
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x <= 0 || n.x >= W) { n.vx *= -1; n.x = Math.max(0, Math.min(W, n.x)); }
      if (n.y <= 0 || n.y >= H) { n.vy *= -1; n.y = Math.max(0, Math.min(H, n.y)); }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // node-to-node links
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > LINK_DIST * LINK_DIST) continue;
        const d = Math.sqrt(d2);
        const alpha = (1 - d / LINK_DIST) * 0.16;
        ctx.strokeStyle = `rgba(${a.teal || b.teal ? TEAL : INDIGO},${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // cursor links (visual only — no physics, so it never jitters)
    if (pointer.active) {
      for (const n of nodes) {
        const dx = n.x - pointer.x, dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > POINTER_R * POINTER_R) continue;
        const d = Math.sqrt(d2);
        const alpha = (1 - d / POINTER_R) * 0.28;
        ctx.strokeStyle = `rgba(${INDIGO},${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
    }

    // nodes
    for (const n of nodes) {
      ctx.fillStyle = `rgba(${n.teal ? TEAL : INDIGO},0.55)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() { step(); draw(); raf = requestAnimationFrame(loop); }
  function start() { if (!raf && !reduce.matches) raf = requestAnimationFrame(loop); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  function init() {
    size();
    if (W === 0 || H === 0) { requestAnimationFrame(init); return; } // wait for layout
    makeNodes();
    if (reduce.matches) draw();   // single static frame
    else start();
  }

  const host = canvas.parentElement || canvas;
  host.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.active = true;
  });
  host.addEventListener('pointerleave', () => { pointer.active = false; });

  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { size(); makeNodes(); if (reduce.matches) draw(); }, 200);
  });

  // pause when the hero scrolls out of view or the tab is hidden
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) start(); else stop(); });
    }, { threshold: 0 }).observe(canvas);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });
  reduce.addEventListener && reduce.addEventListener('change', () => { stop(); init(); });

  init();
})();
