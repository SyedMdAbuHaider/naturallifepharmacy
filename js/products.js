/**
 * products.js — loads data/products.json and renders the product grid.
 * To add a product: append an object to data/products.json and drop the
 * matching image into assets/products/. No HTML edits required.
 */
(function () {
  let PRODUCTS = [];
  const grid = document.getElementById('product-grid');

  const catIcons = {
    mosquito: '<ellipse cx="60" cy="46" rx="15" ry="20" fill="#15803D"/><path d="M60 66v34M46 78l-14 10M74 78l14 10M46 92l-14 10M74 92l14 10M46 40l-14-10M74 40l14-10" stroke="#15803D" stroke-width="4" stroke-linecap="round" opacity="0.85"/>',
    cockroach: '<ellipse cx="60" cy="70" rx="30" ry="17" fill="#15803D"/><path d="M38 58l-16-12M38 82l-16 12M82 58l16-12M82 82l16 12" stroke="#15803D" stroke-width="4" stroke-linecap="round" opacity="0.85"/>',
    ant: '<circle cx="60" cy="40" r="9" fill="#15803D"/><circle cx="60" cy="64" r="12" fill="#15803D"/><circle cx="60" cy="94" r="15" fill="#15803D"/><path d="M46 60l-18-10M74 60l18-10M44 96l-20 8M76 96l20 8" stroke="#15803D" stroke-width="4" stroke-linecap="round" opacity="0.85"/>',
    termite: '<path d="M30 100V56l30-20 30 20v44" fill="none" stroke="#15803D" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><rect x="46" y="76" width="28" height="24" fill="#15803D"/>',
    garden: '<path d="M60 100V56" stroke="#15803D" stroke-width="5" stroke-linecap="round"/><path d="M60 66c0-16 12-26 26-28-2 16-10 26-26 28Z" fill="#15803D"/><path d="M60 76c0-13-10-21-22-23 2 13 9 21 22 23Z" fill="#22C55E"/>',
    bedbug: '<ellipse cx="60" cy="66" rx="22" ry="26" fill="#15803D"/><circle cx="60" cy="38" r="9" fill="#15803D"/><path d="M40 56l-16-6M40 76l-16 6M80 56l16-6M80 76l16 6" stroke="#15803D" stroke-width="4" stroke-linecap="round" opacity="0.85"/>'
  };

  function fallbackIcon(catKey) {
    const shape = catIcons[catKey] || catIcons.mosquito;
    return `<svg viewBox="0 0 120 120" class="h-[58%] w-[58%]">${shape}</svg>`;
  }

  function productMedia(p, lang) {
    // p.image can be a local path (assets/products/xyz.webp) OR a full URL
    // from any external image host (imgbb, Cloudinary, imgur, etc.) — both
    // work identically since it's just an <img src="...">.
    if (!p.image) {
      return `<div class="relative flex items-center justify-center h-full w-full">${fallbackIcon(p.categoryKey)}</div>`;
    }
    const alt = (p.name[lang] || '').replace(/"/g, '&quot;');
    return `<img src="${p.image}" alt="${alt}" loading="lazy" class="product-img relative h-full w-full object-cover" data-cat="${p.categoryKey}">`;
  }

  function renderProducts(lang) {
    if (!grid || !PRODUCTS.length) return;
    grid.innerHTML = '';
    const addToCartText = lang === 'bn' ? 'অর্ডার করুন' : 'Order Now';
    const quickViewText = lang === 'bn' ? 'দ্রুত দেখুন' : 'Quick View';
    const outOfStockText = lang === 'bn' ? 'স্টক নেই' : 'Out of Stock';
    const currency = window.SITE_CONFIG.CURRENCY_SYMBOL;

    PRODUCTS.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'fade-up in-view card-hover group relative rounded-3xl bg-surface dark:bg-[#0E1A17] border border-black/5 dark:border-white/5 shadow-soft overflow-hidden';
      card.style.setProperty('--i', i % 4);
      const badgeColor = p.badgeType === 'primary' ? 'bg-primary' : 'bg-secondary';

      card.innerHTML = `
        <div class="relative aspect-[4/3.2] overflow-hidden bg-gradient-to-br from-primary/[0.08] via-white to-secondary/[0.10] dark:from-primary/15 dark:via-[#0E1A17] dark:to-secondary/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
          <div class="absolute inset-0 lab-grid opacity-50"></div>
          ${productMedia(p, lang)}
          ${p.badge ? `<span class="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white ${badgeColor}">${p.badge[lang]}</span>` : ''}
          ${!p.stock ? `<span class="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white bg-ink/70">${outOfStockText}</span>` : ''}
          <button type="button" class="quick-view-btn absolute inset-x-3 bottom-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 rounded-xl bg-ink/90 backdrop-blur text-white text-[12.5px] font-semibold py-2.5" data-id="${p.id}">${quickViewText}</button>
        </div>
        <div class="p-4 sm:p-5">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-primary">${p.category[lang]}</p>
          <h3 class="mt-1.5 font-display text-[15px] font-700 leading-snug text-ink dark:text-white">${p.name[lang]}</h3>
          <p class="mt-1 text-[12.5px] text-ink2 dark:text-gray-400 line-clamp-2">${p.description[lang]}</p>
          <div class="mt-2.5 flex items-center gap-1 text-accent">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 18.3 5.6 21.6 7 14.5 1.7 9.5l7.2-.9L12 2Z"/></svg>
            <span class="text-[12.5px] font-semibold text-ink dark:text-white">${p.rating}</span>
            <span class="text-[12px] text-ink2 dark:text-gray-500">(${p.reviews})</span>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <div class="flex items-baseline gap-2">
              <span class="text-[16px] font-800 font-display text-ink dark:text-white">${currency}${p.price}</span>
              ${p.oldPrice ? `<span class="text-[12.5px] text-ink2 dark:text-gray-500 line-through">${currency}${p.oldPrice}</span>` : ''}
            </div>
          </div>
          <button type="button" class="order-btn btn-press mt-4 w-full rounded-xl ${p.stock ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white' : 'bg-black/5 text-ink2 cursor-not-allowed'} font-semibold text-[13.5px] py-2.5 transition-colors" data-id="${p.id}" ${p.stock ? '' : 'disabled'}>
            ${p.stock ? addToCartText : outOfStockText}
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    // If an image URL 404s or fails to load, swap it for the category icon
    // instead of leaving a broken-image glyph.
    grid.querySelectorAll('.product-img').forEach(img => {
      img.addEventListener('error', () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'relative flex items-center justify-center h-full w-full';
        wrapper.innerHTML = fallbackIcon(img.dataset.cat);
        img.replaceWith(wrapper);
      }, { once: true });
    });

    // Wire up "Order Now" / "Quick View" buttons to the order modal
    grid.querySelectorAll('.order-btn, .quick-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = PRODUCTS.find(p => p.id === Number(btn.dataset.id));
        if (product && window.APP.openOrderModal) window.APP.openOrderModal(product);
      });
    });
  }

  async function loadProducts() {
    try {
      const res = await fetch('data/products.json');
      PRODUCTS = await res.json();
      window.APP.getProductById = (id) => PRODUCTS.find(p => p.id === id);
      renderProducts(window.APP.lang);
    } catch (err) {
      console.error('Failed to load products.json', err);
      if (grid) grid.innerHTML = '<p class="col-span-full text-center text-ink2">Could not load products.</p>';
    }
  }

  window.APP.registerRenderer(renderProducts);
  loadProducts();
})();
