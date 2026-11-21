const PRODUCTS = [
  {
    id: 'starter',
    name: 'Starter Kit',
    subtitle: '6 pods',
    price: 129,
    desc: 'Perfect for one room. Six hexagon scent pods for dogs home alone.',
    type: 'kit'
  },
  {
    id: 'explorer',
    name: 'Explorer Kit',
    subtitle: '10 pods &mdash; best for multi-room homes',
    price: 189,
    desc: 'Spread the hunt across your whole home. Ten scent pods.',
    type: 'kit',
    featured: true
  },
  {
    id: 'expansion',
    name: 'Expansion Pack',
    subtitle: '3 pods',
    price: 59,
    desc: 'Add three more scent pods to any kit.',
    type: 'addon'
  },
  {
    id: 'scent-citrus',
    name: 'Scent Refill Pack',
    subtitle: 'Citrus Meadow &mdash; 3 wicks (~3 months)',
    price: 14,
    desc: 'Refillable scent wicks. Choose your scent.',
    type: 'addon',
    scent: 'Citrus Meadow'
  },
  {
    id: 'scent-chicken',
    name: 'Scent Refill Pack',
    subtitle: 'Roast Chicken &mdash; 3 wicks (~3 months)',
    price: 14,
    desc: 'Refillable scent wicks. Choose your scent.',
    type: 'addon',
    scent: 'Roast Chicken'
  },
  {
    id: 'scent-peanut',
    name: 'Scent Refill Pack',
    subtitle: 'Peanut Butter &mdash; 3 wicks (~3 months)',
    price: 14,
    desc: 'Refillable scent wicks. Choose your scent.',
    type: 'addon',
    scent: 'Peanut Butter'
  }
];

const STATUS_TEXT = 'Pre-order &bull; Ships February 2027';

let cart = JSON.parse(localStorage.getItem('sniff_cart') || '[]');
let appliedCoupon = localStorage.getItem('sniff_coupon') || null;
let couponValid = null;

const productList = document.getElementById('product-list');
const cartCountEl = document.querySelector('.cart-count');
const cartItemsEl = document.getElementById('cart-items');
const cartDrawer = document.getElementById('cart-drawer');
const emptyCartMsg = document.getElementById('empty-cart-msg');
const sumSubtotal = document.getElementById('sum-subtotal');
const sumShipping = document.getElementById('sum-shipping');
const sumTotal = document.getElementById('sum-total');
const couponInput = document.getElementById('coupon-input');
const couponApply = document.getElementById('coupon-apply');
const couponMsg = document.getElementById('coupon-msg');
const checkoutBtn = document.getElementById('checkout-btn');

function saveCart() {
  localStorage.setItem('sniff_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const n = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = n;
}

function renderProducts() {
  if (!productList) return;
  productList.innerHTML = PRODUCTS.map(p => `
    <div class="product-card${p.featured ? '' : ''}">
      <div class="product-visual"></div>
      <h3>${p.name}</h3>
      <div class="price">$${p.price}</div>
      <div class="desc">${p.subtitle}&bull; ${p.desc}</div>
      <button class="add-btn" data-id="${p.id}">Add to Cart</button>
    </div>
  `).join('');
  productList.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      addToCart(e.target.dataset.id);
    });
  });
}

function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, name: p.name, price: p.price, qty: 1 });
  saveCart();
  renderCart();
  cartDrawer.style.display = 'flex';
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function getSubtotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function getShipping(subtotal) {
  return subtotal >= 100 ? 0 : 6.99;
}

function applyCouponCode(code) {
  if (!code || code.trim() === '') { appliedCoupon = null; couponValid = null; return; }
  const c = code.trim().toUpperCase();
  if (c === 'SNIFF10') { appliedCoupon = c; couponValid = true; }
  else { appliedCoupon = c; couponValid = false; }
  localStorage.setItem('sniff_coupon', appliedCoupon);
}

function getDiscount(subtotal) {
  if (!appliedCoupon || !couponValid) return 0;
  if (appliedCoupon === 'SNIFF10') return subtotal * 0.10;
  return 0;
}

