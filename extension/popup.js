/**
 * @file extension/popup.js
 * @description GoCoupon toolbar popup logic.
 * Queries the active tab domain, fetches coupon count from background cache,
 * and wires the "Find Coupons" button to open the in-page coupon panel.
 */

const SUPPORTED_DOMAINS = [
  'amazon.in','amazon.com','flipkart.com','walmart.com',
  'bestbuy.com','croma.com','myntra.com','meesho.com','nykaa.com','ajio.com'
];

async function init() {
  let tab = null;
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tab = activeTab;
  } catch {}

  const domainLabel = document.getElementById('domainLabel');
  const domainSpan  = document.getElementById('currentDomain');
  const couponEl    = document.getElementById('couponCount');
  const dealsEl     = document.getElementById('totalDeals');
  const findBtn     = document.getElementById('findBtn');
  const noMatch     = document.getElementById('noMatchMsg');

  if (!tab || !tab.url) {
    domainLabel.textContent = 'No active page';
    findBtn.disabled = true;
    return;
  }

  let hostname = '';
  try {
    hostname = new URL(tab.url).hostname.replace(/^www\./, '');
  } catch {
    domainLabel.textContent = 'Invalid URL';
    findBtn.disabled = true;
    return;
  }

  const isSupported = SUPPORTED_DOMAINS.some(d => hostname.endsWith(d));

  domainLabel.textContent = isSupported ? 'Active store:' : 'Browsing:';
  domainSpan.textContent = hostname;

  if (!isSupported) {
    noMatch.style.display = 'block';
    findBtn.disabled = true;
    couponEl.textContent = '0';
    couponEl.style.background = 'none';
    couponEl.style.webkitTextFillColor = '#5a5e73';
  } else {
    // Ask background service worker for cached coupon count
    try {
      const resp = await chrome.runtime.sendMessage({ type: 'GET_COUPON_COUNT', domain: hostname });
      const count = resp?.count ?? 0;
      couponEl.textContent = count > 0 ? String(count) : '—';
      if (count === 0) couponEl.textContent = 'Tap ↓';
    } catch {
      couponEl.textContent = '—';
    }
  }

  // Fetch total deals count from DB for the stat card
  try {
    const r = await fetch('https://gocoupon.io/api/deals/stats');
    if (r.ok) {
      const d = await r.json();
      if (d.totalDeals > 0) dealsEl.textContent = d.totalDeals.toLocaleString();
    }
  } catch {}

  // Find button → send message to content.js to open the coupon panel
  findBtn.addEventListener('click', async () => {
    if (!tab?.id) return;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'OPEN_COUPON_PANEL' });
    } catch {
      // content.js may not be injected yet; inject it manually
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js'],
        });
        await chrome.tabs.sendMessage(tab.id, { type: 'OPEN_COUPON_PANEL' });
      } catch {}
    }
    window.close();
  });
}

init();
