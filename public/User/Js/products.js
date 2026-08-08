(function (global) {
  "use strict";

  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Keep sale and regular product prices readable with one shared rule across the storefront. */
  function getPriceValues(product, selectedPrice) {
    if (!product || !Array.isArray(product.sizes) || !product.sizes.length) {
      return { currentPrice: null, originalPrice: null, isOnSale: false };
    }

    const prices = product.sizes.map((s) => Number(s.price) || 0);
    const currentPrice = Number(selectedPrice != null ? selectedPrice : Math.min(...prices));
    const originalPrice = Math.max(...prices);
    const isOnSale = !!product.isFlashSale && currentPrice < originalPrice;

    return { currentPrice, originalPrice, isOnSale };
  }

  function formatPrice(product, selectedPrice) {
    const { currentPrice } = getPriceValues(product, selectedPrice);
    if (currentPrice == null) return "—";
    return `${currentPrice} ${product.currency || "LE"}`;
  }

  function renderPriceTag(product, selectedPrice, wrapInRow) {
    const { currentPrice, originalPrice, isOnSale } = getPriceValues(product, selectedPrice);
    const currency = product.currency || "LE";

    if (currentPrice == null) return "—";

    const price = `<span class="price ${isOnSale ? "price--now" : "price--now"}">${currentPrice} ${currency}</span>`;
    if (!isOnSale) {
      return wrapInRow ? `<span class="product-price-row">${price}</span>` : price;
    }

    const oldPrice = `<span class="price price--was">${originalPrice} ${currency}</span>`;
    const newPrice = `<span class="price price--now">${currentPrice} ${currency}</span>`;
    const markup = `${oldPrice}${newPrice}`;
    return wrapInRow ? `<span class="product-price-row">${markup}</span>` : markup;
  }

  /* Card used on home page ("product" markup) */
  function productCardHome(p) {
    const out = !p.inStock;
    return `
      <div class="product">
        <a href="/products/${p.id}" class="product__media" aria-label="${escapeHtml(p.name)}">
          <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy">
        </a>
        <h4><a href="/products/${p.id}" style="color:inherit;text-decoration:none;">${escapeHtml(p.name)}</a></h4>
        ${renderPriceTag(p, null, true)}
        ${p.isFlashSale ? '<div><span class="badge-flash">Flash sale</span></div>' : ""}
        ${out ? '<div><span class="badge-out">Out of stock</span></div>' : ""}
        <button type="button" class="btn-product-add ${out ? "btn-product-add--out" : ""}" data-id="${p.id}" ${out ? "disabled" : ""}>
          ${out ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    `;
  }

  /* Card used on shop page (".card" markup, with quick fav) */
  function productCardShop(p) {
    const out = !p.inStock;
    const isFav = global.SportifyFavorites && global.SportifyFavorites.has(p.id);
    return `
      <div class="card" data-product-id="${p.id}">
        <div class="image" style="position:relative;">
          <a href="/products/${p.id}"><img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy"></a>
          <button type="button" class="product__fav shop-fav-btn ${isFav ? "product__fav--active" : ""}" data-id="${p.id}" aria-label="Toggle favorite" style="position:absolute;top:0;right:0;">
            <span class="product__fav-icon" aria-hidden="true">❤</span>
          </button>
        </div>
        <h3><a href="/products/${p.id}">${escapeHtml(p.name)}</a></h3>
        <p>${escapeHtml(p.line || "")}</p>
        ${renderPriceTag(p, null, true)}
        ${p.isFlashSale ? '<div><span class="badge-flash">Flash sale</span></div>' : ""}
        <button type="button" class="btn-add-cart shop-add-btn ${out ? "btn-add-cart--out" : ""}" data-id="${p.id}" ${out ? "disabled" : ""}>
          ${out ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    `;
  }

  async function fetchProducts(params) {
    const qs = new URLSearchParams(params || {}).toString();
    const res = await fetch("/api/products" + (qs ? "?" + qs : ""));
    if (!res.ok) throw new Error("Failed to load products");
    return res.json();
  }

  global.SportifyProducts = {
    escapeHtml,
    getPriceValues,
    formatPrice,
    renderPriceTag,
    productCardHome,
    productCardShop,
    fetchProducts
  };
})(window);
