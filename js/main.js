const PRODUCTS = [
  { id: 'starter', name: 'Starter Kit', subtitle: '6 pods', price: 129, type: 'kit', desc: 'Perfect for one room. Six hexagon scent pods for dogs home alone.' },
  { id: 'explorer', name: 'Explorer Kit', subtitle: '10 pods  best for multi-room homes', price: 189, type: 'kit', desc: 'Spread the hunt across your whole home. Ten scent pods.', featured: true },
  { id: 'expansion', name: 'Expansion Pack', subtitle: '3 pods', price: 59, type: 'addon', desc: 'Add three more scent pods to any kit.' },
  { id: 'scent-citrus', name: 'Scent Refill Pack', subtitle: 'Citrus Meadow  3 wicks (~3 months)', price: 14, type: 'addon', desc: 'Refillable scent wicks. Choose your scent.' },
  { id: 'scent-chicken', name: 'Scent Refill Pack', subtitle: 'Roast Chicken  3 wicks (~3 months)', price: 14, type: 'addon', desc: 'Refillable scent wicks. Choose your scent.' },
  { id: 'scent-peanut', name: 'Scent Refill Pack', subtitle: 'Peanut Butter  3 wicks (~3 months)', price: 14, type: 'addon', desc: 'Refillable scent wicks. Choose your scent.' }
];

const STATUS_TEXT = 'Pre-order  Ships February 2027';

let cart = [];
let appliedCoupon = null;
let couponValid = null;

const STORAGE_KEY = 'sniff_cart_v1';
const COUPON_KEY = 'sniff_coupon_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cart = raw ? JSON.parse(raw) : [];
  } catch (e) { cart = []; }
  if (!Array.isArray(cart)) cart = [];
  try {
    const c = localStorage.getItem(COUPON_KEY);
    if (c) { appliedCoupon = c; couponValid = (c === 'SNIFF10'); }
  } catch (e) { appliedCoupon = null; couponValid = null; }
}
function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
  updateBadge();
}
function updateBadge() {
  const n = cart.reduce((s, i) => s + (i.qty || 1), 0);
  document.querySelectorAll('.cart-badge').forEach(el => { el.textContent = n; });
  document.querySelectorAll('.mobile-cart-count').forEach(el => { el.textContent = n; });
}
function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else cart.push({ id, name: p.name, price: p.price, qty: 1 });
  saveCart();
}
function removeFromCart(id) { cart = cart.filter(i => i.id !== id); saveCart(); }
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(0, (item.qty || 1) + delta);
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
}
function getSubtotal() { return cart.reduce((s, i) => s + i.price * (i.qty || 1), 0); }
function getShipping(s) { return s >= 100 ? 0 : 6.99; }
function applyCoupon(code) {
  if (!code || String(code).trim() === '') { appliedCoupon = null; couponValid = null; return; }
  const c = String(code).trim().toUpperCase();
  appliedCoupon = c;
  couponValid = (c === 'SNIFF10');
  try { localStorage.setItem(COUPON_KEY, appliedCoupon); } catch (e) {}
}
function getDiscount(s) {
  if (!appliedCoupon || !couponValid) return 0;
  if (appliedCoupon === 'SNIFF10') return s * 0.10;
  return 0;
}
function clearCoupon() { appliedCoupon = null; couponValid = null; try { localStorage.removeItem(COUPON_KEY); } catch (e) {} }

function formatMoney(n) { return '$' + Number(n || 0).toFixed(2); }

