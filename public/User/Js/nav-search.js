(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("globalSearchInput");
    const results = document.getElementById("globalSearchResults");
    if (!input || !results) return;

    let debounceTimer;

    input.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      const q = input.value.trim();
      if (!q) {
        results.innerHTML = "";
        return;
      }
      debounceTimer = setTimeout(async () => {
        try {
          const data = await window.SportifyProducts.fetchProducts({ search: q, limit: 8 });
          const esc = window.SportifyProducts.escapeHtml;
          const priceFmt = window.SportifyProducts.formatPrice;
          if (!data.products.length) {
            results.innerHTML = '<li class="global-search__empty">No products found.</li>';
            return;
          }
          results.innerHTML = data.products
            .map(
              (p) => `
              <li>
                <a href="/products/${p.id}" class="global-search__result">
                  <img src="${p.image}" alt="${esc(p.name)}">
                  <span>
                    <strong>${esc(p.name)}</strong>
                    <small>${priceFmt(p)}</small>
                  </span>
                </a>
              </li>`
            )
            .join("");
        } catch (e) {
          results.innerHTML = '<li class="global-search__empty">Search failed. Try again.</li>';
        }
      }, 300);
    });
  });
})();
