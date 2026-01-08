const courseBrowsePager = document.getElementById("courseBrowsePager");
const lessonBrowsePager = document.getElementById("lessonBrowsePager");
const assignmentPager = document.getElementById("pager");

// assets/js/assignments.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM =====
  const $ = (id) => document.getElementById(id);

  const courseInput = $("courseInput");
  const courseDatalist = $("courseDatalist");
  const courseIdHidden = $("courseId");

  const lessonWrap = $("lessonWrap");
  const elLesson = $("lessonFilter");

  const btnCreate = $("btnCreateAssignment");

  // course browse
  const courseBrowse = $("courseBrowse");
  const courseBrowseList = $("courseBrowseList");
  const courseBrowseMeta = $("courseBrowseMeta");

  // lesson browse
  const lessonBrowse = $("lessonBrowse");
  const lessonBrowseList = $("lessonBrowseList");
  const lessonBrowseMeta = $("lessonBrowseMeta");

  // assignments
  const listEl = $("list");
  const metaEl = $("meta");

  // ===== STATE =====
  const state = {
    assignments: [],
    assignmentPage: 1,

    allCourses: [],
    coursePage: 1,
    coursePageSize: 6,

    allLessons: [],
    lessonPage: 1,
    lessonPageSize: 6,

    selectedCourseId: "",
    selectedLessonId: "",
  };

  // ===== helpers =====
  const show = (el, yes) => el && el.classList.toggle("d-none", !yes);
  const setHTML = (el, html) => el && (el.innerHTML = html ?? "");
  const setText = (el, text) => el && (el.textContent = text ?? "");

  function pickId(obj) {
    return obj?.courseId ?? obj?.lessonId ?? obj?.assignmentId ?? obj?.id;
  }

  function getName(obj, { idKeys, nameKeys, fallbackPrefix }) {
    const id = idKeys.map(k => obj?.[k]).find(v => v != null) ?? obj?.id ?? "";
    const name = nameKeys.map(k => obj?.[k]).find(v => v) ?? `${fallbackPrefix} ${id}`;
    return { id, name };
  }

  const getCourse = (c) =>
    getName(c, { idKeys: ["courseId", "id"], nameKeys: ["courseName", "name"], fallbackPrefix: "Course" });

  const getLesson = (l) =>
    getName(l, { idKeys: ["lessonId", "id"], nameKeys: ["lessonName", "name"], fallbackPrefix: "Lesson" });

  function setSelectedCourse(id) {
    state.selectedCourseId = id ? String(id) : "";
    if (courseIdHidden) courseIdHidden.value = state.selectedCourseId;
  }

  function setSelectedLesson(id) {
    state.selectedLessonId = id ? String(id) : "";
  }

  function clearAssignments() {
    state.assignments = [];
    state.assignmentPage = 1;
    renderAssignments();
  }

  function resetLessonUI() {
    state.allLessons = [];
    state.lessonPage = 1;
    setSelectedLesson("");

    if (elLesson) {
      elLesson.innerHTML = `<option value="">-- Chọn bài học --</option>`;
      elLesson.value = "";
      elLesson.disabled = true;
    }

    show(lessonWrap, false);
    setHTML(lessonBrowseList, "");
    function clearAllPagers() {
      if (courseBrowsePager) courseBrowsePager.innerHTML = "";
      if (lessonBrowsePager) lessonBrowsePager.innerHTML = "";
      if (assignmentPager) assignmentPager.innerHTML = "";
    }

    setText(lessonBrowseMeta, "");
    show(lessonBrowse, false);
  }

  // ===== Role: chỉ TEACHER/ADMIN thấy nút tạo =====
  (async () => {
    try { if (typeof tryLoadMe === "function") await tryLoadMe(); } catch { }
    const role = String(localStorage.getItem("role") || "").toUpperCase().replace("ROLE_", "");
    if (btnCreate) btnCreate.style.display = (role === "TEACHER" || role === "ADMIN") ? "" : "none";
  })();

  // ===== shared render for browse cards =====
  function renderBrowse({
    wrapEl,
    listEl,
    metaEl,
    pagerId,
    items,
    page,
    pageSize,
    hideWhen,
    cardHtml,
    onPageChange,
  }) {
    if (!listEl) return;

    if (hideWhen && hideWhen()) {
      show(wrapEl, false);
      return;
    }

    const meta = paginate(items, page, pageSize);
    if (metaEl) setText(metaEl, `Hiển thị ${meta.items.length}/${meta.total} (Trang ${meta.page}/${meta.totalPages})`);

    setHTML(listEl, meta.items.map(cardHtml).join(""));

    renderPager(pagerId, meta, (p) => {
      onPageChange(p);
      renderAll();
    });

    show(wrapEl, true);
  }

  // ===== render courses browse =====
  function renderCourseBrowse() {
    const kw = (courseInput?.value || "").trim().toLowerCase();
    let view = state.allCourses;

    if (kw) {
      view = state.allCourses.filter(c => {
        const { id, name } = getCourse(c);
        return String(id).includes(kw) || String(name).toLowerCase().includes(kw);
      });
    }

    renderBrowse({
      wrapEl: courseBrowse,
      listEl: courseBrowseList,
      metaEl: courseBrowseMeta,
      pagerId: "courseBrowsePager",
      items: view,
      page: state.coursePage,
      pageSize: state.coursePageSize,
      hideWhen: () => !!state.selectedCourseId,
      cardHtml: (c) => {
        const { id, name } = getCourse(c);
        return `
          <div class="col-md-4">
            <div class="border rounded-3 p-2 h-100 d-flex align-items-center">
              <div class="me-auto">
                <div class="fw-semibold">${name}</div>
                <div class="small-muted">ID: ${id}</div>
              </div>
              <button class="btn btn-outline-primary btn-sm" data-pick-course="${id}">Chọn</button>
            </div>
          </div>
        `;
      },
      onPageChange: (p) => (state.coursePage = p),
    });
  }

  // ===== fill lesson dropdown =====
  function fillLessonDropdown() {
    if (!elLesson) return;

    elLesson.innerHTML = `<option value="">-- Chọn bài học --</option>`;
    (state.allLessons || []).forEach(l => {
      const { id, name } = getLesson(l);
      const opt = document.createElement("option");
      opt.value = String(id);
      opt.textContent = name;
      elLesson.appendChild(opt);
    });

    elLesson.value = "";
    elLesson.selectedIndex = 0;
    elLesson.disabled = false;
  }

  // ===== render lesson browse =====
  function renderLessonBrowse() {
    renderBrowse({
      wrapEl: lessonBrowse,
      listEl: lessonBrowseList,
      metaEl: lessonBrowseMeta,
      pagerId: "lessonBrowsePager",
      items: state.allLessons,
      page: state.lessonPage,
      pageSize: state.lessonPageSize,
      hideWhen: () => !state.selectedCourseId || !!state.selectedLessonId,
      cardHtml: (l) => {
        const { id, name } = getLesson(l);
        return `
          <div class="col-md-4">
            <div class="border rounded-3 p-2 h-100 d-flex align-items-center">
              <div class="me-auto">
                <div class="fw-semibold">${name}</div>
                <div class="small-muted">ID: ${id}</div>
              </div>
              <button class="btn btn-outline-primary btn-sm" data-pick-lesson="${id}">Chọn</button>
            </div>
          </div>
        `;
      },
      onPageChange: (p) => (state.lessonPage = p),
    });
  }

  // ===== assignments render =====
  function renderAssignments() {
    const q = ($("q")?.value || "").trim().toLowerCase();
    const ps = parseInt($("pageSize")?.value || "6", 10);

    const filtered = state.assignments.filter(x => (x.title || "").toLowerCase().includes(q));
    const meta = paginate(filtered, state.assignmentPage, ps);

    if (metaEl) metaEl.innerText = `Hiển thị ${meta.items.length}/${meta.total} • Trang ${meta.page}/${meta.totalPages}`;
    if (!listEl) return;

    setHTML(listEl, meta.items.map(a => {
      const id = a.assignmentId ?? a.id;
      const title = a.title ?? "Bài tập";
      const deadline = a.deadline ? new Date(a.deadline).toLocaleString() : "-";
      const maxScore = (a.maxScore ?? "-");

      return `
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
      `;
    }).join(""));

    renderPager("pager", meta, (p) => {
      state.assignmentPage = p;
      renderAssignments();
    });
  }

  // ===== loaders =====
  async function loadCourses() {
    const data = await apiFetch("/courses");
    state.allCourses = Array.isArray(data) ? data : [];

    // datalist
    if (courseDatalist) courseDatalist.innerHTML = "";
    state.allCourses.forEach(c => {
      const { id, name } = getCourse(c);
      const opt = document.createElement("option");
      opt.value = name;
      opt.dataset.id = id;
      courseDatalist?.appendChild(opt);
    });
  }

  async function loadLessons(courseId) {
    state.allLessons = [];
    state.lessonPage = 1;
    setSelectedLesson("");
    clearAssignments();

    if (!courseId) {
      resetLessonUI();
      return;
    }

    const lessons = await apiFetch(`/lessons/course/${courseId}`);
    state.allLessons = Array.isArray(lessons) ? lessons : [];

    show(lessonWrap, true);
    fillLessonDropdown();
    renderLessonBrowse();
  }

  async function loadAssignments(lessonId) {
    if (!lessonId) return clearAssignments();

    const data = await apiFetch(`/assignments/lessons/${lessonId}`);
    state.assignments = Array.isArray(data) ? data : [];
    state.assignmentPage = 1;
    renderAssignments();
  }

  // ===== resolve course input =====
  function resolveCourseIdFromInput() {
    const val = (courseInput?.value || "").trim();
    if (!val) return "";

    const m = val.match(/^\s*\[?(\d+)\]?\s*[-–]?\s*/);
    if (m) return String(Number(m[1]));

    const match = state.allCourses.find(c => {
      const name = (c.courseName ?? c.name ?? "").trim();
      return name && name.toLowerCase() === val.toLowerCase();
    });

    return match ? String(match.courseId ?? match.id) : "";
  }

  // ===== actions =====
  async function pickCourse(courseId) {
    setSelectedCourse(courseId);

    const found = state.allCourses.find(c => String(c.courseId ?? c.id) === String(courseId));
    if (courseInput) courseInput.value = found ? getCourse(found).name : String(courseId);

    show(courseBrowse, false);

    resetLessonUI();
    await loadLessons(courseId);

    renderLessonBrowse();
  }

  async function pickLesson(lessonId) {
    setSelectedLesson(lessonId);
    if (elLesson) elLesson.value = String(lessonId);

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

    state.coursePage = 1;
    renderCourseBrowse();
    show(courseBrowse, true);
  }

  function renderAll() {
    renderCourseBrowse();
    renderLessonBrowse();
  }

  // ===== init =====
  (async () => {
    try {
      await loadCourses();
      clearAssignments();
      resetLessonUI();

      state.coursePage = 1;
      renderCourseBrowse();
    } catch (e) {
      toast?.("Không tải được dữ liệu: " + (e.message || e), "danger");
      console.error(e);
    }
  })();

  // ===== events =====
  courseInput?.addEventListener("input", () => {
    if (!state.selectedCourseId) {
      state.coursePage = 1;
      renderCourseBrowse();
    }
  });

  courseInput?.addEventListener("change", async () => {
    const cid = resolveCourseIdFromInput();
    if (!cid) return resetToCourseBrowse();
    await pickCourse(cid);
  });

  courseBrowse?.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-pick-course]");
    if (!btn) return;
    await pickCourse(btn.dataset.pickCourse);
  });

  lessonBrowse?.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-pick-lesson]");
    if (!btn) return;
    await pickLesson(btn.dataset.pickLesson);
  });

  elLesson?.addEventListener("change", async () => {
    const lid = elLesson.value;

    if (!lid) {
      setSelectedLesson("");
      clearAssignments();
      renderLessonBrowse();
      return;
    }

    await pickLesson(lid);
  });

  $("q")?.addEventListener("input", () => {
    state.assignmentPage = 1;
    renderAssignments();
  });

  $("pageSize")?.addEventListener("change", () => {
    state.assignmentPage = 1;
    renderAssignments();
  });
  
});
 (function(){
    const pager = document.getElementById('pager');
    const course = document.getElementById('courseBrowse');
    const lesson = document.getElementById('lessonBrowse');

    function updatePagerVisibility(){
      const courseVisible = course && !course.classList.contains('d-none');
      const lessonVisible = lesson && !lesson.classList.contains('d-none');
      pager.style.display = (courseVisible || lessonVisible) ? 'none' : '';
    }

    // initial
    updatePagerVisibility();

    // observe class changes so visibility updates when your app shows/hides sections
    const obs = new MutationObserver(updatePagerVisibility);
    if (course) obs.observe(course, { attributes: true, attributeFilter: ['class'] });
    if (lesson) obs.observe(lesson, { attributes: true, attributeFilter: ['class'] });
  })();
