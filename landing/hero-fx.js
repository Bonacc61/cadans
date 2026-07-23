'use strict';

/* Interactive neural sphere — a rotating lattice of nodes on a Fibonacci sphere,
   wired to nearest neighbours. It auto-spins and tilts toward the cursor (parallax);
   nodes + links are depth-shaded indigo→teal so the globe reads as 3D on the light
   canvas. Pure canvas, no deps. Reduced-motion → one static frame; pauses off-screen
   or when the tab is hidden. */
(function () {
  const canvas = document.querySelector('.hero-fx');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const INDIGO = [79, 70, 229];
  const TEAL = [13, 148, 136];
  const N = 700;          // node count
  const K = 3;            // links per node (nearest neighbours)
  const PERSP = 2.4;      // perspective strength

  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, R = 0, raf = 0;
  const nodes = [];       // unit-sphere coords
  const edges = [];       // [i, j] neighbour pairs
  let rotY = 0, rotX = -0.32;
  const tilt = { x: 0, y: 0 }, target = { x: 0, y: 0 };

  const mixc = (a, b, k) =>
    `${(a[0] + (b[0] - a[0]) * k) | 0},${(a[1] + (b[1] - a[1]) * k) | 0},${(a[2] + (b[2] - a[2]) * k) | 0}`;

  function build() {
    nodes.length = 0; edges.length = 0;
    const gold = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = gold * i;
      nodes.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r });
    }
    // nearest-neighbour links (O(n²) once — fine for n≈700)
    for (let i = 0; i < N; i++) {
      const a = nodes[i]; const ds = [];
      for (let j = 0; j < N; j++) {
        if (i === j) continue; const b = nodes[j];
        ds.push([(a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2, j]);
      }
      ds.sort((p, q) => p[0] - q[0]);
      for (let k = 0; k < K; k++) { const j = ds[k][1]; if (j > i) edges.push([i, j]); }
    }
  }

  function size() {
    const r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W > 760 ? W * 0.7 : W * 0.5;      // offset right on desktop, centred on mobile
    cy = H * 0.48;
    R = Math.min(W * 0.42, H * 0.4);
  }

  const P = [];
  function frame() {
    tilt.x += (target.x - tilt.x) * 0.05;
    tilt.y += (target.y - tilt.y) * 0.05;
    rotY += 0.0016;                         // gentle auto-spin
    const rx = rotX + tilt.x, ry = rotY + tilt.y;
    const cosY = Math.cos(ry), sinY = Math.sin(ry), cosX = Math.cos(rx), sinX = Math.sin(rx);

    for (let i = 0; i < N; i++) {
      const p = nodes[i];
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.x * sinY + p.z * cosY;
      const y1 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;    // -1..1
      const s = PERSP / (PERSP - z2);
      P[i] = { sx: cx + x1 * R * s, sy: cy + y1 * R * s, z: z2, f: (z2 + 1) / 2 };
    }

    ctx.clearRect(0, 0, W, H);
    // links
    ctx.lineWidth = 1;
    for (let e = 0; e < edges.length; e++) {
      const a = P[edges[e][0]], b = P[edges[e][1]];
      const f = (a.f + b.f) / 2;
      ctx.strokeStyle = `rgba(${mixc(INDIGO, TEAL, f)},${0.04 + f * 0.22})`;
      ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
    }
    // nodes, back-to-front
    const order = P.map((_, i) => i).sort((i, j) => P[i].z - P[j].z);
    for (const i of order) {
      const p = P[i];
      ctx.fillStyle = `rgba(${mixc(INDIGO, TEAL, p.f)},${0.2 + p.f * 0.7})`;
      ctx.beginPath(); ctx.arc(p.sx, p.sy, 0.7 + p.f * 2.1, 0, 6.2832); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }

  function drawStatic() { rotY = 0.6; frame(); stop(); }
  function start() { if (!raf && !reduce.matches) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  hero.addEventListener('pointermove', (ev) => {
    const r = hero.getBoundingClientRect();
    target.y = ((ev.clientX - r.left - cx) / W) * 1.4;
    target.x = ((ev.clientY - r.top - cy) / H) * -1.0;
  });
  hero.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });

  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { size(); if (reduce.matches) drawStatic(); }, 200);
  });
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => es.forEach((en) => (en.isIntersecting ? start() : stop())), { threshold: 0 }).observe(canvas);
  }

  build();
  size();
  if (reduce.matches) drawStatic(); else start();
})();
