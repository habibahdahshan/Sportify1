(function (global) {
  "use strict";

  let favSet = new Set();
  let loaded = false;

  function isLoggedIn() {
    return !!(global.sportifySession && global.sportifySession.loggedIn);
  }

  async function loadFavorites() {
    if (!isLoggedIn()) {
      favSet = new Set();
      loaded = true;
      return favSet;
    }
    try {
      const res = await fetch("/favorites", { credentials: "same-origin" });
      const data = await res.json();
      favSet = new Set(data.favorites || []);
    } catch (e) {
      favSet = new Set();
    }
    loaded = true;
    return favSet;
  }

  function has(productId) {
    return favSet.has(String(productId));
  }

  async function toggle(productId) {
    if (!isLoggedIn()) {
      window.location.href = "/auth/login";
      return { added: false, redirected: true };
    }
    const res = await fetch("/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ productId })
    });
    const data = await res.json();
    favSet = new Set(data.favorites || []);
    return data;
  }

  async function renderDrawer() {
    const wrap = document.getElementById("fav-items");
    if (!wrap) return;

    wrap.innerHTML = '<p class="empty-msg">Loading…</p>';
    try {
      const res = await fetch("/favorites/products", { credentials: "same-origin" });
      const data = await res.json();
      const products = data.products || [];

      if (!products.length) {
        wrap.innerHTML = '<p class="empty-msg">No favorites yet.</p>';
        return;
      }

      const esc = global.SportifyProducts ? global.SportifyProducts.escapeHtml : (s) => s;
      const priceTag = global.SportifyProducts ? global.SportifyProducts.renderPriceTag : () => "";

      wrap.innerHTML = products
        .map(
          (p) => `
          <div class="cart-item" data-id="${p.id}">
            <a href="/products/${p.id}"><img src="${p.image}" alt="${esc(p.name)}"></a>
            <div class="cart-item-info">
              <h4><a href="/products/${p.id}" style="color:inherit;text-decoration:none;">${esc(p.name)}</a></h4>
              ${priceTag(p)}
            </div>
            <button type="button" class="cart-item-remove fav-remove-btn" data-id="${p.id}" aria-label="Remove from favorites">✕</button>
          </div>`
        )
        .join("");

      wrap.querySelectorAll(".fav-remove-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          await toggle(btn.getAttribute("data-id"));
          renderDrawer();
        });
      });
    } catch (e) {
      wrap.innerHTML = '<p class="empty-msg">Could not load favorites.</p>';
    }
  }

  global.SportifyFavorites = {
    loadFavorites,
    has,
    toggle,
    renderDrawer,
    get loaded() {
      return loaded;
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    loadFavorites();
  });
})(window);
