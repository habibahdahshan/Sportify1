(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", async function () {
    const grid = document.getElementById("favoritesGrid");
    const emptyMsg = document.getElementById("favoritesEmptyMsg");
    if (!grid) return;

    try {
      const res = await fetch("/favorites/products", { credentials: "same-origin" });
      const data = await res.json();
      const products = data.products || [];

      if (!products.length) {
        grid.innerHTML = "";
        if (emptyMsg) emptyMsg.style.display = "block";
        return;
      }

      grid.innerHTML = products.map(window.SportifyProducts.productCardShop).join("");

      grid.querySelectorAll(".shop-fav-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const id = btn.getAttribute("data-id");
          await window.SportifyFavorites.toggle(id);
          btn.closest(".card").remove();
          if (!grid.querySelector(".card") && emptyMsg) emptyMsg.style.display = "block";
        });
      });

      grid.querySelectorAll(".shop-add-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          const product = products.find((p) => p.id === id);
          if (!product) return;
          const size = product.sizes.find((s) => s.inStock) || product.sizes[0];
          if (!size) return;
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
          if (window.SportifyOpenCart) window.SportifyOpenCart();
        });
      });
    } catch (e) {
      grid.innerHTML = '<p class="admin-empty">Could not load favorites.</p>';
    }
  });
})();
