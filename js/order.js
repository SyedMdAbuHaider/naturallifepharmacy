/**
 * order.js — the "Buy Now" popup. Injects itself into the DOM once,
 * then is opened by products.js via window.APP.openOrderModal(product).
 * On submit, it hands the order off to telegram.js.
 */
(function () {
  let currentProduct = null;
  let backdrop, form;

  const copy = {
    bn: {
      title: 'অর্ডার নিশ্চিত করুন', name: 'নাম', phone: 'ফোন নম্বর', address: 'সম্পূর্ণ ঠিকানা',
      district: 'জেলা', quantity: 'পরিমাণ', note: 'নোট (ঐচ্ছিক)', notePlaceholder: 'বিশেষ কোনো নির্দেশনা থাকলে লিখুন',
      confirm: 'অর্ডার নিশ্চিত করুন', cancel: 'বাতিল', total: 'সর্বমোট', sending: 'পাঠানো হচ্ছে…',
      success: 'অর্ডার সফলভাবে পাঠানো হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।',
      failure: 'অর্ডার পাঠাতে সমস্যা হয়েছে। দয়া করে সরাসরি কল করুন।',
      required: 'দয়া করে সব প্রয়োজনীয় ঘর পূরণ করুন।'
    },
    en: {
      title: 'Confirm Your Order', name: 'Full Name', phone: 'Phone Number', address: 'Full Address',
      district: 'District', quantity: 'Quantity', note: 'Note (optional)', notePlaceholder: 'Any special instructions',
      confirm: 'Confirm Order', cancel: 'Cancel', total: 'Total', sending: 'Sending…',
      success: 'Order sent successfully! We will contact you shortly.',
      failure: 'Could not send the order. Please call us directly.',
      required: 'Please fill in all required fields.'
    }
  };

  function buildModal() {
    backdrop = document.createElement('div');
    backdrop.className = 'order-modal-backdrop';
    backdrop.id = 'order-modal-backdrop';
    backdrop.innerHTML = `
      <div class="order-modal shadow-lift" role="dialog" aria-modal="true" aria-labelledby="order-modal-title">
        <div class="p-6 sm:p-7">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 id="order-modal-title" class="font-display text-xl font-800 text-ink dark:text-white" data-modal-title></h3>
              <p id="order-modal-product-name" class="mt-1 text-[13.5px] text-primary font-semibold"></p>
            </div>
            <button type="button" id="order-modal-close" aria-label="Close" class="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-ink2 hover:bg-black/5 dark:hover:bg-white/10 dark:text-gray-300">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18" stroke-linecap="round"/></svg>
            </button>
          </div>

          <form id="order-form" class="mt-6 space-y-4">
            <div class="order-field">
              <label for="order-name" data-field="name"></label>
              <input id="order-name" name="name" type="text" required autocomplete="name">
            </div>
            <div class="order-field">
              <label for="order-phone" data-field="phone"></label>
              <input id="order-phone" name="phone" type="tel" required autocomplete="tel" placeholder="01XXXXXXXXX">
            </div>
            <div class="order-field">
              <label for="order-address" data-field="address"></label>
              <textarea id="order-address" name="address" rows="2" required></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="order-field">
                <label for="order-district" data-field="district"></label>
                <select id="order-district" name="district" required></select>
              </div>
              <div class="order-field">
                <label data-field="quantity"></label>
                <div class="qty-stepper">
                  <button type="button" id="qty-minus" aria-label="Decrease quantity">−</button>
                  <input id="order-qty" name="quantity" type="number" min="1" value="1" readonly>
                  <button type="button" id="qty-plus" aria-label="Increase quantity">+</button>
                </div>
              </div>
            </div>
            <div class="order-field">
              <label for="order-note" data-field="note"></label>
              <textarea id="order-note" name="note" rows="2" data-field-placeholder="note"></textarea>
            </div>

            <div class="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
              <span class="text-[13.5px] font-semibold text-ink2 dark:text-gray-400" data-field="total"></span>
              <span id="order-total-amount" class="text-[17px] font-800 font-display text-primary"></span>
            </div>

            <div class="flex gap-3 pt-1">
              <button type="button" id="order-modal-cancel" class="btn-press flex-1 rounded-xl px-5 py-3 text-[14.5px] font-semibold text-ink dark:text-white border border-black/10 dark:border-white/15" data-field="cancel"></button>
              <button type="submit" id="order-submit-btn" class="btn-press flex-1 rounded-xl bg-primary px-5 py-3 text-[14.5px] font-semibold text-white shadow-soft" data-field="confirm"></button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    form = backdrop.querySelector('#order-form');

    backdrop.querySelector('#order-modal-close').addEventListener('click', closeModal);
    backdrop.querySelector('#order-modal-cancel').addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && backdrop.classList.contains('open')) closeModal(); });

    backdrop.querySelector('#qty-minus').addEventListener('click', () => stepQty(-1));
    backdrop.querySelector('#qty-plus').addEventListener('click', () => stepQty(1));

    form.addEventListener('submit', handleSubmit);
  }

  function stepQty(delta) {
    const input = backdrop.querySelector('#order-qty');
    const next = Math.max(1, parseInt(input.value || '1', 10) + delta);
    input.value = next;
    updateTotal();
  }

  function updateTotal() {
    if (!currentProduct) return;
    const qty = parseInt(backdrop.querySelector('#order-qty').value || '1', 10);
    const total = currentProduct.price * qty;
    backdrop.querySelector('#order-total-amount').textContent = `${window.SITE_CONFIG.CURRENCY_SYMBOL}${total}`;
  }

  function fillDistricts(lang) {
    const select = backdrop.querySelector('#order-district');
    select.innerHTML = window.SITE_CONFIG.DISTRICTS.map(d => `<option value="${d}">${d}</option>`).join('');
  }

  function applyModalCopy(lang) {
    const c = copy[lang];
    backdrop.querySelector('[data-modal-title]').textContent = c.title;
    backdrop.querySelectorAll('[data-field]').forEach(el => {
      const key = el.getAttribute('data-field');
      el.textContent = c[key];
    });
    backdrop.querySelectorAll('[data-field-placeholder]').forEach(el => {
      const key = el.getAttribute('data-field-placeholder');
      el.setAttribute('placeholder', c[key + 'Placeholder'] || '');
    });
    backdrop.querySelector('#order-submit-btn').textContent = c.confirm;
    fillDistricts(lang);
  }

  function openModal(product) {
    if (!backdrop) buildModal();
    currentProduct = product;
    const lang = window.APP.lang;
    applyModalCopy(lang);
    backdrop.querySelector('#order-modal-product-name').textContent = product.name[lang];
    backdrop.querySelector('#order-qty').value = 1;
    form.reset();
    fillDistricts(lang);
    updateTotal();
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const lang = window.APP.lang;
    const c = copy[lang];
    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.name || !data.phone || !data.address || !data.district) {
      showToast(c.required, true);
      return;
    }

    const submitBtn = backdrop.querySelector('#order-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = c.sending;

    const order = {
      product: currentProduct,
      name: data.name,
      phone: data.phone,
      address: data.address,
      district: data.district,
      quantity: parseInt(data.quantity, 10) || 1,
      note: data.note || '',
      total: currentProduct.price * (parseInt(data.quantity, 10) || 1),
      lang
    };

    try {
      await window.sendTelegramOrder(order);
      showToast(c.success);
      closeModal();
    } catch (err) {
      console.error('Order send failed', err);
      showToast(c.failure, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  window.APP.openOrderModal = openModal;
  window.APP.registerRenderer((lang) => { if (backdrop) applyModalCopy(lang); });
})();
