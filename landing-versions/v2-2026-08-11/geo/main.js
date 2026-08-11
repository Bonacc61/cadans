'use strict';

// Scroll-reveal
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } }),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll(
  '.service-card, .deliverable-item, .process-step, .problem-text, .problem-visual, .contact-text'
).forEach((el) => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// Smooth-scroll nav links (supplement CSS for browsers that ignore it on anchor clicks)
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Move focus for a11y
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});

// Contact form: client-side feedback (swap for your backend / Formspree endpoint)
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Verstuurd — we nemen spoedig contact op.';
    btn.style.background = 'var(--teal)';
  });
}