function renderCartPage() {
  const list = document.getElementById('cart-items-list');
  const empty = document.getElementById('cart-empty');
  const summary = document.getElementById('cart-summary');
  const checkoutForm = document.getElementById('checkout-form');
  const checkoutMsg = document.getElementById('checkout-msg');
  const couponInput = document.getElementById('coupon-input');
  const couponBtn = document.getElementById('coupon-apply');
  const couponMsg = document.getElementById('coupon-msg');
  if (!list) return;

  const subtotal = getSubtotal();
  const shipping = getShipping(subtotal);
  const discount = getDiscount(subtotal);
  const total = subtotal + shipping - discount;

  if (summary) {
    document.getElementById('cart-subtotal').textContent = formatMoney(subtotal);
    document.getElementById('cart-shipping').textContent = shipping === 0 ? 'Free' : formatMoney(shipping);
    document.getElementById('cart-discount').textContent = discount > 0 ? '-' + formatMoney(discount) : '$0.00';
    document.getElementById('cart-total').textContent = formatMoney(total);
  }
  if (couponMsg) {
    if (appliedCoupon && couponValid) { couponMsg.textContent = 'SNIFF10 applied 10% off subtotal'; couponMsg.className = 'coupon-msg success'; if (couponInput) couponInput.value = appliedCoupon; }
    else if (appliedCoupon && !couponValid) { couponMsg.textContent = 'Invalid Code'; couponMsg.className = 'coupon-msg error'; if (couponInput) couponInput.value = appliedCoupon; }
    else { couponMsg.textContent = ''; }
  }

  list.innerHTML = '';
  if (cart.length === 0) {
    if (empty) empty.style.display = 'block';
    if (summary) summary.style.display = 'none';
    if (checkoutForm) checkoutForm.style.display = 'none';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (summary) summary.style.display = 'block';
  if (checkoutForm) checkoutForm.style.display = 'block';

  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    const metaText = item.meta && item.meta.variant ? escapeHtml(item.meta.variant) : '';
    const lineTotal = item.price * (item.qty || 1);
    el.innerHTML = `
      <div class="image-placeholder">${escapeHtml(item.id)}</div>
      <div class="info">
        <div class="name">${escapeHtml(item.name)}</div>
        ${metaText ? '<div class="meta">' + metaText + '</div>' : ''}
      </div>
      <div class="price-col"><span class="unit-price">${formatMoney(item.price)}</span><span class="line-total">${formatMoney(lineTotal)}</span></div>
      <div class="qty-row">
        <button class="qty-btn" data-id="${escapeHtml(item.id)}" data-delta="-1">&#8722;</button>
        <span class="qty-val">${item.qty || 1}</span>
        <button class="qty-btn" data-id="${escapeHtml(item.id)}" data-delta="1">&#43;</button>
      </div>
      <button class="remove" data-id="${escapeHtml(item.id)}" aria-label="Remove">&#10005;</button>
    `;
    list.appendChild(el);
  });

  const btnCheckout = document.getElementById('btn-checkout');
  if (btnCheckout) {
    btnCheckout.disabled = cart.length === 0;
    btnCheckout.onclick = () => { if (cart.length) { location.href = 'cart.html'; } };
  }

  list.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, parseInt(btn.dataset.delta, 10)));
  });
  list.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', () => { removeFromCart(btn.dataset.id); renderCartPage(); });
  });
}

function renderProductGrid(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = PRODUCTS.map(p => `
    <div class="product-card${p.featured ? ' product-featured' : ''}">
      ${p.featured ? '<div class="product-badge">Best for multi-room</div>' : ''}
      <div class="image-placeholder">${escapeHtml(p.id)}</div>
      <h3>${escapeHtml(p.name)}</h3>
      <div class="subtitle">${escapeHtml(p.subtitle)}</div>
      <div class="price">${formatMoney(p.price)}</div>
      <div class="desc">${escapeHtml(p.desc)}</div>
      <button class="add-btn" data-id="${escapeHtml(p.id)}">Add to Cart</button>
    </div>
  `).join('');
  container.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => { addToCart(btn.dataset.id); });
  });
}

function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }

function initShared() {
  loadCart();
  updateBadge();

  const grids = document.querySelectorAll('[data-product-grid]');
  grids.forEach(g => renderProductGrid(g.id));

  const mobileCartCount = document.querySelector('.mobile-cart-count');
  if (mobileCartCount) mobileCartCount.textContent = cart.reduce((s, i) => s + (i.qty || 1), 0);

  // Mobile nav
  const hamburger = document.querySelector('.hamburger');
  const mobileClose = document.querySelector('.mobile-close');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));
  if (mobileClose && mobileNav) mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
  document.querySelectorAll('.mobile-nav a').forEach(a => {
    a.addEventListener('click', () => { const n = document.querySelector('.mobile-nav'); if (n) n.classList.remove('open'); });
  });

  // Highlight active nav link by page
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && page === href.split('/').pop()) a.classList.add('active');
  });

  // Newsletter
  const nlForm = document.getElementById('newsletter-form');
  if (nlForm) {
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.getElementById('newsletter-msg');
      const email = nlForm.querySelector('input[type="email"]');
      if (!email || !email.value.includes('@')) {
        if (msg) { msg.textContent = 'Please enter a valid email.'; msg.className = 'newsletter-msg error'; }
        return;
      }
      if (msg) { msg.textContent = 'Thanks! You’ll hear when SniffScape ships in February 2027.'; msg.className = 'newsletter-msg success'; }
      nlForm.reset();
    });
  }
}

// Expose cart helpers for page-specific scripts
window.sniffCart = {
  add(id, name, price, qty = 1, meta = {}) {
    const existing = cart.find((i) => i.id === id);
    if (existing) existing.qty = (existing.qty || 1) + qty;
    else cart.push({ id, name, price, qty, meta: meta || {} });
    saveCart();
    return cart;
  },
  get() {
    return cart;
  },
  count() {
    return cart.reduce((s, i) => s + (i.qty || 1), 0);
  },
  applyCoupon(code) {
    applyCoupon(code);
  },
  clearCoupon() {
    clearCoupon();
  },
};

document.addEventListener('DOMContentLoaded', initShared);
