

// // assets/js/upload_lesson.js
// document.addEventListener("DOMContentLoaded", async () => {
//   // đảm bảo có role (nếu đã login)
//   try { if (typeof tryLoadMe === "function") await tryLoadMe(); } catch { }

//   const role = String(localStorage.getItem("role") || "").toUpperCase();
//   const allowed = role === "TEACHER" || role === "ADMIN";

//   const roleWarn = document.getElementById("roleWarn");
//   const formWrap = document.getElementById("formWrap");

//   if (!allowed) {
//     roleWarn?.classList.remove("d-none");
//     formWrap?.classList.add("d-none");
//     if (typeof toast === "function") toast("Bạn không có quyền tạo bài học/upload", "warning");
//     return;
//   }

//   // ===== elements =====
//   const fileDoc = document.getElementById("fileDoc");
//   const inpFileUrl = document.getElementById("fileUrl");

//   const selCourse = document.getElementById("courseId");
//   const inpLessonName = document.getElementById("lessonName");
//   const inpContent = document.getElementById("content");

//   const inpFile = document.getElementById("file");       // video file
//   const inpVideoUrl = document.getElementById("videoUrl");

//   const btnUpload = document.getElementById("btnUpload");        // (optional)
//   const btnCreate = document.getElementById("btnCreateLesson");

//   // preview
//   const pvTitle = document.getElementById("pvTitle");
//   const pvCourse = document.getElementById("pvCourse");
//   const pvContent = document.getElementById("pvContent");
//   const pvVideo = document.getElementById("pvVideo");
//   const pvVideoMsg = document.getElementById("pvVideoMsg");

//   let courseMap = new Map(); // id -> name


//   async function loadCourses() {
//     const courses = await apiFetch("/courses");
//     if (!selCourse) return;

//     selCourse.innerHTML = `<option value="">-- Chọn khóa học --</option>`;
//     courseMap.clear();

//     (courses || []).forEach(c => {
//       const id = c.courseId ?? c.id;
//       const name = c.courseName ?? c.name ?? ("Course " + id);
//       if (id == null) return;
//       courseMap.set(String(id), String(name));
//       selCourse.insertAdjacentHTML("beforeend", `<option value="${id}">${name}</option>`);
//     });
//   }

//   // async function uploadVideo(file) {
//   //   const fd = new FormData();
//   //   fd.append("file", file);

//   //   const res = await fetch(`${API_BASE}/upload/video`, {
//   //     method: "POST",
//   //     headers: { ...getAuthHeader() }, // KHÔNG set Content-Type
//   //     body: fd,
//   //   });

//   //   const ct = res.headers.get("content-type") || "";
//   //   const data = ct.includes("application/json")
//   //     ? await res.json().catch(() => null)
//   //     : await res.text().catch(() => "");

//   //   if (!res.ok) {
//   //     const msg = (data && data.message)
//   //       ? data.message
//   //       : (typeof data === "string" ? data : `HTTP ${res.status}`);
//   //     throw new Error(msg || "Upload thất bại");
//   //   }

//   //   // backend bạn trả String "/videos/xxx.mp4"
//   //   if (typeof data === "string") return data.trim();
//   //   return (data?.url || data?.path || "").trim();
//   // }
//   async function uploadVideo(file, courseId) {
//     const fd = new FormData();
//     fd.append("file", file);
//     fd.append("courseId", courseId); // 🔥 QUAN TRỌNG

//     const res = await fetch(`${API_BASE}/upload/video`, {
//       method: "POST",
//       headers: { ...getAuthHeader() },
//       body: fd,
//     });

//     if (!res.ok) {
//       const msg = await res.text().catch(() => "");
//       throw new Error(msg || "Upload video thất bại");
//     }

//     return (await res.text()).trim(); // "/videos/xxx.mp4"
//   }


//   async function uploadDocument(file) {
//     const fd = new FormData();
//     fd.append("file", file);

//     const res = await fetch(`${API_BASE}/upload/document`, {
//       method: "POST",
//       headers: { ...getAuthHeader() }, // KHÔNG set Content-Type
//       body: fd,
//     });

//     if (!res.ok) {
//       const msg = await res.text().catch(() => "");
//       throw new Error(msg || "Upload tài liệu thất bại");
//     }

//     // backend trả "/docs/abc.pdf"
//     return (await res.text()).trim();
//   }

//   function lockUI(locked) {
//     if (btnCreate) btnCreate.disabled = locked;
//     if (btnUpload) btnUpload.disabled = locked;
//     if (selCourse) selCourse.disabled = locked;
//     if (inpLessonName) inpLessonName.disabled = locked;
//     if (inpContent) inpContent.disabled = locked;
//     if (inpFile) inpFile.disabled = locked;
//     if (inpVideoUrl) inpVideoUrl.disabled = locked;
//   }

