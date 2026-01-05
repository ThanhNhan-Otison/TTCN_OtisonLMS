// assets/js/info.js
document.addEventListener("DOMContentLoaded", async () => {
  const box = document.getElementById("userInfoBox");
  if (!box) return;

  const render = (html) => (box.innerHTML = html);

  try {
    // nếu chưa có userInfo thì gọi BE lấy
    if (!localStorage.getItem("userInfo")) {
      await tryLoadMe();
    }

    const raw = localStorage.getItem("userInfo");
    if (!raw) {
      render('<div class="alert alert-warning">Chưa có thông tin. Vui lòng đăng nhập lại.</div>');
      return;
    }

    let info;
    try {
      info = JSON.parse(raw);
    } catch {
      render('<div class="alert alert-danger">Dữ liệu userInfo bị lỗi. Hãy đăng nhập lại.</div>');
      return;
    }

    render(`
      <ul class="list-group mb-3">
        <li class="list-group-item"><strong>Họ tên:</strong> ${info.fullName || ""}</li>
        <li class="list-group-item"><strong>Email:</strong> ${info.email || ""}</li>
        <li class="list-group-item"><strong>Vai trò:</strong> ${info.role || ""}</li>
        <li class="list-group-item"><strong>Mã người dùng:</strong> ${info.id || ""}</li>
      </ul>
    `);
  } catch (e) {
    render('<div class="alert alert-danger">Lỗi tải thông tin. Vui lòng thử lại.</div>');
  }
});
