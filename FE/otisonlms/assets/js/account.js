// account.js

document.addEventListener("DOMContentLoaded", function () {
  const safeSetText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  };

  const safeOnClick = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  };

  const handleLogout = () => {
    clearAuth();
    location.href = "login.html";
  };
  safeOnClick("logout", handleLogout);
  safeOnClick("navLogout", handleLogout);

  function formatDate(value) {
    if (!value) return "—";
    const dt = new Date(value);
    if (isNaN(dt.getTime())) return String(value);
    return dt.toLocaleString("vi-VN");
  }

  function initialsFromName(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return (parts[0][0] || "?").toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  (async () => {
    const me = await tryLoadMe();

    const email = me?.email || localStorage.getItem("email") || "—";
    const role = (me?.role || localStorage.getItem("role") || "UNKNOWN").toUpperCase();
    const name =
      me?.fullName ||
      me?.name ||
      me?.username ||
      (email.includes("@") ? email.split("@")[0] : email) ||
      "Người dùng";

    // nếu BE trả tên field khác (createdDate / updatedDate / lastLogin ...)
    // ưu tiên snake_case trước, fallback camelCase
    const createdAt = me?.created_date ?? me?.createdDate ?? me?.createdAt;
    const lastLoginAt = me?.updated_date ?? me?.updatedDate ?? me?.lastLoginAt;

    safeSetText("avatarInitial", initialsFromName(name));
    safeSetText("accName", name);
    safeSetText("accRole", role);
    safeSetText("accEmail", email);

    safeSetText("accId", me?.id ?? me?.userId ?? "—");
    safeSetText("accFullName", name);
    safeSetText("accRoleFull", role);

    // 2 cái này có thể bị bạn xóa khỏi HTML => không sao
    safeSetText("accJoined", formatDate(createdAt));
    safeSetText("accLastLogin", formatDate(lastLoginAt));

    // activity box
    safeSetText("activitySummary", "Đăng nhập thành công");
    safeSetText("activityTime", lastLoginAt ? formatDate(lastLoginAt) : "Vừa truy cập");
    safeSetText("activityDevice", navigator.userAgent);
  })();
});
