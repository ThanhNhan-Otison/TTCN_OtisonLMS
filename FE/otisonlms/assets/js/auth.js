// lưu JWT
function setJwtToken(token) {
  localStorage.setItem("token", token);
}

// xoá toàn bộ thông tin đăng nhập
function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("role");
  localStorage.removeItem("firstName");
  localStorage.removeItem("userInfo");
}

// kiểm tra token hợp lệ
function isValidAuth(val) {
  if (!val) return false;
  if (typeof val !== "string") return false;
  const v = val.trim();
  return v !== "" && v !== "null" && v !== "undefined";
}

// ================= ROLE HELPERS =================
function getStoredRole() {
  const r = localStorage.getItem("role");
  if (!r || r === "null" || r === "undefined") return "";
  return String(r).toUpperCase();
}

function isTeacherOrAdmin() {
  const role = getStoredRole();
  return role === "TEACHER" || role === "ADMIN";
}
function isUserRole() {
  const role = getStoredRole();
  return role === "USER";
}



// ================= AUTH GUARDS =================

// yêu cầu đăng nhập
function requireAuth(redirectTo = "login.html") {
  const token = localStorage.getItem("token");
  if (!isValidAuth(token)) {
    clearAuth();
    window.location.href = redirectTo;
  }
}

// chỉ cho TEACHER / ADMIN
async function requireTeacherOrAdmin(redirectTo = "home.html") {
  requireAuth("login.html");
  if (!getStoredRole()) await tryLoadMe();
  if (!isTeacherOrAdmin()) window.location.href = redirectTo;
}

// ================= USER INFO =================

// ===== Load user info (cache) =====
let __mePromise = null;

async function tryLoadMe(force = false) {
  if (!force && __mePromise) return __mePromise;

  __mePromise = (async () => {
    try {
      const me = await apiFetch("/auth/me");
      if (!me) return null;

      const uid = me.userId ?? me.id;
      if (uid != null) localStorage.setItem("userId", String(uid));

      const role = me.role ? String(me.role).toUpperCase() : "";
      if (role) localStorage.setItem("role", role);
      if (me.firstName) localStorage.setItem("firstName", me.firstName);

      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          id: uid,
          email: me.email,
          fullName: me.firstName,
          role,
          status: me.status,
          ngaySinh: me.ngaySinh,
          soDienThoai: me.soDienThoai,
          gioiTinh: me.gioiTinh
        })
      );

      return me;
    } catch (e) {
      // token hết hạn/sai
      if (String(e.message || "").includes("401")) {
        clearAuth?.();
      }
      return null;
    }
  })();

  return __mePromise;
}



// ================= LOGIN =================
async function loginJwt(email, password) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    json: { email, password },
  });

  if (!res?.token) throw new Error("Login không trả token (JWT).");

  setJwtToken(res.token);
  localStorage.setItem("email", email);

  // load user + role
  await tryLoadMe();
  return res;
}
