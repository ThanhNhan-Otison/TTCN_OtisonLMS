// assets/js/stats.js
document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  let courseId = params.get("id");
  if (!courseId || courseId === "undefined") courseId = null;

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

  // ===== Detail blocks =====
  const teacherDetailEl = document.getElementById("teacherDetail");
  const studentDetailEl = document.getElementById("studentDetail");

  const teacherDetailNote = document.getElementById("teacherDetailNote");
  const teacherStudentsTbody = document.getElementById("teacherStudentsTbody");
  const teacherLessonsList = document.getElementById("teacherLessonsList");
  const teacherAssignmentsList = document.getElementById("teacherAssignmentsList");
  const teacherSubmissionsList = document.getElementById("teacherSubmissionsList");

  const studentDetailNote = document.getElementById("studentDetailNote");
  const detailProgressBar = document.getElementById("detailProgressBar");
  const detailProgressLabel = document.getElementById("detailProgressLabel");
  const mySubmittedList = document.getElementById("mySubmittedList");
  const myPendingList = document.getElementById("myPendingList");

  // Teacher fields
  // const elAvg = document.getElementById("avg");
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

  function showDetailBlocks() {
    if (!courseId) return;
    const isTA = isTeacherOrAdmin(currentRole);
    if (teacherDetailEl) teacherDetailEl.style.display = isTA ? "block" : "none";
    if (studentDetailEl) studentDetailEl.style.display = !isTA ? "block" : "none";
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

    if (studentStatus) {
      studentStatus.textContent = status === "COMPLETED" ? "Hoàn thành" : "Đang học";
      studentStatus.className =
        "badge " + (status === "COMPLETED" ? "text-bg-success" : "text-bg-primary");
    }

    const rate = total > 0 ? (submitted * 100) / total : 0;
    const safeRate = Math.min(Math.max(rate, 0), 100);

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

  // ================= TEACHER / ADMIN (SINGLE) =================
  function renderTeacherCards(stats) {
    if (!isTeacherOrAdmin(currentRole)) return;

    safeText(elStudents, stats?.totalStudents);
    safeText(elAssign, stats?.totalAssignments);
    safeText(elSubmit, stats?.totalSubmissions);
    safeText(elSubmittedStudents, stats?.submittedStudents);

    // const avg = Number(stats?.averageScore);
    const rate = Number(stats?.submissionRate);

    // safeText(elAvg, Number.isFinite(avg) ? avg.toFixed(2) : "—");
    safeText(elRate, Number.isFinite(rate) ? rate.toFixed(2) + "%" : "—");
  }

  // ================= COURSE META (SINGLE) =================
  async function loadCourseMetaSingle() {
    const course = await apiFetch(`/courses/${courseId}`);
    if (heroTitle) heroTitle.innerText = course.name ?? course.courseName ?? "Khóa học";
    if (heroSub) heroSub.innerText = course.description ?? "";
    if (heroCode) heroCode.innerText = `#${course.courseId ?? courseId}`;
  }

  // ================= STATS (SINGLE) =================
  async function loadStatsSingle() {
    try {
      if (isTeacherOrAdmin(currentRole)) setTeacherTopStatus("Đang tải...");
      else if (studentStatus) studentStatus.textContent = "Đang tải...";

      const path = isTeacherOrAdmin(currentRole)
        ? `/teacher/courses/${courseId}/stats`
        : `/courses/${courseId}/stats/me`;

      const stats = await apiFetch(path);

      renderTeacherCards(stats);
      renderStudentCards(stats);

      if (isTeacherOrAdmin(currentRole)) setTeacherTopStatus("Đã cập nhật");

      return stats;
    } catch (e) {
      if (isTeacherOrAdmin(currentRole)) setTeacherTopStatus("Lỗi");
      if (statsMessage) statsMessage.textContent = "Không thể tải thống kê";
      toast?.("Không thể tải thống kê", "danger");
      return null;
    }
  }

  // ================= ALL COURSES =================
  async function loadAllCoursesStats() {
    showOnly(allCoursesStatsEl);

    if (heroTitle) heroTitle.innerText = "Thống kê tất cả khóa học";
    if (heroSub) {
      heroSub.innerText = isTeacherOrAdmin(currentRole)
        ? "Các khóa bạn quản lý / giảng dạy"
        : "Các khóa bạn đã đăng ký";
    }
    if (heroCode) heroCode.innerText = "#ALL";

    if (allStatsList) allStatsList.innerHTML = "";
    if (allStatsNote) allStatsNote.innerText = "Đang tải...";

    let courses = [];

    if (currentRole === "TEACHER") {
      courses = await apiFetch("/teacher/courses");
    } else if (currentRole === "ADMIN") {
      courses = await apiFetch("/courses");
    } else {
      const enrollments = await apiFetch("/enrollments/me");
      const ids = [...new Set(
        (Array.isArray(enrollments) ? enrollments : [])
          .map(e => e.courseId ?? e.course?.courseId ?? e.course?.id ?? e.course ?? null)
          .filter(v => v != null)
          .map(v => Number(v))
          .filter(v => Number.isFinite(v))
      )];

      courses = await Promise.all(ids.map(id => apiFetch(`/courses/${id}`).catch(() => null)));
      courses = courses.filter(Boolean);
    }

    if (!Array.isArray(courses)) courses = [];

    if (allStatsList) {
      allStatsList.innerHTML = courses.map(c => {
        const cid = c.courseId ?? c.id;
        if (!cid) return "";
        return `
          <div class="border rounded-3 p-3">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">${c.name ?? c.courseName ?? "Khóa học"}</div>
                <div class="small text-muted">${c.description ?? ""}</div>
              </div>
              <a class="btn btn-outline-primary btn-sm" href="stats.html?id=${cid}">
                Chi tiết
              </a>
            </div>
          </div>
        `;
      }).join("");
    }

    if (allStatsNote) allStatsNote.innerText = `Đã tải ${courses.length} khóa.`;
  }

  // ================= DETAIL: TEACHER / ADMIN =================
  async function loadTeacherDetail() {
    if (!courseId) return;
    if (!isTeacherOrAdmin(currentRole)) return;

    try {
      if (teacherDetailNote) teacherDetailNote.textContent = "Đang tải...";

      // 1) Students in course
      const enrollments = await apiFetch(`/enrollments/course/${courseId}`).catch(() => []);
      const enrollArr = Array.isArray(enrollments) ? enrollments : [];

      if (teacherStudentsTbody) {
        teacherStudentsTbody.innerHTML = enrollArr.length
          ? enrollArr.map((e, idx) => {
            const name =
              e.StudentName ?? e.studentName ?? e.ten ?? e.name ?? "—";
            const email =
              e.studentEmail ?? e.email ?? "—";
            const created =
              e.registeredAt ?? e.createdDate ?? e.enrolledAt ?? e.createdAt ?? "";
            const sid =
              e.studentId ?? e.studentID ?? e.StudentId ?? e.StudentID ?? "—";

            return `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${name}</td>
                  <td>${email !== "—" ? email : `<span class="text-muted">ID: ${sid}</span>`}</td>
                  <td>${created ? new Date(created).toLocaleString() : "—"}</td>
                </tr>
              `;
          }).join("")
          : `
            <tr>
              <td colspan="4" class="text-muted">Chưa có sinh viên đăng ký.</td>
            </tr>
          `;
      }

      // 2) Assignments (theo course)
      const assignments = await apiFetch(`/courses/${courseId}/assignments`).catch(() => []);
      const assignmentsArr = Array.isArray(assignments) ? assignments : [];

      if (teacherAssignmentsList) {
        teacherAssignmentsList.innerHTML = assignmentsArr.length
          ? assignmentsArr.map(a => {
            const id = a.assignmentId ?? a.id ?? "—";
            const title = a.title ?? a.ten ?? "Bài tập";
            const desc = a.description ?? a.moTa ?? "";
            const deadline = a.deadline ? ` • Deadline: ${new Date(a.deadline).toLocaleString()}` : "";
            return `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-semibold">${title}</div>
                    <div class="small text-muted">#${id}${deadline}${desc ? " • " + desc : ""}</div>
                  </div>
                  <a class="btn btn-outline-secondary btn-sm" href="assignment_detail.html?id=${id}">
                    Xem
                  </a>
                </li>
              `;
          }).join("")
          : `<li class="list-group-item text-muted">Chưa có bài tập.</li>`;
      }

      // 3) Submissions (teacher all) -> filter by courseId
      const submissionsAll = await apiFetch(`/submissions/teacher`).catch(() => []);
      const subsAllArr = Array.isArray(submissionsAll) ? submissionsAll : [];
      const subsInCourse = subsAllArr.filter(s => String(s.courseId ?? "") === String(courseId));

      if (teacherSubmissionsList) {
        teacherSubmissionsList.innerHTML = subsInCourse.length
          ? subsInCourse.map(s => {
            const sid = s.submissionId ?? s.id ?? "—";
            const studentName = s.studentName ?? s.student?.ten ?? s.student?.name ?? "—";
            const asgTitle = s.assignmentTitle ?? "Bài tập";
            const score = s.score ?? s.diem ?? null;
            const at = s.submittedAt ?? s.createdDate ?? s.createdAt ?? "";
            return `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-semibold">#${sid} • ${studentName}</div>
                    <div class="small text-muted">${asgTitle}${at ? " • " + new Date(at).toLocaleString() : ""}</div>
                  </div>
                  <span class="badge ${score == null ? "text-bg-secondary" : "text-bg-success"}">
                    ${score == null ? "Chưa chấm" : `Điểm: ${score}`}
                  </span>
                </li>
              `;
          }).join("")
          : `<li class="list-group-item text-muted">Chưa có bài nộp trong khóa này.</li>`;
      }

      // 4) Lessons (KHÔNG gọi /courses/{id}/lessons vì 403)
      // Ưu tiên suy từ assignments (nếu có lessonId). Nếu không có -> suy từ submissions (lessonId/lessonName).
      // ✅ đúng endpoint: /api/v1/lessons/course/{courseId}
      const lessons = await apiFetch(`/lessons/course/${courseId}`).catch(() => []);
const lessonArr = Array.isArray(lessons) ? lessons : [];

if (teacherLessonsList) {
  teacherLessonsList.innerHTML = lessonArr.length
    ? lessonArr.map(l => {
        const lid = l.lessonId ?? l.id ?? "—";
        const name = l.lessonName ?? l.name ?? l.title ?? "Bài học";
        const desc = l.description ?? l.moTa ?? "";

        return `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <a href="lesson_detail.html?id=${lid}" class="fw-semibold text-decoration-none">
                ${name}
              </a>
              <div class="small text-muted">${desc}</div>
            </div>

            <div class="d-flex gap-2 align-items-center">
              <span class="badge text-bg-light">#${lid}</span>
              <a class="btn btn-outline-primary btn-sm" href="lesson.html?id=${lid}">
                Xem
              </a>
            </div>
          </li>
        `;
      }).join("")
    : `<li class="list-group-item text-muted">Chưa có bài học.</li>`;
}

   

      if (teacherDetailNote) teacherDetailNote.textContent = "Đã tải";
    } catch (e) {
      if (teacherDetailNote) teacherDetailNote.textContent = "Lỗi tải chi tiết";
      toast?.(e?.message || "Không thể tải chi tiết (Teacher/Admin)", "danger");
    }
  }

  // ================= DETAIL: USER (student-detail API) =================
  async function loadStudentDetail() {
    if (!courseId) return;
    if (isTeacherOrAdmin(currentRole)) return;

    try {
      if (studentDetailNote) studentDetailNote.textContent = "Đang tải...";

      const detail = await apiFetch(`/stats/courses/${courseId}/student-detail`);

      const total = Number(detail?.totalAssignments ?? 0);
      const submittedCount = Number(detail?.submittedAssignments ?? 0);
      const pendingCount = Number(detail?.pendingAssignments ?? 0);

      const pct = Number(detail?.progressPercent ?? (total > 0 ? (submittedCount * 100) / total : 0));
      const safePct = Math.min(Math.max(pct, 0), 100);

      if (detailProgressBar) {
        detailProgressBar.style.width = `${safePct}%`;
        detailProgressBar.textContent = `${safePct.toFixed(1)}%`;
      }
      if (detailProgressLabel) {
        detailProgressLabel.textContent = `Tiến độ: ${submittedCount}/${total} bài tập đã nộp.`;
      }

      const submittedList = Array.isArray(detail?.submittedList) ? detail.submittedList : [];
      if (mySubmittedList) {
        mySubmittedList.innerHTML = submittedList.length
          ? submittedList.map(a => {
            const asgId = a.assignmentId ?? "—";
            const title = a.title ?? "Bài tập";
            const score = a.score ?? null;
            return `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-semibold">${title}</div>
                    <div class="small text-muted">#${asgId}</div>
                  </div>
                  <span class="badge ${score == null ? "text-bg-secondary" : "text-bg-success"}">
                    ${score == null ? "Đã nộp" : `Điểm: ${score}`}
                  </span>
                </li>
              `;
          }).join("")
          : `<li class="list-group-item text-muted">Chưa có bài nộp.</li>`;
      }

      const pendingList = Array.isArray(detail?.pendingList) ? detail.pendingList : [];
      if (myPendingList) {
        myPendingList.innerHTML = pendingList.length
          ? pendingList.map(a => {
            const asgId = a.assignmentId ?? "—";
            const title = a.title ?? "Bài tập";
            const deadline = a.deadline ? new Date(a.deadline).toLocaleString() : "—";
            return `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-semibold">${title}</div>
                    <div class="small text-muted">#${asgId} • Deadline: ${deadline}</div>
                  </div>
                  <span class="badge text-bg-warning">Chưa nộp</span>
                </li>
              `;
          }).join("")
          : `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div class="fw-semibold">Chưa nộp: ${pendingCount} bài</div>
                <div class="small text-muted">Không còn bài chưa nộp.</div>
              </div>
              <a class="btn btn-outline-primary btn-sm" href="assignments.html?courseId=${courseId}">
                Xem bài tập
              </a>
            </li>
          `;
      }

      if (studentDetailNote) studentDetailNote.textContent = "Đã tải";
    } catch (e) {
      if (studentDetailNote) studentDetailNote.textContent = "Lỗi tải chi tiết";
      toast?.(e?.message || "Không thể tải chi tiết (User)", "danger");
    }
  }

  // ================= INIT =================
  (async () => {
    if (typeof tryLoadMe === "function") await tryLoadMe();
    syncRoleBadge();

    btnReloadAllStats?.addEventListener("click", loadAllCoursesStats);

    // ALL MODE
    if (courseId === null) {
      await loadAllCoursesStats();
      return;
    }

    // SINGLE MODE
    showOnly(isTeacherOrAdmin(currentRole) ? teacherStatsEl : studentStatsEl);

    await loadCourseMetaSingle();
    await loadStatsSingle();

    showDetailBlocks();
    await loadTeacherDetail();
    await loadStudentDetail();
  })();

  // Logout
  const handleLogout = () => {
    clearAuth?.();
    location.href = "login.html";
  };
  document.getElementById("logout")?.addEventListener("click", handleLogout);
  document.getElementById("navLogout")?.addEventListener("click", handleLogout);
});
