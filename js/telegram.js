/**
 * telegram.js — sends new orders to Telegram using the Bot API directly
 * from the browser. No server required, works fine on GitHub Pages.
 *
 * Setup (one time):
 *   1. Open Telegram, search for @BotFather, send /newbot, follow prompts.
 *   2. Copy the token BotFather gives you into js/config.js -> TELEGRAM_BOT_TOKEN.
 *   3. Send your new bot any message (e.g. "hi") so it can reply to you.
 *   4. Visit https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates in a browser,
 *      find "chat":{"id": 123456789, ...} and copy that id into
 *      js/config.js -> TELEGRAM_CHAT_ID.
 */
window.sendTelegramOrder = async function (order) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, CURRENCY_SYMBOL } = window.SITE_CONFIG;

  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN.startsWith('PASTE_')) {
    throw new Error('Telegram bot token is not configured in js/config.js');
  }

  const time = new Date().toLocaleString('en-GB', { hour12: true });
  const text = [
    '🛒 *New Order*',
    '',
    `*Product:* ${order.product.name[order.lang]}`,
    `*Quantity:* ${order.quantity}`,
    `*Total:* ${CURRENCY_SYMBOL}${order.total}`,
    '',
    `*Name:* ${order.name}`,
    `*Phone:* ${order.phone}`,
    `*District:* ${order.district}`,
    `*Address:* ${order.address}`,
    order.note ? `*Note:* ${order.note}` : null,
    '',
    `*Time:* ${time}`
  ].filter(Boolean).join('\n');

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'Markdown'
    })
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Telegram API error: ${errBody}`);
  }
  return res.json();
};
