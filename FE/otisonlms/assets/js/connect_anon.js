// assets/js/connect_anon.js
// Backend version: create/list/delete via API
// - Auto-expire 30 days: handled by backend (expiresAt + cleanup)
// - Owner-only delete: enforced by backend (deleteMine checks owner)
// - FE: only show delete button for owner

let courseOptionsCacheKey = "";

document.addEventListener("DOMContentLoaded", function () {
  // ======= ELEMENTS =======
  const form = document.getElementById("anonForm");
  const courseInput = document.getElementById("anonCourse");
  const emailInput = document.getElementById("anonEmail");
  const noteInput = document.getElementById("anonNote");
  const status = document.getElementById("anonStatus");
  const clearBtn = document.getElementById("anonClear");
  const list = document.getElementById("anonList");
  const empty = document.getElementById("anonEmpty");
  const counter = document.getElementById("anonCounter");
  const filterKeyword = document.getElementById("anonFilterKeyword");
  const filterCourse = document.getElementById("anonFilterCourse");

  // ======= STATE =======
  let allConnections = []; // from backend

  // ======= HELPERS =======
  function setStatus(msg) {
    if (status) status.textContent = msg || "";
  }

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ======= LOAD COURSES -> left dropdown =======
  async function loadCourses() {
    if (!courseInput) return;

    try {
      const courses = await apiFetch("/courses");

      const optionsHtml = (courses || [])
        .map((c) => {
          // BE của bạn thường trả: courseId + name
          const id = c.courseId ?? c.id ?? c.course_id;
          const name = c.name ?? c.courseName ?? c.ten ?? "";
          if (!id || !name) return "";
          return `<option value="${id}">${escapeHtml(name)}</option>`;
        })
        .filter(Boolean)
        .join("");

      courseInput.innerHTML =
        '<option value="">Chọn khóa học</option>' + optionsHtml;

    } catch (e) {
      courseInput.innerHTML = '<option value="">Không tải được khóa học</option>';
      console.error(e);
    }
  }

  // ======= LOAD CONNECTIONS (GET /connections) =======
  async function loadConnections() {
    try {
      const data = await apiFetch("/connections");
      allConnections = Array.isArray(data) ? data : [];
    } catch (e) {
      allConnections = [];
      setStatus("Không tải được danh sách: " + (e?.message || e));
      console.error(e);
    }
  }

  // ======= RIGHT FILTER DROPDOWN =======
  function buildCourseFilterFromConnections(data) {
    if (!filterCourse) return;

    const options = [
      ...new Set(
        (data || [])
          .map((i) => (i.courseName || "").trim())
          .filter(Boolean)
      ),
    ];

    const newKey = options.slice().sort().join("|");
    if (newKey === courseOptionsCacheKey) return;
    courseOptionsCacheKey = newKey;

    const current = filterCourse.value;

    filterCourse.innerHTML =
      `<option value="">Tất cả khóa học</option>` +
      options
        .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
        .join("");

    filterCourse.value = options.includes(current) ? current : "";
  }

  function applyFilters(data) {
    const kw = (filterKeyword?.value || "").trim().toLowerCase();
    const course = filterCourse?.value || "";

    return (data || []).filter((item) => {
      const haystack = `${item.contactEmail || ""} ${item.note || ""}`.toLowerCase();
      const matchKw = !kw || haystack.includes(kw);
      const matchCourse = !course || item.courseName === course;
      return matchKw && matchCourse;
    });
  }

  // ======= RENDER =======
  function render() {
    buildCourseFilterFromConnections(allConnections);

    const filtered = applyFilters(allConnections);

    if (counter) {
      counter.textContent = allConnections.length
        ? `${filtered.length}/${allConnections.length} nhu cầu`
        : "";
    }

    if (!filtered.length) {
      if (empty) empty.style.display = "block";
      if (list) list.innerHTML = "";
      return;
    }
    if (empty) empty.style.display = "none";

    // ✅ lấy currentUserId (đảm bảo auth.js đã set localStorage userId khi /auth/me)
    const currentUserId = Number(localStorage.getItem("userId") || 0);

    const html = filtered
      .map((item) => {
        const courseName = item.courseName || "";
        const email = item.contactEmail || "";
        const note = item.note || "";

        const subject = `Học chung ${courseName}`;
        const body =
          `Chào bạn,\n` +
          `Mình cũng muốn học chung khóa: ${courseName}.\n` +
          `Bạn rảnh thời gian nào để mình trao đổi?\n\n` +
          `--\n` +
          `Gửi từ BeeLearning`;

        const mailto =
          `mailto:${encodeURIComponent(email)}` +
          `?subject=${encodeURIComponent(subject)}` +
          `&body=${encodeURIComponent(body)}`;

        const createdAtText = item.createdAt
          ? new Date(item.createdAt).toLocaleString("vi-VN", { hour12: false })
          : "-";

        const expiresAtText = item.expiresAt
          ? new Date(item.expiresAt).toLocaleDateString("vi-VN")
          : "-";

        // ✅ CHỈ OWNER MỚI HIỆN NÚT XÓA
        const isOwner = Number(item.ownerId) === currentUserId;

        return `
          <div class="list-group-item py-3" data-id="${escapeHtml(item.id)}">
            <div class="d-flex justify-content-between align-items-center gap-2">
              <div>
                <span class="course-chip">${escapeHtml(courseName)}</span>
                <div class="text-muted small mt-1">
                  Tạo: ${escapeHtml(createdAtText)} • Hết hạn: ${escapeHtml(expiresAtText)}
                </div>
              </div>

              <div class="d-flex gap-2">
                <a class="btn btn-sm btn-outline-primary" href="${mailto}">
                  Liên hệ
                </a>
                <button class="btn btn-sm btn-outline-secondary" type="button" data-copy="${escapeHtml(email)}">
                  Copy email
                </button>
              </div>
            </div>

            <div class="mt-2 fw-semibold">${escapeHtml(email)}</div>
            <div class="mt-1 text-muted small">${escapeHtml(note || "Không có ghi chú")}</div>

            <div class="text-muted small mt-2">
              Bấm <b>Liên hệ</b> sẽ mở app Email mặc định. Nếu không mở, bấm <b>Copy email</b> để liên hệ thủ công.
            </div>

            ${
              isOwner
                ? `<button class="btn btn-sm btn-link text-danger px-0 mt-2" data-delete="${escapeHtml(item.id)}">
                     Xóa
                   </button>`
                : ""
            }
          </div>
        `;
      })
      .join("");

    if (list) list.innerHTML = html;
  }

  // ======= CREATE (POST /connections) =======
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const selectedCourseId = Number(courseInput?.value || 0);
    if (!selectedCourseId) {
      setStatus("Bạn chưa chọn khóa học");
      return;
    }

    const payload = {
      courseId: selectedCourseId,
      contactEmail: (emailInput?.value || "").trim(),
      note: (noteInput?.value || "").trim(),
    };

    try {
      await apiFetch("/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      form.reset();
      setStatus("Đã gửi nhu cầu ghép nhóm.");

      await loadConnections();
      render();
    } catch (err) {
      setStatus("Không gửi được: " + (err?.message || err));
      console.error(err);
    }
  });

  // ======= LIST CLICK (copy / delete) =======
  list?.addEventListener("click", async (e) => {
    // Copy email
    const copyBtn = e.target.closest("button[data-copy]");
    if (copyBtn) {
      const email = copyBtn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(email);
        setStatus("Đã copy email: " + email);
      } catch {
        prompt("Copy email này:", email);
      }
      return;
    }

    // Delete mine (DELETE /connections/{id})
    const delBtn = e.target.closest("button[data-delete]");
    if (delBtn) {
      const id = delBtn.getAttribute("data-delete");
      if (!id) return;

      if (!confirm("Xóa yêu cầu này? (Chỉ người tạo mới xóa được)")) return;

      try {
        await apiFetch(`/connections/${encodeURIComponent(id)}`, { method: "DELETE" });
        setStatus("Đã xóa yêu cầu.");

        await loadConnections();
        render();
      } catch (err) {
        setStatus("Không xóa được: " + (err?.message || err));
        console.error(err);
      }
    }
  });

  // Backend version: không nên có "xóa tất cả"
  clearBtn?.addEventListener("click", () => {
    setStatus("Backend version: không có 'xóa tất cả' (vì phải đảm bảo quyền owner).");
  });

  // Filters
  filterKeyword?.addEventListener("input", render);
  filterCourse?.addEventListener("change", render);

  // ======= INIT =======
  (async function init() {
    await loadCourses();
    await loadConnections();
    render();
  })();
});
