// assets/js/assignments.js
document.addEventListener("DOMContentLoaded", function () {
  // ===== STATE =====
  let assignments = [];
  let assignmentPage = 1;

  let allCourses = [];
  let coursePage = 1;
  const coursePageSize = 6;

  let allLessons = [];
  let lessonPage = 1;
  const lessonPageSize = 6;

  // selected
  let selectedCourseId = "";
  let selectedLessonId = "";

  // ===== DOM =====
  const courseInput = document.getElementById("courseInput");
  const courseDatalist = document.getElementById("courseDatalist");
  const courseIdHidden = document.getElementById("courseId");

  const lessonWrap = document.getElementById("lessonWrap");
  const elLesson = document.getElementById("lessonFilter");

  const btnCreate = document.getElementById("btnCreateAssignment");

  // course browse
  const courseBrowse = document.getElementById("courseBrowse");
  const courseBrowseList = document.getElementById("courseBrowseList");
  const courseBrowseMeta = document.getElementById("courseBrowseMeta");
  const courseBrowsePager = document.getElementById("courseBrowsePager");

  // lesson browse
  const lessonBrowse = document.getElementById("lessonBrowse");
  const lessonBrowseList = document.getElementById("lessonBrowseList");
  const lessonBrowseMeta = document.getElementById("lessonBrowseMeta");
  const lessonBrowsePager = document.getElementById("lessonBrowsePager");

  // assignments
  const listEl = document.getElementById("list");
  const metaEl = document.getElementById("meta");

  // ===== UI helpers =====
  function show(el, yes) {
    if (!el) return;
    el.classList.toggle("d-none", !yes);
  }

  function getCourseName(c) {
    const id = c.courseId ?? c.id;
    const name = c.courseName ?? c.name ?? `Course ${id}`;
    return { id, name };
  }

  function getLessonName(l) {
    const id = l.lessonId ?? l.id;
    const name = l.lessonName ?? l.name ?? `Lesson ${id}`;
    return { id, name };
  }

  function setSelectedCourse(id) {
    selectedCourseId = id ? String(id) : "";
    if (courseIdHidden) courseIdHidden.value = selectedCourseId;
  }

  function setSelectedLesson(id) {
    selectedLessonId = id ? String(id) : "";
  }

  function resetLessonUI() {
    allLessons = [];
    lessonPage = 1;
    setSelectedLesson("");

    // dropdown ẩn & reset
    if (elLesson) {
      elLesson.innerHTML = `<option value="">-- Chọn bài học --</option>`;
      elLesson.value = "";
      elLesson.disabled = true;
    }
    show(lessonWrap, false);

    // cards ẩn
    if (lessonBrowseList) lessonBrowseList.innerHTML = "";
    if (lessonBrowseMeta) lessonBrowseMeta.textContent = "";
    show(lessonBrowse, false);
  }

  function clearAssignments() {
    assignments = [];
    assignmentPage = 1;
    renderAssignments();
  }

  // ===== Role: chỉ TEACHER/ADMIN thấy nút tạo =====
  (async () => {
    try { if (typeof tryLoadMe === "function") await tryLoadMe(); } catch {}
    const role = String(localStorage.getItem("role") || "").toUpperCase();
    if (btnCreate) btnCreate.style.display = (role === "TEACHER" || role === "ADMIN") ? "" : "none";
  })();

  // ===================== RENDER COURSES =====================
  function renderCourseBrowse() {
    if (!courseBrowseList || !courseBrowsePager) return;

    // chỉ hiện khi chưa chọn course
    if (selectedCourseId) {
      show(courseBrowse, false);
      return;
    }

    const kw = (courseInput?.value || "").trim().toLowerCase();
    let view = allCourses;

    if (kw) {
      view = allCourses.filter(c => {
        const { id, name } = getCourseName(c);
        return String(id).includes(kw) || String(name).toLowerCase().includes(kw);
      });
    }

    const meta = paginate(view, coursePage, coursePageSize);

    if (courseBrowseMeta) {
      courseBrowseMeta.textContent =
        `Hiển thị ${meta.items.length}/${meta.total} (Trang ${meta.page}/${meta.totalPages})`;
    }

    courseBrowseList.innerHTML = "";
    meta.items.forEach(c => {
      const { id, name } = getCourseName(c);
      courseBrowseList.insertAdjacentHTML("beforeend", `
        <div class="col-md-4">
          <div class="border rounded-3 p-2 h-100 d-flex align-items-center">
            <div class="me-auto">
              <div class="fw-semibold">${name}</div>
              <div class="small-muted">ID: ${id}</div>
            </div>
            <button class="btn btn-outline-primary btn-sm" data-pick-course="${id}">Chọn</button>
          </div>
        </div>
      `);
    });

    renderPager("courseBrowsePager", meta, (p) => {
      coursePage = p;
      renderCourseBrowse();
    });

    show(courseBrowse, true);
  }

  // ===================== RENDER LESSON CARDS =====================
  function renderLessonBrowse() {
    if (!lessonBrowseList || !lessonBrowsePager) return;

    // ✅ hiện khi đã chọn course nhưng CHƯA chọn lesson
    if (!selectedCourseId || selectedLessonId) {
      show(lessonBrowse, false);
      return;
    }

    const meta = paginate(allLessons, lessonPage, lessonPageSize);

    if (lessonBrowseMeta) {
      lessonBrowseMeta.textContent =
        `Hiển thị ${meta.items.length}/${meta.total} (Trang ${meta.page}/${meta.totalPages})`;
    }

    lessonBrowseList.innerHTML = "";
    meta.items.forEach(l => {
      const { id, name } = getLessonName(l);
      lessonBrowseList.insertAdjacentHTML("beforeend", `
        <div class="col-md-4">
          <div class="border rounded-3 p-2 h-100 d-flex align-items-center">
            <div class="me-auto">
              <div class="fw-semibold">${name}</div>
              <div class="small-muted">ID: ${id}</div>
            </div>
            <button class="btn btn-outline-primary btn-sm" data-pick-lesson="${id}">Chọn</button>
          </div>
        </div>
      `);
    });

    renderPager("lessonBrowsePager", meta, (p) => {
      lessonPage = p;
      renderLessonBrowse();
    });

    show(lessonBrowse, true);
  }

  // ===================== FILL DROPDOWN LESSON =====================
  function fillLessonDropdown() {
    if (!elLesson) return;

    elLesson.innerHTML = `<option value="">-- Chọn bài học --</option>`;
    (allLessons || []).forEach(l => {
      const { id, name } = getLessonName(l);
      const opt = document.createElement("option");
      opt.value = String(id);
      opt.textContent = name;
      elLesson.appendChild(opt);
    });

    // ✅ QUAN TRỌNG: ép về "chưa chọn" để lessonBrowse hiện
    elLesson.value = "";
    elLesson.selectedIndex = 0;
    elLesson.disabled = false;
  }

  // ===================== RENDER ASSIGNMENTS =====================
  function renderAssignments() {
    const q = (document.getElementById("q")?.value || "").trim().toLowerCase();
    const ps = parseInt(document.getElementById("pageSize")?.value || "6", 10);

    const filtered = assignments.filter(x => (x.title || "").toLowerCase().includes(q));
    const meta = paginate(filtered, assignmentPage, ps);

    if (metaEl) {
      metaEl.innerText = `Hiển thị ${meta.items.length}/${meta.total} • Trang ${meta.page}/${meta.totalPages}`;
    }

    if (!listEl) return;
    listEl.innerHTML = "";

    meta.items.forEach(a => {
      const id = a.assignmentId ?? a.id;
      const title = a.title ?? "Bài tập";
      const deadline = a.deadline ? new Date(a.deadline).toLocaleString() : "-";
      const maxScore = (a.maxScore ?? "-");

      listEl.insertAdjacentHTML("beforeend", `
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

    renderPager("pager", meta, (p) => {
      assignmentPage = p;
      renderAssignments();
    });
  }

  // ===================== LOADERS =====================
  async function loadCourses() {
    const data = await apiFetch("/courses");
    allCourses = Array.isArray(data) ? data : [];

    // datalist
    if (courseDatalist) courseDatalist.innerHTML = "";
    allCourses.forEach(c => {
      const { id, name } = getCourseName(c);
      const opt = document.createElement("option");
      opt.value = name;
      opt.dataset.id = id;
      courseDatalist?.appendChild(opt);
    });
  }

  async function loadLessons(courseId) {
    allLessons = [];
    lessonPage = 1;

    setSelectedLesson("");
    clearAssignments();         // ✅ chưa chọn lesson => chưa có assignments

    if (!courseId) {
      resetLessonUI();
      return;
    }

    const lessons = await apiFetch(`/lessons/course/${courseId}`);
    allLessons = Array.isArray(lessons) ? lessons : [];

    // show dropdown lesson
    show(lessonWrap, true);
    fillLessonDropdown();

    // ✅ luôn hiện lesson cards sau khi chọn course
    renderLessonBrowse();
  }

  async function loadAssignments(lessonId) {
    if (!lessonId) {
      clearAssignments();
      return;
    }
    const data = await apiFetch(`/assignments/lessons/${lessonId}`);
    assignments = Array.isArray(data) ? data : [];
    assignmentPage = 1;
    renderAssignments();
  }

  // ===================== RESOLVE COURSE INPUT =====================
  function resolveCourseIdFromInput() {
    const val = (courseInput?.value || "").trim();
    if (!val) return "";

    // [10] abc | 10 - abc | 10
    const m = val.match(/^\s*\[?(\d+)\]?\s*[-–]?\s*/);
    if (m) return String(Number(m[1]));

    // match by name
    const match = allCourses.find(c => {
      const name = (c.courseName ?? c.name ?? "").trim();
      return name && name.toLowerCase() === val.toLowerCase();
    });

    return match ? String(match.courseId ?? match.id) : "";
  }

  // ===================== ACTIONS =====================
  async function pickCourse(courseId) {
    setSelectedCourse(courseId);

    // set input = course name
    const found = allCourses.find(c => String(c.courseId ?? c.id) === String(courseId));
    if (courseInput) courseInput.value = found ? getCourseName(found).name : String(courseId);

    // UI: hide course cards
    show(courseBrowse, false);

    // reset lesson + load lessons
    resetLessonUI();
    await loadLessons(courseId);

    // lesson cards will be shown (selectedLessonId="")
    renderLessonBrowse();
  }

  async function pickLesson(lessonId) {
    setSelectedLesson(lessonId);

    // sync dropdown
    if (elLesson) elLesson.value = String(lessonId);

    // hide lesson cards, load assignments
    show(lessonBrowse, false);
    await loadAssignments(lessonId);
  }

  function resetToCourseBrowse() {
    setSelectedCourse("");
    setSelectedLesson("");
    if (courseInput) courseInput.value = "";
    if (courseIdHidden) courseIdHidden.value = "";

    clearAssignments();
    resetLessonUI();

    coursePage = 1;
    renderCourseBrowse();
    show(courseBrowse, true);
  }

  // ===================== INIT =====================
  (async () => {
    try {
      await loadCourses();
      clearAssignments();
      resetLessonUI();

      // initial: show course browse
      coursePage = 1;
      renderCourseBrowse();
    } catch (e) {
      toast("Không tải được dữ liệu: " + (e.message || e), "danger");
      console.error(e);
    }
  })();

  // ===================== EVENTS =====================
  // gõ lọc course browse (khi chưa chọn course)
  courseInput?.addEventListener("input", () => {
    if (!selectedCourseId) {
      coursePage = 1;
      renderCourseBrowse();
    }
  });

  // change: nếu match course -> pick course
  courseInput?.addEventListener("change", async () => {
    const cid = resolveCourseIdFromInput();
    if (!cid) {
      resetToCourseBrowse();
      return;
    }
    await pickCourse(cid);
  });

  // click course card
  courseBrowse?.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-pick-course]");
    if (!btn) return;
    await pickCourse(btn.dataset.pickCourse);
  });

  // click lesson card
  lessonBrowse?.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-pick-lesson]");
    if (!btn) return;
    await pickLesson(btn.dataset.pickLesson);
  });

  // dropdown lesson change => load assignments
  elLesson?.addEventListener("change", async () => {
    const lid = elLesson.value;

    if (!lid) {
      // chưa chọn => hiện lesson cards lại, assignments rỗng
      setSelectedLesson("");
      clearAssignments();
      renderLessonBrowse();
      return;
    }

    await pickLesson(lid);
  });

  // search assignments
  document.getElementById("q")?.addEventListener("input", () => {
    assignmentPage = 1;
    renderAssignments();
  });

  // page size assignments
  document.getElementById("pageSize")?.addEventListener("change", () => {
    assignmentPage = 1;
    renderAssignments();
  });
});
