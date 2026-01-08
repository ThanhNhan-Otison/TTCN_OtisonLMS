// assets/js/dashboard.js

// ===== ADMIN USERS =====
// TODO: sửa đúng endpoint backend của bạn ở đây nếu khác:
const ADMIN_USERS_API = "/admin/users"; // GET list users
const ADMIN_USER_STATUS_API = (id) => `/admin/users/${id}/status`; // PATCH { status: true|false } (true=HIỆN, false=ẨN)

let __allUsers = [];
let __activeRoleTab = "USER";

const $ = (id) => document.getElementById(id);
function norm(s) { return String(s || "").toLowerCase(); }

function badgeStatus(status) {
  // Hỗ trợ nhiều kiểu backend trả về:
  // - boolean true/false
  // - "true"/"false"
  // - "ACTIVE"/"HIDDEN"/"PENDING"
  const s = String(status ?? "").toUpperCase();
  const isActive =
    status === true ||
    status === "true" ||
    s === "ACTIVE" ||
    s === "ENABLED" ||
    s === "PUBLISH";

  return isActive
    ? `<span class="badge text-bg-success">HIỆN</span>`
    : `<span class="badge text-bg-secondary">ẨN</span>`;
}

function renderUsers() {
  const tbody = $("usersTbody");
  if (!tbody) return;

  const q = norm($("userSearch")?.value);

  const rows = __allUsers
    .filter(u => String(u.role || "").toUpperCase() === __activeRoleTab)
    .filter(u =>
      !q ||
      norm(u.email).includes(q) ||
      norm(u.fullName).includes(q) ||
      norm(u.firstName).includes(q)
    );

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
          <button class="btn btn-outline-success btn-sm me-1" data-act="approve" data-id="${id}">Hiện</button>
          <button class="btn btn-outline-secondary btn-sm" data-act="hide" data-id="${id}">Ẩn</button>
        </td>
      </tr>
    `;
  }).join("");
}

async function loadUsers() {
  const tbody = $("usersTbody");
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
      // normalize status nhiều kiểu
      status: u.status ?? u.enabled ?? (u.enabled === false ? "HIDDEN" : (u.enabled === true ? "ACTIVE" : u.status)),
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

    toast?.(`Đã cập nhật: ${statusBool ? "HIỆN" : "ẨN"}`, "success");

    __allUsers = __allUsers.map(u => {
      const id = u.userId ?? u.id;
      return String(id) === String(userId)
        ? { ...u, status: Boolean(statusBool) }
        : u;
    });

    renderUsers();
  } catch (e) {
    toast?.("Cập nhật thất bại", "danger");
    console.error(e);
  }
}

function bindUsersUI() {
  const tbody = $("usersTbody");
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
  $("userSearch")?.addEventListener("input", renderUsers);

  // reload
  $("btnReloadUsers")?.addEventListener("click", loadUsers);

  // actions
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;

    const act = btn.dataset.act;
    const id = btn.dataset.id;
    if (!id) return;

    if (act === "approve") setUserStatus(id, true); // HIỆN
    if (act === "hide") setUserStatus(id, false);   // ẨN
  });
}


// ===== ADMIN COURSES =====
const ADMIN_COURSES_API = "/courses"; // GET list courses
const ADMIN_COURSE_STATUS_API = (courseId) => `/admin/courses/${courseId}/status`; // PATCH { status: "publish"|"hidden"|"draft" }

let __allCourses = [];
let __activeCourseTab = "publish"; // publish | hidden | draft

function courseStatusText(status) {
  const s = String(status || "").toLowerCase();
  if (s === "publish") return "HIỆN";
  if (s === "hidden") return "ẨN";
  if (s === "draft") return "NHÁP";
  return s ? s.toUpperCase() : "—";
}

function courseStatusBadge(status) {
  const s = String(status || "").toLowerCase();
  if (s === "publish") return `<span class="badge text-bg-success">HIỆN</span>`;
  if (s === "hidden") return `<span class="badge text-bg-secondary">ẨN</span>`;
  if (s === "draft") return `<span class="badge text-bg-warning text-dark">NHÁP</span>`;
  return `<span class="badge text-bg-light text-dark">${courseStatusText(status)}</span>`;
}

function normalizeCourse(c) {
  return {
    id: c.courseId ?? c.id,
    name: c.courseName ?? c.name ?? c.ten ?? "-",
    description: c.description ?? c.moTa ?? "",
    status: String(c.status ?? c.trangThai ?? "").toLowerCase(), // publish|hidden|draft
  };
}

function renderCourses() {
  const tbody = $("coursesTbody");
  if (!tbody) return;

  const q = norm($("courseSearch")?.value);

  const rows = __allCourses
    .filter(c => String(c.status || "").toLowerCase() === __activeCourseTab)
    .filter(c => !q || norm(c.name).includes(q) || norm(c.description).includes(q));

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="small-muted">Không có khóa học phù hợp.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((c, idx) => {
    const id = c.id;

    const disPublish = c.status === "publish" ? "disabled" : "";
    const disHidden  = c.status === "hidden"  ? "disabled" : "";
    const disDraft   = c.status === "draft"   ? "disabled" : "";

    return `
      <tr class="text-dark">
        <td>${idx + 1}</td>
        <td class="fw-semibold">${c.name}</td>
        <td>${c.description ? c.description : `<span class="small-muted">-</span>`}</td>
        <td>${courseStatusBadge(c.status)}</td>
        <td class="text-end">
          <button class="btn btn-outline-success btn-sm me-1" data-cact="publish" data-id="${id}" ${disPublish}>Hiện</button>
          <button class="btn btn-outline-secondary btn-sm me-1" data-cact="hidden"  data-id="${id}" ${disHidden}>Ẩn</button>
          <button class="btn btn-outline-warning btn-sm text-dark" data-cact="draft"  data-id="${id}" ${disDraft}>Nháp</button>
        </td>
      </tr>
    `;
  }).join("");
}

async function loadCourses() {
  const tbody = $("coursesTbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" class="small-muted">Đang tải...</td></tr>`;

  try {
    const courses = await apiFetch(ADMIN_COURSES_API);
    if (!Array.isArray(courses)) throw new Error("API courses không trả về mảng");

    __allCourses = courses.map(normalizeCourse);
    renderCourses();
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-danger">Không tải được khóa học: ${e.message || e}</td></tr>`;
  }
}

