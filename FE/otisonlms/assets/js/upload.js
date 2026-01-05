// assets/js/upload_lesson.js
document.addEventListener("DOMContentLoaded", async () => {
  // đảm bảo có role (nếu đã login)
  try { if (typeof tryLoadMe === "function") await tryLoadMe(); } catch {}

  const role = String(localStorage.getItem("role") || "").toUpperCase();
  const allowed = role === "TEACHER" || role === "ADMIN";

  const roleWarn = document.getElementById("roleWarn");
  const formWrap = document.getElementById("formWrap");

  if (!allowed) {
    roleWarn?.classList.remove("d-none");
    formWrap?.classList.add("d-none");
    if (typeof toast === "function") toast("Bạn không có quyền tạo bài học/upload", "warning");
    return;
  }

  // ===== elements =====
  const selCourse = document.getElementById("courseId");
  const inpLessonName = document.getElementById("lessonName");
  const inpContent = document.getElementById("content");
  const inpFile = document.getElementById("file");
  const inpVideoUrl = document.getElementById("videoUrl");

  const btnUpload = document.getElementById("btnUpload");
  const btnCreate = document.getElementById("btnCreateLesson");

  // preview
  const pvTitle = document.getElementById("pvTitle");
  const pvCourse = document.getElementById("pvCourse");
  const pvContent = document.getElementById("pvContent");
  const pvVideo = document.getElementById("pvVideo");
  const pvVideoMsg = document.getElementById("pvVideoMsg");

  let courseMap = new Map(); // id -> name

  // ===== helpers =====
  function setPreview() {
    const title = (inpLessonName?.value || "").trim();
    const content = (inpContent?.value || "").trim();
    const courseId = selCourse?.value || "";
    const courseName = courseMap.get(String(courseId)) || "—";
    const videoUrl = (inpVideoUrl?.value || "").trim();

    if (pvTitle) pvTitle.textContent = title || "—";
    if (pvContent) pvContent.textContent = content || "—";
    if (pvCourse) pvCourse.textContent = `Khóa học: ${courseName || "—"}`;

    // preview video
    if (!pvVideo || !pvVideoMsg) return;

    // reset
    pvVideo.classList.add("d-none");
    pvVideo.removeAttribute("src");
    pvVideo.load?.();
    pvVideoMsg.textContent = "Chưa có video.";

    if (!videoUrl) return;

    // nếu là /videos/... => build url từ host backend
    let src = videoUrl;
    if (videoUrl.startsWith("/")) {
      src = `http://localhost:8080${videoUrl}`;
    }

    // chỉ preview nếu là http(s) hoặc /...
    if (src.startsWith("http://") || src.startsWith("https://")) {
      pvVideo.src = src;
      pvVideo.classList.remove("d-none");
      pvVideoMsg.textContent = "";
    } else {
      pvVideoMsg.textContent = "videoUrl không hợp lệ để preview.";
    }
  }

  async function loadCourses() {
    const courses = await apiFetch("/courses");
    if (!selCourse) return;

    selCourse.innerHTML = `<option value="">-- Chọn khóa học --</option>`;
    courseMap.clear();

    (courses || []).forEach(c => {
      const id = c.courseId ?? c.id;
      const name = c.courseName ?? c.name ?? ("Course " + id);
      if (id == null) return;
      courseMap.set(String(id), String(name));
      selCourse.insertAdjacentHTML("beforeend", `<option value="${id}">${name}</option>`);
    });
  }

  async function uploadVideo(file) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_BASE}/upload/video`, {
      method: "POST",
      headers: { ...getAuthHeader() }, // KHÔNG set Content-Type
      body: fd,
    });

    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");

    if (!res.ok) {
      const msg = (data && data.message) ? data.message : (typeof data === "string" ? data : `HTTP ${res.status}`);
      throw new Error(msg || "Upload thất bại");
    }

    // backend bạn trả String "/videos/xxx.mp4"
    if (typeof data === "string") return data.trim();
    return (data?.url || data?.path || "").trim();
  }

  // ===== init =====
  try {
    await loadCourses();
    setPreview();
  } catch (e) {
    toast("Không tải được khóa học: " + (e?.message || e), "danger");
  }

  // ===== live preview =====
  selCourse?.addEventListener("change", setPreview);
  inpLessonName?.addEventListener("input", setPreview);
  inpContent?.addEventListener("input", setPreview);
  inpVideoUrl?.addEventListener("input", setPreview);

  // ===== upload video =====
  btnUpload?.addEventListener("click", async () => {
    const f = inpFile?.files?.[0];
    if (!f) return toast("Chọn video trước", "warning");

    btnUpload.disabled = true;
    try {
      const url = await uploadVideo(f);
      if (inpVideoUrl) inpVideoUrl.value = url;
      toast("Upload video thành công!", "success");
      setPreview();
    } catch (e) {
      toast("Upload thất bại: " + (e?.message || e), "danger");
    } finally {
      btnUpload.disabled = false;
    }
  });

  // ===== create lesson =====
  btnCreate?.addEventListener("click", async () => {
    const courseId = Number(selCourse?.value || 0);
    const lessonName = (inpLessonName?.value || "").trim();
    const content = (inpContent?.value || "").trim();
    const videoUrl = (inpVideoUrl?.value || "").trim();

    if (!courseId) return toast("Chọn khóa học trước", "warning");
    if (!lessonName) return toast("Nhập tên bài học", "warning");
    if (!videoUrl) return toast("Bạn chưa upload video / chưa có videoUrl", "warning");

    btnCreate.disabled = true;
    try {
      // bạn có thể đổi key "courseId" theo đúng DTO/Controller của bạn
      const payload = { courseId, lessonName, content, videoUrl };

      const created = await apiFetch("/lessons", {
        method: "POST",
        json: payload,
      });

      toast("Tạo bài học thành công!", "success");

      // quay về course_detail
      const cid = created?.courseId ?? payload.courseId;
      location.href = `course_detail.html?id=${cid}`;
    } catch (e) {
      toast("Tạo bài học thất bại: " + (e?.message || e), "danger");
      console.error(e);
    } finally {
      btnCreate.disabled = false;
    }
  });
});
