// assets/js/assignments.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM helpers =====
  const $ = (id) => document.getElementById(id);
  const show = (el, yes) => el && el.classList.toggle("d-none", !yes);
  const setHTML = (el, html) => el && (el.innerHTML = html ?? "");
  const setText = (el, text) => el && (el.textContent = text ?? "");

  // ===== DOM =====
  const courseInput = $("courseInput");
  const courseDatalist = $("courseDatalist");
  const courseIdHidden = $("courseId");
  const btnCreate = $("btnCreateAssignment");

  const courseBrowse = $("courseBrowse");
  const courseBrowseList = $("courseBrowseList");
  const courseBrowseMeta = $("courseBrowseMeta");

  const listEl = $("list");
  const metaEl = $("meta");
  const assignmentPager = $("pager");

  const btnBackCourses = $("btnBackCourses");

  // ===== STATE =====
  const state = {
    assignments: [],
    assignmentPage: 1,

    allCourses: [],
    coursePage: 1,
    coursePageSize: 6,

    selectedCourseId: "",
  };

  // ===== small utils =====
  const normalizeRole = (r = "") => String(r).toUpperCase().replace("ROLE_", "");
  const getRole = () => normalizeRole(localStorage.getItem("role") || "");
  const isStudent = () => {
    const role = getRole();
    return role === "USER" || role === "STUDENT";
  };

  function pickFirst(obj, keys) {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return undefined;
  }

  function getCourseDisplay(c) {
    const id = pickFirst(c, ["courseId", "id"]) ?? "";
    const name = pickFirst(c, ["courseName", "name"]) ?? `Course ${id}`;
    return { id: String(id), name: String(name) };
  }

  function setSelectedCourse(courseId) {
    state.selectedCourseId = courseId ? String(courseId) : "";
    if (courseIdHidden) courseIdHidden.value = state.selectedCourseId;
  }

  function clearAssignments() {
    state.assignments = [];
    state.assignmentPage = 1;
    renderAssignments();
  }

  // ===== URL param (giữ courseId khi back) =====
  function setCourseParam(courseId) {
    const url = new URL(location.href);
    if (courseId) url.searchParams.set("courseId", String(courseId));
    else url.searchParams.delete("courseId");
    history.replaceState({}, "", url.toString());
  }

  function getCourseIdFromUrl() {
    return new URL(location.href).searchParams.get("courseId") || "";
  }

  // ===== Role: chỉ TEACHER/ADMIN thấy nút tạo =====
  (async () => {
    try {
      if (typeof tryLoadMe === "function") await tryLoadMe();
    } catch {}
    const role = getRole();
    if (btnCreate) btnCreate.style.display = role === "TEACHER" || role === "ADMIN" ? "" : "none";
  })();

  // ===== concurrency helper =====
  async function mapLimit(items, limit, mapper) {
    const arr = Array.isArray(items) ? items : [];
    if (arr.length === 0) return [];
    const out = new Array(arr.length);

    let i = 0;
    const workers = Array.from({ length: Math.min(limit, arr.length) }, async () => {
      while (i < arr.length) {
        const idx = i++;
        out[idx] = await mapper(arr[idx], idx);
      }
    });

    await Promise.all(workers);
    return out;
  }

  // ===== check course has any assignments =====
  async function courseHasAssignments(courseId) {
    try {
      const lessons = await apiFetch(`/lessons/course/${courseId}`);
      const ls = Array.isArray(lessons) ? lessons : [];
      if (ls.length === 0) return false;

      for (const l of ls) {
        const lid = l.lessonId ?? l.id;
        if (!lid) continue;

        const asg = await apiFetch(`/assignments/lessons/${lid}`);
        if (Array.isArray(asg) && asg.length > 0) return true;
      }
      return false;
    } catch (e) {
      console.warn("courseHasAssignments error", courseId, e);
      return false;
    }
  }

  // ===== FE-only =====
  let submittedSet = null; 

  async function ensureSubmittedSetLoaded() {
    if (!isStudent()) return null;
    if (submittedSet) return submittedSet;

    try {
      const mySubs = await apiFetch(`/submissions/me`);
      submittedSet = new Set((Array.isArray(mySubs) ? mySubs : []).map((s) => String(s.assignmentId)));
    } catch (e) {
      console.warn("Không load được /submissions/me để ẩn nút Bài nộp:", e);
      submittedSet = new Set(); 
    }
    return submittedSet;
  }

  async function hideSubmitButtonsInRenderedCards() {
    if (!isStudent() || !listEl) return;

    const set = await ensureSubmittedSetLoaded();
    if (!set) return;

    listEl.querySelectorAll("a[href*='submissions.html?assignmentId=']").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const m = href.match(/assignmentId=(\d+)/);
      if (!m) return;

      const aid = String(m[1]);
      if (set.has(aid)) a.style.display = "none";
    });
  }

  // ===== loaders =====
  async function loadCourses() {
    if (typeof tryLoadMe === "function" && !localStorage.getItem("role")) {
      await tryLoadMe(true);
    }
    const role = getRole();
    let endpoint = "/courses"; 
    if (role === "USER") endpoint = "/courses/enrolled";
    else if (role === "TEACHER") endpoint = "/courses/mine";
    const data = await apiFetch(endpoint);
    const all = Array.isArray(data) ? data : [];
    const checks = await mapLimit(all, 4, async (c) => {
      const cid = c.courseId ?? c.id;
      if (!cid) return { ok: false, c };
      return { ok: await courseHasAssignments(cid), c };
    });
    state.allCourses = checks.filter((x) => x.ok).map((x) => x.c);
    if (courseDatalist) courseDatalist.innerHTML = "";
    state.allCourses.forEach((c) => {
      const { id, name } = getCourseDisplay(c);
      const opt = document.createElement("option");
      opt.value = name;
      opt.dataset.id = id;
      courseDatalist?.appendChild(opt);
    });
  }

  async function loadAssignmentsByCourse(courseId) {
    clearAssignments();
    if (!courseId) return;

    const lessons = await apiFetch(`/lessons/course/${courseId}`);
    const ls = Array.isArray(lessons) ? lessons : [];

    const allAssignments = [];
    for (const l of ls) {
      const lid = l.lessonId ?? l.id;
      if (!lid) continue;

      const asg = await apiFetch(`/assignments/lessons/${lid}`);
      if (Array.isArray(asg) && asg.length) allAssignments.push(...asg);
    }

    // sort deadline desc (optional)
    allAssignments.sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : 0;
      const db = b.deadline ? new Date(b.deadline).getTime() : 0;
      return db - da;
    });

    state.assignments = allAssignments;
    state.assignmentPage = 1;
    renderAssignments();
  }

  // ===== render: course browse =====
  function renderCourseBrowse() {
    const kw = (courseInput?.value || "").trim().toLowerCase();

    let view = state.allCourses;
    if (kw) {
      view = state.allCourses.filter((c) => {
        const { id, name } = getCourseDisplay(c);
        return String(id).includes(kw) || String(name).toLowerCase().includes(kw);
      });
    }

    if (!courseBrowseList) return;

    const meta = paginate(view, state.coursePage, state.coursePageSize);
    setText(courseBrowseMeta, `Hiển thị ${meta.items.length}/${meta.total} (Trang ${meta.page}/${meta.totalPages})`);

    if (meta.total === 0) {
      setHTML(courseBrowseList, `<div class="col-12 small-muted">Không có khóa học nào có bài tập.</div>`);
      show(courseBrowse, !state.selectedCourseId);
      return;
    }

    setHTML(
      courseBrowseList,
      meta.items
        .map((c) => {
          const { id, name } = getCourseDisplay(c);
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
        })
        .join("")
    );

    renderPager("courseBrowsePager", meta, (p) => {
      state.coursePage = p;
      renderCourseBrowse();
    });

    show(courseBrowse, !state.selectedCourseId);
  }

  // ===== render: assignments =====
  function renderAssignments() {
    const q = ($("q")?.value || "").trim().toLowerCase();
    const pageSize = parseInt($("pageSize")?.value || "6", 10);

    if (!state.selectedCourseId) {
      setHTML(listEl, "");
      if (assignmentPager) assignmentPager.innerHTML = "";
      if (metaEl) metaEl.textContent = "";
      return;
    }

    const filtered = (state.assignments || []).filter((x) => (x.title || "").toLowerCase().includes(q));
    const meta = paginate(filtered, state.assignmentPage, pageSize);

    if (metaEl) metaEl.textContent = `Hiển thị ${meta.items.length}/${meta.total} • Trang ${meta.page}/${meta.totalPages}`;
    if (!listEl) return;

    if (meta.total === 0) {
      setHTML(listEl, `<div class="col-12"><div class="alert alert-warning mb-0">Khóa học này chưa có bài tập.</div></div>`);
      if (assignmentPager) assignmentPager.innerHTML = "";
      return;
    }

    setHTML(
      listEl,
      meta.items
        .map((a) => {
          const id = a.assignmentId ?? a.id;
          const title = a.title ?? "Bài tập";
          const deadline = a.deadline ? new Date(a.deadline).toLocaleString() : "-";
          const maxScore = a.maxScore ?? "-";

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
        })
        .join("")
    );

    renderPager("pager", meta, (p) => {
      state.assignmentPage = p;
      renderAssignments();
    });

    // ✅ sau khi render xong, ẩn nút Bài nộp nếu đã nộp (FE-only)
    hideSubmitButtonsInRenderedCards();
  }

  // ===== resolve course input =====
  function resolveCourseIdFromInput() {
    const val = (courseInput?.value || "").trim();
    if (!val) return "";

    // Cho phép nhập "[123] - ..." hoặc "123 - ..."
    const m = val.match(/^\s*\[?(\d+)\]?\s*[-–]?\s*/);
    if (m) return String(Number(m[1]));

    // match theo tên course
    const match = state.allCourses.find((c) => {
      const name = String(c.courseName ?? c.name ?? "").trim();
      return name && name.toLowerCase() === val.toLowerCase();
    });

    return match ? String(match.courseId ?? match.id) : "";
  }

  // ===== actions =====
  async function pickCourse(courseId) {
    setSelectedCourse(courseId);
    setCourseParam(courseId);

    btnBackCourses?.classList.remove("d-none"); // ✅ show back
    show(courseBrowse, false);

    const found = state.allCourses.find((c) => String(c.courseId ?? c.id) === String(courseId));
    if (courseInput) courseInput.value = found ? getCourseDisplay(found).name : String(courseId);

    // preload set 1 lần (để renderAssignments() gọi hide nhanh)
    await ensureSubmittedSetLoaded();

    await loadAssignmentsByCourse(courseId);
  }

  function resetToCourseBrowse() {
    setSelectedCourse("");
    setCourseParam("");

    btnBackCourses?.classList.add("d-none"); // ✅ hide back
    if (courseInput) courseInput.value = "";
    if (courseIdHidden) courseIdHidden.value = "";

    submittedSet = null; // optional: reset cache khi quay lại browse
    clearAssignments();

    state.coursePage = 1;
    renderCourseBrowse();
    show(courseBrowse, true);
  }

  // ===== init =====
  (async () => {
    try {
      requireAuth("login.html");
      await loadCourses();

      // mặc định: ẩn nút back
      btnBackCourses?.classList.add("d-none");

      const cidFromUrl = getCourseIdFromUrl();
      if (cidFromUrl) {
        await pickCourse(cidFromUrl);
        return;
      }

      clearAssignments();
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

  $("q")?.addEventListener("input", () => {
    state.assignmentPage = 1;
    renderAssignments();
  });

  $("pageSize")?.addEventListener("change", () => {
    state.assignmentPage = 1;
    renderAssignments();
  });

  btnBackCourses?.addEventListener("click", (e) => {
    e.preventDefault();
    resetToCourseBrowse();
  });
});
