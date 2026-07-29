/**
 * banner.js — hero image slider. Reads data/banners.json.
 * To change slides: edit the JSON and drop matching images in assets/banners/.
 */
(function () {
  let BANNERS = [];
  let current = 0;
  let timer = null;
  const root = document.getElementById('hero-banner');
  if (!root) return;

  function render(lang) {
    if (!BANNERS.length) return;
    root.innerHTML = `
      <div class="banner-slider shadow-lift">
        ${BANNERS.map((b, i) => `
          <div class="banner-slide ${i === current ? 'active' : ''}" style="background-image:url('${b.image}')" data-index="${i}">
            <div class="banner-slide-overlay">
              <p class="font-display text-xl sm:text-2xl font-800">${b.headline[lang]}</p>
              <p class="mt-1 text-[13.5px] text-white/80">${b.subtext[lang]}</p>
            </div>
          </div>
        `).join('')}
        <button type="button" class="banner-arrow prev" aria-label="Previous slide">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 6-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button type="button" class="banner-arrow next" aria-label="Next slide">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="banner-dots">
          ${BANNERS.map((_, i) => `<span class="banner-dot ${i === current ? 'active' : ''}" data-index="${i}"></span>`).join('')}
        </div>
      </div>
    `;

    root.querySelector('.prev').addEventListener('click', () => goTo(current - 1));
    root.querySelector('.next').addEventListener('click', () => goTo(current + 1));
    root.querySelectorAll('.banner-dot').forEach(dot => {
      dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
    });

    // Swipe support
    let touchStartX = 0;
    root.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  function goTo(index) {
    current = (index + BANNERS.length) % BANNERS.length;
    root.querySelectorAll('.banner-slide').forEach((el, i) => el.classList.toggle('active', i === current));
    root.querySelectorAll('.banner-dot').forEach((el, i) => el.classList.toggle('active', i === current));
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), window.SITE_CONFIG.BANNER_INTERVAL_MS);
  }

  async function loadBanners() {
    try {
      const res = await fetch('data/banners.json');
      BANNERS = await res.json();
      render(window.APP.lang);
      resetTimer();
    } catch (err) {
      console.error('Failed to load banners.json', err);
    }
  }

  window.APP.registerRenderer(render);
  loadBanners();
})();
