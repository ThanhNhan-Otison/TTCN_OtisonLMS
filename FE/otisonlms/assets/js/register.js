// assets/js/register.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const status = document.getElementById("registerStatus");
  if (!form || !status) return;

  const ALLOWED_ROLES = ["USER", "TEACHER"];

  const setStatus = (msg = "", ok = false) => {
    status.textContent = msg;
    status.classList.toggle("text-success", ok);
    status.classList.toggle("text-danger", !ok);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const fullName = String(fd.get("fullName") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const confirmPassword = String(fd.get("confirmPassword") || "");
    const role = String(fd.get("role") || "").toUpperCase();

    // ===== VALIDATE =====
    if (!fullName || !email || !password || !confirmPassword || !role)
      return setStatus("Vui lòng điền đầy đủ thông tin.");

    if (password !== confirmPassword)
      return setStatus("Mật khẩu nhập lại không khớp.");

    if (!ALLOWED_ROLES.includes(role))
      return setStatus("Phân quyền không hợp lệ.");

    // UI loading
    status.textContent = "Đang xử lý...";
    status.classList.remove("text-danger", "text-success");

    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: fullName,
          email,
          password,
          role, // chỉ USER hoặc TEACHER
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok)
        return setStatus(data.message || "Đăng ký thất bại.");

      setStatus("Đăng ký thành công! Bạn có thể đăng nhập.", true);
      setTimeout(() => (location.href = "login.html"), 1500);
    } catch {
      setStatus("Lỗi kết nối máy chủ.");
    }
  });
});
