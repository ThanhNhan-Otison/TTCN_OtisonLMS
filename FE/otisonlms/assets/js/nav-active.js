// assets/js/nav-active.js
(() => {
  let path = location.pathname.split("/").pop().toLowerCase();

  // xử lý trang chủ
  if (path === "" || path === "index.html") {
    path = "home.html";
  }

  document.querySelectorAll(".navbar .nav-link").forEach(link => {
    const href = link.getAttribute("href")?.toLowerCase();
    const isActive = href === path;

    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
})();
