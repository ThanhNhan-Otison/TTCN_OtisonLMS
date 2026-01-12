// =====================
// AUTH / ME HELPERS
// =====================

const LS = {
  token: "token",
  email: "email",
  role: "role",
  userId: "userId",
  firstName: "firstName",
  userInfo: "userInfo",
};

function setJwtToken(token) {
  if (token) localStorage.setItem(LS.token, String(token));
}

function clearAuth() {
  Object.values(LS).forEach((k) => localStorage.removeItem(k));
}

function isValidAuth(val) {
  if (val == null) return false;
  if (typeof val !== "string") return false;
  const v = val.trim();
  return v !== "" && v !== "null" && v !== "undefined";
}

// ================= ROLE HELPERS =================
function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "");
}

function getStoredRole() {
  return normalizeRole(localStorage.getItem(LS.role));
}

function isTeacherOrAdmin() {
  const role = getStoredRole();
  return role === "TEACHER" || role === "ADMIN";
}

function isUserRole() {
  const role = getStoredRole();
  return role === "USER" || role === "STUDENT";
}

// ================= AUTH GUARDS =================
function requireAuth(redirectTo = "login.html") {
  const token = localStorage.getItem(LS.token);
  if (!isValidAuth(token)) {
    clearAuth();
    window.location.href = redirectTo;
  }
}

// chỉ cho TEACHER / ADMIN
async function requireTeacherOrAdmin(redirectTo = "home.html") {
  requireAuth("login.html");
  if (!getStoredRole()) await tryLoadMe(true);
  if (!isTeacherOrAdmin()) window.location.href = redirectTo;
}

// ================= USER INFO =================
let __mePromise = null;

function mapUserInfo(me) {
  const userId = me?.userId ?? me?.id ?? null;

  // ưu tiên fullName, fallback firstName/username/email
  const fullName =
    me?.fullName ||
    me?.firstName ||
    me?.name ||
    me?.username ||
    (me?.email?.includes("@") ? me.email.split("@")[0] : me?.email) ||
    "";

  const role = normalizeRole(me?.role);

  return {
    userId,
    email: me?.email ?? "",
    fullName,
    firstName: me?.firstName ?? "",
    role,
    status: me?.status ?? "",
    ngaySinh: me?.ngaySinh ?? null,
    soDienThoai: me?.soDienThoai ?? "",
    gioiTinh: me?.gioiTinh ?? "",
  };
}

function saveMeToLocalStorage(me) {
  const info = mapUserInfo(me);

  if (info.userId != null) localStorage.setItem(LS.userId, String(info.userId));
  if (info.role) localStorage.setItem(LS.role, info.role);
  if (info.firstName) localStorage.setItem(LS.firstName, info.firstName);

  localStorage.setItem(LS.userInfo, JSON.stringify(info));
}

async function tryLoadMe(force = false) {
  if (!force && __mePromise) return __mePromise;

  __mePromise = (async () => {
    try {
      const me = await apiFetch("/auth/me");
      if (!me) return null;

      saveMeToLocalStorage(me);
      return me;
    } catch (e) {
      // token hết hạn/sai => clear
      const msg = String(e?.message || "");
      if (msg.includes("401") || msg.includes("Unauthorized")) clearAuth();
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
  if (email) localStorage.setItem(LS.email, String(email));

  // load user + role
  await tryLoadMe(true);
  return res;
}
