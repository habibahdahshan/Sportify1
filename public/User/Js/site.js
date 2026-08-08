(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    /* Mobile nav toggle */
    const navToggle = document.getElementById("nav-toggle");
    const navMain = document.getElementById("nav-main");
    const navBackdrop = document.getElementById("nav-backdrop");
    if (navToggle && navMain) {
      navToggle.addEventListener("click", function () {
        const open = navMain.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        if (navBackdrop) navBackdrop.classList.toggle("open", open);
      });
      if (navBackdrop) {
        navBackdrop.addEventListener("click", function () {
          navMain.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
          navBackdrop.classList.remove("open");
        });
      }
    }

    /* Cart drawer */
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");
    const cartIcon = document.getElementById("cart-icon-home");
    const cartClose = document.getElementById("cart-close-btn");

    function openCart() {
      if (cartSidebar) cartSidebar.classList.add("open");
      if (cartOverlay) cartOverlay.classList.add("open");
      if (window.SportifyCart) window.SportifyCart.renderDrawer();
    }
    function closeCart() {
      if (cartSidebar) cartSidebar.classList.remove("open");
      if (cartOverlay) cartOverlay.classList.remove("open");
    }
    if (cartIcon) {
      cartIcon.closest(".cart-icon-wrap").addEventListener("click", openCart);
    }
    if (cartClose) cartClose.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
    window.SportifyOpenCart = openCart;

    /* Favorites drawer */
    const favTrigger = document.getElementById("fav-drawer-trigger");
    const favSidebar = document.getElementById("fav-sidebar");
    const favOverlay = document.getElementById("fav-overlay");
    const favClose = document.getElementById("fav-close-btn");

    function openFav() {
      if (!window.sportifySession || !window.sportifySession.loggedIn) {
        window.location.href = "/auth/login";
        return;
      }
      if (favSidebar) favSidebar.classList.add("open");
      if (favOverlay) favOverlay.classList.add("open");
      if (window.SportifyFavorites) window.SportifyFavorites.renderDrawer();
    }
    function closeFav() {
      if (favSidebar) favSidebar.classList.remove("open");
      if (favOverlay) favOverlay.classList.remove("open");
    }
    if (favTrigger) {
      favTrigger.addEventListener("click", openFav);
      favTrigger.addEventListener("keypress", function (e) {
        if (e.key === "Enter" || e.key === " ") openFav();
      });
    }
    if (favClose) favClose.addEventListener("click", closeFav);
    if (favOverlay) favOverlay.addEventListener("click", closeFav);

    /* Search modal */
    const searchIcon = document.getElementById("nav-search-icon");
    const searchPanel = document.getElementById("globalSearchPanel");
    const searchClose = document.getElementById("globalSearchClose");
    function openSearch() {
      if (searchPanel) {
        searchPanel.classList.add("open");
        const input = document.getElementById("globalSearchInput");
        if (input) setTimeout(() => input.focus(), 50);
      }
    }
    function closeSearch() {
      if (searchPanel) searchPanel.classList.remove("open");
    }
    if (searchIcon) {
      searchIcon.addEventListener("click", openSearch);
      searchIcon.addEventListener("keypress", function (e) {
        if (e.key === "Enter" || e.key === " ") openSearch();
      });
    }
    if (searchClose) searchClose.addEventListener("click", closeSearch);
    if (searchPanel) {
      searchPanel.addEventListener("click", function (e) {
        if (e.target === searchPanel) closeSearch();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeSearch();
        closeCart();
        closeFav();
      }
    });

    /* Password show/hide toggles */
    document.querySelectorAll(".password-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const targetId = btn.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (!input) return;
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        btn.textContent = isHidden ? "Hide" : "Show";
      });
    });

    /* Auto-dismiss flash messages */
    document.querySelectorAll(".flash-message").forEach(function (msg) {
      setTimeout(function () {
        msg.style.transition = "opacity .4s ease";
        msg.style.opacity = "0";
        setTimeout(() => msg.remove(), 400);
      }, 4000);
    });
  });
})();
