/**
 * order.js — handles the order modal (open, close, submit)
 * Works with telegram.js for sending order notifications.
 */
(function () {
  'use strict';

  let currentProduct = { name: '', price: '' };
  let currentQuantity = 1;
  let cartContext = null; // set when the modal is opened from the cart (holds cartItems, totals, etc.)

  /* ---------- create modal if not present ---------- */
  function createModal() {
    if (document.getElementById('order-modal-backdrop')) return;

    const modal = document.createElement('div');
    modal.id = 'order-modal-backdrop';
    modal.className = 'order-modal-backdrop';
    modal.innerHTML = `
      <div class="order-modal">
        <div style="padding:24px 24px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--pharmacy-border)">
          <h3 class="font-display text-lg font-700 text-[var(--pharmacy-ink)] dark:text-white">অর্ডার ফর্ম</h3>
          <button id="close-order-modal" style="height:32px;width:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:none;background:transparent;cursor:pointer;color:var(--pharmacy-ink-light)">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
          </button>
        </div>
        <form id="order-form" style="padding:20px 24px 24px;display:flex;flex-direction:column;gap:16px">
          <div class="order-field">
            <label>পণ্য</label>
            <input type="text" id="order-product-name" readonly style="background:#f0faf8;font-weight:600;color:var(--pharmacy-teal)">
          </div>
          <div class="order-field" id="qty-field-wrapper">
            <label>পরিমাণ</label>
            <div class="qty-stepper">
              <button type="button" id="qty-minus">−</button>
              <input type="number" id="qty-input" value="1" min="1" max="20" readonly>
              <button type="button" id="qty-plus">+</button>
            </div>
          </div>
          <div class="order-field">
            <label>মোট মূল্য</label>
            <input type="text" id="order-total" readonly style="font-weight:700;font-size:18px;color:var(--pharmacy-teal)">
          </div>
          <div class="order-field">
            <label>আপনার নাম *</label>
            <input type="text" id="order-name" required placeholder="আপনার নাম লিখুন">
          </div>
          <div class="order-field">
            <label>ফোন নম্বর *</label>
            <input type="tel" id="order-phone" required placeholder="০১XXXXXXXXX">
          </div>
          <div class="order-field">
            <label>জেলা *</label>
            <select id="order-district" required>
              <option value="">জেলা নির্বাচন করুন</option>
              ${(window.SITE_CONFIG?.DISTRICTS || ['Dhaka']).map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
          </div>
          <div class="order-field">
            <label>ঠিকানা *</label>
            <textarea id="order-address" required placeholder="বিস্তারিত ঠিকানা লিখুন" rows="3"></textarea>
          </div>
          <div class="order-field">
            <label>অতিরিক্ত মন্তব্য</label>
            <textarea id="order-note" placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন" rows="2"></textarea>
          </div>
          <button type="submit" class="btn-press pharmacy-gradient" style="width:100%;padding:14px;border-radius:14px;border:none;font-size:15px;font-weight:700;color:#fff;cursor:pointer">
            অর্ডার কনফার্ম করুন →
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('close-order-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });

    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const qtyInput = document.getElementById('qty-input');

    qtyMinus.addEventListener('click', () => updateQty(-1));
    qtyPlus.addEventListener('click', () => updateQty(1));

    document.getElementById('order-form').addEventListener('submit', handleSubmit);
  }

  function updateQty(delta) {
    if (cartContext) return; // whole-cart order — quantities are already fixed per item
    currentQuantity = Math.max(1, Math.min(20, currentQuantity + delta));
    document.getElementById('qty-input').value = currentQuantity;
    updateTotal();
  }

  function updateTotal() {
    if (cartContext) return; // total is already computed by the cart
    const price = parseFloat(currentProduct.price.replace(/[^0-9.]/g, ''));
    const total = price * currentQuantity;
    document.getElementById('order-total').value = window.SITE_CONFIG.CURRENCY_SYMBOL + total;
  }

  function openModal(productName, productPrice, extra) {
    createModal();
    cartContext = (extra && extra.cartItems) ? extra : null;
    currentProduct = { name: productName, price: productPrice };
    currentQuantity = 1;

    document.getElementById('order-product-name').value = productName;

    const qtyWrapper = document.getElementById('qty-field-wrapper');
    if (cartContext) {
      qtyWrapper.style.display = 'none';
      document.getElementById('order-total').value = productPrice; // already the grand total from the cart
      if (cartContext.district) document.getElementById('order-district').value = cartContext.district;
    } else {
      qtyWrapper.style.display = '';
      document.getElementById('qty-input').value = 1;
      updateTotal();
    }

    document.getElementById('order-modal-backdrop').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('order-modal-backdrop')?.classList.remove('open');
    document.body.style.overflow = '';
    cartContext = null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'অর্ডার প্রসেস হচ্ছে...';

    const baseFields = {
      name: document.getElementById('order-name').value,
      phone: document.getElementById('order-phone').value,
      district: document.getElementById('order-district').value,
      address: document.getElementById('order-address').value,
      note: document.getElementById('order-note').value,
      lang: document.documentElement.lang === 'en' ? 'en' : 'bn'
    };

    const order = cartContext ? {
      isCart: true,
      items: cartContext.cartItems,
      itemsTotal: cartContext.itemsTotal,
      deliveryCharge: cartContext.deliveryCharge,
      freeDelivery: cartContext.freeDelivery,
      grandTotal: cartContext.grandTotal,
      total: document.getElementById('order-total').value,
      ...baseFields
    } : {
      product: { name: { bn: currentProduct.name, en: currentProduct.name } },
      quantity: currentQuantity,
      total: document.getElementById('order-total').value,
      ...baseFields
    };

    try {
      if (typeof window.sendTelegramOrder === 'function') {
        await window.sendTelegramOrder(order);
      }
      showToast('অর্ডার সফলভাবে পাঠানো হয়েছে!');
      if (cartContext && typeof window.clearCart === 'function') window.clearCart();
      closeModal();
      e.target.reset();
    } catch (err) {
      showToast('অর্ডার পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', true);
      console.error('Order error:', err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'অর্ডার কনফার্ম করুন →';
    }
  }

  function showToast(message, isError = false) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast show' + (isError ? ' error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // Expose globally
  window.openOrderModal = openModal;
})();
