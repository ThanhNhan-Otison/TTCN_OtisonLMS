// assets/js/assignment_detail.js
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const id = qs("id");            // assignmentId
  const mode = qs("mode");        // "create" | null
  const isEdit = () => !!id && mode !== "create";

  // ===== DOM =====
  const infoBox = $("infoBox");
  const submitBox = $("submitBox");
  const createBox = $("createBox");

  const aTitle = $("aTitle");
  const aDesc = $("aDesc");
  const aDue = $("aDue");
  const aMax = $("aMax");
  const aCourse = $("aCourse");
  const aLesson = $("aLesson");

  const answer = $("answer");
  const fileInput = $("file");
  const btnSubmit = $("btnSubmit");

  const btnCreate = $("btnCreate");
  const cTitle = $("cTitle");
  const cDesc = $("cDesc");
  const cDue = $("cDue");
  const cMaxScore = $("cMaxScore");
  const cCourseId = $("cCourseId");   // chỉ dùng khi CREATE
  const cLessonId = $("cLessonId");   // CREATE + hiển thị khi EDIT

  // ===== cache =====
  const lessonCache = new Map();
  const courseCache = new Map();

  // ===== helpers =====
  const roleUpper = () =>
    String(localStorage.getItem("role") || "").toUpperCase().replace("ROLE_", "");

  const isUser = () => ["USER", "STUDENT"].includes(roleUpper());
  const isTeacher = () => ["TEACHER", "ADMIN"].includes(roleUpper());

  const show = (el, yes) => el && (el.style.display = yes ? "block" : "none");
  const setText = (el, v) => el && (el.textContent = (v === null || v === undefined || v === "" ? "-" : String(v)));

  const fmtDate = (d) => {
    if (!d) return "-";
    const s = String(d);
    return s.length >= 10 ? s.slice(0, 10) : s;
  };

  async function ensureMe() {
    if (localStorage.getItem("token") && !localStorage.getItem("role")) {
      await tryLoadMe();
    }
  }

  // ===== extractors =====
  function getLessonIdFromAssignment(a) {
    return String(
      a?.lessonId?.lessonId ??
      a?.lesson?.lessonId ??
      a?.lessonId ??
      a?.lesson?.id ??
      ""
    );
  }

  function getCourseIdFromLesson(lesson) {
    return String(
      lesson?.courseId ??
      lesson?.course?.courseId ??
      lesson?.course?.id ??
      ""
    );
  }

  function getLessonName(lesson, fallbackId) {
    return (
      lesson?.lessonName ??
      lesson?.name ??
      (fallbackId ? `Lesson ID: ${fallbackId}` : "-")
    );
  }

  function getCourseName(course, fallbackId) {
    return (
      course?.courseName ??
      course?.name ??
      (fallbackId ? `Course ID: ${fallbackId}` : "-")
    );
  }

  // ===== API helpers =====
  async function fetchLesson(lessonId) {
    const key = String(lessonId || "").trim();
    if (!key) return null;
    if (lessonCache.has(key)) return lessonCache.get(key);

    // ⚠️ nếu BE bạn không có /lessons/{id} thì sửa endpoint ở đây
    const lesson = await apiFetch(`/lessons/${key}`);
    lessonCache.set(key, lesson);
    return lesson;
  }

  async function fetchCourse(courseId) {
    const key = String(courseId || "").trim();
    if (!key) return null;
    if (courseCache.has(key)) return courseCache.get(key);

    // /courses/{id} thường có
    const course = await apiFetch(`/courses/${key}`);
    courseCache.set(key, course);
    return course;
  }

  // ===== UI: show boxes by role =====
  function showByRole() {
    show(infoBox, true);
    show(submitBox, isUser());
    show(createBox, isTeacher());
  }

  // ===== CREATE form helpers =====
  function resetCreateForm() {
    if (cTitle) cTitle.value = "";
    if (cDesc) cDesc.value = "";
    if (cDue) cDue.value = "";
    if (cMaxScore) cMaxScore.value = "";
    if (cCourseId) cCourseId.value = "";

    if (cLessonId) {
      cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
      cLessonId.value = "";
      cLessonId.disabled = true;
    }
  }

  async function loadCourseDropdown() {
    if (!cCourseId) return;
    cCourseId.innerHTML = `<option value="">-- Chọn khóa học --</option>`;

    const courses = await apiFetch("/courses");
    (courses || []).forEach((c) => {
      const cid = c.courseId ?? c.id;
      const name = c.courseName ?? c.name ?? `Course ${cid}`;
      if (cid == null) return;
      const opt = document.createElement("option");
      opt.value = String(cid);
      opt.textContent = name;
      cCourseId.appendChild(opt);
    });
  }

  async function loadLessonsByCourse(courseId) {
    if (!cLessonId) return;

    cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
    cLessonId.disabled = true;
    if (!courseId) return;

    const lessons = await apiFetch(`/lessons/course/${courseId}`);
    (lessons || []).forEach((l) => {
      const lid = l.lessonId ?? l.id;
      const name = l.lessonName ?? l.name ?? `Lesson ${lid}`;
      if (lid == null) return;
      const opt = document.createElement("option");
      opt.value = String(lid);
      opt.textContent = name;
      cLessonId.appendChild(opt);
    });

    cLessonId.disabled = false;
  }

  // ===== load info =====
  async function fillCourseLessonNameByLessonId(lessonId) {
    setText(aLesson, "-");
    setText(aCourse, "-");
    if (!lessonId) return;

    try {
      const lesson = await fetchLesson(lessonId);
      setText(aLesson, getLessonName(lesson, lessonId));

      const cid = getCourseIdFromLesson(lesson);
      if (cid) {
        const course = await fetchCourse(cid);
        setText(aCourse, getCourseName(course, cid));
      }
    } catch {
      setText(aLesson, `Lesson ID: ${lessonId}`);
      setText(aCourse, "-");
    }
  }

  async function loadAssignmentDetail() {
    if (!id) {
      setText(aTitle, "Tạo bài tập mới");
      setText(aDesc, "");
      setText(aDue, "-");
      setText(aMax, "-");
      setText(aCourse, "-");
      setText(aLesson, "-");
      return { lessonId: "" };
    }

    const a = await apiFetch(`/assignments/${id}`);

    // info box
    setText(aTitle, a.title ?? a.assignmentName ?? "Bài tập");
    setText(aDesc, a.description ?? a.moTa ?? "");
    setText(aDue, fmtDate(a.deadline ?? a.dueDate));
    setText(aMax, a.maxScore ?? a.diemToiDa ?? "-");

    const lessonId = getLessonIdFromAssignment(a);
    await fillCourseLessonNameByLessonId(lessonId);

    // teacher fill edit form
    if (isTeacher()) {
      if (cTitle) cTitle.value = a.title ?? "";
      if (cDesc) cDesc.value = a.description ?? "";
      const rawDue = a.deadline ?? a.dueDate ?? "";
      if (cDue && rawDue) cDue.value = String(rawDue).slice(0, 10);

      const ms = a.maxScore ?? a.diemToiDa ?? "";
      if (cMaxScore && ms !== null && ms !== undefined) cMaxScore.value = ms;

      if (isEdit()) {
        // edit: khóa course/lesson
        if (cCourseId) {
          cCourseId.innerHTML = `<option value="">(Khoá học: xem ở thông tin phía trên)</option>`;
          cCourseId.disabled = true;
        }
        if (cLessonId) {
          cLessonId.innerHTML = lessonId
            ? `<option value="${lessonId}">Lesson ID: ${lessonId}</option>`
            : `<option value="">(Không có lessonId)</option>`;
          cLessonId.value = lessonId || "";
          cLessonId.disabled = true;
        }
      }
    }

    return { lessonId };
  }

  // ===== submit =====
  async function submitAssignment() {
    if (!id) throw new Error("Bài tập chưa có ID để nộp.");

    const content = (answer?.value || "").trim();
    const file = fileInput?.files?.[0] || null;

    if (!content && !file) throw new Error("Bạn cần nhập link/nội dung hoặc chọn file để nộp.");

    const form = new FormData();
    form.append("assignmentId", String(Number(id)));
    form.append("content", content);
    if (file) form.append("file", file);

    await apiFetch("/submissions", { method: "POST", body: form });

    toast?.("Nộp bài thành công", "success");
    if (answer) answer.value = "";
    if (fileInput) fileInput.value = "";
  }

  // ===== create/update =====
  function buildPayload(editLessonId) {
    const titleVal = cTitle?.value?.trim() || "";
    if (!titleVal) throw new Error("Bạn chưa nhập tiêu đề.");

    const lessonIdVal = isEdit()
      ? (editLessonId ? Number(editLessonId) : null)
      : (cLessonId?.value ? Number(cLessonId.value) : null);

    if (!lessonIdVal) throw new Error("Bạn chưa chọn bài học.");

    return {
      title: titleVal,
      description: cDesc?.value?.trim() || "",
      deadline: cDue?.value || null,
      maxScore: (cMaxScore?.value === "" ? null : Number(cMaxScore?.value)),
      lessonId: lessonIdVal,
    };
  }

  async function saveAssignment(editLessonId) {
    const payload = buildPayload(editLessonId);

    if (!isEdit()) {
      await apiFetch("/assignments", { method: "POST", json: payload });
      toast?.("Tạo bài tập thành công", "success");
      resetCreateForm();
      return;
    }

    await apiFetch(`/assignments/${id}`, { method: "PUT", json: payload });
    toast?.("Cập nhật bài tập thành công", "success");
    await loadAssignmentDetail();
  }

  // ===== main =====
  (async () => {
    try {
      await ensureMe();
      showByRole();

      // teacher + create mode: dropdown course/lesson
      if (isTeacher() && !isEdit()) {
        await loadCourseDropdown();
        cCourseId?.addEventListener("change", async () => {
          const cid = cCourseId.value;
          if (!cid) {
            if (cLessonId) {
              cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
              cLessonId.value = "";
              cLessonId.disabled = true;
            }
            return;
          }
          await loadLessonsByCourse(cid);
        });
      }

      const { lessonId } = await loadAssignmentDetail();

      btnSubmit?.addEventListener("click", async () => {
        if (!isUser()) return;
        try { await submitAssignment(); }
        catch (e) { toast?.("Nộp bài thất bại: " + (e.message || e), "danger"); }
      });

      btnCreate?.addEventListener("click", async () => {
        if (!isTeacher()) return;
        try { await saveAssignment(lessonId); }
        catch (e) { toast?.("Lưu thất bại: " + (e.message || e), "danger"); }
      });
    } catch (e) {
      toast?.("Lỗi: " + (e.message || e), "danger");
      console.error(e);
    }
  })();

  // logout
  const handleLogout = () => {
    clearAuth();
    location.href = "login.html";
  };
  $("logout")?.addEventListener("click", handleLogout);
  $("navLogout")?.addEventListener("click", handleLogout);
});
