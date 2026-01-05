// assets/js/stats.js
document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id"); // null => ALL mode

  // ===== Elements =====
  const roleBadge = document.getElementById("roleBadge");

  const heroTitle = document.getElementById("courseTitle");
  const heroSub = document.getElementById("courseSubtitle");
  const heroCode = document.getElementById("courseCode");

  // Single-course blocks
  const teacherStatsEl = document.getElementById("teacherStats");
  const studentStatsEl = document.getElementById("studentStats");
  const statsStatus = document.getElementById("statsStatus");
  const statsMessage = document.getElementById("statsMessage");

  // All-courses block
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
  const elSubmitNote = document.getElementById("submitNote");

  // Student fields
  const studentStatus = document.getElementById("studentStatus");
  const studentProgressBar = document.getElementById("studentProgressBar");
  const studentProgressLabel = document.getElementById("studentProgressLabel");
  const studentAssignments = document.getElementById("studentAssignments");
  const studentSubmissions = document.getElementById("studentSubmissions");
  const studentAverage = document.getElementById("studentAverage"); // bạn đang dùng như "Trạng thái"

  let currentRole = (localStorage.getItem("role") || "").toUpperCase();
  const currentUserId = Number(localStorage.getItem("userId") || 0);

  // ===== Helpers =====
  const isTeacherOrAdmin = (role) => ["TEACHER", "ADMIN"].includes((role || "").toUpperCase());

  function safeText(el, val) {
    if (!el) return;
    el.textContent = val ?? "—";
  }

  function setTeacherTopStatus(text) {
    if (statsStatus) statsStatus.textContent = text;
  }

  function syncRoleBadge() {
    currentRole = (localStorage.getItem("role") || currentRole || "").toUpperCase();
    if (roleBadge) roleBadge.innerText = currentRole || "UNKNOWN";
  }

  function showOnly(elToShow) {
    const blocks = [teacherStatsEl, studentStatsEl, allCoursesStatsEl];
    blocks.forEach((b) => {
      if (!b) return;
      b.style.display = (b === elToShow) ? "block" : "none";
    });
  }

  // ===== Render SINGLE: STUDENT/USER =====
  function renderStudentCards(stats) {
    if (isTeacherOrAdmin(currentRole)) return;
    if (!studentStatsEl) return;

    const total = Number(stats?.totalAssignments ?? 0);
    const submitted = Number(stats?.submittedAssignments ?? 0);
    const pending = Number(stats?.pendingAssignments ?? Math.max(0, total - submitted));
    const status = String(stats?.courseStatus || "ONGOING").toUpperCase(); // ONGOING/COMPLETED

    if (studentStatus) {
      studentStatus.textContent = status === "COMPLETED" ? "Hoàn thành" : "Đang học";
      studentStatus.className = "badge " + (status === "COMPLETED" ? "text-bg-success" : "text-bg-primary");
    }

    const rate = total <= 0 ? 0 : (submitted * 100) / total;
    const safeRate = Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 100) : 0;

    if (studentProgressBar) {
      studentProgressBar.style.width = `${safeRate}%`;
      studentProgressBar.textContent = `${safeRate.toFixed(1)}%`;
    }
    if (studentProgressLabel) {
      studentProgressLabel.innerText = "Tiến độ hoàn thành bài tập của bạn trong khóa học.";
    }

    safeText(studentAssignments, total);
    safeText(studentSubmissions, submitted);
    safeText(studentAverage, status === "COMPLETED" ? "Đã hoàn thành" : `Còn ${pending} bài chưa nộp`);
  }

  // ===== Render SINGLE: TEACHER/ADMIN =====
  function renderTeacherCards(stats) {
    if (!isTeacherOrAdmin(currentRole)) return;

    safeText(elStudents, stats?.totalStudents ?? 0);
    safeText(elAssign, stats?.totalAssignments ?? 0);
    safeText(elSubmit, stats?.totalSubmissions ?? 0);

    const submittedStudents =
      stats?.submittedStudents ??
      stats?.studentsSubmitted ??
      stats?.submittedCount ??
      null;

    const avg = Number(stats?.averageScore);
    const rate = Number(stats?.submissionRate);
    safeText(elAvg, Number.isFinite(avg) ? avg.toFixed(2) : "—");
    safeText(elRate, Number.isFinite(rate) ? rate.toFixed(2) + "%" : "—");

    if (elSubmittedStudents) {
      if (submittedStudents === null) {
        elSubmittedStudents.textContent = "—";
        if (elSubmitNote) elSubmitNote.textContent = "BE chưa trả số SV đã nộp (distinct).";
      } else {
        elSubmittedStudents.textContent = submittedStudents;
        if (elSubmitNote) elSubmitNote.textContent = "";
      }
    }
  }

  // ===== Course Meta (single) =====
  async function loadCourseMetaSingle() {
    try {
      const course = await apiFetch(`/courses/${courseId}`);
      const title = course.courseName ?? course.name ?? "Khóa học";
      const sub = course.description ?? course.moTa ?? "";
      const code = course.courseId ?? course.id ?? courseId;

      if (heroTitle) heroTitle.innerText = title;
      if (heroSub) heroSub.innerText = sub || "Tổng quan tình trạng học tập và bài nộp.";
      if (heroCode) heroCode.innerText = `#${code}`;
    } catch {
      if (heroTitle) heroTitle.innerText = "Không tải được thông tin khóa học";
    }
  }

  // ===== Stats (single) =====
  async function loadStatsSingle() {
    try {
      if (isTeacherOrAdmin(currentRole)) setTeacherTopStatus("Đang tải");
      else if (studentStatus) studentStatus.textContent = "Đang tải...";

      const path = isTeacherOrAdmin(currentRole)
        ? `/teacher/courses/${courseId}/stats`
        : `/courses/${courseId}/stats/me`;

      const stats = await apiFetch(path);

      renderTeacherCards(stats);
      renderStudentCards(stats);

      if (isTeacherOrAdmin(currentRole)) setTeacherTopStatus("Đã cập nhật");
    } catch (e) {
      const msg = e?.message || String(e);
      if (isTeacherOrAdmin(currentRole)) setTeacherTopStatus("Lỗi");
      if (statsMessage) statsMessage.textContent = "Không thể tải thống kê: " + msg;

      if (!isTeacherOrAdmin(currentRole)) {
        if (studentStatus) studentStatus.textContent = "Không có dữ liệu";
        if (studentProgressLabel) studentProgressLabel.innerText = msg;
      }
      if (typeof toast === "function") toast("Không thể tải thống kê", "danger");
    }
  }

  // ===== ALL COURSES MODE =====

  async function fetchCoursesForAllMode() {
    // USER: lấy các khóa đã đăng ký
    if (!isTeacherOrAdmin(currentRole)) {
      const enrollments = await apiFetch("/enrollments/me");
      const ids = (Array.isArray(enrollments) ? enrollments : [])
        .map(e => e.courseId ?? e.course?.courseId ?? e.course?.id ?? e.course)
        .filter(v => v != null)
        .map(Number);

      const uniqueIds = [...new Set(ids)];
      const courses = await Promise.all(uniqueIds.map(id => apiFetch(`/courses/${id}`).catch(() => null)));
      return courses.filter(Boolean);
    }

    // TEACHER: chỉ khóa mình dạy (endpoint bạn đã có)
    if (currentRole === "TEACHER") {
      const list = await apiFetch("/teacher/courses");
      return Array.isArray(list) ? list : [];
    }

    // ADMIN: xem tất cả
    const all = await apiFetch("/courses");
    return Array.isArray(all) ? all : [];
  }

  async function fetchStatsForCourse(course) {
    const cid = course.courseId ?? course.id;
    if (!cid) return null;

    const path = isTeacherOrAdmin(currentRole)
      ? `/teacher/courses/${cid}/stats`
      : `/courses/${cid}/stats/me`;

    try {
      const stats = await apiFetch(path);
      return { course, stats, error: null };
    } catch (e) {
      // 403: không có quyền -> bỏ qua nhưng vẫn ghi note
      const msg = e?.message || String(e);
      if (String(msg).includes("403")) {
        return { course, stats: null, error: "403" };
      }
      return { course, stats: null, error: msg };
    }
  }

  function renderAllCourseCard(item) {
    const c = item.course;
    const cid = c.courseId ?? c.id;
    const title = c.courseName ?? c.name ?? "Khóa học";
    const desc = c.description ?? c.moTa ?? "";

    // Không có quyền stats (403)
    if (item.error === "403") {
      return `
        <div class="border rounded-3 p-3">
          <div class="d-flex align-items-start gap-2">
            <div class="me-auto">
              <div class="fw-semibold">${title}</div>
              <div class="small text-muted">${desc}</div>
              <div class="small text-danger mt-1">Không có quyền xem thống kê khóa này (403).</div>
            </div>
            <a class="btn btn-outline-primary btn-sm" href="stats.html?id=${cid}">Chi tiết</a>
          </div>
        </div>
      `;
    }

    // Lỗi khác
    if (!item.stats) {
      return `
        <div class="border rounded-3 p-3">
          <div class="d-flex align-items-start gap-2">
            <div class="me-auto">
              <div class="fw-semibold">${title}</div>
              <div class="small text-muted">${desc}</div>
              <div class="small text-danger mt-1">Lỗi tải thống kê: ${item.error || "unknown"}</div>
            </div>
            <a class="btn btn-outline-primary btn-sm" href="stats.html?id=${cid}">Chi tiết</a>
          </div>
        </div>
      `;
    }

    const s = item.stats;

    // USER cards
    if (!isTeacherOrAdmin(currentRole)) {
      const total = Number(s?.totalAssignments ?? 0);
      const submitted = Number(s?.submittedAssignments ?? 0);
      const pending = Number(s?.pendingAssignments ?? Math.max(0, total - submitted));
      const status = String(s?.courseStatus || "ONGOING").toUpperCase();
      const rate = total <= 0 ? 0 : (submitted * 100) / total;
      const safeRate = Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 100) : 0;

      return `
        <div class="border rounded-3 p-3">
          <div class="d-flex align-items-start gap-2">
            <div class="me-auto">
              <div class="fw-semibold">${title}</div>
              <div class="small text-muted">${desc}</div>
            </div>
            <a class="btn btn-outline-primary btn-sm" href="stats.html?id=${cid}">Chi tiết</a>
          </div>

          <div class="mt-2 d-flex flex-wrap gap-2 align-items-center">
            <span class="badge ${status === "COMPLETED" ? "text-bg-success" : "text-bg-primary"}">
              ${status === "COMPLETED" ? "Hoàn thành" : "Đang học"}
            </span>
            <span class="small text-muted">Bài tập: <b>${total}</b></span>
            <span class="small text-muted">Đã nộp: <b>${submitted}</b></span>
            <span class="small text-muted">Chưa nộp: <b>${pending}</b></span>
          </div>

          <div class="progress mt-2" style="height:10px;">
            <div class="progress-bar" role="progressbar" style="width:${safeRate}%;"></div>
          </div>
          <div class="small text-muted mt-1">Tiến độ nộp bài: ${safeRate.toFixed(1)}%</div>
        </div>
      `;
    }

    // TEACHER/ADMIN cards
    const totalStudents = s?.totalStudents ?? 0;
    const totalAssignments = s?.totalAssignments ?? 0;
    const totalSubmissions = s?.totalSubmissions ?? 0;
    const submittedStudents = s?.submittedStudents ?? s?.studentsSubmitted ?? s?.submittedCount ?? "—";

    return `
      <div class="border rounded-3 p-3">
        <div class="d-flex align-items-start gap-2">
          <div class="me-auto">
            <div class="fw-semibold">${title}</div>
            <div class="small text-muted">${desc}</div>
          </div>
          <a class="btn btn-outline-primary btn-sm" href="stats.html?id=${cid}">Chi tiết</a>
        </div>

        <div class="mt-2 d-flex flex-wrap gap-3">
          <div class="small text-muted">SV đăng ký: <b>${totalStudents}</b></div>
          <div class="small text-muted">SV đã nộp: <b>${submittedStudents}</b></div>
          <div class="small text-muted">Tổng bài tập: <b>${totalAssignments}</b></div>
          <div class="small text-muted">Tổng bài nộp: <b>${totalSubmissions}</b></div>
        </div>
      </div>
    `;
  }

  async function loadAllCoursesStats() {
    if (!allCoursesStatsEl || !allStatsList) return;

    showOnly(allCoursesStatsEl);

    if (heroTitle) heroTitle.innerText = "Thống kê tất cả khóa học";
    if (heroSub) heroSub.innerText = isTeacherOrAdmin(currentRole)
      ? "Tổng hợp thống kê các khóa bạn quản lý/giảng dạy."
      : "Tổng hợp thống kê các khóa bạn đã đăng ký.";
    if (heroCode) heroCode.innerText = "#ALL";

    allStatsList.innerHTML = "";
    if (allStatsNote) allStatsNote.innerText = "Đang tải danh sách khóa học...";

    try {
      const courses = await fetchCoursesForAllMode();

      if (!courses.length) {
        allStatsList.innerHTML = `<div class="text-muted">Không có khóa học để thống kê.</div>`;
        if (allStatsNote) allStatsNote.innerText = "Không có dữ liệu.";
        return;
      }

      if (allStatsNote) allStatsNote.innerText = `Đang tải thống kê ${courses.length} khóa...`;

      const results = await Promise.all(courses.map(c => fetchStatsForCourse(c)));
      const ok = results.filter(Boolean);

      allStatsList.innerHTML = ok.map(renderAllCourseCard).join("");

      const loaded = ok.filter(x => x.stats).length;
      if (allStatsNote) allStatsNote.innerText = `Đã tải ${loaded}/${courses.length} khóa.`;

    } catch (e) {
      allStatsList.innerHTML = `<div class="text-danger">Không thể tải: ${e?.message || e}</div>`;
      if (allStatsNote) allStatsNote.innerText = "Lỗi.";
      if (typeof toast === "function") toast("Không thể tải thống kê", "danger");
    }
  }

  async function checkTeacherOwnCourseOrWarn() {
    if (currentRole !== "TEACHER") return true;
    // teacher chỉ được xem stats các course của mình
    try {
      const my = await apiFetch("/teacher/courses");
      const list = Array.isArray(my) ? my : [];
      const ok = list.some(c => String(c.courseId ?? c.id) === String(courseId));
      return ok;
    } catch {
      return false;
    }
  }

  // ===== INIT =====
  (async () => {
    if (typeof tryLoadMe === "function") await tryLoadMe();
    syncRoleBadge();

    if (btnReloadAllStats) btnReloadAllStats.onclick = loadAllCoursesStats;

    // ALL MODE
    if (!courseId) {
      await loadAllCoursesStats();
      return;
    }

    // SINGLE MODE
    const teacherOk = await checkTeacherOwnCourseOrWarn();
    if (currentRole === "TEACHER" && !teacherOk) {
      showOnly(teacherStatsEl); // để hiện khung thông báo
      if (heroTitle) heroTitle.innerText = "Không có quyền";
      if (heroSub) heroSub.innerText = "Bạn không quản lý khóa học này nên không xem được thống kê.";
      if (heroCode) heroCode.innerText = `#${courseId}`;
      setTeacherTopStatus("403");
      if (statsMessage) statsMessage.textContent = "Bạn không quản lý khóa này (Forbidden).";
      return;
    }

    showOnly(isTeacherOrAdmin(currentRole) ? teacherStatsEl : studentStatsEl);
    await loadCourseMetaSingle();
    await loadStatsSingle();
  })();

  // Logout
  const handleLogout = () => {
    if (typeof clearAuth === "function") clearAuth();
    location.href = "login.html";
  };
  document.getElementById("logout")?.addEventListener("click", handleLogout);
  document.getElementById("navLogout")?.addEventListener("click", handleLogout);
});
