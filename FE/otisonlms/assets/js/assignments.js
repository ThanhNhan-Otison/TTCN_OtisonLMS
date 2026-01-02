// assets/js/assignments.js
document.addEventListener("DOMContentLoaded", function () {
  let all = [];
  let page = 1;

  const lessonWrap = document.getElementById("lessonWrap");
  const elLesson = document.getElementById("lessonFilter");

  const courseInput = document.getElementById("courseInput");
  const courseDatalist = document.getElementById("courseDatalist");
  const courseIdHidden = document.getElementById("courseId");

  const btnCreate = document.getElementById("btnCreateAssignment");

  // ✅ Ẩn hẳn field Lesson ngay từ đầu
  if (lessonWrap) lessonWrap.classList.add("d-none");
  if (elLesson) {
    elLesson.innerHTML = "";
    elLesson.disabled = true;
  }

  // ===== role FE: chỉ TEACHER/ADMIN thấy nút tạo =====
  (async () => {
    await tryLoadMe();
    const role = (localStorage.getItem("role") || "").toUpperCase();
    if (btnCreate) btnCreate.style.display = (role === "TEACHER" || role === "ADMIN") ? "" : "none";
  })();

  function render() {
    const q = (document.getElementById("q")?.value || "").trim().toLowerCase();
    const ps = parseInt(document.getElementById("pageSize")?.value || "6", 10);

    const filtered = all.filter(x => (x.title || "").toLowerCase().includes(q));
    const meta = paginate(filtered, page, ps);

    const metaEl = document.getElementById("meta");
    if (metaEl) metaEl.innerText = `Hiển thị ${meta.items.length}/${meta.total} • Trang ${meta.page}/${meta.totalPages}`;

    const list = document.getElementById("list");
    if (!list) return;
    list.innerHTML = "";

    meta.items.forEach(a => {
      const id = a.assignmentId ?? a.id;
      const title = a.title ?? "Bài tập";
      const deadline = a.deadline ? new Date(a.deadline).toLocaleString() : "-";
      const maxScore = (a.maxScore ?? "-");

      list.insertAdjacentHTML("beforeend", `
        <div class="col-md-4">
          <div class="card shadow-soft p-3 h-100">
            <div class="fw-bold">${title}</div>
            <div class="small-muted">Hạn: ${deadline}</div>
            <div class="small-muted">Điểm tối đa: ${maxScore}</div>
            <div class="mt-3 d-flex gap-2">
              <a class="btn btn-outline-primary btn-sm" href="assignment_detail.html?id=${id}">Chi tiết</a>
              <a class="btn btn-outline-secondary btn-sm" href="submissions.html?assignmentId=${id}">Bài nộp</a>
            </div>
          </div>
        </div>
      `);
    });

    renderPager("pager", meta, (p) => { page = p; render(); });
  }

  async function loadCoursesIntoDatalist() {
    const data = await apiFetch("/courses");
    if (courseDatalist) courseDatalist.innerHTML = "";

    (data || []).forEach(c => {
      const id = c.courseId ?? c.id;
      const name = c.courseName ?? c.name ?? `Course ${id}`;
      const opt = document.createElement("option");
      opt.value = name;
      opt.dataset.id = id;
      courseDatalist?.appendChild(opt);
    });

    return Array.isArray(data) ? data : [];
  }

  function resolveCourseIdFromInput(allCourses) {
    const val = (courseInput?.value || "").trim();
    if (!val) {
      if (courseIdHidden) courseIdHidden.value = "";
      return "";
    }

    // nhập dạng [10] abc hoặc 10 - abc
    const m = val.match(/^\s*\[?(\d+)\]?\s*[-–]?\s*/);
    if (m) {
      const cid = Number(m[1]);
      if (courseIdHidden) courseIdHidden.value = String(cid);
      return cid;
    }

    // match theo tên
    const match = allCourses.find(c => {
      const name = (c.courseName ?? c.name ?? "").trim();
      return name.toLowerCase() === val.toLowerCase();
    });

    const id = match ? (match.courseId ?? match.id) : "";
    if (courseIdHidden) courseIdHidden.value = id ? String(id) : "";
    return id;
  }

  async function loadLessonsByCourse(courseId) {
    if (!elLesson || !lessonWrap) return;

    // ❌ chưa có course → ẨN HẲN
    if (!courseId) {
      lessonWrap.classList.add("d-none");
      elLesson.innerHTML = "";
      elLesson.disabled = true;
      return;
    }

    // ✅ có course → HIỆN field lesson
    lessonWrap.classList.remove("d-none");
    elLesson.innerHTML = "";
    elLesson.disabled = true;

    const lessons = await apiFetch(`/lessons/course/${courseId}`);

    elLesson.insertAdjacentHTML("beforeend", `<option value="">-- Chọn bài học --</option>`);

    (lessons || []).forEach(l => {
      const id = l.lessonId ?? l.id;
      const name = l.lessonName ?? `Lesson ${id}`;
      elLesson.insertAdjacentHTML("beforeend", `<option value="${id}">[${id}] ${name}</option>`);
    });

    elLesson.disabled = false;
  }

  async function loadAssignmentsByLesson(lessonId) {
    if (!lessonId) {
      all = [];
      page = 1;
      render();
      return;
    }
    const data = await apiFetch(`/assignments/lessons/${lessonId}`);
    all = Array.isArray(data) ? data : [];
    page = 1;
    render();
  }

  // ===== init =====
  let __coursesCache = [];
  (async () => {
    __coursesCache = await loadCoursesIntoDatalist();
    all = [];
    render();
  })();

  // ===== events =====
  courseInput?.addEventListener("change", async () => {
    const cid = resolveCourseIdFromInput(__coursesCache);

    if (!cid) {
      await loadLessonsByCourse("");
      all = [];
      render();
      return;
    }

    await loadLessonsByCourse(cid);
    all = [];
    render();
  });

  courseInput?.addEventListener("input", () => {
    const cid = resolveCourseIdFromInput(__coursesCache);
    if (!cid) loadLessonsByCourse("");
  });

  elLesson?.addEventListener("change", async () => {
    await loadAssignmentsByLesson(elLesson.value);
  });

  document.getElementById("q")?.addEventListener("input", () => { page = 1; render(); });
  document.getElementById("pageSize")?.addEventListener("change", () => { page = 1; render(); });
});
