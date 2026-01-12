// assets/js/connect_anon.js
(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    // ===== DOM =====
    const $ = (id) => document.getElementById(id);

    const el = {
      form: $("anonForm"),
      course: $("anonCourse"),
      email: $("anonEmail"),
      note: $("anonNote"),
      status: $("anonStatus"),
      clear: $("anonClear"),
      list: $("anonList"),
      empty: $("anonEmpty"),
      counter: $("anonCounter"),
      kw: $("anonFilterKeyword"),
      courseFilter: $("anonFilterCourse"),
    };

    // ===== STATE =====
    const state = {
      all: [],
      currentUserId: 0,
      courseOptionsKey: "",
    };

    // ===== HELPERS =====
    const setStatus = (msg = "") => el.status && (el.status.textContent = msg);

    const escapeHtml = (str = "") =>
      String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const fmtDateTime = (v) => (v ? new Date(v).toLocaleString("vi-VN", { hour12: false }) : "-");
    const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "-");

    function makeMailto(email, courseName) {
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
    }

    async function ensureCurrentUserId() {
      const direct = Number(localStorage.getItem("userId") || 0);
      if (direct) return direct;

      // userInfo cache
      try {
        const raw = localStorage.getItem("userInfo");
        if (raw) {
          const ui = JSON.parse(raw);
          const id = Number(ui?.userId || ui?.id || 0);
          if (id) {
            localStorage.setItem("userId", String(id));
            return id;
          }
        }
      } catch {}

      // fallback API
      try {
        const me = await apiFetch("/auth/me");
        const id = Number(me?.userId ?? me?.id ?? 0);
        if (id) localStorage.setItem("userId", String(id));
        return id || 0;
      } catch {
        return 0;
      }
    }

    // ===== LOAD COURSES (left dropdown) =====
    async function loadCourses() {
      if (!el.course) return;
      try {
        const courses = await apiFetch("/courses");
        const list = Array.isArray(courses) ? courses : [];

        const options = list
          .map((c) => {
            const id = c.courseId ?? c.id ?? c.course_id;
            const name = c.courseName ?? c.name ?? c.ten ?? "";
            if (!id || !name) return "";
            return `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`;
          })
          .filter(Boolean)
          .join("");

        el.course.innerHTML = `<option value="">Chọn khóa học</option>${options}`;
      } catch (e) {
        el.course.innerHTML = `<option value="">Không tải được khóa học</option>`;
        console.error(e);
      }
    }

    // ===== LOAD CONNECTIONS =====
    async function loadConnections() {
      try {
        const data = await apiFetch("/connections");
        state.all = Array.isArray(data) ? data : [];
      } catch (e) {
        state.all = [];
        setStatus("Không tải được danh sách: " + (e?.message || e));
        console.error(e);
      }
    }

    // ===== FILTERS =====
    function rebuildCourseFilter(data) {
      if (!el.courseFilter) return;

      const options = [...new Set((data || []).map((i) => (i.courseName || "").trim()).filter(Boolean))];
      const key = options.slice().sort().join("|");

      if (key === state.courseOptionsKey) return;
      state.courseOptionsKey = key;

      const current = el.courseFilter.value;
      el.courseFilter.innerHTML =
        `<option value="">Tất cả khóa học</option>` +
        options.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

      el.courseFilter.value = options.includes(current) ? current : "";
    }

    function applyFilters(data) {
      const kw = (el.kw?.value || "").trim().toLowerCase();
      const course = el.courseFilter?.value || "";

      return (data || []).filter((item) => {
        const hay = `${item.contactEmail || ""} ${item.note || ""}`.toLowerCase();
        const okKw = !kw || hay.includes(kw);
        const okCourse = !course || item.courseName === course;
        return okKw && okCourse;
      });
    }

    // ===== RENDER =====
    function render() {
      rebuildCourseFilter(state.all);

      const filtered = applyFilters(state.all);

      if (el.counter) {
        el.counter.textContent = state.all.length ? `${filtered.length}/${state.all.length} nhu cầu` : "";
      }

      if (!filtered.length) {
        if (el.empty) el.empty.style.display = "block";
        if (el.list) el.list.innerHTML = "";
        return;
      }
      if (el.empty) el.empty.style.display = "none";

      const html = filtered
        .map((item) => {
          const courseName = item.courseName || "";
          const email = item.contactEmail || "";
          const note = item.note || "";

          const createdAtText = fmtDateTime(item.createdAt);
          const expiresAtText = fmtDate(item.expiresAt);

          const isOwner = Number(item.ownerId || 0) === Number(state.currentUserId || 0);

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
                  <a class="btn btn-sm btn-outline-primary" href="${makeMailto(email, courseName)}">Liên hệ</a>
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
                  ? `<button class="btn btn-sm btn-link text-danger px-0 mt-2" data-delete="${escapeHtml(item.id)}">Xóa</button>`
                  : ""
              }
            </div>
          `;
        })
        .join("");

      if (el.list) el.list.innerHTML = html;
    }

    // ===== CREATE =====
    el.form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!el.form.checkValidity()) return el.form.reportValidity();

      const courseId = Number(el.course?.value || 0);
      if (!courseId) return setStatus("Bạn chưa chọn khóa học");

      const payload = {
        courseId,
        contactEmail: (el.email?.value || "").trim(),
        note: (el.note?.value || "").trim(),
      };

      try {
        await apiFetch("/connections", { method: "POST", json: payload });
        el.form.reset();
        setStatus("Đã gửi nhu cầu ghép nhóm.");
        await loadConnections();
        render();
      } catch (err) {
        setStatus("Không gửi được: " + (err?.message || err));
        console.error(err);
      }
    });

    // ===== LIST CLICK (copy / delete) =====
    el.list?.addEventListener("click", async (e) => {
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

    el.clear?.addEventListener("click", () => {
      setStatus("Backend version: không có 'xóa tất cả' (vì phải đảm bảo quyền owner).");
    });

    el.kw?.addEventListener("input", render);
    el.courseFilter?.addEventListener("change", render);

    // ===== INIT =====
    (async () => {
      state.currentUserId = await ensureCurrentUserId();
      await loadCourses();
      await loadConnections();
      render();
    })();
  });
})();
