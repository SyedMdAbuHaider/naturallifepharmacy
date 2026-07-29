/**
 * app.js — core site behavior.
 * Other modules (products.js, banner.js, faq.js, reviews.js, order.js)
 * register a render(lang) function on window.APP.renderers so that a
 * single language toggle can refresh every dynamic section at once.
 */
window.APP = {
  lang: 'bn',
  renderers: [], // functions of shape (lang) => void, called on language change
  registerRenderer(fn) {
    this.renderers.push(fn);
  }
};

function applyLanguage(lang) {
  window.APP.lang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-bn]').forEach(el => {
    const val = lang === 'bn' ? el.getAttribute('data-bn') : el.getAttribute('data-en');
    if (val !== null) el.textContent = val;
  });
  document.querySelectorAll('[data-bn-placeholder]').forEach(el => {
    const val = lang === 'bn' ? el.getAttribute('data-bn-placeholder') : el.getAttribute('data-en-placeholder');
    if (val !== null) el.setAttribute('placeholder', val);
  });

  window.APP.renderers.forEach(fn => fn(lang));

  document.querySelectorAll('.lang-toggle-label').forEach(el => {
    el.textContent = lang === 'bn' ? 'EN' : 'বাং';
  });
  const mobileToggleSpan = document.querySelector('#lang-toggle-mobile span');
  if (mobileToggleSpan) {
    mobileToggleSpan.textContent = lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন';
  }

  document.title = lang === 'bn'
    ? 'হোম সলিউশন — বিশ্বস্ত গৃহস্থালি পোকামাকড় সমাধান'
    : 'Home Solution — Trusted Household Pest Solutions';
}

document.addEventListener('DOMContentLoaded', () => {
  // ---- Language toggle ----
  const toggleBtn = document.getElementById('lang-toggle');
  const toggleBtnMobile = document.getElementById('lang-toggle-mobile');
  if (toggleBtn) toggleBtn.addEventListener('click', () => applyLanguage(window.APP.lang === 'bn' ? 'en' : 'bn'));
  if (toggleBtnMobile) toggleBtnMobile.addEventListener('click', () => applyLanguage(window.APP.lang === 'bn' ? 'en' : 'bn'));

  // ---- Mobile menu ----
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));
  }

  // ---- Dark mode ----
  const darkToggle = document.getElementById('dark-toggle');
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');
  function applyDark(isDark) {
    document.documentElement.classList.toggle('dark', isDark);
    if (iconSun) iconSun.classList.toggle('hidden', isDark);
    if (iconMoon) iconMoon.classList.toggle('hidden', !isDark);
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyDark(prefersDark);
  if (darkToggle) darkToggle.addEventListener('click', () => applyDark(!document.documentElement.classList.contains('dark')));

  // ---- Header scroll shadow ----
  const headerInner = document.getElementById('header-inner');
  if (headerInner) {
    window.addEventListener('scroll', () => {
      headerInner.classList.toggle('shadow-lift', window.scrollY > 24);
    });
  }

  // ---- Scroll reveal ----
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));
  // Re-run for elements injected later by other modules
  window.APP.observeReveal = (el) => revealObserver.observe(el);

  // ---- Animated counters ----
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.counter-num').forEach(el => counterObserver.observe(el));

  // Kick off initial render — modules have already registered themselves by now
  // because their <script> tags load before this DOMContentLoaded handler runs.
  applyLanguage('bn');
});

/**
 * Small toast helper used by order.js after a successful/failed submission.
 */
function showToast(message, isError = false) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3200);
}