//   // ✅ 핵: tạo lesson, nếu chưa có videoUrl thì tự upload
//   // async function createLessonAutoUploadIfNeeded() {
//   //   const courseId = Number(selCourse?.value || 0);
//   //   const lessonName = (inpLessonName?.value || "").trim();
//   //   const content = (inpContent?.value || "").trim();

//   //   let videoUrl = (inpVideoUrl?.value || "").trim();
//   //   const file = inpFile?.files?.[0];

//   //   if (!courseId) throw new Error("Chọn khóa học trước");
//   //   if (!lessonName) throw new Error("Nhập tên bài học");

//   //   // nếu user chưa có videoUrl thì bắt buộc phải chọn file để auto upload
//   //   if (!videoUrl) {
//   //     if (!file) throw new Error("Chọn file video (hoặc nhập videoUrl)");
//   //     toast?.("Đang upload video...", "info");

//   //     videoUrl = await uploadVideo(file);
//   //     if (inpVideoUrl) inpVideoUrl.value = videoUrl; // tự điền link
//   //     setPreview();
//   //   }

//   //   // tạo lesson
//   //   const payload = { courseId, lessonName, content, videoUrl };

//   //   const created = await apiFetch("/lessons", {
//   //     method: "POST",
//   //     json: payload,
//   //   });

//   //   return created ?? payload;
//   // }
//   async function createLessonAutoUploadIfNeeded() {
//     const courseId = Number(selCourse?.value || 0);
//     const lessonName = (inpLessonName?.value || "").trim();
//     const content = (inpContent?.value || "").trim();

//     let videoUrl = (inpVideoUrl?.value || "").trim();
//     let fileUrl = (inpFileUrl?.value || "").trim();

//     const videoFile = inpFile?.files?.[0];
//     const docFile = fileDoc?.files?.[0];

//     if (!courseId) throw new Error("Chọn khóa học trước");
//     if (!lessonName) throw new Error("Nhập tên bài học");

//     // ===== VIDEO =====
//     if (!videoUrl && videoFile) {
//       if (!courseId) throw new Error("Chọn khóa học trước");

//       toast("Đang upload video...", "info");
//       videoUrl = await uploadVideo(videoFile, courseId);
//       inpVideoUrl.value = videoUrl;
//     }


//     // ===== DOCUMENT =====
//     if (!fileUrl && docFile) {
//       toast?.("Đang upload tài liệu...", "info");
//       fileUrl = await uploadDocument(docFile);
//       inpFileUrl.value = fileUrl;
//     }

//     // ===== CREATE LESSON =====
//     const payload = {
//       courseId,
//       lessonName,
//       content,
//       videoUrl,
//       fileUrl // 🔥
//     };

//     return await apiFetch("/lessons", {
//       method: "POST",
//       json: payload,
//     });
//   }

//   // ===== init =====
//   try {
//     await loadCourses();
 
//   } catch (e) {
//     toast?.("Không tải được khóa học: " + (e?.message || e), "danger");
//   }

//   // ===== live preview =====


//   // ✅ chọn file -> nếu videoUrl đang trống, show hint + preview chưa có
//   inpFile?.addEventListener("change", () => {
//     // không tự upload ở đây (tránh upload nhầm)
//     if (!(inpVideoUrl?.value || "").trim()) {
//       toast?.("Đã chọn video. Bấm 'Tạo bài học' để tự upload + tạo bài.", "info");
//     }
//   });

//   // (optional) nút Upload ngay nếu bạn vẫn muốn giữ
//   // btnUpload?.addEventListener("click", async () => {
//   //   const f = inpFile?.files?.[0];
//   //   if (!f) return toast?.("Chọn video trước", "warning");

//   //   lockUI(true);
//   //   try {
//   //     const url = await uploadVideo(f);
//   //     if (inpVideoUrl) inpVideoUrl.value = url;
//   //     toast?.("Upload video thành công!", "success");
//   //     setPreview();
//   //   } catch (e) {
//   //     toast?.("Upload thất bại: " + (e?.message || e), "danger");
//   //   } finally {
//   //     lockUI(false);
//   //   }
//   // });
//   btnUpload?.addEventListener("click", async () => {
//     const f = inpFile?.files?.[0];
//     const courseId = Number(selCourse?.value || 0);

//     if (!courseId) return toast("Chọn khóa học trước", "warning");
//     if (!f) return toast("Chọn video trước", "warning");

//     try {
//       const url = await uploadVideo(f, courseId);
//       inpVideoUrl.value = url;
//       toast("Upload video thành công", "success");
     
//     } catch (e) {
//       toast(e.message, "danger");
//     }
//   });


//   // ✅ bấm Tạo bài học: tự upload (nếu cần) + tạo lesson
//   btnCreate?.addEventListener("click", async () => {
//     lockUI(true);
//     try {
//       const created = await createLessonAutoUploadIfNeeded();
//       toast?.("Tạo bài học thành công!", "success");

