// assets/js/stats.js
// All logic from stats.html inline script, wrapped in DOMContentLoaded

document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");
  const statsStatus = document.getElementById("statsStatus");
  const roleBadge = document.getElementById("roleBadge");
  const teacherStatsEl = document.getElementById("teacherStats");
  const studentStatsEl = document.getElementById("studentStats");
  const studentStatus = document.getElementById("studentStatus");
  const studentProgressBar = document.getElementById("studentProgressBar");
  const studentProgressLabel = document.getElementById("studentProgressLabel");
  const studentAssignments = document.getElementById("studentAssignments");
  const studentSubmissions = document.getElementById("studentSubmissions");
  const studentAverage = document.getElementById("studentAverage");
  let currentRole = (localStorage.getItem("role") || "").toUpperCase();

  const handleLogout = ()=>{ clearAuth(); location.href = "login.html"; };
  document.getElementById("logout").onclick = handleLogout;
  document.getElementById("navLogout").onclick = handleLogout;

  const isTeacherOrAdmin = role => ["TEACHER","ADMIN"].includes((role||"").toUpperCase());

  function syncRoleBlocks(){
    currentRole = (localStorage.getItem("role") || currentRole || "").toUpperCase();
    roleBadge.innerText = currentRole || "UNKNOWN";
    const showTeacherView = isTeacherOrAdmin(currentRole);
    teacherStatsEl.style.display = showTeacherView ? "block" : "none";
    studentStatsEl.style.display = showTeacherView ? "none" : "block";
  }

  function resetStudentCards(statusText){
    studentStatus.textContent = statusText;
    studentProgressBar.style.width = "0%";
    studentProgressBar.textContent = "0%";
    studentProgressLabel.innerText = "Chưa có dữ liệu.";
    studentAssignments.innerText = "—";
    studentSubmissions.innerText = "—";
    studentAverage.innerText = "—";
  }

  function renderStudentCards(stats){
    if (isTeacherOrAdmin(currentRole)) return;
    studentStatus.textContent = "Đã cập nhật";
    const assignments = stats?.totalAssignments ?? 0;
    const submissions = stats?.totalSubmissions ?? 0;
    const avg = Number(stats?.averageScore);
    const rate = Number(stats?.submissionRate);
    const safeRate = Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 100) : 0;
    studentProgressBar.style.width = `${safeRate}%`;
    studentProgressBar.textContent = `${safeRate.toFixed(1)}%`;
    studentProgressLabel.innerText = "Tỉ lệ học viên đã nộp trong lớp.";
    studentAssignments.innerText = assignments;
    studentSubmissions.innerText = submissions;
    studentAverage.innerText = Number.isFinite(avg) ? avg.toFixed(2) : "—";
  }

  async function loadCourseMeta(){
    if(!courseId) return;
    try{
      const course = await apiFetch(`/courses/${courseId}`);
      document.getElementById("courseTitle").innerText = course.courseName ?? course.name ?? "Khóa học";
      document.getElementById("courseSubtitle").innerText = course.description ?? course.moTa ?? "";
      document.getElementById("courseCode").innerText = `#${course.courseId ?? course.id ?? courseId}`;
    }catch(e){
      document.getElementById("courseTitle").innerText = "Không tải được thông tin khóa học";
    }
  }

  async function loadStats(){
    if(!courseId){
      statsStatus.textContent = "Thiếu mã khóa học";
      document.getElementById("statsMessage").innerText = "Thêm tham số id cho URL (vd: stats.html?id=1).";
      resetStudentCards("Thiếu mã khóa học");
      return;
    }

    try{
      statsStatus.textContent = "Đang tải";
      const stats = await apiFetch(`/teacher/courses/${courseId}/stats`);
      document.getElementById("students").innerText = stats.totalStudents ?? 0;
      document.getElementById("lessons").innerText = stats.totalLessons ?? 0;
      document.getElementById("assign").innerText = stats.totalAssignments ?? 0;
      document.getElementById("submit").innerText = stats.totalSubmissions ?? 0;

      const avg = Number(stats.averageScore);
      const rate = Number(stats.submissionRate);
      document.getElementById("avg").innerText = Number.isFinite(avg) ? avg.toFixed(2) : "—";
      document.getElementById("rate").innerText = Number.isFinite(rate) ? rate.toFixed(2) + "%" : "—";

      statsStatus.textContent = "Đã cập nhật";
      document.getElementById("statsMessage").innerText = "Dữ liệu thống kê được tổng hợp trong 24 giờ gần nhất.";
      renderStudentCards(stats);
    }catch(e){
      statsStatus.textContent = "Lỗi";
      document.getElementById("statsMessage").innerText = "Không thể tải thống kê: " + e.message;
      resetStudentCards("Không có dữ liệu");
      toast("Không thể tải thống kê", "danger");
    }
  }

  // Đổi nút đăng nhập/đăng xuất
  const navAuthBtn = document.getElementById("navAuthBtn");
  if (navAuthBtn) {
    const isValidAuth = (val) => {
      if (!val) return false;
      if (typeof val !== "string") return false;
      if (val.trim() === "" || val === "null" || val === "undefined") return false;
      return true;
    };
    const syncNavAuthBtn = ()=>{
      const authed = isValidAuth(localStorage.getItem("auth"));
      if (authed) {
        navAuthBtn.textContent = "Đăng xuất";
        navAuthBtn.classList.remove("btn-primary");
        navAuthBtn.classList.add("btn-outline-danger");
      } else {
        navAuthBtn.textContent = "Đăng nhập";
        navAuthBtn.classList.remove("btn-outline-danger");
        navAuthBtn.classList.add("btn-primary");
      }
    };
    syncNavAuthBtn();
    navAuthBtn.onclick = ()=>{
      if (isValidAuth(localStorage.getItem("auth"))) {
        if (typeof clearAuth === "function") clearAuth();
        syncNavAuthBtn();
        window.location.href = "login.html";
      } else {
        window.location.href = "login.html";
      }
    };
  }

  resetStudentCards("Đang chờ dữ liệu");
  (async ()=>{
    await tryLoadMe();
    syncRoleBlocks();
    await loadCourseMeta();
    await loadStats();
  })();
});
