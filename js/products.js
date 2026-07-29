/**
 * products.js — loads products from data/products.json
 * Renders them in #product-grid AND populates the why-choose-us slideshow.
 */
(function () {
  'use strict';

  const PRODUCT_GRID_ID = 'product-grid';
  const SLIDESHOW_TRACK_ID = 'whySlidesTrack';
  const SLIDESHOW_DOTS_ID = 'whySlideshowDots';

  let currentSlideshowIndex = 0;
  let slideshowInterval = null;

  /* ---------- helpers ---------- */
  function getLang() {
    return document.documentElement.lang === 'en' ? 'en' : 'bn';
  }

  function starRating(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      '★'.repeat(full) +
      (half ? '½' : '') +
      '☆'.repeat(empty)
    );
  }

  /* ---------- render product card ---------- */
  function renderProductCard(product, index) {
    const lang = getLang();
    const card = document.createElement('div');
    card.className = 'fade-up product-card';
    card.style.setProperty('--i', index);

    const badgeHtml = product.badge
      ? `<span class="product-badge${product.badgeType === 'primary' ? ' pharmacy-gradient' : ' pharmacy-gold-gradient'}">${product.badge[lang]}</span>`
      : '';

    const oldPriceHtml = product.oldPrice
      ? `<span style="text-decoration:line-through;color:#94A3B8;font-size:13px;margin-left:6px">${window.SITE_CONFIG.CURRENCY_SYMBOL}${product.oldPrice}</span>`
      : '';

    card.innerHTML = `
      <div class="product-img-wrapper">
        ${badgeHtml}
        <img src="${product.image}" alt="${product.name[lang]}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27300%27 height=%27300%27%3E%3Crect fill=%27%23e8f5f0%27 width=%27300%27 height=%27300%27/%3E%3Ctext x=%27150%27 y=%27160%27 text-anchor=%27middle%27 font-size=%2716%27 fill=%27%230F766E%27%3E${encodeURIComponent(product.name[lang])}%3C/text%3E%3C/svg%3E'">
      </div>
      <div class="product-info">
        <h3 class="font-display text-[15px] font-700 text-[var(--pharmacy-ink)] dark:text-white leading-snug">${product.name[lang]}</h3>
        <p class="text-[11px] text-[var(--pharmacy-ink-light)] dark:text-[#94A3B8] mt-0.5">${product.category[lang]}</p>
        <div style="display:flex;align-items:center;gap:4px;margin-top:6px">
          <span style="color:#f59e0b;font-size:13px">${starRating(product.rating)}</span>
          <span style="font-size:11px;color:#94A3B8">(${product.reviews})</span>
        </div>
        <p class="mt-2 text-[16px] font-800 text-[var(--pharmacy-teal)]">
          ${window.SITE_CONFIG.CURRENCY_SYMBOL}${product.price}
          ${oldPriceHtml}
        </p>
      </div>
      <div class="product-actions">
        <button class="btn-buy btn-press order-trigger" data-product='${JSON.stringify({name:product.name[lang],price:window.SITE_CONFIG.CURRENCY_SYMBOL+product.price,id:product.id})}'>
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.4 18H18a2 2 0 0 0 2-1.6L21.5 8H6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="21" r="1.4"/><circle cx="17.5" cy="21" r="1.4"/></svg>
          কিনুন
        </button>
        <button class="btn-details order-trigger" data-product='${JSON.stringify({name:product.name[lang],price:window.SITE_CONFIG.CURRENCY_SYMBOL+product.price,id:product.id})}' title="Details">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12c2-4 6-6 9-6s7 2 9 6c-2 4-6 6-9 6s-7-2-9-6Z" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.8"/></svg>
        </button>
      </div>
    `;
    return card;
  }

  /* ---------- attach order modal triggers ---------- */
  function attachOrderTriggers() {
    document.querySelectorAll('.order-trigger').forEach(btn => {
      btn.addEventListener('click', function () {
        const productData = JSON.parse(this.getAttribute('data-product'));
        if (typeof window.openOrderModal === 'function') {
          window.openOrderModal(productData.name, productData.price);
        } else {
          const toast = document.createElement('div');
          toast.className = 'toast show';
          toast.textContent = 'অর্ডার ফিচার শীঘ্রই আসছে! — ' + productData.name;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }
      });
    });
  }

  /* ---------- populate why-choose-us slideshow ---------- */
  function populateSlideshow(products) {
    const track = document.getElementById(SLIDESHOW_TRACK_ID);
    const dotsContainer = document.getElementById(SLIDESHOW_DOTS_ID);
    if (!track || !dotsContainer || products.length === 0) return;

    track.innerHTML = '';
    dotsContainer.innerHTML = '';
    const lang = getLang();

    products.forEach((product, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.innerHTML = `
        <img src="${product.image}" alt="${product.name[lang]}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27600%27 height=%27750%27%3E%3Crect fill=%27%23e8f5f0%27 width=%27600%27 height=%27750%27/%3E%3Ctext x=%27300%27 y=%27375%27 text-anchor=%27middle%27 font-size=%2718%27 fill=%27%230F766E%27%3E${encodeURIComponent(product.name[lang])}%3C/text%3E%3C/svg%3E'">
        <div class="slide-overlay">
          <p class="slide-title">${product.name[lang]}</p>
          <p class="slide-category">${product.category[lang]} — ${window.SITE_CONFIG.CURRENCY_SYMBOL}${product.price}</p>
        </div>
      `;
      track.appendChild(slide);

      const dot = document.createElement('button');
      dot.className = 'why-slideshow-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('data-index', i);
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dotsContainer.appendChild(dot);
    });

    initSlideshowControls(products.length);
  }

  /* ---------- slideshow navigation ---------- */
  function initSlideshowControls(totalSlides) {
    const track = document.getElementById(SLIDESHOW_TRACK_ID);
    if (!track || totalSlides === 0) return;

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentSlideshowIndex = index;
      track.style.transform = `translateX(-${currentSlideshowIndex * 100}%)`;

      document.querySelectorAll('#whySlideshowDots .why-slideshow-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlideshowIndex);
      });
    }

    function nextSlide() { goToSlide(currentSlideshowIndex + 1); }
    function prevSlide() { goToSlide(currentSlideshowIndex - 1); }

    function startAutoPlay() {
      stopAutoPlay();
      if (totalSlides > 1) slideshowInterval = setInterval(nextSlide, 3500);
    }

    function stopAutoPlay() {
      if (slideshowInterval) { clearInterval(slideshowInterval); slideshowInterval = null; }
    }

    document.getElementById('whySlideshowPrev')?.addEventListener('click', () => { prevSlide(); startAutoPlay(); });
    document.getElementById('whySlideshowNext')?.addEventListener('click', () => { nextSlide(); startAutoPlay(); });

    document.querySelectorAll('#whySlideshowDots .why-slideshow-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(idx)) { goToSlide(idx); startAutoPlay(); }
      });
    });

    const container = document.getElementById('whySlideshow');
    if (container) {
      container.addEventListener('mouseenter', stopAutoPlay);
      container.addEventListener('mouseleave', startAutoPlay);
    }

    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); startAutoPlay(); }
    }, { passive: true });

    startAutoPlay();
  }

  /* ---------- load products ---------- */
  async function loadProducts() {
    const grid = document.getElementById(PRODUCT_GRID_ID);
    if (!grid) return;

    try {
      const res = await fetch('data/products.json');
      if (!res.ok) throw new Error('Failed to load products');
      const products = await res.json();

      grid.innerHTML = '';
      products.forEach((product, i) => {
        grid.appendChild(renderProductCard(product, i));
      });

      // Trigger animations
      setTimeout(() => {
        grid.querySelectorAll('.fade-up').forEach(el => el.classList.add('in-view'));
      }, 50);

      attachOrderTriggers();
      populateSlideshow(products);

    } catch (err) {
      console.error('Product load error:', err);
      grid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-[var(--pharmacy-ink-light)]">পণ্য লোড করতে সমস্যা হচ্ছে।</p>
        </div>
      `;
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProducts);
  } else {
    loadProducts();
  }
})();
