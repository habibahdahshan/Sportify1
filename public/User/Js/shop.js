(function () {
  "use strict";

  let state = {
    category: window.SPORTIFY_INITIAL_CATEGORY === "shopall" ? "" : window.SPORTIFY_INITIAL_CATEGORY || "",
    search: "",
    page: 1
  };

  const grid = document.getElementById("shopGrid");
  const pagEl = document.getElementById("shopPagination");
  const countEl = document.getElementById("resultsCount");

  function renderPagination(page, pages) {
    if (!pagEl) return;
    if (pages <= 1) {
      pagEl.innerHTML = "";
      return;
    }
    let html = "";
    html += `<a href="#" data-page="${Math.max(1, page - 1)}" class="pagination__link ${page <= 1 ? "is-disabled" : ""}">‹ Prev</a>`;
    for (let i = 1; i <= pages; i++) {
      html += `<a href="#" data-page="${i}" class="pagination__link ${i === page ? "is-active" : ""}">${i}</a>`;
    }
    html += `<a href="#" data-page="${Math.min(pages, page + 1)}" class="pagination__link ${page >= pages ? "is-disabled" : ""}">Next ›</a>`;
    pagEl.innerHTML = html;

    pagEl.querySelectorAll("a[data-page]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const p = Number(a.getAttribute("data-page"));
        if (p === state.page) return;
        state.page = p;
        loadProducts();
        window.scrollTo({ top: grid.offsetTop - 100, behavior: "smooth" });
      });
    });
  }

  async function loadProducts() {
    if (!grid) return;
    grid.innerHTML = '<p class="admin-empty">Loading products…</p>';
    try {
      const params = { page: state.page, limit: 12 };
      if (state.category) params.category = state.category;
      if (state.search) params.search = state.search;

      const data = await window.SportifyProducts.fetchProducts(params);

      if (!data.products.length) {
        grid.innerHTML = '<p class="admin-empty">No products match your filters.</p>';
        countEl.textContent = "0 products";
        renderPagination(1, 1);
        return;
      }

      grid.innerHTML = data.products.map(window.SportifyProducts.productCardShop).join("");
      countEl.textContent = `${data.total} product${data.total === 1 ? "" : "s"}`;
      renderPagination(data.page, data.pages);

      grid.querySelectorAll(".shop-add-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          const product = data.products.find((p) => p.id === id);
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
            btn.textContent = "Add to cart";
          }, 1200);
          if (window.SportifyOpenCart) window.SportifyOpenCart();
        });
      });

      grid.querySelectorAll(".shop-fav-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const id = btn.getAttribute("data-id");
          await window.SportifyFavorites.toggle(id);
          btn.classList.toggle("product__fav--active");
        });
      });
    } catch (e) {
      grid.innerHTML = '<p class="admin-empty">Could not load products. Please try again.</p>';
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('input[name="collectionFilter"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        state.category = radio.value === "shopall" ? "" : radio.value;
        state.page = 1;
        loadProducts();
      });
    });

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      let t;
      searchInput.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(() => {
          state.search = searchInput.value.trim();
          state.page = 1;
          loadProducts();
        }, 350);
      });
    }

    const clearBtn = document.getElementById("clearFilters");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        state = { category: "", search: "", page: 1 };
        document.querySelectorAll('input[name="collectionFilter"]').forEach((r) => (r.checked = r.value === "shopall"));
        if (searchInput) searchInput.value = "";
        loadProducts();
      });
    }

    window.SportifyFavorites.loadFavorites().finally(loadProducts);
  });
})();
