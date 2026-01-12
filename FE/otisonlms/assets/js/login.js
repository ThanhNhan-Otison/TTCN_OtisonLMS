// document.addEventListener("DOMContentLoaded", () => {
//   const $ = (id) => document.getElementById(id);
//   const hasToken = () => !!localStorage.getItem("token");

//   const navAuthBtn = $("navAuthBtn");

//   const renderNavAuth = () => {
//     if (!navAuthBtn) return;
//     const authed = hasToken();

//     navAuthBtn.textContent = authed ? "Đăng xuất" : "Đăng nhập";
//     navAuthBtn.classList.toggle("btn-primary", !authed);
//     navAuthBtn.classList.toggle("btn-outline-danger", authed);
//   };

//   const bindNavAuth = () => {
//     if (!navAuthBtn) return;
//     navAuthBtn.onclick = () => {
//       if (hasToken()) {
//         clearAuth();
//         toast("Đã đăng xuất", "info");
//         renderNavAuth();
//       } else {
//         location.href = "login.html";
//       }
//     };
//   };

//   const loginAndGo = async (email, password, successMsg) => {
//     try {
//       await loginJwt(email, password);
//       toast(successMsg || "Đăng nhập thành công", "success");
//       renderNavAuth();
//       location.href = "dashboard.html";
//     } catch (e) {
//       clearAuth();
//       renderNavAuth();
//       toast("Đăng nhập thất bại: " + (e?.message || e), "danger");
//     }
//   };

//   // (Optional) Nếu đã đăng nhập rồi thì đá về dashboard
//   if (hasToken()) {
//     location.href = "dashboard.html";
//     return;
//   }

//   renderNavAuth();
//   bindNavAuth();

//   const btnLogin = $("btnLogin");
//   if (btnLogin) {
//     btnLogin.onclick = async () => {
//       const email = $("email")?.value?.trim();
//       const password = $("password")?.value;

//       if (!email || !password) {
//         toast("Nhập email và mật khẩu", "warning");
//         return;
//       }
//       await loginAndGo(email, password, "Đăng nhập thành công");
//     };
//   }

//   // const btnDemoStudent = $("btnDemoStudent");
//   // if (btnDemoStudent) {
//   //   btnDemoStudent.onclick = () =>
//   //     loginAndGo("student@gmail.com", "12345", "Đăng nhập demo Student");
//   // }

//   // const btnDemoTeacher = $("btnDemoTeacher");
//   // if (btnDemoTeacher) {
//   //   btnDemoTeacher.onclick = () =>
//   //     loginAndGo("teacher@gmail.com", "12345", "Đăng nhập demo Teacher");
//   // }
// });

// // test reset ,...
// document.addEventListener("DOMContentLoaded", () => {
//   const $ = (id) => document.getElementById(id);

//   // ====== CONFIG ======
//   const API_BASE = "http://localhost:8080"; // đổi đúng port backend bạn đang chạy
//   const API_PREFIX = "/api/v1/auth"; // nếu controller có @RequestMapping("/auth") thì set = "/auth"

//   const loginBox = $("loginBox");
//   const forgotBox = $("forgotBox");
//   const resetBox = $("resetBox");

//   const setActiveBox = (boxToShow) => {
//     [loginBox, forgotBox, resetBox].forEach((b) => {
//       b.classList.add("d-none");
//       b.classList.remove("is-active");
//     });

//     boxToShow.classList.remove("d-none");
//     // trigger animation
//     requestAnimationFrame(() => boxToShow.classList.add("is-active"));
//   };

//   const focusFirst = (box) => {
//     const firstInput = box.querySelector("input");
//     firstInput?.focus();
//   };

//   const setBusy = (btn, busy, labelBusy = "Đang xử lý...") => {
//     if (!btn) return;
//     btn.disabled = busy;
//     btn.dataset._label = btn.dataset._label || btn.textContent;
//     btn.textContent = busy ? labelBusy : btn.dataset._label;
//   };

//   const apiPostText = async (path, body) => {
//     const res = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });
//     const text = await res.text();
//     if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
//     return text;
//   };

//   // ====== NAV / LOGIN của bạn có thể giữ nguyên ======
//   // (Nếu bạn có loginJwt(), clearAuth(), toast()... thì giữ lại)
//   // Ở đây chỉ tập trung forgot/reset.

