(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", async function () {
    const linesEl = document.getElementById("checkoutLines");
    const totalEl = document.getElementById("checkoutTotal");
    const finalSubtotal = document.getElementById("finalSubtotal");
    const finalDiscount = document.getElementById("finalDiscount");
    const finalTotal = document.getElementById("finalTotal");
    const discountRow = document.getElementById("discountRow");
    const cartItemsInput = document.getElementById("cartItemsInput");
    const form = document.getElementById("checkoutForm");
    const promoInput = document.getElementById("promoInput");
    const promoApplyBtn = document.getElementById("promoApply");
    const promoMsg = document.getElementById("promoMsg");
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const visaFields = document.getElementById("visaFields");
    const cardNumberInput = document.getElementById("cardNumber");

    if (!linesEl) return;

    function toggleVisaFields() {
      if (!visaFields) return;
      const hasVisa = Array.from(paymentRadios).some((radio) => radio.checked && radio.value === "visa");
      visaFields.style.display = hasVisa ? "block" : "none";
    }

    if (cardNumberInput) {
      cardNumberInput.addEventListener("input", function () {
        const digits = this.value.replace(/\D/g, "").slice(0, 16);
        this.value = digits.replace(/(.{4})/g, "$1 ").trim();
      });
    }

    paymentRadios.forEach((radio) => radio.addEventListener("change", toggleVisaFields));
    toggleVisaFields();

    let items = [];
    let discountPercent = 0;

    function esc(s) {
      return window.SportifyProducts ? window.SportifyProducts.escapeHtml(s) : s;
    }

    function subtotal() {
      return items.reduce((sum, i) => sum + i.price * i.qty, 0);
    }

    function renderTotals() {
      const sub = subtotal();
      const discountAmt = sub * (discountPercent / 100);
      const total = sub - discountAmt;

      totalEl.textContent = sub.toFixed(2) + " LE";
      finalSubtotal.textContent = sub.toFixed(2) + " LE";
      finalTotal.textContent = total.toFixed(2) + " LE";

      if (discountPercent > 0) {
        discountRow.style.display = "flex";
        finalDiscount.textContent = "-" + discountAmt.toFixed(2) + " LE (" + discountPercent + "%)";
      } else {
        discountRow.style.display = "none";
      }

      cartItemsInput.value = JSON.stringify(items);
    }

    async function loadCart() {
      items = await window.SportifyCart.getItems();
      if (!items.length) {
        linesEl.innerHTML = '<li class="admin-empty">Your cart is empty. <a href="/shop">Go shopping</a>.</li>';
        document.getElementById("placeOrderBtn").disabled = true;
        renderTotals();
        return;
      }
      linesEl.innerHTML = items
        .map(
          (i) => `<li class="checkout-line">
            <span>${i.qty} × ${esc(i.name)} (${esc(i.size)})</span>
            <span>${(i.price * i.qty).toFixed(2)} ${i.currency || "LE"}</span>
          </li>`
        )
        .join("");
      renderTotals();
    }

    if (promoApplyBtn) {
      promoApplyBtn.addEventListener("click", async () => {
        const code = promoInput.value.trim();
        if (!code) return;
        promoMsg.textContent = "Checking…";
        promoMsg.style.color = "#555";
        try {
          const res = await fetch(`/api/promos/validate/${encodeURIComponent(code)}`);
          const data = await res.json();
          if (!data.success) {
            discountPercent = 0;
            promoMsg.textContent = data.message || "Invalid promo code.";
            promoMsg.style.color = "#b3261e";
          } else {
            discountPercent = data.discountPercent;
            promoMsg.textContent = `Promo "${data.code}" applied: -${data.discountPercent}%`;
            promoMsg.style.color = "#1e7d3a";
          }
          renderTotals();
        } catch (e) {
          promoMsg.textContent = "Could not validate promo code.";
          promoMsg.style.color = "#b3261e";
        }
      });
    }

    if (form) {
      form.addEventListener("submit", () => {
        cartItemsInput.value = JSON.stringify(items);
      });
    }

    await loadCart();
  });
})();