async function setCourseStatus(courseId, status) {
  // Backend bạn đang dùng: PATCH /admin/courses/{id}/status {status}
  return apiFetch(ADMIN_COURSE_STATUS_API(courseId), {
    method: "PATCH",
    json: { status }, // publish | hidden | draft
  });
}

async function updateCourseStatus(courseId, status) {
  try {
    await setCourseStatus(courseId, status);
    toast?.(`Đã cập nhật trạng thái: ${courseStatusText(status)}`, "success");

    __allCourses = __allCourses.map(c =>
      String(c.id) === String(courseId) ? { ...c, status } : c
    );

    renderCourses();
  } catch (e) {
    toast?.(`Cập nhật thất bại: ${e.message || e}`, "danger");
    console.error(e);
  }
}

function bindCoursesUI() {
  const tbody = $("coursesTbody");
  if (!tbody) return;

  // tabs
  const tabs = document.querySelectorAll("#courseTabs .nav-link");
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      __activeCourseTab = btn.getAttribute("data-status") || "publish";
      renderCourses();
    });
  });

  // search
  $("courseSearch")?.addEventListener("input", renderCourses);

  // reload
  $("btnReloadCourses")?.addEventListener("click", loadCourses);

  // actions
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-cact]");
    if (!btn) return;

    const act = btn.dataset.cact; // publish|hidden|draft
    const id = btn.dataset.id;
    if (!id) return;

    updateCourseStatus(id, act);
  });
}


// ===== DASHBOARD MAIN (ADMIN ONLY) =====
document.addEventListener("DOMContentLoaded", async () => {
  // ✅ Chỉ cần gọi requireAuth ở đây (bỏ requireAuth() trong HTML)
  requireAuth("login.html");

  // Load me để role chuẩn (nếu token có mà role/userInfo chưa có)
  if (!localStorage.getItem("role") || !localStorage.getItem("userInfo")) {
    await tryLoadMe();
  }

  const role = String(localStorage.getItem("role") || "")
    .toUpperCase()
    .replace("ROLE_", "");

  // ✅ Chỉ ADMIN được vào
  if (role !== "ADMIN") {
    location.href = "home.html";
    return;
  }

  // ===== STATS =====
  try {
    const courses = await apiFetch("/courses");
    const el = $("countCourses");
    if (el) el.innerText = Array.isArray(courses) ? courses.length : 0;
  } catch {
    const el = $("countCourses");
    if (el) el.innerText = "0";
  }

  try {
    const a = await apiFetch("/assignments");
    const el = $("countAssignments");
    if (el) el.innerText = Array.isArray(a) ? a.length : 0;
  } catch {
    const el = $("countAssignments");
    if (el) el.innerText = "0";
  }

  // ===== USERS + COURSES =====
  bindUsersUI();
  await loadUsers();

  bindCoursesUI();
  await loadCourses();

  // ===== LOGOUT =====
  const handleLogout = () => {
    clearAuth();
    location.href = "login.html";
  };

  $("logout") && ($("logout").onclick = handleLogout);
  $("navLogout") && ($("navLogout").onclick = handleLogout);
});