//   // ====== DEFAULT ======
//   setActiveBox(loginBox);
//   focusFirst(loginBox);

//   // ====== SWITCH ======
//   $("btnGoForgot")?.addEventListener("click", () => {
//     // copy email cho tiện
//     const cur = $("email")?.value?.trim();
//     if (cur) $("forgotEmail").value = cur;
//     setActiveBox(forgotBox);
//     focusFirst(forgotBox);
//   });

//   const backToLogin = () => {
//     // clear fields
//     if ($("forgotEmail")) $("forgotEmail").value = "";
//     if ($("resetToken")) $("resetToken").value = "";
//     if ($("resetNewPassword")) $("resetNewPassword").value = "";
//     $("tokenHint").style.display = "none";
//     setActiveBox(loginBox);
//     focusFirst(loginBox);
//   };

//   $("btnBackToLogin1")?.addEventListener("click", backToLogin);
//   $("btnBackToLogin2")?.addEventListener("click", backToLogin);

//   // ====== FORGOT: send token ======
//   $("btnForgot")?.addEventListener("click", async () => {
//     const btn = $("btnForgot");
//     const email = $("forgotEmail")?.value?.trim();
//     if (!email) {
//       toast("Nhập email để nhận token", "warning");
//       return;
//     }

//     try {
//       setBusy(btn, true, "Đang gửi...");
//       const msg = await apiPostText("/forgot-password", { email });
//       toast(msg || "Đã gửi token đặt lại mật khẩu", "success");

//       // qua reset
//       setActiveBox(resetBox);
//       focusFirst(resetBox);

//       // Nếu backend trả thêm TTL/expireAt thì mình sẽ hiển thị countdown.
//       // Hiện tại backend bạn trả String, nên chỉ show note.
//       const hint = $("tokenHint");
//       hint.style.display = "block";
//       hint.textContent = "Token có thể có thời hạn (khuyến nghị 15 phút).";
//     } catch (e) {
//       toast("Gửi token thất bại: " + (e?.message || e), "danger");
//     } finally {
//       setBusy(btn, false);
//     }
//   });

//   // ====== RESET PASSWORD ======
//   $("btnReset")?.addEventListener("click", async () => {
//     const btn = $("btnReset");
//     const token = $("resetToken")?.value?.trim();
//     const newPassword = $("resetNewPassword")?.value;

//     if (!token || !newPassword) {
//       toast("Nhập token và mật khẩu mới", "warning");
//       return;
//     }

//     try {
//       setBusy(btn, true, "Đang đổi...");
//       // DTO backend: ResetPasswordRequest { token, newPassword }
//       const msg = await apiPostText("/reset-password", { token, newPassword });

