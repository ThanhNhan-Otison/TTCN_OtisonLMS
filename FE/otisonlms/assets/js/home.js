// assets/js/home.js
(() => {
  const $ = (id) => document.getElementById(id);

  const hasToken = () => !!localStorage.getItem("token");

  const roleOf = () =>
    String(localStorage.getItem("role") || "")
      .toUpperCase()
      .replace("ROLE_", "");

  const isAdmin = (role) => role === "ADMIN";

  const setHidden = (el, hidden) => el && el.classList.toggle("d-none", !!hidden);

  const setBtn = (btn, { text, cls }) => {
    if (!btn) return;
    btn.textContent = text;
    btn.className = cls;
  };

  const syncNav = ({ navAuthBtn, dashboardBtn, userInfoBtn, registerBtn }) => {
    const authed = hasToken();
    const role = roleOf();

    setBtn(navAuthBtn, authed
      ? { text: "Đăng xuất", cls: "btn btn-outline-danger" }
      : { text: "Đăng nhập", cls: "btn btn-primary" }
    );

    setHidden(dashboardBtn, !(authed && isAdmin(role)));
    setHidden(userInfoBtn, !authed);
    setHidden(registerBtn, authed);
  };

  const loadCourses = async () => {
    const grid = $("courseGrid");
    if (!grid) return;

    const data = await apiFetch("/courses");
    grid.innerHTML = data
      .slice(0, 4)
      .map((c) => {
        const name = String(c?.name || "").toUpperCase();
        const id = c?.id ?? "";
        return `
          <div class="col-lg-3 col-md-6">
            <div class="course-card">
              <div class="course-code">
                ${name}<br>[ID_${id}]
              </div>
              <a class="btn btn-pill btn-course-blue" href="course_detail.html?id=${id}">
                KHÓA HỌC
              </a>
            </div>
          </div>
        `;
      })
      .join("");
  };

  document.addEventListener("DOMContentLoaded", async () => {
    const els = {
      navAuthBtn: $("navAuthBtn"),
      dashboardBtn: $("dashboardBtn"),
      userInfoBtn: $("userInfoBtn"),
      registerBtn: $("registerBtn"),
    };

    // Có token mà chưa có role → gọi /auth/me để sync role
    if (hasToken() && !localStorage.getItem("role")) {
      await tryLoadMe();
    }

    // Bind events
    if (els.userInfoBtn) els.userInfoBtn.onclick = () => (location.href = "info.html");

    if (els.navAuthBtn) {
      els.navAuthBtn.onclick = () => {
        if (hasToken()) {
          clearAuth();
          location.reload();
        } else {
          location.href = "login.html";
        }
      };
    }

    // Render UI + data
    syncNav(els);
    await loadCourses();
  });
})();
