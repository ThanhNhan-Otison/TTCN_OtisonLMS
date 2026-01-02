document.addEventListener("DOMContentLoaded", async function () {
  // ===== 1) CHẶN QUYỀN FE (ẩn UI) =====
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const allowed = role === "TEACHER" || role === "ADMIN";

  const roleWarn = document.getElementById("roleWarn");
  const formWrap = document.getElementById("formWrap");
  if (!allowed) {
    roleWarn.classList.remove("d-none");
    formWrap.classList.add("d-none");
    toast("Bạn không có quyền tạo bài học/upload", "warning");
    return;
  }

  // ===== 2) LOAD DANH SÁCH KHÓA HỌC =====
  async function loadCoursesToSelect() {
    try {
      const courses = await apiFetch("/courses"); // GET /api/v1/courses
      const sel = document.getElementById("courseId");
      sel.innerHTML = `<option value="">-- Chọn khóa học --</option>`;

      (courses || []).forEach((c) => {
        const id = c.courseId ?? c.id;
        const name = c.courseName ?? c.name ?? ("Course " + id);
        sel.insertAdjacentHTML(
          "beforeend",
          `<option value="${id}">${name}</option>`
        );
      });
    } catch (e) {
      toast("Không tải được khóa học: " + e.message, "danger");
    }
  }
  await loadCoursesToSelect();

  // ===== 3) UPLOAD + TẠO LESSON =====
  document.getElementById("btnUploadAndCreate").onclick = async () => {
    const courseId = document.getElementById("courseId").value;
    const lessonName = document.getElementById("lessonName").value.trim();
    const content = document.getElementById("content").value.trim();
    const f = document.getElementById("file").files[0];

    if (!courseId) return toast("Chọn khóa học trước", "warning");
    if (!lessonName) return toast("Nhập tên bài học", "warning");
    if (!f) return toast("Chọn video trước", "warning");

    try {
      // (A) Upload video -> lấy url dạng /videos/xxx.mp4
      const fd = new FormData();
      fd.append("file", f);

      const upRes = await fetch(`${API_BASE}/upload/video`, {
        method: "POST",
        headers: { ...getAuthHeader() }, // KHÔNG set Content-Type
        body: fd,
      });

      const upText = await upRes.text();
      if (!upRes.ok) throw new Error(upText || "Upload thất bại");

      const videoUrl = upText; // backend bạn trả plain text: "/videos/....mp4"

      // (B) Gọi API tạo lesson -> lưu DB luôn
      const payload = {
        courseId: Number(courseId),
        lessonName,
        content,
        videoUrl,
      };

      // endpoint createLesson của bạn là POST /api/v1/lessons
      const created = await apiFetch("/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      toast("Tạo bài học thành công!", "success");

      // chuyển về course_detail để thấy bài học mới
      const cid = created?.courseId ?? payload.courseId;
      location.href = `course_detail.html?id=${cid}`;
    } catch (e) {
      toast("Thất bại: " + e.message, "danger");
    }
  };

  // logout
  const handleLogout = () => {
    clearAuth();
    location.href = "login.html";
  };
  document.getElementById("logout")?.addEventListener("click", handleLogout);
  document.getElementById("navLogout")?.addEventListener("click", handleLogout);
});
