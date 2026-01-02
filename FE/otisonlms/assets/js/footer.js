// assets/js/footer.js
(function () {
  async function injectFooter() {
    const host = document.getElementById("appFooter");
    if (!host) return;

    const res = await fetch("assets/partials/footer.html", { cache: "no-store" });
    host.innerHTML = await res.text();

    // set year
    const yearEl = host.querySelector("#year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  document.addEventListener("DOMContentLoaded", injectFooter);
})();
