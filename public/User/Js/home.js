(function () {
  "use strict";

  function bindCardButtons(el, products) {
    el.querySelectorAll(".btn-product-add").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const product = products.find((p) => p.id === id);
        if (!product) return;

        const size = product.sizes.find((s) => s.inStock) || product.sizes[0];
        if (!size) return;

        btn.disabled = true;
        btn.textContent = "Adding…";

        const saleInfo = window.SportifyProducts.getPriceValues(product, size.price);
        await window.SportifyCart.addItem({
          productId: product.id,
          name: product.name,
          price: size.price,
          qty: 1,
          size: size.size,
          image: product.image,
          currency: product.currency,
          originalPrice: saleInfo.originalPrice,
          isFlashSale: saleInfo.isOnSale
        });

        btn.textContent = "Added ✓";
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = product.inStock ? "Add to cart" : "Out of stock";
          if (!product.inStock) btn.disabled = true;
        }, 1200);

        if (window.SportifyOpenCart) window.SportifyOpenCart();
      });
    });
  }

  async function loadGrid(elId, params) {
    const el = document.getElementById(elId);
    if (!el) return;
    try {
      const data = await window.SportifyProducts.fetchProducts(params);
      if (!data.products.length) {
        el.innerHTML = '<p class="admin-empty">No products yet — check back soon.</p>';
        return;
      }
      el.innerHTML = data.products.map(window.SportifyProducts.productCardHome).join("");
      bindCardButtons(el, data.products);
    } catch (e) {
      el.innerHTML = '<p class="admin-empty">Could not load products.</p>';
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadGrid("flashSaleGrid", { flashSale: "1", limit: 4 });
    loadGrid("bestSellersGrid", { bestSeller: "1", limit: 8 });
  });
})();
