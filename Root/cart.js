// cart.js
const CART_KEY = "ice_cart_v1";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "{}");
}

function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// 加入購物車
function addToCart(name, price, qty) {
  const cart = getCart();
  const p = Number(price);
  const q = Math.max(1, Number(qty) || 1);

  if (!cart[name]) cart[name] = { price: p, qty: 0 };
  cart[name].price = p;
  cart[name].qty += q;

  setCart(cart);
  updateBadge();
}

// 更新右上角 badge 數量（跨頁共用）
function updateBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;

  const cart = getCart();
  const count = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);

  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

// 清空購物車
function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateBadge();
}

// cart.html 渲染清單
function renderCartPage() {
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");
  if (!list || !totalEl) return;

  const cart = getCart();
  const names = Object.keys(cart);

  if (names.length === 0) {
    list.innerHTML = `<div class="empty">購物車是空的</div>`;
    totalEl.textContent = "$0";
    updateBadge();
    return;
  }

  let total = 0;
  list.innerHTML = names.map((name) => {
    const item = cart[name];
    const sub = item.price * item.qty;
    total += sub;

    // 用 encode 方式避免特殊字元出錯
    const safeName = encodeURIComponent(name);

    return `
      <div class="cart-item">
        <div class="cart-info">
          <div class="cart-name">${name}</div>
          <div class="cart-meta">$${item.price} × ${item.qty} = <strong>$${sub}</strong></div>
        </div>
        <div class="cart-ops">
          <button class="mini-btn" onclick="changeQty('${safeName}', -1)">-</button>
          <button class="mini-btn" onclick="changeQty('${safeName}', 1)">+</button>
          <button class="mini-btn danger" onclick="removeItem('${safeName}')">刪除</button>
        </div>
      </div>
    `;
  }).join("");

  totalEl.textContent = "$" + total;
  updateBadge();
}

function changeQty(encodedName, delta) {
  const name = decodeURIComponent(encodedName);
  const cart = getCart();
  if (!cart[name]) return;

  cart[name].qty = Math.max(1, cart[name].qty + delta);
  setCart(cart);
  renderCartPage();
}

function removeItem(encodedName) {
  const name = decodeURIComponent(encodedName);
  const cart = getCart();
  delete cart[name];
  setCart(cart);
  renderCartPage();
}

// 每頁載入都更新 badge
document.addEventListener("DOMContentLoaded", updateBadge);
