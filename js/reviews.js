/**
 * reviews.js — loads data/reviews.json and renders the testimonial cards.
 */
(function () {
  let REVIEWS = [];
  const root = document.getElementById('reviews-grid');
  if (!root) return;

  const avatarColors = ['#15803D', '#16A34A', '#22C55E', '#4ADE80'];
  const star = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 18.3 5.6 21.6 7 14.5 1.7 9.5l7.2-.9L12 2Z"/></svg>';

  function render(lang) {
    if (!REVIEWS.length) return;
    root.innerHTML = REVIEWS.map((r, i) => `
      <div class="fade-up in-view glass card-hover rounded-3xl p-7 shadow-soft" style="--i:${i}">
        <div class="flex gap-1 text-accent">${star.repeat(r.rating)}</div>
        <p class="mt-4 text-[14.5px] leading-relaxed text-ink dark:text-gray-300">${r.text[lang]}</p>
        <div class="mt-6 flex items-center gap-3">
          <svg class="h-11 w-11 rounded-full" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="22" fill="${avatarColors[i % avatarColors.length]}"/>
            <text x="22" y="28" text-anchor="middle" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#ffffff">${r.initials}</text>
          </svg>
          <div>
            <p class="text-[14px] font-semibold text-ink dark:text-white">${r.name[lang]}</p>
            <p class="text-[12.5px] text-ink2 dark:text-gray-400">${r.location[lang]}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  async function loadReviews() {
    try {
      const res = await fetch('data/reviews.json');
      REVIEWS = await res.json();
      render(window.APP.lang);
    } catch (err) {
      console.error('Failed to load reviews.json', err);
    }
  }

  window.APP.registerRenderer(render);
  loadReviews();
})();
