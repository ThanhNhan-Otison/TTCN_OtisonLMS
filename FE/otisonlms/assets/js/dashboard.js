// assets/js/dashboard.js
/*document.addEventListener("DOMContentLoaded", function () {
  (async () => {
    // 1) Bắt đăng nhập + phân quyền trước khi render dashboard
    await requireTeacherOrAdmin("home.html");

    // 2) lấy userInfo từ localStorage hoặc gọi /auth/me
    let me = null;
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      try { me = JSON.parse(raw); } catch { localStorage.removeItem("userInfo"); }
    }
    if (!me) me = await tryLoadMe();

    // 3) render thông tin
    const emailEl = document.getElementById("email");
    const roleEl  = document.getElementById("role");

    const email = me?.email || localStorage.getItem("email") || "-";
    const role  = (me?.role || localStorage.getItem("role") || "UNKNOWN").toUpperCase();

    if (emailEl) emailEl.innerText = email;
    if (roleEl)  roleEl.innerText = role;

    // 4) thống kê
    try {
      const courses = await apiFetch("/courses");
      document.getElementById("countCourses").innerText = Array.isArray(courses) ? courses.length : 0;
    } catch {
      document.getElementById("countCourses").innerText = "0";
    }

    try {
      const a = await apiFetch("/assignments");
      document.getElementById("countAssignments").innerText = Array.isArray(a) ? a.length : 0;
    } catch {
      document.getElementById("countAssignments").innerText = "0";
    }

    try {
      const s = await apiFetch("/submissions/me");
      document.getElementById("countSubmissions").innerText = Array.isArray(s) ? s.length : 0;
    } catch {
      document.getElementById("countSubmissions").innerText = "0";
    }
  })();

  // Logout
  const handleLogout = () => {
    clearAuth();
    window.location.href = "login.html";
  };

  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) logoutBtn.onclick = handleLogout;

  const navLogoutBtn = document.getElementById("navLogout");
  if (navLogoutBtn) navLogoutBtn.onclick = handleLogout;

  // Navbar button
  const navAuthBtn = document.getElementById("navAuthBtn");
  if (navAuthBtn) {
    const sync = () => {
      const authed = isValidAuth(localStorage.getItem("auth"));
      navAuthBtn.textContent = authed ? "Đăng xuất" : "Đăng nhập";
      navAuthBtn.classList.toggle("btn-outline-danger", authed);
      navAuthBtn.classList.toggle("btn-primary", !authed);
    };
    sync();
    navAuthBtn.onclick = () => {
      if (isValidAuth(localStorage.getItem("auth"))) handleLogout();
      else window.location.href = "login.html";
    };
  }
});


assets/js/dashboard.js */

/*document.addEventListener("DOMContentLoaded", function () {

  (async () => {
    // 1) Bắt buộc đăng nhập trước
    requireAuth("login.html");

    // 2) Lấy role chuẩn từ backend (hoặc localStorage)
    let me = null;
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      try { me = JSON.parse(raw); } catch { localStorage.removeItem("userInfo"); }
    }
    if (!me) me = await tryLoadMe();

    const role = String(me?.role || localStorage.getItem("role") || "").toUpperCase();

    // 3) CHỈ ADMIN được vào dashboard
    if (role !== "ADMIN") {
      // bạn có thể đổi sang courses.html nếu muốn
      window.location.href = "home.html";
      return;
    }

    // 4) render info
    const emailEl = document.getElementById("email");
    const roleEl  = document.getElementById("role");
    const email = me?.email || localStorage.getItem("email") || "-";

    if (emailEl) emailEl.innerText = email;
    if (roleEl)  roleEl.innerText = role;

    // 5) thống kê (ADMIN vào mới gọi)
    try {
      const courses = await apiFetch("/courses");
      document.getElementById("countCourses").innerText = Array.isArray(courses) ? courses.length : 0;
    } catch {
      document.getElementById("countCourses").innerText = "0";
    }

    try {
      const a = await apiFetch("/assignments");
      document.getElementById("countAssignments").innerText = Array.isArray(a) ? a.length : 0;
    } catch {
      document.getElementById("countAssignments").innerText = "0";
    }

    try {
      const s = await apiFetch("/submissions/me");
      document.getElementById("countSubmissions").innerText = Array.isArray(s) ? s.length : 0;
    } catch {
      document.getElementById("countSubmissions").innerText = "0";
    }
  })();

  // Logout
  const handleLogout = () => {
    clearAuth();
    window.location.href = "login.html";
  };

  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) logoutBtn.onclick = handleLogout;


});*/


// ===== ADMIN USERS =====
// TODO: sửa đúng endpoint backend của bạn ở đây:
const ADMIN_USERS_API = "/admin/users"; // ví dụ: "/admin/users" hoặc "/users"
const ADMIN_USER_STATUS_API = (id) => `/admin/users/${id}/status`; // PATCH { status: "ACTIVE"|"HIDDEN"|"PENDING" }

let __allUsers = [];
let __activeRoleTab = "USER";

function norm(s) { return String(s || "").toLowerCase(); }

function badgeStatus(status) {
  const v = (status === true || status === "true");
  return v
    ? `<span class="badge text-bg-success">HIỆN</span>`
    : `<span class="badge text-bg-secondary">ẨN</span>`;
}

