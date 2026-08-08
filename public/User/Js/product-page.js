(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const root = document.getElementById("productRoot");
    if (!root) return;

    const product = JSON.parse(root.getAttribute("data-product"));
    const sizeSelect = document.getElementById("pdSize");
    const priceEl = document.getElementById("pdPrice");
    const qtyVal = document.getElementById("pdQty");
    const qtyInc = document.getElementById("pdQtyInc");
    const qtyDec = document.getElementById("pdQtyDec");
    const addBtn = document.getElementById("pdAddCart");
    const buyBtn = document.getElementById("pdBuyNow");
    const favBtn = document.getElementById("pdFav");

    let qty = 1;

    function currentSize() {
      const opt = sizeSelect.options[sizeSelect.selectedIndex];
      return {
        size: opt.value,
        price: Number(opt.getAttribute("data-price"))
      };
    }

    function updatePrice() {
      const s = currentSize();
      priceEl.innerHTML = window.SportifyProducts.renderPriceTag(product, s.price, false);
    }

    sizeSelect.addEventListener("change", updatePrice);
    updatePrice();

    qtyInc.addEventListener("click", () => {
      qty += 1;
      qtyVal.textContent = qty;
    });
    qtyDec.addEventListener("click", () => {
      qty = Math.max(1, qty - 1);
      qtyVal.textContent = qty;
    });

    async function buildCartItem() {
      const s = currentSize();
      const saleInfo = window.SportifyProducts.getPriceValues(product, s.price);
      return {
        productId: product.id,
        name: product.name,
        price: s.price,
        qty,
        size: s.size,
        image: product.image,
        currency: product.currency,
        originalPrice: saleInfo.originalPrice,
        isFlashSale: saleInfo.isOnSale
      };
    }

    addBtn.addEventListener("click", async () => {
      addBtn.disabled = true;
      addBtn.textContent = "Adding…";
      await window.SportifyCart.addItem(await buildCartItem());
      addBtn.textContent = "Added ✓";
      setTimeout(() => {
        addBtn.disabled = false;
        addBtn.textContent = "Add to cart";
      }, 1200);
      if (window.SportifyOpenCart) window.SportifyOpenCart();
    });

    buyBtn.addEventListener("click", async () => {
      await window.SportifyCart.addItem(await buildCartItem());
      window.location.href = "/checkout";
    });

    /* Favorite */
    window.SportifyFavorites.loadFavorites().then(() => {
      const isFav = window.SportifyFavorites.has(product.id);
      favBtn.classList.toggle("product-detail__fav--active", isFav);
      favBtn.setAttribute("aria-pressed", isFav ? "true" : "false");
    });
    favBtn.addEventListener("click", async () => {
      const data = await window.SportifyFavorites.toggle(product.id);
      if (data.redirected) return;
      favBtn.classList.toggle("product-detail__fav--active", data.added);
      favBtn.setAttribute("aria-pressed", data.added ? "true" : "false");
    });
  });
})();
