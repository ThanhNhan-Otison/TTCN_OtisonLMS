// assets/js/connect_anon.js
(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);

    // ======= ELEMENTS =======
    const form = $("anonForm");
    const courseInput = $("anonCourse");
    const emailInput = $("anonEmail");
    const noteInput = $("anonNote");
    const statusEl = $("anonStatus");
    const clearBtn = $("anonClear");
    const list = $("anonList");
    const empty = $("anonEmpty");
    const counter = $("anonCounter");
    const filterKeyword = $("anonFilterKeyword");
    const filterCourse = $("anonFilterCourse");

    // ======= STATE =======
    let allConnections = [];
    let currentUserId = 0;
    let courseOptionsCacheKey = "";

    // ======= HELPERS =======
    const setStatus = (msg = "") => { if (statusEl) statusEl.textContent = msg; };

    const escapeHtml = (str = "") =>
      String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const fmtDateTime = (v) =>
      v ? new Date(v).toLocaleString("vi-VN", { hour12: false }) : "-";

    const fmtDate = (v) =>
      v ? new Date(v).toLocaleDateString("vi-VN") : "-";

    const makeMailto = (email, courseName) => {
      const subject = `Học chung ${courseName || ""}`.trim();
      const body =
        `Chào bạn,\n` +
        `Mình cũng muốn học chung khóa: ${courseName || ""}.\n` +
        `Bạn rảnh thời gian nào để mình trao đổi?\n\n` +
        `--\n` +
        `Gửi từ BeeLearning`;

      return (
        `mailto:${encodeURIComponent(email || "")}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`
      );
    };

    // ✅ lấy userId theo thứ tự: userId -> userInfo.id -> /auth/me
    async function ensureCurrentUserId() {
      const direct = Number(localStorage.getItem("userId") || 0);
      if (direct) return direct;

      try {
        const raw = localStorage.getItem("userInfo");
        if (raw) {
          const ui = JSON.parse(raw);
          const id = Number(ui?.id || ui?.userId || 0);
          if (id) {
            localStorage.setItem("userId", String(id));
            return id;
          }
        }
      } catch {}

      try {
        const me = await apiFetch("/auth/me");
        const id = Number(me?.userId ?? me?.id ?? 0);
        if (id) localStorage.setItem("userId", String(id));
        return id || 0;
      } catch {
        return 0;
      }
    }

    // ======= LOAD COURSES -> left dropdown =======
    async function loadCourses() {
      if (!courseInput) return;
      try {
        const courses = await apiFetch("/courses");
        const options = (courses || [])
          .map((c) => {
            const id = c.courseId ?? c.id ?? c.course_id;
            const name = c.name ?? c.courseName ?? c.ten ?? "";
            if (!id || !name) return "";
            return `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`;
          })
          .filter(Boolean)
          .join("");

        courseInput.innerHTML = `<option value="">Chọn khóa học</option>` + options;
      } catch (e) {
        courseInput.innerHTML = `<option value="">Không tải được khóa học</option>`;
        console.error(e);
      }
    }

    // ======= LOAD CONNECTIONS =======
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

    // ======= FILTERS =======
    function buildCourseFilterFromConnections(data) {
      if (!filterCourse) return;

      const options = [
        ...new Set((data || []).map((i) => (i.courseName || "").trim()).filter(Boolean)),
      ];

      const newKey = options.slice().sort().join("|");
      if (newKey === courseOptionsCacheKey) return;
      courseOptionsCacheKey = newKey;

      const current = filterCourse.value;

      filterCourse.innerHTML =
        `<option value="">Tất cả khóa học</option>` +
        options.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

      filterCourse.value = options.includes(current) ? current : "";
    }

    function applyFilters(data) {
      const kw = (filterKeyword?.value || "").trim().toLowerCase();
      const course = filterCourse?.value || "";

      return (data || []).filter((item) => {
        const hay = `${item.contactEmail || ""} ${item.note || ""}`.toLowerCase();
        const okKw = !kw || hay.includes(kw);
        const okCourse = !course || item.courseName === course;
        return okKw && okCourse;
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

      const html = filtered.map((item) => {
        const courseName = item.courseName || "";
        const email = item.contactEmail || "";
        const note = item.note || "";

        const mailto = makeMailto(email, courseName);
        const createdAtText = fmtDateTime(item.createdAt);
        const expiresAtText = fmtDate(item.expiresAt);

        const isOwner = Number(item.ownerId || 0) === Number(currentUserId || 0);

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
                <a class="btn btn-sm btn-outline-primary" href="${mailto}">Liên hệ</a>
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

            ${isOwner ? `<button class="btn btn-sm btn-link text-danger px-0 mt-2" data-delete="${escapeHtml(item.id)}">Xóa</button>` : ""}
          </div>
        `;
      }).join("");

      if (list) list.innerHTML = html;
    }

    // ======= CREATE =======
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) return form.reportValidity();

      const courseId = Number(courseInput?.value || 0);
      if (!courseId) return setStatus("Bạn chưa chọn khóa học");

      const payload = {
        courseId,
        contactEmail: (emailInput?.value || "").trim(),
        note: (noteInput?.value || "").trim(),
      };

      try {
        // ✅ nếu apiFetch của bạn hỗ trợ json, dùng cách này gọn hơn:
        await apiFetch("/connections", { method: "POST", json: payload });

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

    clearBtn?.addEventListener("click", () => {
      setStatus("Backend version: không có 'xóa tất cả' (vì phải đảm bảo quyền owner).");
    });

    filterKeyword?.addEventListener("input", render);
    filterCourse?.addEventListener("change", render);

    // ======= INIT =======
    (async function init() {
      currentUserId = await ensureCurrentUserId();
      await loadCourses();
      await loadConnections();
      render();
    })();
  });
})();
