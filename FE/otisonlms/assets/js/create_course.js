// assets/js/create_course.js
document.addEventListener("DOMContentLoaded", async () => {
  const $ = (id) => document.getElementById(id);

  // ✅ chuẩn hóa: không cần requireAuth inline trong HTML
  requireAuth("login.html");

  // đảm bảo role/userInfo có sẵn (đặc biệt khi token có nhưng role chưa lưu)
  if (localStorage.getItem("token") && typeof tryLoadMe === "function") {
    await tryLoadMe();
  }

  const form = $("create-course-form");
  const messageDiv = $("create-course-message");
  const logoutBtn = $("logout");

  const setMsg = (html) => {
    if (messageDiv) messageDiv.innerHTML = html || "";
  };

  const role = String(localStorage.getItem("role") || "").toUpperCase().replace("ROLE_", "");

  // Logout
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      clearAuth();
      location.href = "login.html";
    };
  }

  if (!form) return;

  // Chặn UI luôn nếu không phải TEACHER
  if (role !== "TEACHER") {
    setMsg(`<div class="alert alert-danger mb-0">Chỉ TEACHER mới được tạo khóa học.</div>`);
    form.querySelectorAll("input, textarea, button").forEach((el) => (el.disabled = true));
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = $("courseName")?.value?.trim();
    const description = $("courseDescription")?.value?.trim();

    if (!name || !description) {
      setMsg(`<div class="alert alert-warning">Vui lòng nhập đầy đủ tên và mô tả.</div>`);
      return;
    }

    try {
      await apiFetch("/courses", {
        method: "POST",
        json: {
          name,
          description,
          status: "draft",
        },
      });

      setMsg(`<div class="alert alert-success">Tạo khóa học thành công!</div>`);
      form.reset();
    } catch (err) {
      setMsg(`<div class="alert alert-danger">${err?.message || "Có lỗi xảy ra."}</div>`);
    }
  });
});
