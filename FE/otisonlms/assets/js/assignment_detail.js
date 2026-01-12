// assets/js/assignment_detail.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM helpers =====
  const $ = (id) => document.getElementById(id);
  const show = (el, yes) => el && (el.style.display = yes ? "block" : "none");
  const setText = (el, v) =>
    el && (el.textContent = v === null || v === undefined || v === "" ? "-" : String(v));

  // ===== Query helpers (qs is assumed available globally) =====
  const assignmentId = qs("id");       // assignmentId
  const mode = qs("mode");             // "create" | null
  const isEditMode = () => !!assignmentId && mode !== "create";

  // ===== Role helpers =====
  const roleUpper = () =>
    String(localStorage.getItem("role") || "")
      .toUpperCase()
      .replace("ROLE_", "");

  const isUser = () => ["USER", "STUDENT"].includes(roleUpper());
  const isTeacher = () => ["TEACHER", "ADMIN"].includes(roleUpper());

  // ===== Date =====
  const fmtDate = (d) => {
    if (!d) return "-";
    const s = String(d);
    return s.length >= 10 ? s.slice(0, 10) : s;
  };

  async function ensureMe() {
    if (localStorage.getItem("token") && !localStorage.getItem("role")) {
      if (typeof tryLoadMe === "function") await tryLoadMe();
    }
  }

  // ===== DOM =====
  const dom = {
    infoBox: $("infoBox"),
    submitBox: $("submitBox"),
    createBox: $("createBox"),

    aTitle: $("aTitle"),
    aDesc: $("aDesc"),
    aDue: $("aDue"),
    aMax: $("aMax"),
    aCourse: $("aCourse"),
    aLesson: $("aLesson"),

    answer: $("answer"),
    fileInput: $("file"),
    btnSubmit: $("btnSubmit"),

    btnCreate: $("btnCreate"),
    cTitle: $("cTitle"),
    cDesc: $("cDesc"),
    cDue: $("cDue"),
    cMaxScore: $("cMaxScore"),
    cCourseId: $("cCourseId"),
    cLessonId: $("cLessonId"),
  };

  // ===== Cache =====
  const lessonCache = new Map();
  const courseCache = new Map();

  // ===== Extractors =====
  const getLessonIdFromAssignment = (a) =>
    String(
      a?.lessonId?.lessonId ??
        a?.lesson?.lessonId ??
        a?.lessonId ??
        a?.lesson?.id ??
        ""
    );

  const getCourseIdFromLesson = (lesson) =>
    String(lesson?.courseId ?? lesson?.course?.courseId ?? lesson?.course?.id ?? "");

  const getLessonName = (lesson, fallbackId) =>
    lesson?.lessonName ?? lesson?.name ?? (fallbackId ? `Lesson ID: ${fallbackId}` : "-");

  const getCourseName = (course, fallbackId) =>
    course?.courseName ?? course?.name ?? (fallbackId ? `Course ID: ${fallbackId}` : "-");

  // ===== API wrappers =====
  async function fetchLesson(lessonId) {
    const key = String(lessonId || "").trim();
    if (!key) return null;
    if (lessonCache.has(key)) return lessonCache.get(key);

    const lesson = await apiFetch(`/lessons/${key}`);
    lessonCache.set(key, lesson);
    return lesson;
  }

  async function fetchCourse(courseId) {
    const key = String(courseId || "").trim();
    if (!key) return null;
    if (courseCache.has(key)) return courseCache.get(key);

    const course = await apiFetch(`/courses/${key}`);
    courseCache.set(key, course);
    return course;
  }

  // ===== UI toggles =====
  function showByRole() {
    show(dom.infoBox, true);
    show(dom.submitBox, false); // form nộp sẽ quyết định sau
    show(dom.createBox, isTeacher());
  }

  // ===== FE-only: check đã nộp hay chưa =====
  async function hasSubmitted(aid) {
    if (!aid || !isUser()) return false;

    try {
      const mySubs = await apiFetch(`/submissions/me`);
      return Array.isArray(mySubs) && mySubs.some((s) => String(s.assignmentId) === String(aid));
    } catch (e) {
      console.warn("hasSubmitted error:", e);
      return false; // lỗi thì không khóa nhầm
    }
  }

  async function updateSubmitBoxVisibility() {
    if (!dom.submitBox) return;

    if (!isUser() || !assignmentId) {
      show(dom.submitBox, false);
      return;
    }

    const submitted = await hasSubmitted(assignmentId);
    show(dom.submitBox, !submitted);
  }

  // ===== CREATE helpers =====
  function resetCreateForm() {
    if (dom.cTitle) dom.cTitle.value = "";
    if (dom.cDesc) dom.cDesc.value = "";
    if (dom.cDue) dom.cDue.value = "";
    if (dom.cMaxScore) dom.cMaxScore.value = "";
    if (dom.cCourseId) dom.cCourseId.value = "";

    if (dom.cLessonId) {
      dom.cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
      dom.cLessonId.value = "";
      dom.cLessonId.disabled = true;
    }
  }

  async function loadCourseDropdown() {
    if (!dom.cCourseId) return;

    dom.cCourseId.innerHTML = `<option value="">-- Chọn khóa học --</option>`;
    const courses = await apiFetch("/courses").catch(() => []);

    (Array.isArray(courses) ? courses : []).forEach((c) => {
      const cid = c.courseId ?? c.id;
      if (cid == null) return;

      const name = c.courseName ?? c.name ?? `Course ${cid}`;
      const opt = document.createElement("option");
      opt.value = String(cid);
      opt.textContent = name;
      dom.cCourseId.appendChild(opt);
    });
  }

  async function loadLessonsByCourse(courseId) {
    if (!dom.cLessonId) return;

    dom.cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
    dom.cLessonId.disabled = true;
    if (!courseId) return;

    const lessons = await apiFetch(`/lessons/course/${courseId}`).catch(() => []);
    (Array.isArray(lessons) ? lessons : []).forEach((l) => {
      const lid = l.lessonId ?? l.id;
      if (lid == null) return;

      const name = l.lessonName ?? l.name ?? `Lesson ${lid}`;
      const opt = document.createElement("option");
      opt.value = String(lid);
      opt.textContent = name;
      dom.cLessonId.appendChild(opt);
    });

    dom.cLessonId.disabled = false;
  }

  // ===== Info loaders =====
  async function fillCourseLessonNameByLessonId(lessonId) {
    setText(dom.aLesson, "-");
    setText(dom.aCourse, "-");
    if (!lessonId) return;

    try {
      const lesson = await fetchLesson(lessonId);
      setText(dom.aLesson, getLessonName(lesson, lessonId));

      const cid = getCourseIdFromLesson(lesson);
      if (cid) {
        const course = await fetchCourse(cid);
        setText(dom.aCourse, getCourseName(course, cid));
      }
    } catch {
      setText(dom.aLesson, `Lesson ID: ${lessonId}`);
      setText(dom.aCourse, "-");
    }
  }

  async function loadAssignmentDetail() {
    // CREATE mode / no id
    if (!assignmentId) {
      setText(dom.aTitle, "Tạo bài tập mới");
      setText(dom.aDesc, "");
      setText(dom.aDue, "-");
      setText(dom.aMax, "-");
      setText(dom.aCourse, "-");
      setText(dom.aLesson, "-");
      return { lessonId: "" };
    }

    const a = await apiFetch(`/assignments/${assignmentId}`);

    setText(dom.aTitle, a.title ?? a.assignmentName ?? "Bài tập");
    setText(dom.aDesc, a.description ?? a.moTa ?? "");
    setText(dom.aDue, fmtDate(a.deadline ?? a.dueDate));
    setText(dom.aMax, a.maxScore ?? a.diemToiDa ?? "-");

    const lessonId = getLessonIdFromAssignment(a);
    await fillCourseLessonNameByLessonId(lessonId);

    // Teacher/Admin: fill edit form
    if (isTeacher()) {
      if (dom.cTitle) dom.cTitle.value = a.title ?? "";
      if (dom.cDesc) dom.cDesc.value = a.description ?? "";

      const rawDue = a.deadline ?? a.dueDate ?? "";
      if (dom.cDue && rawDue) dom.cDue.value = String(rawDue).slice(0, 10);

      const ms = a.maxScore ?? a.diemToiDa ?? "";
      if (dom.cMaxScore && ms !== null && ms !== undefined) dom.cMaxScore.value = ms;

      // Edit mode: khóa chọn course/lesson
      if (isEditMode()) {
        if (dom.cCourseId) {
          dom.cCourseId.innerHTML = `<option value="">(Khoá học: xem ở thông tin phía trên)</option>`;
          dom.cCourseId.disabled = true;
        }
        if (dom.cLessonId) {
          dom.cLessonId.innerHTML = lessonId
            ? `<option value="${lessonId}">Lesson ID: ${lessonId}</option>`
            : `<option value="">(Không có lessonId)</option>`;
          dom.cLessonId.value = lessonId || "";
          dom.cLessonId.disabled = true;
        }
      }
    }

    return { lessonId };
  }

  // ===== Submit (USER) =====
  async function submitAssignment() {
    if (!assignmentId) throw new Error("Bài tập chưa có ID để nộp.");

    const submitted = await hasSubmitted(assignmentId);
    if (submitted) throw new Error("Bạn đã nộp bài rồi.");

    const content = (dom.answer?.value || "").trim();
    const file = dom.fileInput?.files?.[0] || null;

    if (!content && !file) throw new Error("Bạn cần nhập link/nội dung hoặc chọn file để nộp.");

    const form = new FormData();
    form.append("assignmentId", String(Number(assignmentId)));
    form.append("content", content);
    if (file) form.append("file", file);

    await apiFetch("/submissions", { method: "POST", body: form });

    toast?.("Nộp bài thành công", "success");
    if (dom.answer) dom.answer.value = "";
    if (dom.fileInput) dom.fileInput.value = "";

    await updateSubmitBoxVisibility();
  }

  // ===== Create/Update (TEACHER/ADMIN) =====
  function buildPayload(editLessonId) {
    const titleVal = dom.cTitle?.value?.trim() || "";
    if (!titleVal) throw new Error("Bạn chưa nhập tiêu đề.");

    const lessonIdVal = isEditMode()
      ? (editLessonId ? Number(editLessonId) : null)
      : (dom.cLessonId?.value ? Number(dom.cLessonId.value) : null);

    if (!lessonIdVal) throw new Error("Bạn chưa chọn bài học.");

    return {
      title: titleVal,
      description: dom.cDesc?.value?.trim() || "",
      deadline: dom.cDue?.value || null,
      maxScore: dom.cMaxScore?.value === "" ? null : Number(dom.cMaxScore?.value),
      lessonId: lessonIdVal,
    };
  }

  async function saveAssignment(editLessonId) {
    const payload = buildPayload(editLessonId);

    if (!isEditMode()) {
      await apiFetch("/assignments", { method: "POST", json: payload });
      toast?.("Tạo bài tập thành công", "success");
      resetCreateForm();
      return;
    }

    await apiFetch(`/assignments/${assignmentId}`, { method: "PUT", json: payload });
    toast?.("Cập nhật bài tập thành công", "success");
    await loadAssignmentDetail();
  }

  // ===== Logout =====
  const handleLogout = () => {
    clearAuth?.();
    location.href = "login.html";
  };

  // ===== Main =====
  (async () => {
    try {
      await ensureMe();
      showByRole();

      // Teacher + create mode: dropdown
      if (isTeacher() && !isEditMode()) {
        await loadCourseDropdown();
        dom.cCourseId?.addEventListener("change", async () => {
          const cid = dom.cCourseId.value;
          if (!cid) {
            if (dom.cLessonId) {
              dom.cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
              dom.cLessonId.value = "";
              dom.cLessonId.disabled = true;
            }
            return;
          }
          await loadLessonsByCourse(cid);
        });
      }

      const { lessonId } = await loadAssignmentDetail();
      await updateSubmitBoxVisibility();

      dom.btnSubmit?.addEventListener("click", async () => {
        if (!isUser()) return;
        try {
          await submitAssignment();
        } catch (e) {
          toast?.("Nộp bài thất bại: " + (e?.message || e), "danger");
        }
      });

      dom.btnCreate?.addEventListener("click", async () => {
        if (!isTeacher()) return;
        try {
          await saveAssignment(lessonId);
        } catch (e) {
          toast?.("Lưu thất bại: " + (e?.message || e), "danger");
        }
      });

      $("logout")?.addEventListener("click", handleLogout);
      $("navLogout")?.addEventListener("click", handleLogout);
    } catch (e) {
      toast?.("Lỗi: " + (e?.message || e), "danger");
      console.error(e);
    }
  })();
});
