document.addEventListener("DOMContentLoaded", () => {
  const id = qs("id");       // assignmentId (nếu sửa)
  const mode = qs("mode");   // "create" hoặc null

  const createBox = document.getElementById("createBox");
  const btnCreate = document.getElementById("btnCreate");

  const cTitle = document.getElementById("cTitle");
  const cDesc = document.getElementById("cDesc");
  const cDue = document.getElementById("cDue");
  const cMaxScore = document.getElementById("cMaxScore");
  const cCourseId = document.getElementById("cCourseId"); // <select>

  async function ensureMe() {
    if (localStorage.getItem("token") && !localStorage.getItem("role")) {
      await tryLoadMe();
    }
  }

  function normalizeRole(r = "") {
    return String(r).toUpperCase().replace("ROLE_", "");
  }

  function canManageAssignment() {
    const role = normalizeRole(localStorage.getItem("role") || "");
    return role === "TEACHER" || role === "ADMIN";
  }

  function showCreateBoxOnly() {
    if (createBox) createBox.style.display = canManageAssignment() ? "block" : "none";
    if (!canManageAssignment()) {
      toast("Bạn không có quyền tạo/sửa bài tập.", "warning");
    }
  }

  async function loadCourseDropdown() {
    if (!cCourseId) return;

    cCourseId.innerHTML = `<option value="">-- Chọn khóa học --</option>`;

    try {
      const courses = await apiFetch("/courses");
      (courses || []).forEach((c) => {
        const courseId = c.courseId ?? c.id;
        const courseName = c.courseName ?? c.name ?? `Course ${courseId}`;
        if (courseId == null) return;

        const opt = document.createElement("option");
        opt.value = String(courseId);
        opt.textContent = courseName; // ✅ HIỂN THỊ TÊN KHÓA HỌC
        cCourseId.appendChild(opt);
      });
    } catch (e) {
      toast("Không tải được danh sách khóa học: " + (e.message || e), "warning");
    }
  }

  // (tuỳ BE) load chi tiết assignment để fill form khi sửa
  async function loadAssignmentToForm() {
    if (!id) return;

    try {
      const a = await apiFetch(`/assignments/${id}`);

      if (cTitle) cTitle.value = a.title ?? a.assignmentName ?? "";
      if (cDesc) cDesc.value = a.description ?? a.moTa ?? "";

      // date: BE có thể trả deadline / dueDate (string ISO)
      const rawDue = a.dueDate ?? a.deadline ?? "";
      if (cDue && rawDue) {
        // cắt về yyyy-mm-dd nếu là ISO
        cDue.value = String(rawDue).slice(0, 10);
      }

      // maxScore
      const ms = a.maxScore ?? a.diemToiDa ?? a.max_point ?? "";
      if (cMaxScore && ms !== null && ms !== undefined) cMaxScore.value = ms;

      // courseId (nếu BE có)
      const cid = a.courseId ?? a.course?.courseId ?? a.course?.id ?? "";
      if (cCourseId && cid) cCourseId.value = String(cid);
    } catch (e) {
      toast("Không tải được bài tập để sửa: " + (e.message || e), "danger");
    }
  }

  async function createAssignment() {
    // validate
    const courseIdVal = cCourseId?.value;
    if (!courseIdVal) {
      toast("Bạn chưa chọn khóa học.", "warning");
      return;
    }

    const titleVal = cTitle?.value?.trim() || "";
    if (!titleVal) {
      toast("Bạn chưa nhập tiêu đề.", "warning");
      return;
    }

    const payload = {
      title: titleVal,
      description: cDesc?.value?.trim() || "",
      dueDate: cDue?.value || null,
      courseId: Number(courseIdVal),

      // ✅ Điểm tối đa
      // Nếu BE bạn dùng tên khác, đổi key tại đây.
      maxScore: (cMaxScore?.value === "" ? null : Number(cMaxScore?.value)),
    };

    await apiFetch("/assignments", { method: "POST", json: payload });
    toast("Tạo bài tập thành công", "success");
  }

  async function updateAssignment() {
    const courseIdVal = cCourseId?.value;
    if (!courseIdVal) {
      toast("Bạn chưa chọn khóa học.", "warning");
      return;
    }

    const titleVal = cTitle?.value?.trim() || "";
    if (!titleVal) {
      toast("Bạn chưa nhập tiêu đề.", "warning");
      return;
    }

    const payload = {
      title: titleVal,
      description: cDesc?.value?.trim() || "",
      dueDate: cDue?.value || null,
      courseId: Number(courseIdVal),
      maxScore: (cMaxScore?.value === "" ? null : Number(cMaxScore?.value)),
    };

    // Nếu BE bạn dùng PUT /assignments/{id} hoặc PATCH, chỉnh lại đúng endpoint
    await apiFetch(`/assignments/${id}`, { method: "PUT", json: payload });
    toast("Cập nhật bài tập thành công", "success");
  }

  // ===== Main =====
  (async () => {
    await ensureMe();
    showCreateBoxOnly();
    if (!canManageAssignment()) return;

    await loadCourseDropdown();

    // mode=create => tạo mới
    if (mode === "create") {
      // form trống
      return;
    }

    // có id => sửa
    if (id) {
      await loadAssignmentToForm();
    }
  })();

  // ===== Save button =====
  if (btnCreate) {
    btnCreate.onclick = async () => {
      try {
        if (!canManageAssignment()) return;

        if (mode === "create" || !id) {
          await createAssignment();
        } else {
          await updateAssignment();
        }
      } catch (e) {
        toast("Lưu thất bại: " + (e.message || e), "danger");
        console.error(e);
      }
    };
  }

  const handleLogout = () => {
    clearAuth();
    location.href = "login.html";
  };
  document.getElementById("logout")?.addEventListener("click", handleLogout);
  document.getElementById("navLogout")?.addEventListener("click", handleLogout);
});
