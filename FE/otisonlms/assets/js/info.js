// assets/js/info.js
document.addEventListener("DOMContentLoaded", async () => {
  const box = document.getElementById("userInfoBox");
  if (!box) return;

  const btnEdit = document.getElementById("btnEditProfile");

  const modalEl = document.getElementById("profileModal");
  const modal = modalEl ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;

  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");

  const pfFullName = document.getElementById("pfFullName");
  const pfEmail = document.getElementById("pfEmail");
  const pfNgaySinh = document.getElementById("pfNgaySinh");
  const pfSoDienThoai = document.getElementById("pfSoDienThoai");
  const pfGioiTinh = document.getElementById("pfGioiTinh");
  const pfSaveBtn = document.getElementById("pfSaveBtn");

  const pwOld = document.getElementById("pwOld");
  const pwNew = document.getElementById("pwNew");
  const pwNew2 = document.getElementById("pwNew2");
  const pwSaveBtn = document.getElementById("pwSaveBtn");

  const render = (html) => (box.innerHTML = html);

  function safeJsonParse(str) {
    try { return JSON.parse(str); } catch { return null; }
  }

  async function loadMeAndCache() {
    // đảm bảo có userInfo
    if (!localStorage.getItem("userInfo")) {
      if (typeof tryLoadMe === "function") await tryLoadMe();
    }
    const raw = localStorage.getItem("userInfo");
    return safeJsonParse(raw);
  }

  function renderInfo(info) {
    render(`
      <ul class="list-group mb-3">
        <li class="list-group-item"><strong>Họ tên:</strong> ${info?.fullName || ""}</li>
        <li class="list-group-item"><strong>Email:</strong> ${info?.email || ""}</li>
        <li class="list-group-item"><strong>Ngày sinh:</strong> ${info?.ngaySinh || ""}</li>
        <li class="list-group-item"><strong>Số điện thoại:</strong> ${info?.soDienThoai || ""}</li>
        <li class="list-group-item"><strong>Giới tính:</strong> ${
          info?.gioiTinh === true ? "Nam" : (info?.gioiTinh === false ? "Nữ" : "")
        }</li>
        <li class="list-group-item"><strong>Vai trò:</strong> ${info?.role || ""}</li>
        <li class="list-group-item"><strong>Mã người dùng:</strong> ${info?.id || ""}</li>
      </ul>
    `);
  }

  function fillProfileForm(info) {
    if (pfFullName) pfFullName.value = info?.fullName || "";
    if (pfEmail) pfEmail.value = info?.email || "";
    if (pfNgaySinh) pfNgaySinh.value = info?.ngaySinh || "";
    if (pfSoDienThoai) pfSoDienThoai.value = info?.soDienThoai || "";
    if (pfGioiTinh) {
      pfGioiTinh.value =
        info?.gioiTinh === true ? "true" : (info?.gioiTinh === false ? "false" : "");
    }
  }

  // ===== INIT =====
  try {
    const info = await loadMeAndCache();
    if (!info) {
      render('<div class="alert alert-warning">Chưa có thông tin. Vui lòng đăng nhập lại.</div>');
      return;
    }
    renderInfo(info);
  } catch (e) {
    render('<div class="alert alert-danger">Lỗi tải thông tin. Vui lòng thử lại.</div>');
    console.error(e);
  }

  // ===== OPEN MODAL =====
  btnEdit?.addEventListener("click", async () => {
    const info = await loadMeAndCache();
    if (!info) return toast?.("Chưa có thông tin user", "warning");

    fillProfileForm(info);

    // reset password tab
    if (pwOld) pwOld.value = "";
    if (pwNew) pwNew.value = "";
    if (pwNew2) pwNew2.value = "";

    // luôn mở tab "Chỉnh sửa thông tin" trước
    const tabInfoBtn = document.getElementById("tab-info");
    if (tabInfoBtn) bootstrap.Tab.getOrCreateInstance(tabInfoBtn).show();

    modal?.show();
  });

  // ===== SUBMIT: UPDATE PROFILE =====
  profileForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: (pfFullName?.value || "").trim(),
        email: (pfEmail?.value || "").trim(),
        ngaySinh: pfNgaySinh?.value || null,
        soDienThoai: (pfSoDienThoai?.value || "").trim(),
        gioiTinh: pfGioiTinh?.value === "" ? null : (pfGioiTinh?.value === "true"),
      };

      if (!payload.fullName) return toast?.("Vui lòng nhập họ tên", "warning");
      if (!payload.email) return toast?.("Vui lòng nhập email", "warning");

      if (pfSaveBtn) {
        pfSaveBtn.disabled = true;
        pfSaveBtn.textContent = "Đang lưu...";
      }

      // ✅ dùng options.json cho đúng Content-Type
      const updated = await apiFetch("/auth/me", {
        method: "PUT",
        json: payload,
      });

      const newInfo = {
        id: updated.userId ?? updated.id ?? payload.id,
        email: updated.email ?? payload.email,
        fullName: updated.fullName ?? updated.firstName ?? payload.fullName,
        role: updated.role ?? (localStorage.getItem("role") || ""),
        status: updated.status ?? updated.isStatus ?? true,
        ngaySinh: updated.ngaySinh ?? (payload.ngaySinh || ""),
        soDienThoai: updated.soDienThoai ?? (payload.soDienThoai || ""),
        gioiTinh:
          typeof updated.gioiTinh === "boolean" ? updated.gioiTinh : payload.gioiTinh,
      };

      localStorage.setItem("userInfo", JSON.stringify(newInfo));
      if (newInfo.email) localStorage.setItem("email", newInfo.email);

      toast?.("Cập nhật thông tin thành công", "success");
      renderInfo(newInfo);
      modal?.hide();
    } catch (err) {
      toast?.("Cập nhật thất bại: " + (err.message || err), "danger");
      console.error(err);
    } finally {
      if (pfSaveBtn) {
        pfSaveBtn.disabled = false;
        pfSaveBtn.textContent = "Lưu";
      }
    }
  });

  // ===== SUBMIT: CHANGE PASSWORD =====
  passwordForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const oldPassword = (pwOld?.value || "").trim();
      const newPassword = (pwNew?.value || "").trim();
      const newPassword2 = (pwNew2?.value || "").trim();

      if (!oldPassword) return toast?.("Vui lòng nhập mật khẩu cũ", "warning");
      if (!newPassword || newPassword.length < 6) return toast?.("Mật khẩu mới tối thiểu 6 ký tự", "warning");
      if (newPassword !== newPassword2) return toast?.("Nhập lại mật khẩu không khớp", "warning");

      if (pwSaveBtn) {
        pwSaveBtn.disabled = true;
        pwSaveBtn.textContent = "Đang đổi...";
      }

      // ✅ BE của bạn là PUT /api/v1/auth/change-password (theo controller bạn gửi)
      await apiFetch("/auth/change-password", {
        method: "PUT",
        json: { oldPassword, newPassword },
      });

      toast?.("Đổi mật khẩu thành công", "success");

      if (pwOld) pwOld.value = "";
      if (pwNew) pwNew.value = "";
      if (pwNew2) pwNew2.value = "";

      modal?.hide();
    } catch (err) {
      toast?.("Đổi mật khẩu thất bại: " + (err.message || err), "danger");
      console.error(err);
    } finally {
      if (pwSaveBtn) {
        pwSaveBtn.disabled = false;
        pwSaveBtn.textContent = "Đổi mật khẩu";
      }
    }
  });
});
