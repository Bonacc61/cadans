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
document.querySelectorAll('.why-row, .offer, .faq-item, .contact-form').forEach((el) => {
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
    // An explicit behavior option overrides the CSS scroll-behavior property,
    // so the reduced-motion guard in the stylesheet cannot reach this call.
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});

// Contact form → Supabase (PostgREST). The anon key is public by design: RLS
// grants it INSERT on intake_submissions and nothing else, so it cannot read
// a single lead back. Every limit is a CHECK constraint in the migration.
const SUPABASE_URL = 'https://kolfehnnhroobfqxhafe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Y5mZ_ubWiZHs8Ut7CWXc8Q_LNIlFkau';

const form = document.querySelector('.contact-form');
if (form) {
  const btn = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.f-status');

  const COPY = {
    incomplete: {
      nl: 'Vul je naam, e-mailadres en interesse in, en ga akkoord met het privacybeleid.',
      en: 'Please fill in your name, email and interest, and accept the privacy policy.',
    },
    email: {
      nl: 'Dit e-mailadres lijkt niet te kloppen — controleer het even.',
      en: 'That email address does not look right — please check it.',
    },
    failed: {
      nl: 'Versturen is niet gelukt. Probeer het opnieuw, of mail direct naar jan@cadans.ai.',
      en: 'Sending failed. Please try again, or email jan@cadans.ai directly.',
    },
    ok: {
      nl: 'Bedankt — je aanvraag is binnen. We nemen zo snel mogelijk contact met je op.',
      en: 'Thanks — your request came through. We will be in touch as soon as we can.',
    },
  };

  const lang = () => (document.documentElement.classList.contains('lang-en') ? 'en' : 'nl');
  const field = (n) => form.elements.namedItem(n);
  const val = (n) => (field(n).value || '').trim();
  const say = (key, kind) => {
    status.textContent = COPY[key][lang()];
    status.className = 'f-status ' + kind;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btn.disabled) return;

    // Honeypot: a real browser leaves this empty. Show the bot a success state
    // so it does not retry with a variation, and insert nothing.
    if (val('f_hp_2')) {
      say('ok', 'is-ok');
      btn.disabled = true;
      return;
    }

    const payload = {
      interest: val('interest'),
      name: val('name'),
      email: val('email'),
      phone: val('phone') || null,
      company: val('company') || null,
      message: val('message') || null,
      consent: field('consent').checked,
    };

    if (!payload.name || !payload.email || !payload.interest || !payload.consent) {
      say('incomplete', 'is-error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email)) {
      say('email', 'is-error');
      field('email').focus();
      return;
    }

    btn.disabled = true;
    btn.classList.add('is-sending');
    status.className = 'f-status';

    // AbortController rather than AbortSignal.timeout: the latter throws on
    // pre-2022 Safari, which would lock those visitors out of submitting
    // entirely rather than just skipping the timeout.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);

    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/intake_submissions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          authorization: 'Bearer ' + SUPABASE_ANON_KEY,
          // anon has no SELECT grant, so asking for the row back would 401.
          prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
        // Without this a hung connection never settles, and the button stays
        // greyed out forever with no way back short of a reload.
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error('status ' + res.status + ' ' + (await res.text()));

      // Terminal state — swap the span text, not the button's, so the
      // NL/EN toggle keeps working afterwards.
      btn.querySelector('.nl-only').textContent = 'Verstuurd';
      btn.querySelector('.en-only').textContent = 'Sent';
      btn.classList.remove('is-sending');
      say('ok', 'is-ok');
      form.querySelectorAll('input, select, textarea').forEach((el) => { el.disabled = true; });
    } catch (err) {
      console.error('intake submit failed', err);
      btn.disabled = false;
      btn.classList.remove('is-sending');
      say('failed', 'is-error');
    } finally {
      clearTimeout(timer);
    }
  });
}
