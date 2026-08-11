'use strict';
(function () {
  var btn = document.getElementById('lang-btn');
  if (!btn) return;

  var html = document.documentElement;
  var stored = localStorage.getItem('cadans-lang') || 'nl';
  applyLang(stored, false);

  btn.addEventListener('click', function () {
    var cur = html.classList.contains('lang-en') ? 'en' : 'nl';
    applyLang(cur === 'en' ? 'nl' : 'en', true);
  });

  function applyLang(lang, persist) {
    if (lang === 'en') {
      html.classList.add('lang-en');
      html.setAttribute('lang', 'en');
      btn.textContent = 'NL';
      btn.setAttribute('aria-label', 'Schakel naar Nederlands');
    } else {
      html.classList.remove('lang-en');
      html.setAttribute('lang', 'nl');
      btn.textContent = 'EN';
      btn.setAttribute('aria-label', 'Switch to English');
    }

    // Translate <select> options
    document.querySelectorAll('select option[data-nl]').forEach(function (opt) {
      opt.textContent = lang === 'en' ? opt.dataset.en : opt.dataset.nl;
    });

    // Translate placeholders via data-nl-ph / data-en-ph
    document.querySelectorAll('[data-nl-ph]').forEach(function (el) {
      el.placeholder = lang === 'en' ? (el.dataset.enPh || '') : (el.dataset.nlPh || '');
    });

    // Nav toggle aria-label
    var navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
      navToggle.setAttribute('aria-label', lang === 'en' ? 'Open menu' : 'Menu openen');
    }

    if (persist) localStorage.setItem('cadans-lang', lang);
  }
}());