//       const cid = created?.courseId ?? Number(selCourse?.value || 0);
//       location.href = `course_detail.html?id=${cid}`;
//     } catch (e) {
//       toast?.("Tạo bài học thất bại: " + (e?.message || e), "danger");
//       console.error(e);
//     } finally {
//       lockUI(false);
//     }
//   });
// });


// assets/js/upload_lesson.js
document.addEventListener("DOMContentLoaded", async () => {

  /* ================== AUTH & ROLE ================== */
  try {
    if (typeof tryLoadMe === "function") await tryLoadMe();
  } catch {}

  const role = (localStorage.getItem("role") || "").toUpperCase();
  if (!["TEACHER", "ADMIN"].includes(role)) {
    document.getElementById("roleWarn")?.classList.remove("d-none");
    document.getElementById("formWrap")?.classList.add("d-none");
    toast("Bạn không có quyền tạo bài học", "warning");
    return;
  }

  /* ================== ELEMENTS ================== */
  const selCourse     = document.getElementById("courseId");
  const inpLessonName = document.getElementById("lessonName");
  const inpContent    = document.getElementById("content");

  const inpVideoFile  = document.getElementById("file");
  const inpVideoUrl   = document.getElementById("videoUrl");

  const inpDocFile    = document.getElementById("fileDoc");
  const inpFileUrl    = document.getElementById("fileUrl");

  const btnUpload     = document.getElementById("btnUpload");
  const btnCreate     = document.getElementById("btnCreateLesson");

  /* ================== LOAD COURSES ================== */
  async function loadCourses() {
    const courses = await apiFetch("/courses");
    selCourse.innerHTML = `<option value="">-- Chọn khóa học --</option>`;

    (courses || []).forEach(c => {
      const id = c.courseId ?? c.id;
      const name = c.courseName ?? c.name;
      if (id) {
        selCourse.insertAdjacentHTML(
          "beforeend",
          `<option value="${id}">${name}</option>`
        );
      }
    });
  }

  /* ================== UPLOAD VIDEO ================== */
  async function uploadVideo(file, courseId) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("courseId", courseId);

    const res = await fetch(`${API_BASE}/upload/video`, {
      method: "POST",
      headers: { ...getAuthHeader() },
      body: fd
    });

    if (!res.ok) throw new Error(await res.text());
    return (await res.text()).trim();
  }

  /* ================== UPLOAD DOCUMENT ================== */
  async function uploadDocument(file) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_BASE}/upload/document`, {
      method: "POST",
      headers: { ...getAuthHeader() },
      body: fd
    });

    if (!res.ok) throw new Error(await res.text());
    return (await res.text()).trim();
  }

  /* ================== CREATE LESSON ================== */
  async function createLessonAutoUploadIfNeeded() {
    const courseId = Number(selCourse.value || 0);
    const lessonName = inpLessonName.value.trim();
    const content = inpContent.value.trim();

    let videoUrl = inpVideoUrl.value.trim();
    let fileUrl  = inpFileUrl.value.trim();

    const videoFile = inpVideoFile?.files?.[0];
    const docFile   = inpDocFile?.files?.[0];

    if (!courseId) throw new Error("Chọn khóa học");
    if (!lessonName) throw new Error("Nhập tên bài học");

    if (!videoUrl && videoFile) {
      toast("Đang upload video...", "info");
      videoUrl = await uploadVideo(videoFile, courseId);
      inpVideoUrl.value = videoUrl;
    }

    if (!fileUrl && docFile) {
      toast("Đang upload tài liệu...", "info");
      fileUrl = await uploadDocument(docFile);
      inpFileUrl.value = fileUrl;
    }

    return await apiFetch("/lessons", {
      method: "POST",
      json: { courseId, lessonName, content, videoUrl, fileUrl }
    });
  }

  /* ================== EVENTS ================== */
  btnUpload?.addEventListener("click", async () => {
    const file = inpVideoFile?.files?.[0];
    const cid = Number(selCourse.value || 0);

    if (!cid) return toast("Chọn khóa học trước", "warning");
    if (!file) return toast("Chọn video trước", "warning");

    try {
      const url = await uploadVideo(file, cid);
      inpVideoUrl.value = url;
      toast("Upload video thành công", "success");
    } catch (e) {
      toast(e.message, "danger");
    }
  });

  btnCreate?.addEventListener("click", async () => {
    btnCreate.disabled = true;
    try {
      const created = await createLessonAutoUploadIfNeeded();
      toast("Tạo bài học thành công", "success");

      const cid = created?.courseId ?? selCourse.value;
      location.href = `course_detail.html?id=${cid}`;
    } catch (e) {
      toast(e.message, "danger");
      console.error(e);
    } finally {
      btnCreate.disabled = false;
    }
  });

  /* ================== INIT ================== */
  try {
    await loadCourses();
  } catch {
    toast("Không tải được khóa học", "danger");
  }
});
