// assets/js/stats.js
document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");

  // ===== Elements (có thể null tùy trang) =====
  const statsStatus = document.getElementById("statsStatus");
  const roleBadge = document.getElementById("roleBadge");

  const teacherStatsEl = document.getElementById("teacherStats");
  const studentStatsEl = document.getElementById("studentStats");

  // Teacher fields (ID mới)
  const elLessons = document.getElementById("t_lessons"); // nếu bạn có field lessons
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
  const studentAverage = document.getElementById("studentAverage");

  let currentRole = (localStorage.getItem("role") || "").toUpperCase();

  // ===== Helpers =====
  const isTeacherOrAdmin = (role) =>
    ["TEACHER", "ADMIN"].includes((role || "").toUpperCase());

  function safeText(el, val) {
    if (!el) return;
    el.textContent = val ?? "—";
  }

  function setStatusTop(text) {
    if (statsStatus) statsStatus.textContent = text;
  }

  function resetStudentCards(statusText) {
    if (!studentStatsEl) return;

    if (studentStatus) studentStatus.textContent = statusText || "—";
    if (studentProgressBar) {
      studentProgressBar.style.width = "0%";
      studentProgressBar.textContent = "0%";
    }
    if (studentProgressLabel) studentProgressLabel.innerText = "Chưa có dữ liệu.";
    safeText(studentAssignments, "—");
    safeText(studentSubmissions, "—");
    safeText(studentAverage, "—");
  }

  function syncRoleBlocks() {
    currentRole = (localStorage.getItem("role") || currentRole || "").toUpperCase();
    if (roleBadge) roleBadge.innerText = currentRole || "UNKNOWN";

    const showTeacherView = isTeacherOrAdmin(currentRole);

    if (teacherStatsEl) teacherStatsEl.style.display = showTeacherView ? "block" : "none";
    if (studentStatsEl) studentStatsEl.style.display = showTeacherView ? "none" : "block";
  }

  function renderStudentCards(stats) {
    // chỉ dành cho STUDENT/USER
    if (isTeacherOrAdmin(currentRole)) return;
    if (!studentStatsEl) return;

    if (studentStatus) studentStatus.textContent = "Đã cập nhật";

    const assignments = stats?.totalAssignments ?? 0;
    const submissions = stats?.totalSubmissions ?? 0;

    const avg = Number(stats?.averageScore);
    const rate = Number(stats?.submissionRate);

    const safeRate = Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 100) : 0;

    if (studentProgressBar) {
      studentProgressBar.style.width = `${safeRate}%`;
      studentProgressBar.textContent = `${safeRate.toFixed(1)}%`;
    }
    if (studentProgressLabel) studentProgressLabel.innerText = "Tỉ lệ học viên đã nộp trong lớp.";

    safeText(studentAssignments, assignments);
    safeText(studentSubmissions, submissions);
    safeText(studentAverage, Number.isFinite(avg) ? avg.toFixed(2) : "—");
  }

  function renderTeacherCards(stats) {
    // chỉ dành cho TEACHER/ADMIN
    if (!isTeacherOrAdmin(currentRole)) return;

    const totalStudents = stats?.totalStudents ?? 0;
    // const totalLessons = stats?.totalLessons ?? 0;
    const totalAssignments = stats?.totalAssignments ?? 0;
    const totalSubmissions = stats?.totalSubmissions ?? 0;

    // 👇 Field quan trọng: số SV đã nộp bài (distinct)
    // Nếu BE có: submittedStudents / studentsSubmitted / submittedCount...
    const submittedStudents =
      stats?.submittedStudents ??
      stats?.studentsSubmitted ??
      stats?.submittedCount ??
      null;

    safeText(elStudents, totalStudents);
    // safeText(elLessons, totalLessons);
    safeText(elAssign, totalAssignments);
    safeText(elSubmit, totalSubmissions);

    // AVG/RATE nếu có
    const avg = Number(stats?.averageScore);
    const rate = Number(stats?.submissionRate);
    safeText(elAvg, Number.isFinite(avg) ? avg.toFixed(2) : "—");
    safeText(elRate, Number.isFinite(rate) ? rate.toFixed(2) + "%" : "—");

    // ✅ show submittedStudents nếu BE có, không có thì fallback
    if (elSubmittedStudents) {
      if (submittedStudents === null) {
        elSubmittedStudents.textContent = "—";
        if (elSubmitNote) {
          elSubmitNote.textContent =
            "BE chưa trả số SV đã nộp (distinct). Đang hiển thị tổng bài nộp ở ô bên cạnh.";
        }
      } else {
        elSubmittedStudents.textContent = submittedStudents;
        if (elSubmitNote) elSubmitNote.textContent = "";
      }
    }
  }

  // ===== Load Course Meta =====
  async function loadCourseMeta() {
    if (!courseId) return;
    try {
      const course = await apiFetch(`/courses/${courseId}`);
      const title = course.courseName ?? course.name ?? "Khóa học";
      const sub = course.description ?? course.moTa ?? "";
      const code = course.courseId ?? course.id ?? courseId;

      const elTitle = document.getElementById("courseTitle");
      const elSub = document.getElementById("courseSubtitle");
      const elCode = document.getElementById("courseCode");

      if (elTitle) elTitle.innerText = title;
      if (elSub) elSub.innerText = sub;
      if (elCode) elCode.innerText = `#${code}`;
    } catch (e) {
      const elTitle = document.getElementById("courseTitle");
      if (elTitle) elTitle.innerText = "Không tải được thông tin khóa học";
    }
  }

  // ===== Load Stats =====
  async function loadStats() {
    const statsMsg = document.getElementById("statsMessage");

    if (!courseId) {
      setStatusTop("Thiếu mã khóa học");
      if (statsMsg) {
        statsMsg.innerText = "Thêm tham số id cho URL (vd: stats.html?id=1).";
      }
      resetStudentCards("Thiếu mã khóa học");
      return;
    }

    try {
      setStatusTop("Đang tải");

      // Endpoint của bạn đang dùng:
      const stats = await apiFetch(`/teacher/courses/${courseId}/stats`);

      // Render theo role
      renderTeacherCards(stats);
      renderStudentCards(stats);

      setStatusTop("Đã cập nhật");
      if (statsMsg) statsMsg.innerText = "Dữ liệu thống kê được tổng hợp gần đây.";

    } catch (e) {
      setStatusTop("Lỗi");
      if (statsMsg) statsMsg.innerText = "Không thể tải thống kê: " + (e?.message || e);

      resetStudentCards("Không có dữ liệu");
      if (typeof toast === "function") toast("Không thể tải thống kê", "danger");
    }
  }

  // ===== Logout buttons (đỡ lỗi null) =====
  const handleLogout = () => {
    if (typeof clearAuth === "function") clearAuth();
    location.href = "login.html";
  };

  const btnLogout = document.getElementById("logout");
  const btnNavLogout = document.getElementById("navLogout");
  if (btnLogout) btnLogout.onclick = handleLogout;
  if (btnNavLogout) btnNavLogout.onclick = handleLogout;

  // ===== INIT =====
  resetStudentCards("Đang chờ dữ liệu");
  (async () => {
    // đảm bảo role/userInfo được set trước
    if (typeof tryLoadMe === "function") await tryLoadMe();

    syncRoleBlocks();
    await loadCourseMeta();
    await loadStats();
  })();
});