function renderUsers() {
  const tbody = document.getElementById("usersTbody");
  if (!tbody) return;

  const q = norm(document.getElementById("userSearch")?.value);

  let rows = __allUsers
    .filter(u => String(u.role || "").toUpperCase() === __activeRoleTab)
    .filter(u => !q || norm(u.email).includes(q) || norm(u.fullName).includes(q) || norm(u.firstName).includes(q));

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="small-muted">Không có tài khoản phù hợp.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((u, idx) => {
    const id = u.userId ?? u.id;
    const email = u.email ?? "-";
    const fullName = u.fullName ?? u.firstName ?? "";
    const role = String(u.role || "").toUpperCase();
    const status = u.status ?? u.enabled ?? "UNKNOWN";

    return `
      <tr>
        <td>${idx + 1}</td>
        <td class="fw-semibold">${email}</td>
        <td>${fullName || `<span class="small-muted">-</span>`}</td>
        <td><span class="badge text-bg-info">${role}</span></td>
        <td>${badgeStatus(status)}</td>
        <td class="text-end">
          <button class="btn btn-outline-success btn-sm me-1" data-act="approve" data-id="${id}">Duyệt</button>
          <button class="btn btn-outline-secondary btn-sm" data-act="hide" data-id="${id}">Ẩn</button>
        </td>
      </tr>
    `;
  }).join("");
}

async function loadUsers() {
  const tbody = document.getElementById("usersTbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="small-muted">Đang tải...</td></tr>`;

  try {
    const users = await apiFetch(ADMIN_USERS_API);
    if (!Array.isArray(users)) throw new Error("API users không trả về mảng");

    __allUsers = users.map(u => ({
      id: u.id,
      userId: u.userId,
      email: u.email,
      role: u.role,
      status: u.status ?? (u.enabled === false ? "HIDDEN" : (u.enabled === true ? "ACTIVE" : u.status)),
      fullName: u.fullName ?? u.firstName ?? u.name,
      firstName: u.firstName
    }));

    renderUsers();
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-danger">Không tải được users: ${e.message || e}</td></tr>`;
  }
}

async function setUserStatus(userId, statusBool) {
  try {
    await apiFetch(ADMIN_USER_STATUS_API(userId), {
      method: "PATCH",
      json: { status: Boolean(statusBool) }
    });

    const label = statusBool ? "HIỆN" : "ẨN";
    if (typeof toast === "function") {
      toast(`Đã cập nhật: ${label}`, "success");
    }

    __allUsers = __allUsers.map(u => {
      const id = u.userId ?? u.id;
      return String(id) === String(userId)
        ? { ...u, status: Boolean(statusBool) }
        : u;
    });

    renderUsers();
  } catch (e) {
    if (typeof toast === "function") {
      toast("Cập nhật thất bại", "danger");
    }
    console.error(e);
  }
}


function bindUsersUI() {
  const tbody = document.getElementById("usersTbody");
  if (!tbody) return;

  // tabs
  const tabs = document.querySelectorAll("#userTabs .nav-link");
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      __activeRoleTab = btn.getAttribute("data-role") || "USER";
      renderUsers();
    });
  });

  // search
  const search = document.getElementById("userSearch");
  if (search) search.addEventListener("input", () => renderUsers());

  // reload
  const reload = document.getElementById("btnReloadUsers");
  if (reload) reload.addEventListener("click", () => loadUsers());

  // actions
  // tbody.addEventListener("click", (e) => {
  //   const btn = e.target.closest("button[data-act]");
  //   if (!btn) return;

  //   const act = btn.getAttribute("data-act");
  //   const id = btn.getAttribute("data-id");
  //   if (!id) return;

  //   if (act === "approve") setUserStatus(id, "true");
  //   if (act === "hide") setUserStatus(id, "false");
  // });
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;

    const act = btn.dataset.act;
    const id = btn.dataset.id;

    if (act === "approve") setUserStatus(id, true);  // HIỆN
    if (act === "hide") setUserStatus(id, false); // ẨN
  });
}


// ===== DASHBOARD MAIN =====
document.addEventListener("DOMContentLoaded", function () {
  (async () => {
    // 1) Bắt buộc đăng nhập
    requireAuth("login.html");

    // 2) Load me để lấy role chuẩn
    let me = null;
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      try { me = JSON.parse(raw); } catch { localStorage.removeItem("userInfo"); }
    }
    if (!me) me = await tryLoadMe();

    const role = String(me?.role || localStorage.getItem("role") || "").toUpperCase();

    // 3) CHỈ ADMIN được vào


    if (role !== "ADMIN") {

      window.location.href = "home.html";
      return;

    }



    // 4) Render info
    const emailEl = document.getElementById("email");
    const roleEl = document.getElementById("role");
    const email = me?.email || localStorage.getItem("email") || "-";
    if (emailEl) emailEl.innerText = email;
    if (roleEl) roleEl.innerText = role;

    // 5) Thống kê
    try {
      const courses = await apiFetch("/courses");
      document.getElementById("countCourses").innerText = Array.isArray(courses) ? courses.length : 0;
    } catch { document.getElementById("countCourses").innerText = "0"; }

    try {
      const a = await apiFetch("/assignments");
      document.getElementById("countAssignments").innerText = Array.isArray(a) ? a.length : 0;
    } catch { document.getElementById("countAssignments").innerText = "0"; }

    // try {
    //   const s = await apiFetch("/submissions/me");
    //   document.getElementById("countSubmissions").innerText = Array.isArray(s) ? s.length : 0;
    // } catch { document.getElementById("countSubmissions").innerText = "0"; }
    // ADMIN không xem submissions/me => set 0 hoặc ẩn card này
    document.getElementById("countSubmissions").innerText = "0";


    // 6) USERS: bind + load
    bindUsersUI();
    loadUsers();
  })();

  // Logout
  const handleLogout = () => {
    clearAuth();
    window.location.href = "login.html";
  };
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) logoutBtn.onclick = handleLogout;
});
