// account.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== Helpers =====
  const $ = (id) => document.getElementById(id);

  const setText = (id, value = "—") => {
    const el = $(id);
    if (el) el.textContent = value ?? "—";
  };

  const onClick = (id, handler) => {
    const el = $(id);
    if (el) el.addEventListener("click", handler);
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? String(value) : dt.toLocaleString("vi-VN");
  };

  const initialsFromName = (name) => {
    const n = String(name || "").trim();
    if (!n) return "?";
    const parts = n.split(/\s+/);
    const first = parts[0]?.[0] || "?";
    const last = (parts.length > 1 ? parts[parts.length - 1]?.[0] : "") || "";
    return (first + last).toUpperCase();
  };

  const getDisplayName = ({ me, email }) => {
    const raw =
      me?.fullName ||
      me?.name ||
      me?.username ||
      (email?.includes("@") ? email.split("@")[0] : email) ||
      "Người dùng";
    return String(raw).trim() || "Người dùng";
  };

  // ===== Actions =====
  const handleLogout = () => {
    clearAuth?.();
    location.href = "login.html";
  };

  onClick("logout", handleLogout);
  onClick("navLogout", handleLogout);

  // ===== Init =====
  (async () => {
    try {
      const me = await tryLoadMe?.();

      const email = me?.email ?? localStorage.getItem("email") ?? "—";
      const role = String(me?.role ?? localStorage.getItem("role") ?? "UNKNOWN").toUpperCase();
      const name = getDisplayName({ me, email });

      const createdAt = me?.createdDate ?? me?.created_date ?? me?.createdAt;
      const lastLoginAt = me?.updatedDate ?? me?.updated_date ?? me?.lastLoginAt;

      setText("avatarInitial", initialsFromName(name));
      setText("accName", name);
      setText("accRole", role);
      setText("accEmail", email);

      setText("accId", me?.id ?? me?.userId ?? "—");
      setText("accFullName", name);
      setText("accRoleFull", role);

      // Có thể không tồn tại trong HTML -> không sao
      setText("accJoined", formatDate(createdAt));
      setText("accLastLogin", formatDate(lastLoginAt));

      // Activity box
      setText("activitySummary", "Đăng nhập thành công");
      setText("activityTime", lastLoginAt ? formatDate(lastLoginAt) : "Vừa truy cập");
      setText("activityDevice", navigator.userAgent);
    } catch (err) {
      console.error("account.js load error:", err);
      setText("accName", "—");
      setText("accRole", "UNKNOWN");
      setText("accEmail", localStorage.getItem("email") ?? "—");
      setText("activitySummary", "Không thể tải thông tin tài khoản");
      setText("activityTime", "—");
      setText("activityDevice", navigator.userAgent);
    }
  })();
});
