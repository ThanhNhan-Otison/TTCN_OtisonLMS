document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const hasToken = () => !!localStorage.getItem("token");

  const navAuthBtn = $("navAuthBtn");

  const renderNavAuth = () => {
    if (!navAuthBtn) return;
    const authed = hasToken();

    navAuthBtn.textContent = authed ? "Đăng xuất" : "Đăng nhập";
    navAuthBtn.classList.toggle("btn-primary", !authed);
    navAuthBtn.classList.toggle("btn-outline-danger", authed);
  };

  const bindNavAuth = () => {
    if (!navAuthBtn) return;
    navAuthBtn.onclick = () => {
      if (hasToken()) {
        clearAuth();
        toast("Đã đăng xuất", "info");
        renderNavAuth();
      } else {
        location.href = "login.html";
      }
    };
  };

  const loginAndGo = async (email, password, successMsg) => {
    try {
      await loginJwt(email, password);
      toast(successMsg || "Đăng nhập thành công", "success");
      renderNavAuth();
      location.href = "dashboard.html";
    } catch (e) {
      clearAuth();
      renderNavAuth();
      toast("Đăng nhập thất bại: " + (e?.message || e), "danger");
    }
  };

  // (Optional) Nếu đã đăng nhập rồi thì đá về dashboard
  if (hasToken()) {
    location.href = "dashboard.html";
    return;
  }

  renderNavAuth();
  bindNavAuth();

  const btnLogin = $("btnLogin");
  if (btnLogin) {
    btnLogin.onclick = async () => {
      const email = $("email")?.value?.trim();
      const password = $("password")?.value;

      if (!email || !password) {
        toast("Nhập email và mật khẩu", "warning");
        return;
      }
      await loginAndGo(email, password, "Đăng nhập thành công");
    };
  }

  const btnDemoStudent = $("btnDemoStudent");
  if (btnDemoStudent) {
    btnDemoStudent.onclick = () =>
      loginAndGo("student@gmail.com", "12345", "Đăng nhập demo Student");
  }

  const btnDemoTeacher = $("btnDemoTeacher");
  if (btnDemoTeacher) {
    btnDemoTeacher.onclick = () =>
      loginAndGo("teacher@gmail.com", "12345", "Đăng nhập demo Teacher");
  }
});
