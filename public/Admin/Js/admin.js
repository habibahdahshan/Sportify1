(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".flash-message").forEach(function (msg) {
      setTimeout(function () {
        msg.style.transition = "opacity .4s ease";
        msg.style.opacity = "0";
        setTimeout(() => msg.remove(), 400);
      }, 4000);
    });
  });
})();