//       toast(msg || "Đổi mật khẩu thành công!", "success");
//       backToLogin();
//     } catch (e) {
//       // Nếu backend trả "Token expired" / "Invalid token" sẽ show ở đây
//       toast("Đổi mật khẩu thất bại: " + (e?.message || e), "danger");
//     } finally {
//       setBusy(btn, false);
//     }
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  // ====== AUTH (JWT) ======
  const hasJwt = () => !!localStorage.getItem("token");

  // ====== RESET TOKEN (FROM URL) ======
  // Backend đã đổi: ?resetToken=...
  const urlResetToken = new URLSearchParams(window.location.search).get("resetToken");
  const isResetFlow = !!urlResetToken;

  // ====== NAV AUTH BUTTON ======
  const navAuthBtn = $("navAuthBtn");

  const renderNavAuth = () => {
    if (!navAuthBtn) return;
    const authed = hasJwt();
    navAuthBtn.textContent = authed ? "Đăng xuất" : "Đăng nhập";
    navAuthBtn.classList.toggle("btn-primary", !authed);
    navAuthBtn.classList.toggle("btn-outline-danger", authed);
  };

  const bindNavAuth = () => {
    if (!navAuthBtn) return;
    navAuthBtn.onclick = () => {
      if (hasJwt()) {
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

  // ✅ Nếu đã đăng nhập thì chỉ đá về dashboard khi KHÔNG phải luồng reset
  if (hasJwt() && !isResetFlow) {
    location.href = "dashboard.html";
    return;
  }

  renderNavAuth();
  bindNavAuth();

  // ====== CONFIG API ======
  const API_BASE = "http://localhost:8080"; // đổi đúng port backend bạn đang chạy
  const API_PREFIX = "/api/v1/auth";

  const apiPostText = async (path, body) => {
    const res = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    return text;
  };

  // ====== BOXES ======
  const loginBox = $("loginBox");
  const forgotBox = $("forgotBox");
  const resetBox = $("resetBox");

  const setActiveBox = (boxToShow) => {
    [loginBox, forgotBox, resetBox].forEach((b) => {
      if (!b) return;
      b.classList.add("d-none");
      b.classList.remove("is-active");
    });

    boxToShow?.classList.remove("d-none");
    requestAnimationFrame(() => boxToShow?.classList.add("is-active"));
  };

  const focusFirst = (box) => box?.querySelector("input")?.focus();

  const setBusy = (btn, busy, labelBusy = "Đang xử lý...") => {
    if (!btn) return;
    btn.disabled = busy;
    btn.dataset._label = btn.dataset._label || btn.textContent;
    btn.textContent = busy ? labelBusy : btn.dataset._label;
  };

  const backToLogin = () => {
    if ($("forgotEmail")) $("forgotEmail").value = "";
    if ($("resetToken")) $("resetToken").value = "";
    if ($("resetNewPassword")) $("resetNewPassword").value = "";
    const hint = $("tokenHint");
    if (hint) hint.style.display = "none";

    // Xoá resetToken khỏi URL cho sạch (khỏi bị auto reset lại)
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("resetToken");
      window.history.replaceState({}, document.title, url.pathname + url.search);
    } catch {}

    setActiveBox(loginBox);
    focusFirst(loginBox);
  };

  // ====== DEFAULT SCREEN ======
  // ✅ Nếu có resetToken từ email -> mở thẳng Reset box
  if (isResetFlow) {
    setActiveBox(resetBox);
    if ($("resetToken")) $("resetToken").value = urlResetToken;

    const hint = $("tokenHint");
    if (hint) {
      hint.style.display = "block";
      hint.textContent = "Token đã được điền sẵn từ email. Nhập mật khẩu mới để đổi.";
    }

    focusFirst(resetBox);
  } else {
    setActiveBox(loginBox);
    focusFirst(loginBox);
  }

  // ====== LOGIN ======
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

  // ====== SWITCH: LOGIN <-> FORGOT ======
  $("btnGoForgot")?.addEventListener("click", () => {
    const cur = $("email")?.value?.trim();
    if (cur && $("forgotEmail")) $("forgotEmail").value = cur;
    setActiveBox(forgotBox);
    focusFirst(forgotBox);
  });

  $("btnBackToLogin1")?.addEventListener("click", backToLogin);
  $("btnBackToLogin2")?.addEventListener("click", backToLogin);

  // ====== FORGOT: send reset token email ======
  $("btnForgot")?.addEventListener("click", async () => {
    const btn = $("btnForgot");
    const email = $("forgotEmail")?.value?.trim();

    if (!email) {
      toast("Nhập email để nhận token", "warning");
      return;
    }

    try {
      setBusy(btn, true, "Đang gửi...");
      const msg = await apiPostText("/forgot-password", { email });
      toast(msg || "Đã gửi token đặt lại mật khẩu", "success");

      // chuyển sang reset
      setActiveBox(resetBox);
      focusFirst(resetBox);

      const hint = $("tokenHint");
      if (hint) {
        hint.style.display = "block";
        hint.textContent = "Vui lòng kiểm tra email để lấy token (thường có hạn ~15 phút).";
      }
    } catch (e) {
      toast("Gửi token thất bại: " + (e?.message || e), "danger");
    } finally {
      setBusy(btn, false);
    }
  });

  // ====== RESET PASSWORD ======
  $("btnReset")?.addEventListener("click", async () => {
    const btn = $("btnReset");
    const token = $("resetToken")?.value?.trim();
    const newPassword = $("resetNewPassword")?.value;

    if (!token || !newPassword) {
      toast("Nhập token và mật khẩu mới", "warning");
      return;
    }

    try {
      setBusy(btn, true, "Đang đổi...");
      const msg = await apiPostText("/reset-password", { token, newPassword });
      toast(msg || "Đổi mật khẩu thành công!", "success");
      backToLogin();
    } catch (e) {
      toast("Đổi mật khẩu thất bại: " + (e?.message || e), "danger");
    } finally {
      setBusy(btn, false);
    }
  });
});