function renderCart() {
  if (!cartItemsEl) return;
  cartItemsEl.innerHTML = '';
  if (cart.length === 0) {
    emptyCartMsg.style.display = 'block';
  } else {
    emptyCartMsg.style.display = 'none';
    cart.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="item-visual"></div>
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-qty">Qty: ${item.qty}</div>
        </div>
        <div class="item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <button class="item-remove" data-id="${item.id}">Remove</button>
      `;
      el.querySelector('.item-remove').addEventListener('click', () => removeFromCart(item.id));
      cartItemsEl.appendChild(el);
    });
  }
  updateTotals();
}

function updateTotals() {
  const subtotal = getSubtotal();
  const shipping = getShipping(subtotal);
  const discount = getDiscount(subtotal);
  const total = subtotal + shipping - discount;
  sumSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  sumShipping.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
  sumTotal.textContent = `$${total.toFixed(2)}`;

  if (couponMsg) {
    if (appliedCoupon && couponValid) {
      couponMsg.textContent = 'SNIFF10 applied &mdash; 10% off';
      couponMsg.className = 'coupon-msg success';
    } else if (appliedCoupon && !couponValid) {
      couponMsg.textContent = 'Invalid Code';
      couponMsg.className = 'coupon-msg error';
    } else {
      couponMsg.textContent = '';
    }
  }
}

// Apply coupon from storage on load
(function initCoupon() {
  if (appliedCoupon) {
    couponValid = (appliedCoupon === 'SNIFF10');
    if (couponInput) couponInput.value = appliedCoupon;
  }
})();

if (couponApply) {
  couponApply.addEventListener('click', () => {
    applyCouponCode(couponInput.value);
    renderCart();
  });
}

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    document.getElementById('checkout-modal').style.display = 'flex';
    const couponField = document.querySelector('input[name="coupon"]');
    if (couponField && appliedCoupon) couponField.value = appliedCoupon;
  });
}

// Cart drawer open/close
document.querySelectorAll('[data-nav="cart"]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    cartDrawer.style.display = 'flex';
  });
});
document.querySelector('.cart-close').addEventListener('click', () => {
  cartDrawer.style.display = 'none';
});

// Checkout form
const checkoutForm = document.getElementById('checkout-form');
const orderMsg = document.getElementById('order-msg');
const checkoutModal = document.getElementById('checkout-modal');
document.querySelector('.modal-close').addEventListener('click', () => {
  checkoutModal.style.display = 'none';
});
window.addEventListener('click', (e) => {
  if (e.target === checkoutModal) checkoutModal.style.display = 'none';
  if (e.target === cartDrawer) cartDrawer.style.display = 'none';
});

if (checkoutForm) {
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    orderMsg.textContent = '';
    const formData = new FormData(checkoutForm);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      address: formData.get('address'),
      coupon: formData.get('coupon') || undefined,
      items: cart,
      subtotal: getSubtotal(),
      shipping: getShipping(getSubtotal()),
      discount: getDiscount(getSubtotal()),
      total: getSubtotal() + getShipping(getSubtotal()) - getDiscount(getSubtotal())
    };
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        orderMsg.textContent = 'Order placed! We&rsquo;ll confirm your pre-order ships February 2027.';
        orderMsg.className = 'success';
        checkoutForm.reset();
        cart = [];
        appliedCoupon = null;
        couponValid = null;
        localStorage.removeItem('sniff_cart');
        localStorage.removeItem('sniff_coupon');
        saveCart();
        renderCart();
        setTimeout(() => { checkoutModal.style.display = 'none'; }, 1500);
      } else {
        orderMsg.textContent = (data && data.error) || 'Order failed. Try again.';
        orderMsg.className = 'error';
      }
    } catch (err) {
      orderMsg.textContent = 'Order failed. Try again.';
      orderMsg.className = 'error';
    }
  });
}

// Navigation
const navLinks = document.querySelectorAll('a[data-nav]');
const sections = document.querySelectorAll('section');
function showSection(name) {
  sections.forEach(sec => {
    sec.style.display = sec.id === name ? '' : 'none';
  });
  // Keep header/footer always visible
  document.querySelector('header').style.display = '';
  document.querySelector('footer').style.display = '';
  window.scrollTo(0, 0);
}
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const name = link.dataset.nav;
    if (name === 'cart') { e.preventDefault(); cartDrawer.style.display = 'flex'; return; }
    e.preventDefault();
    showSection(name);
    document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
  });
});

// Init
renderProducts();
renderCart();

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (navToggle) {
  navToggle.addEventListener('click', () => nav.classList.toggle('open'));
}
