// assets/js/create_course.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("create-course-form");
  const messageDiv = document.getElementById("create-course-message");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("courseName").value.trim();
    const description = document.getElementById("courseDescription").value.trim();

    // (tuỳ chọn) chặn UI nếu không phải TEACHER
    const role = (localStorage.getItem("role") || "").toUpperCase();
    if (role !== "TEACHER") {
      messageDiv.innerHTML = `<div class="alert alert-danger">Chỉ TEACHER mới được tạo khóa học.</div>`;
      return;
    }

    try {
      const res = await apiFetch("/courses", {
        method: "POST",
        json: {
          name,
          description,
          status: "publish" // nếu BE yêu cầu, còn không thì bỏ
        }
      });

      messageDiv.innerHTML = `<div class="alert alert-success">Tạo khóa học thành công!</div>`;
      form.reset();
    } catch (err) {
      messageDiv.innerHTML = `<div class="alert alert-danger">${err.message || "Có lỗi xảy ra."}</div>`;
    }
  });
});
