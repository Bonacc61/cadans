'use strict';

/* Magnetic neural grid — a canvas lattice of nodes on a home grid. Each node springs
   back to home but is pushed aside by a cursor repulsion field, so the mesh bends and
   ripples around the pointer; the mesh lines + nodes light up indigo→teal near the
   cursor. A slow idle "breathing" keeps it alive at rest. Pure canvas, no deps.
   Reduced-motion → one static frame; pauses when off-screen or the tab is hidden. */
(function () {
  const canvas = document.querySelector('.hero-fx');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const INK = [15, 23, 42];
  const INDIGO = [79, 70, 229];
  const TEAL = [13, 148, 136];
  const GAP = 34;      // grid spacing (px)
  const REPEL = 135;   // cursor influence radius (px)
  const FORCE = 30;    // max node displacement (px)

  let W = 0, H = 0, DPR = 1, cols = 0, rows = 0, pts = [], raf = 0, t = 0;
  const ptr = { x: -9999, y: -9999, active: false };

  const lerp = (a, b, k) => a + (b - a) * k;
  const mix = (a, b, k) => `rgba(${lerp(a[0], b[0], k) | 0},${lerp(a[1], b[1], k) | 0},${lerp(a[2], b[2], k) | 0}`;

  function size() {
    const r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function build() {
    cols = Math.ceil(W / GAP) + 2;
    rows = Math.ceil(H / GAP) + 2;
    pts = new Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const hx = i * GAP, hy = j * GAP;
        pts[j * cols + i] = { hx, hy, x: hx, y: hy, ph: (i + j) * 0.55, cr: 0 };
      }
    }
  }

  function step() {
    t += 0.016;
    for (const p of pts) {
      const bx = Math.sin(t * 0.6 + p.ph) * 1.2;
      const by = Math.cos(t * 0.5 + p.ph) * 1.2;
      let tx = p.hx + bx, ty = p.hy + by;
      let cr = 0;
      if (ptr.active) {
        const dx = p.hx - ptr.x, dy = p.hy - ptr.y;
        const d = Math.hypot(dx, dy);
        if (d < REPEL) {
          const f = 1 - d / REPEL;               // 0..1, strongest at cursor
          const e = f * f;                        // ease the falloff
          tx += (dx / (d || 1)) * e * FORCE;
          ty += (dy / (d || 1)) * e * FORCE;
          cr = f;
        }
      }
      p.x += (tx - p.x) * 0.16;
      p.y += (ty - p.y) * 0.16;
      p.cr = cr;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // mesh lines (to right + down neighbour) — faint base, brighter near cursor
    ctx.lineWidth = 1;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const p = pts[j * cols + i];
        if (i < cols - 1) link(p, pts[j * cols + i + 1]);
        if (j < rows - 1) link(p, pts[(j + 1) * cols + i]);
      }
    }
    // nodes
    for (const p of pts) {
      const c = p.cr;
      const col = c > 0 ? mix(INK, c < 0.5 ? INDIGO : TEAL, c) : `rgba(${INK[0]},${INK[1]},${INK[2]}`;
      ctx.fillStyle = `${col},${0.14 + c * 0.6})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2 + c * 1.8, 0, 6.2832);
      ctx.fill();
    }
  }

  function link(a, b) {
    const c = Math.max(a.cr, b.cr);
    const alpha = 0.05 + c * 0.5;
    ctx.strokeStyle = `${mix(INK, INDIGO, c)},${alpha})`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function loop() { step(); draw(); raf = requestAnimationFrame(loop); }
  function start() { if (!raf && !reduce.matches) raf = requestAnimationFrame(loop); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
    ptr.active = true;
  });
  hero.addEventListener('pointerleave', () => { ptr.active = false; });

  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { size(); if (reduce.matches) draw(); }, 200);
  });
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => es.forEach((en) => (en.isIntersecting ? start() : stop())), { threshold: 0 }).observe(canvas);
  }

  size();
  if (reduce.matches) draw(); else start();
})();
