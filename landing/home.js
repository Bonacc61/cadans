'use strict';

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
  });
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });
}

// Scroll-reveal
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } }),
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.pt-panel-body, .why-row, .contact-option, .contact-form').forEach((el) => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (mobileMenu) { mobileMenu.classList.remove('open'); navToggle?.setAttribute('aria-expanded', 'false'); }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});

// Product tabs
const ptTabs = document.querySelectorAll('.pt-tab');
const ptPanels = document.querySelectorAll('.pt-panel');

if (ptTabs.length && ptPanels.length) {
  ptTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      ptTabs.forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      ptPanels.forEach((p) => { p.classList.remove('active'); p.hidden = true; });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('panel-' + target);
      if (panel) { panel.hidden = false; void panel.offsetWidth; panel.classList.add('active'); }
    });
  });
  // Keyboard navigation
  ptTabs.forEach((tab, i) => {
    tab.addEventListener('keydown', (e) => {
      const tabs = Array.from(ptTabs);
      let next = -1;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); next = (i + 1) % tabs.length; }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); next = (i - 1 + tabs.length) % tabs.length; }
      if (next >= 0) { tabs[next].focus(); tabs[next].click(); }
    });
  });
}

// Contact form
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const isEn = document.documentElement.classList.contains('lang-en');
    btn.disabled = true;
    btn.textContent = isEn ? 'Sent — we\'ll be in touch shortly.' : 'Verstuurd — we nemen spoedig contact op.';
    btn.style.background = '#0D9488';
  });
}
