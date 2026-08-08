(function (global) {
  "use strict";

  const LOCAL_KEY = "sportify_cart_guest";

  function isLoggedIn() {
    return !!(global.sportifySession && global.sportifySession.loggedIn);
  }

  function readLocal() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function writeLocal(items) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  }
  function clearLocal() {
    localStorage.removeItem(LOCAL_KEY);
  }

  async function apiGet() {
    const res = await fetch("/cart", { credentials: "same-origin" });
    if (!res.ok) throw new Error("Failed to load cart");
    return res.json();
  }
  async function apiAdd(item) {
    const res = await fetch("/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(item)
    });
    return res.json();
  }
  async function apiUpdate(productId, size, qty) {
    const res = await fetch("/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ productId, size, qty })
    });
    return res.json();
  }
  async function apiRemove(productId, size) {
    const res = await fetch("/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ productId, size })
    });
    return res.json();
  }
  async function apiSync(items) {
    const res = await fetch("/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ items })
    });
    return res.json();
  }

  let cachedItems = [];

  async function getItems() {
    if (isLoggedIn()) {
      const data = await apiGet();
      cachedItems = data.cart || [];
      return cachedItems;
    }
    cachedItems = readLocal();
    return cachedItems;
  }

  async function addItem(item) {
    if (isLoggedIn()) {
      const data = await apiAdd(item);
      cachedItems = data.cart || [];
      return cachedItems;
    }
    const items = readLocal();
    const idx = items.findIndex((i) => i.productId === item.productId && i.size === item.size);
    if (idx >= 0) items[idx].qty += item.qty;
    else items.push(item);
    writeLocal(items);
    cachedItems = items;
    return items;
  }

  async function updateQty(productId, size, qty) {
    if (isLoggedIn()) {
      const data = await apiUpdate(productId, size, qty);
      cachedItems = data.cart || [];
      return cachedItems;
    }
    const items = readLocal();
    const item = items.find((i) => i.productId === productId && i.size === size);
    if (item) item.qty = Math.max(1, qty);
    writeLocal(items);
    cachedItems = items;
    return items;
  }

  async function removeItem(productId, size) {
    if (isLoggedIn()) {
      const data = await apiRemove(productId, size);
      cachedItems = data.cart || [];
      return cachedItems;
    }
    let items = readLocal();
    items = items.filter((i) => !(i.productId === productId && i.size === size));
    writeLocal(items);
    cachedItems = items;
    return items;
  }

  /* Merge any guest cart into the server cart right after login */
  async function syncGuestCartIfNeeded() {
    if (!isLoggedIn()) return;
    const guestItems = readLocal();
    if (!guestItems.length) return;
    const serverData = await apiGet();
    const merged = serverData.cart || [];
    guestItems.forEach((gi) => {
      const existing = merged.find((i) => i.productId === gi.productId && i.size === gi.size);
      if (existing) existing.qty += gi.qty;
      else merged.push(gi);
    });
    await apiSync(merged);
    clearLocal();
  }

  function updateBadge(items) {
    const badge = document.getElementById("cart-count");
    if (!badge) return;
    const count = items.reduce((sum, i) => sum + (i.qty || 0), 0);
    badge.textContent = String(count);
  }

  async function refreshBadge() {
    try {
      const items = await getItems();
      updateBadge(items);
    } catch (e) {
      /* fail silently on badge refresh */
    }
  }

  function calcTotal(items) {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function renderItemPrice(item) {
    const currentPrice = Number(item.price) || 0;
    const originalPrice = Number(item.originalPrice) || 0;
    const isOnSale = !!item.isFlashSale && originalPrice > currentPrice && currentPrice > 0;
    const currency = item.currency || "LE";

    if (!isOnSale) {
      return `<span class="price">${currentPrice} ${currency}</span>`;
    }

    return `
      <span class="product-price-row">
        <span class="price price--was">${originalPrice} ${currency}</span>
        <span class="price price--now">${currentPrice} ${currency}</span>
      </span>`;
  }

  async function renderDrawer() {
    const wrap = document.getElementById("cart-items");
    const footer = document.getElementById("cart-footer");
    const totalEl = document.getElementById("cart-total");
    if (!wrap) return;

    let items;
    try {
      items = await getItems();
    } catch (e) {
      wrap.innerHTML = '<p class="empty-msg">Could not load cart.</p>';
      return;
    }

    updateBadge(items);

    if (!items.length) {
      wrap.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
      if (footer) footer.style.display = "none";
      return;
    }

    const esc = global.SportifyProducts ? global.SportifyProducts.escapeHtml : (s) => s;

    wrap.innerHTML = items
      .map(
        (i) => `
        <div class="cart-item" data-id="${i.productId}" data-size="${esc(i.size)}">
          <img src="${i.image}" alt="${esc(i.name)}">
          <div class="cart-item-info">
            <h4>${esc(i.name)}</h4>
            <p>Size: ${esc(i.size)}</p>
            <div class="qty-stepper qty-stepper--sm">
              <button type="button" class="cart-qty-dec">−</button>
              <span>${i.qty}</span>
              <button type="button" class="cart-qty-inc">+</button>
            </div>
            ${renderItemPrice(i)}
          </div>
          <button type="button" class="cart-item-remove" aria-label="Remove">✕</button>
        </div>`
      )
      .join("");

    if (footer) footer.style.display = "block";
    if (totalEl) totalEl.textContent = calcTotal(items).toFixed(2) + " LE";

    wrap.querySelectorAll(".cart-item").forEach((row) => {
      const id = row.getAttribute("data-id");
      const size = row.getAttribute("data-size");
      row.querySelector(".cart-qty-inc").addEventListener("click", async () => {
        const item = cachedItems.find((i) => i.productId === id && i.size === size);
        await updateQty(id, size, (item ? item.qty : 1) + 1);
        renderDrawer();
      });
      row.querySelector(".cart-qty-dec").addEventListener("click", async () => {
        const item = cachedItems.find((i) => i.productId === id && i.size === size);
        const newQty = (item ? item.qty : 1) - 1;
        if (newQty <= 0) {
          await removeItem(id, size);
        } else {
          await updateQty(id, size, newQty);
        }
        renderDrawer();
      });
      row.querySelector(".cart-item-remove").addEventListener("click", async () => {
        await removeItem(id, size);
        renderDrawer();
      });
    });
  }

  global.SportifyCart = {
    getItems,
    addItem,
    updateQty,
    removeItem,
    renderDrawer,
    refreshBadge,
    syncGuestCartIfNeeded,
    clearLocal
  };

  document.addEventListener("DOMContentLoaded", function () {
    syncGuestCartIfNeeded().finally(refreshBadge);
  });
})(window);
