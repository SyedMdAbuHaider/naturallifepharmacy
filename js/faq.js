/**
 * faq.js — loads data/faq.json and renders the accordion.
 */
(function () {
  let FAQS = [];
  const faqList = document.getElementById('faq-list');
  if (!faqList) return;

  function render(lang) {
    if (!FAQS.length) return;
    faqList.innerHTML = '';
    FAQS.forEach((f, i) => {
      const item = document.createElement('div');
      item.className = 'fade-up in-view rounded-2xl bg-surface dark:bg-[#0E1A17] border border-black/5 dark:border-white/5 shadow-soft overflow-hidden';
      item.style.setProperty('--i', i);
      item.innerHTML = `
        <button class="faq-trigger w-full flex items-center justify-between gap-4 px-6 py-5 text-left" aria-expanded="false">
          <span class="font-display font-700 text-[15px] text-ink dark:text-white">${f.q[lang]}</span>
          <svg class="faq-icon h-5 w-5 shrink-0 text-primary transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
        </button>
        <div class="accordion-panel px-6">
          <p class="pb-5 text-[14px] leading-relaxed text-ink2 dark:text-gray-400">${f.a[lang]}</p>
        </div>
      `;
      faqList.appendChild(item);
    });
  }

  faqList.addEventListener('click', (e) => {
    const trigger = e.target.closest('.faq-trigger');
    if (!trigger) return;
    const panel = trigger.nextElementSibling;
    const icon = trigger.querySelector('.faq-icon');
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    faqList.querySelectorAll('.faq-trigger').forEach(t => {
      t.setAttribute('aria-expanded', 'false');
      t.nextElementSibling.style.maxHeight = null;
      t.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
    });

    if (!isOpen) {
      trigger.setAttribute('aria-expanded', 'true');
      panel.style.maxHeight = panel.scrollHeight + 'px';
      icon.style.transform = 'rotate(45deg)';
    }
  });

  async function loadFaqs() {
    try {
      const res = await fetch('data/faq.json');
      FAQS = await res.json();
      render(window.APP.lang);
    } catch (err) {
      console.error('Failed to load faq.json', err);
    }
  }

  window.APP.registerRenderer(render);
  loadFaqs();
})();
