// assets/js/stats.js
document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  let courseId = params.get("id");
  if (!courseId || courseId === "undefined") {
    courseId = null;
  }


  // ===== Elements =====
  const roleBadge = document.getElementById("roleBadge");

  const heroTitle = document.getElementById("courseTitle");
  const heroSub = document.getElementById("courseSubtitle");
  const heroCode = document.getElementById("courseCode");

  const teacherStatsEl = document.getElementById("teacherStats");
  const studentStatsEl = document.getElementById("studentStats");
  const statsStatus = document.getElementById("statsStatus");
  const statsMessage = document.getElementById("statsMessage");

  const allCoursesStatsEl = document.getElementById("allCoursesStats");
  const allStatsList = document.getElementById("allStatsList");
  const allStatsNote = document.getElementById("allStatsNote");
  const btnReloadAllStats = document.getElementById("btnReloadAllStats");

  // Teacher fields
  const elAvg = document.getElementById("avg");
  const elRate = document.getElementById("rate");
  const elStudents = document.getElementById("t_students");
  const elAssign = document.getElementById("t_assign");
  const elSubmit = document.getElementById("t_submit");
  const elSubmittedStudents = document.getElementById("t_submittedStudents");

  // Student fields
  const studentStatus = document.getElementById("studentStatus");
  const studentProgressBar = document.getElementById("studentProgressBar");
  const studentProgressLabel = document.getElementById("studentProgressLabel");
  const studentAssignments = document.getElementById("studentAssignments");
  const studentSubmissions = document.getElementById("studentSubmissions");
  const studentAverage = document.getElementById("studentAverage");

  // ===== ROLE =====
  function getRole() {
    return (localStorage.getItem("role") || "")
      .toUpperCase()
      .replace("ROLE_", "");
  }

  let currentRole = getRole();

  const isTeacherOrAdmin = (role) =>
    ["TEACHER", "ADMIN"].includes((role || "").toUpperCase());

  function syncRoleBadge() {
    currentRole = getRole();
    if (roleBadge) roleBadge.innerText = currentRole || "UNKNOWN";
  }

  function showOnly(elToShow) {
    [teacherStatsEl, studentStatsEl, allCoursesStatsEl].forEach((el) => {
      if (!el) return;
      el.style.display = el === elToShow ? "block" : "none";
    });
  }

  function safeText(el, val) {
    if (!el) return;
    el.textContent = val ?? "—";
  }

  function setTeacherTopStatus(text) {
    if (statsStatus) statsStatus.textContent = text;
  }

  // ================= STUDENT (SINGLE) =================
  function renderStudentCards(stats) {
    if (isTeacherOrAdmin(currentRole)) return;

    const total = Number(stats?.totalAssignments ?? 0);
    const submitted = Number(stats?.submittedAssignments ?? 0);
    const pending = Math.max(0, total - submitted);
    const status = String(stats?.courseStatus || "ONGOING").toUpperCase();

    studentStatus.textContent =
      status === "COMPLETED" ? "Hoàn thành" : "Đang học";
    studentStatus.className =
      "badge " +
      (status === "COMPLETED" ? "text-bg-success" : "text-bg-primary");

    const rate = total > 0 ? (submitted * 100) / total : 0;

    studentProgressBar.style.width = `${rate}%`;
    studentProgressBar.textContent = `${rate.toFixed(1)}%`;
    studentProgressLabel.innerText =
      "Tiến độ hoàn thành bài tập của bạn trong khóa học.";

    safeText(studentAssignments, total);
    safeText(studentSubmissions, submitted);
    safeText(
      studentAverage,
      status === "COMPLETED"
        ? "Đã hoàn thành"
        : `Còn ${pending} bài chưa nộp`
    );
  }

  // ================= TEACHER / ADMIN (SINGLE) =================
  function renderTeacherCards(stats) {
    if (!isTeacherOrAdmin(currentRole)) return;

    safeText(elStudents, stats?.totalStudents);
    safeText(elAssign, stats?.totalAssignments);
    safeText(elSubmit, stats?.totalSubmissions);
    safeText(elSubmittedStudents, stats?.submittedStudents);

    const avg = Number(stats?.averageScore);
    const rate = Number(stats?.submissionRate);

    safeText(elAvg, Number.isFinite(avg) ? avg.toFixed(2) : "—");
    safeText(elRate, Number.isFinite(rate) ? rate.toFixed(2) + "%" : "—");
  }

  // ================= COURSE META (SINGLE) =================
  async function loadCourseMetaSingle() {
    const course = await apiFetch(`/courses/${courseId}`);
    heroTitle.innerText = course.name;
    heroSub.innerText = course.description ?? "";
    heroCode.innerText = `#${course.courseId}`;
  }

  // ================= STATS (SINGLE) =================
  async function loadStatsSingle() {
    try {
      if (isTeacherOrAdmin(currentRole)) setTeacherTopStatus("Đang tải...");
      else studentStatus.textContent = "Đang tải...";

      const path = isTeacherOrAdmin(currentRole)
        ? `/teacher/courses/${courseId}/stats`
        : `/courses/${courseId}/stats/me`;

      const stats = await apiFetch(path);

      renderTeacherCards(stats);
      renderStudentCards(stats);

      if (isTeacherOrAdmin(currentRole)) setTeacherTopStatus("Đã cập nhật");
    } catch {
      if (isTeacherOrAdmin(currentRole)) setTeacherTopStatus("Lỗi");
      statsMessage.textContent = "Không thể tải thống kê";
      toast?.("Không thể tải thống kê", "danger");
    }
  }

  // ================= ALL COURSES =================
  async function loadAllCoursesStats() {
    showOnly(allCoursesStatsEl);

    heroTitle.innerText = "Thống kê tất cả khóa học";
    heroSub.innerText = isTeacherOrAdmin(currentRole)
      ? "Các khóa bạn quản lý / giảng dạy"
      : "Các khóa bạn đã đăng ký";
    heroCode.innerText = "#ALL";

    allStatsList.innerHTML = "";
    allStatsNote.innerText = "Đang tải...";

    let courses = [];

    if (currentRole === "TEACHER") {
      courses = await apiFetch("/teacher/courses");
    } else if (currentRole === "ADMIN") {
      courses = await apiFetch("/courses");
    } else {
      const enrollments = await apiFetch("/enrollments/me");
      const ids = [...new Set(enrollments.map(e => e.courseId))];
      courses = await Promise.all(ids.map(id => apiFetch(`/courses/${id}`)));
    }

    allStatsList.innerHTML = courses.map(c => `
      <div class="border rounded-3 p-3">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-semibold">${c.name}</div>
            <div class="small text-muted">${c.description ?? ""}</div>
          </div>
          <a class="btn btn-outline-primary btn-sm"
             href="stats.html?id=${c.courseId}">
             Chi tiết
          </a>
        </div>
      </div>
    `).join("");

    allStatsNote.innerText = `Đã tải ${courses.length} khóa.`;
  }

  // ================= INIT =================
  // ===== INIT =====
(async () => {
  if (typeof tryLoadMe === "function") await tryLoadMe();
  syncRoleBadge();

  btnReloadAllStats?.addEventListener("click", loadAllCoursesStats);

  // ✅ ALL MODE – KHÔNG CÓ COURSE ID
  if (courseId === null) {
    await loadAllCoursesStats();
    return; // ⛔ CỰC KỲ QUAN TRỌNG
  }

  // ✅ SINGLE MODE – CÓ COURSE ID HỢP LỆ
  showOnly(isTeacherOrAdmin(currentRole) ? teacherStatsEl : studentStatsEl);
  await loadCourseMetaSingle();
  await loadStatsSingle();
})();


  // Logout
  const handleLogout = () => {
    clearAuth?.();
    location.href = "login.html";
  };
  document.getElementById("logout")?.addEventListener("click", handleLogout);
  document.getElementById("navLogout")?.addEventListener("click", handleLogout);
});
