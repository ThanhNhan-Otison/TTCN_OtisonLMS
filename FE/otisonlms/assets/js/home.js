
// assets/js/home.js
(() => {
  const qs = (id) => document.getElementById(id);

  const normalizeRole = (r = "") =>
    String(r).toUpperCase().replace("ROLE_", "");

  const isTeacherOrAdmin = (r) =>
    ["TEACHER", "ADMIN"].includes(normalizeRole(r));

  const isAdmin = (r) =>
    [ "ADMIN"].includes(normalizeRole(r));
  function syncNavAuthBtn(btn) {
    const authed = !!localStorage.getItem("token");
    if (!btn) return;

    btn.textContent = authed ? "Đăng xuất" : "Đăng nhập";
    btn.className = authed
      ? "btn btn-outline-danger"
      : "btn btn-primary";
  }

  function syncNavUI({ dashboardBtn, userInfoBtn, registerBtn }) {
    const authed = !!localStorage.getItem("token");
    const role = normalizeRole(localStorage.getItem("role"));

    if (dashboardBtn)
      dashboardBtn.classList.toggle(
        "d-none",
        !(authed && isAdmin(role))
      );

    if (userInfoBtn)
      userInfoBtn.classList.toggle("d-none", !authed);

    if (registerBtn)
      registerBtn.classList.toggle("d-none", authed);
  }

  async function loadCourses() {
    const data = await apiFetch("/courses");
    const grid = qs("courseGrid");
    if (!grid) return;

    grid.innerHTML = "";
    data.slice(0, 4).forEach((c) => {
      grid.insertAdjacentHTML(
        "beforeend",
        `
        <div class="col-lg-3 col-md-6">
          <div class="course-card">
            <div class="course-code">
              ${(c.name || "").toUpperCase()}<br>[ID_${c.id}]
            </div>
            <a class="btn btn-pill btn-course-blue"
               href="course_detail.html?id=${c.id}">
              KHÓA HỌC
            </a>
          </div>
        </div>
      `
      );
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const navAuthBtn = qs("navAuthBtn");
    const dashboardBtn = qs("dashboardBtn");
    const userInfoBtn = qs("userInfoBtn");
    const registerBtn = qs("registerBtn");

    // Nếu có token mà chưa có role → gọi /auth/me
    if (localStorage.getItem("token") && !localStorage.getItem("role")) {
      await tryLoadMe();
    }

    if (userInfoBtn) {
      userInfoBtn.onclick = () => {
        location.href = "info.html";
      };
    }
    syncNavAuthBtn(navAuthBtn);
    syncNavUI({ dashboardBtn, userInfoBtn, registerBtn });

    await loadCourses();

    if (navAuthBtn) {
      navAuthBtn.onclick = () => {
        if (localStorage.getItem("token")) {
          clearAuth();
          location.reload();
        } else {
          location.href = "login.html";
        }
      };
    }
  });
})();
