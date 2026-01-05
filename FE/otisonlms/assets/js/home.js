// (() => {
//   const qs = (id) => document.getElementById(id);
//   const normalizeRole = (r = "") =>
//     String(r).toUpperCase().replace("ROLE_", "");
//   const isTeacherOrAdmin = (r) =>
//     ["TEACHER", "ADMIN"].includes(normalizeRole(r));
//   const isAdmin = (r) =>
//     [ "ADMIN"].includes(normalizeRole(r));
//   function syncNavAuthBtn(btn) {
//     const authed = !!localStorage.getItem("token");
//     if (!btn) return;
//     btn.textContent = authed ? "Đăng xuất" : "Đăng nhập";
//     btn.className = authed
//       ? "btn btn-outline-danger"
//       : "btn btn-primary";
//   }
//   function syncNavUI({ dashboardBtn, userInfoBtn, registerBtn }) {
//     const authed = !!localStorage.getItem("token");
//     const role = normalizeRole(localStorage.getItem("role"));
//     if (dashboardBtn)
//       dashboardBtn.classList.toggle(
//         "d-none",
//         !(authed && isAdmin(role))
//       );
//     if (userInfoBtn)
//       userInfoBtn.classList.toggle("d-none", !authed);
//     if (registerBtn)
//       registerBtn.classList.toggle("d-none", authed);
//   }
//   async function loadCourses() {
//     const data = await apiFetch("/courses");
//     const grid = qs("courseGrid");
//     if (!grid) return;
//     grid.innerHTML = "";
//     data.slice(0, 4).forEach((c) => {
//       grid.insertAdjacentHTML(
//         "beforeend",
//         `
//         <div class="col-lg-3 col-md-6">
//           <div class="course-card">
//             <div class="course-code">
//               ${(c.name || "").toUpperCase()}<br>[ID_${c.id}]
//             </div>
//             <a class="btn btn-pill btn-course-blue"
//                href="course_detail.html?id=${c.id}">
//               KHÓA HỌC
//             </a>
//           </div>
//         </div>
//       `
//       );
//     });
//   }
//   document.addEventListener("DOMContentLoaded", async () => {
//     const navAuthBtn = qs("navAuthBtn");
//     const dashboardBtn = qs("dashboardBtn");
//     const userInfoBtn = qs("userInfoBtn");
//     const registerBtn = qs("registerBtn");
//     // Nếu có token mà chưa có role → gọi /auth/me
//     if (localStorage.getItem("token") && !localStorage.getItem("role")) {
//       await tryLoadMe();
//     }
//     if (userInfoBtn) {
//       userInfoBtn.onclick = () => {
//         location.href = "info.html";
//       };
//     }
//     syncNavAuthBtn(navAuthBtn);
//     syncNavUI({ dashboardBtn, userInfoBtn, registerBtn });
//     await loadCourses();
//     if (navAuthBtn) {
//       navAuthBtn.onclick = () => {
//         if (localStorage.getItem("token")) {
//           clearAuth();
//           location.reload();
//         } else {
//           location.href = "login.html";
//         }
//       };
//     }
//   });
// })();

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
