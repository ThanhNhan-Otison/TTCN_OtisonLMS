// // assets/js/login.js
// // All logic from login.html inline script, wrapped in DOMContentLoaded

// document.addEventListener('DOMContentLoaded', function() {
//   const navAuthBtn = document.getElementById("navAuthBtn");
//   const syncNavAuthBtn = ()=>{
//     const authed = !!localStorage.getItem("auth");
//     if (authed) {
//       navAuthBtn.textContent = "Đăng xuất";
//       navAuthBtn.classList.remove("btn-primary");
//       navAuthBtn.classList.add("btn-outline-danger");
//     } else {
//       navAuthBtn.textContent = "Đăng nhập";
//       navAuthBtn.classList.remove("btn-outline-danger");
//       navAuthBtn.classList.add("btn-primary");
//     }
//   };

//   syncNavAuthBtn();

//   navAuthBtn.onclick = ()=>{
//     if (localStorage.getItem("auth")) {
//       clearAuth();
//       toast("Đã đăng xuất", "info");
//       syncNavAuthBtn();
//     } else {
//       window.location.href = "login.html";
//     }
//   };

//   document.getElementById("btnLogin").onclick = async () => {
//     const email = document.getElementById("email").value.trim();
//     const password = document.getElementById("password").value;

//     if(!email || !password) return toast("Nhập email + mật khẩu", "warning");

//     setBasicAuth(email, password);

//     // test gọi API để biết auth OK
//     try {
//       await apiFetch("/courses"); // đổi nếu bạn muốn
//       await tryLoadMe(); // nếu BE có /users/me
//       syncNavAuthBtn();
//       window.location.href = "dashboard.html";
//     } catch (e) {
//       clearAuth();
//       toast("Sai tài khoản hoặc bị chặn quyền: " + e.message, "danger");
//       syncNavAuthBtn();
//     }
//   };

//   document.getElementById("btnDemoStudent").onclick = () => {
//     setBasicAuth("student@gmail.com","12345");
//     toast("Đã lưu Basic auth demo Student", "success");
//   };
//   document.getElementById("btnDemoTeacher").onclick = () => {
//     setBasicAuth("teacher@gmail.com","12345");
//     toast("Đã lưu Basic auth demo Teacher", "success");
//   };
// });
// assets/js/login.js
// JWT version – minimal changes

document.addEventListener('DOMContentLoaded', function () {

  const navAuthBtn = document.getElementById("navAuthBtn");

  const isAuthed = () => !!localStorage.getItem("token");

  const syncNavAuthBtn = () => {
    if (!navAuthBtn) return;

    if (isAuthed()) {
      navAuthBtn.textContent = "Đăng xuất";
      navAuthBtn.classList.remove("btn-primary");
      navAuthBtn.classList.add("btn-outline-danger");
    } else {
      navAuthBtn.textContent = "Đăng nhập";
      navAuthBtn.classList.remove("btn-outline-danger");
      navAuthBtn.classList.add("btn-primary");
    }
  };

  syncNavAuthBtn();

  if (navAuthBtn) {
    navAuthBtn.onclick = () => {
      if (isAuthed()) {
        clearAuth();
        toast("Đã đăng xuất", "info");
        syncNavAuthBtn();
      } else {
        window.location.href = "login.html";
      }
    };
  }

  // ===== LOGIN =====
  const btnLogin = document.getElementById("btnLogin");
  if (btnLogin) {
    btnLogin.onclick = async () => {
      const email = document.getElementById("email")?.value?.trim();
      const password = document.getElementById("password")?.value;

      if (!email || !password) {
        toast("Nhập email và mật khẩu", "warning");
        return;
      }

      try {
        await loginJwt(email, password); // ✅ JWT login
        toast("Đăng nhập thành công", "success");
        syncNavAuthBtn();
        window.location.href = "dashboard.html";
      } catch (e) {
        clearAuth();
        toast("Đăng nhập thất bại: " + e.message, "danger");
        syncNavAuthBtn();
      }
    };
  }

  // ===== DEMO ACCOUNTS (JWT) =====
  const btnDemoStudent = document.getElementById("btnDemoStudent");
  if (btnDemoStudent) {
    btnDemoStudent.onclick = async () => {
      try {
        await loginJwt("student@gmail.com", "12345");
        toast("Đăng nhập demo Student", "success");
        window.location.href = "dashboard.html";
      } catch (e) {
        toast(e.message, "danger");
      }
    };
  }

  const btnDemoTeacher = document.getElementById("btnDemoTeacher");
  if (btnDemoTeacher) {
    btnDemoTeacher.onclick = async () => {
      try {
        await loginJwt("teacher@gmail.com", "12345");
        toast("Đăng nhập demo Teacher", "success");
        window.location.href = "dashboard.html";
      } catch (e) {
        toast(e.message, "danger");
      }
    };
  }

});
