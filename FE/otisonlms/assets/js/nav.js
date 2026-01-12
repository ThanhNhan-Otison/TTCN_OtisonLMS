// assets/js/nav.js
(async function () {
  async function injectNav() {
    const host = document.getElementById("appNav");
    if (!host) return;

    // fetch partial
    const res = await fetch("assets/partials/navbar.html", { cache: "no-store" });
    host.innerHTML = await res.text();

    // sau khi inject xong mới query được element
    await setupNavHandlers();
  }

  function roleUpper() {
    // ưu tiên auth.js nếu có getStoredRole()
    if (typeof getStoredRole === "function") return String(getStoredRole() || "").toUpperCase();
    return String(localStorage.getItem("role") || "").toUpperCase();
  }

  function isAuthed() {
    return !!localStorage.getItem("token");
  }

  function syncButtons() {

    const dashboardBtn = document.getElementById("dashboardBtn");
    const userInfoBtn = document.getElementById("userInfoBtn");
    const registerBtn = document.getElementById("registerBtn");
    const navAuthBtn = document.getElementById("navAuthBtn");

    const authed = isAuthed();
    const role = roleUpper();

    // ✅ Dashboard: chỉ ADMIN
    if (dashboardBtn) dashboardBtn.classList.toggle("d-none", !(authed && role === "ADMIN"));

    // Thông tin cá nhân: có đăng nhập thì hiện
    if (userInfoBtn) userInfoBtn.classList.toggle("d-none", !authed);

    // Đăng ký: chưa đăng nhập thì hiện
    if (registerBtn) registerBtn.classList.toggle("d-none", authed);

    // Nút auth
    if (navAuthBtn) {
      navAuthBtn.textContent = authed ? "Đăng xuất" : "Đăng nhập";
      navAuthBtn.className = authed
        ? "btn btn-outline-danger btn-sm px-4"
        : "btn btn-primary btn-sm px-4";
    }

    //connect button 
    const connectBtn = document.getElementById("connectBtn");
    if (connectBtn) connectBtn.classList.toggle("d-none", !(authed && role === "USER"));
  }
  function setActiveNavLink() {
    const cur = location.pathname.split("/").pop().toLowerCase() || "home.html";

    // bỏ active tất cả
    document.querySelectorAll(".navbar .nav-link").forEach(a => {
      a.classList.remove("active");
      a.removeAttribute("aria-current");
    });

    // tìm link khớp với trang hiện tại
    const match = Array.from(document.querySelectorAll(".navbar .nav-link"))
      .find(a => (a.getAttribute("href") || "").toLowerCase() === cur);

    if (match) {
      match.classList.add("active");
      match.setAttribute("aria-current", "page");
    }
  }

  async function setupNavHandlers() {
    // nếu có token mà chưa có role → gọi /auth/me để lưu role vào localStorage
    if (isAuthed() && !localStorage.getItem("role") && typeof tryLoadMe === "function") {
      await tryLoadMe();
    }

    syncButtons();
    setActiveNavLink();

    const navAuthBtn = document.getElementById("navAuthBtn");
    const userInfoBtn = document.getElementById("userInfoBtn");

    if (userInfoBtn) {
      userInfoBtn.onclick = () => (window.location.href = "info.html"); // bạn đổi trang info nếu khác
    }

    if (navAuthBtn) {
      navAuthBtn.onclick = () => {
        if (isAuthed()) {
          if (typeof clearAuth === "function") clearAuth();
          window.location.href = "login.html";
        } else {
          window.location.href = "login.html";
        }
      };
    }
  }

  document.addEventListener("DOMContentLoaded", injectNav);
})();
