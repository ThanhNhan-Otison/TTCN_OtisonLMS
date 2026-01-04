// assets/js/submissions.js
document.addEventListener('DOMContentLoaded', function () {
  const assignmentId = qs("assignmentId");

  // ====== FILE URL HELPERS (FIX Cannot GET /submissions/...) ======
  function getApiOrigin() {
    // Nếu api.js có window.API_BASE = "http://localhost:8080/api/v1"
    const base = window.API_BASE || "http://localhost:8080/api/v1";
    try {
      // base có thể là "/api/v1" hoặc full url
      if (base.startsWith("http")) return new URL(base).origin;
      // nếu base là relative thì fallback localhost:8080
      return "http://localhost:8080";
    } catch {
      return "http://localhost:8080";
    }
  }

  function buildFileUrl(fileUrl) {
    if (!fileUrl) return "";
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl; // đã là full url
    // fileUrl từ BE dạng "/submissions/xxx.pdf"
    const origin = getApiOrigin();
    return origin + (fileUrl.startsWith("/") ? fileUrl : ("/" + fileUrl));
  }

  // ====== ROLE HELPERS ======
  function normalizeRole(r = "") {
    return String(r).toUpperCase().replace("ROLE_", "");
  }
  function isTeacher() {
    const role = normalizeRole(localStorage.getItem("role") || "");
    return role === "TEACHER" || role === "ADMIN";
  }
  function isUser() {
    const role = normalizeRole(localStorage.getItem("role") || "");
    return role === "USER" || role === "STUDENT";
  }

  async function ensureMe() {
    if (localStorage.getItem("token") && !localStorage.getItem("role")) {
      if (typeof tryLoadMe === "function") await tryLoadMe();
    }
  }

  // ====== RENDER ======
  function renderListTeacher(data) {
    const ul = document.getElementById("list");
    if (!ul) {
      console.error("Không tìm thấy #list trong HTML");
      return;
    }

    ul.innerHTML = "";
    if (!data || data.length === 0) {
      ul.innerHTML = `<li class="list-group-item">Chưa có bài nộp.</li>`;
      return;
    }

    data.forEach(s => {
      ul.insertAdjacentHTML("beforeend", `
        <li class="list-group-item">
          <div class="fw-semibold">
            ${s.courseName ?? "-"} • ${s.lessonName ?? "-"} • ${s.assignmentTitle ?? "-"}
          </div>

          <div class="small-muted">
            SV: ${s.studentName ?? ""} (${s.studentEmail ?? "-"}) • Nộp lúc: ${s.submittedAt ?? "-"}
          </div>

          <div class="small-muted">Nội dung: ${(s.content ?? "").slice(0, 120)}</div>

          ${s.fileUrl
            ? `<div class="small-muted">File:
                <a href="${buildFileUrl(s.fileUrl)}" target="_blank" rel="noopener">Tải file</a>
              </div>`
            : ""
          }

          <div class="small-muted">
            Điểm: ${s.score ?? "-"} ${s.feedback ? `• Nhận xét: ${s.feedback}` : ""}
          </div>

          <button class="btn btn-sm btn-outline-primary mt-2" data-grade="${s.submissionId}">
            Chấm điểm
          </button>
        </li>
      `);
    });

    bindGradeButtons(); // gắn event sau khi render
  }

  function renderListUser(data) {
    const ul = document.getElementById("list");
    if (!ul) {
      console.error("Không tìm thấy #list trong HTML");
      return;
    }

    ul.innerHTML = "";
    if (!data || data.length === 0) {
      ul.innerHTML = `<li class="list-group-item">Chưa có bài nộp.</li>`;
      return;
    }

    data.forEach(s => {
      ul.insertAdjacentHTML("beforeend", `
        <li class="list-group-item">
          <div class="fw-semibold">Submission #${s.submissionId ?? s.id ?? "-"}</div>

          <div class="small-muted">Nội dung: ${(s.content ?? s.link ?? "").slice(0, 120)}</div>

          ${s.fileUrl
            ? `<div class="small-muted">File:
                <a href="${buildFileUrl(s.fileUrl)}" target="_blank" rel="noopener">Tải file</a>
              </div>`
            : ""
          }

          <div class="small-muted">Điểm: ${s.score ?? "-"}</div>
          ${s.feedback ? `<div class="small-muted">Nhận xét: ${s.feedback}</div>` : ""}
        </li>
      `);
    });
  }

  function bindGradeButtons() {
    document.querySelectorAll("[data-grade]").forEach(btn => {
      btn.onclick = async () => {
        try {
          const sid = btn.getAttribute("data-grade");
          const score = prompt("Nhập điểm:");
          if (score === null) return;

          const feedback = prompt("Nhận xét (có thể bỏ trống):") || "";

          await apiFetch(
            `/submissions/${sid}/grade?score=${encodeURIComponent(score)}&feedback=${encodeURIComponent(feedback)}`,
            { method: "POST" }
          );

          toast("Chấm điểm thành công", "success");
          location.reload();
        } catch (e) {
          toast("Chấm điểm thất bại: " + (e.message || e), "danger");
          console.error(e);
        }
      };
    });
  }

  // ====== LOADERS ======
  async function loadTeacherDashboard() {
    const modeTag = document.getElementById("modeTag");
    if (modeTag) modeTag.innerText = "Các khóa tôi dạy";

    const data = await apiFetch(`/submissions/teacher`);
    renderListTeacher(data);

    // stats
    try {
      const stats = await apiFetch(`/submissions/teacher/stats`);
      const statsEl = document.getElementById("stats");
      if (statsEl) {
        statsEl.innerText = `Tổng lượt nộp: ${stats.totalSubmissions} • Tổng SV đã nộp: ${stats.totalStudents}`;
      }
    } catch (e) {
      // bỏ qua nếu chưa có endpoint
      console.warn("Không tải được stats teacher:", e);
    }
  }

  async function loadTeacherByAssignment(aid) {
    const modeTag = document.getElementById("modeTag");
    if (modeTag) modeTag.innerText = "Theo bài tập #" + aid;

    const data = await apiFetch(`/submissions/assignments/${aid}`);
    renderListTeacher(data);

    // stats theo assignment nếu có
    try {
      const stats = await apiFetch(`/submissions/assignment/${aid}/stats`);
      const statsEl = document.getElementById("stats");
      if (statsEl) {
        statsEl.innerText = `SV đã nộp: ${stats.totalStudentsSubmitted} • Tổng lượt nộp: ${stats.totalSubmissions}`;
      }
    } catch (e) {
      console.warn("Không tải được stats assignment:", e);
    }
  }

  async function loadUserView() {
    const modeTag = document.getElementById("modeTag");
    if (modeTag) modeTag.innerText = "Bài nộp của tôi";

    const data = await apiFetch(`/submissions/me`);
    renderListUser(data);
  }

  // ====== BOOT ======
  (async () => {
    try {
      await ensureMe();

      if (assignmentId) {
        if (!isTeacher()) {
          toast("Bạn không có quyền xem danh sách bài nộp của bài tập này.", "warning");
          return;
        }
        await loadTeacherByAssignment(assignmentId);
        return;
      }

      if (isTeacher()) {
        await loadTeacherDashboard();
        return;
      }

      if (isUser()) {
        await loadUserView();
        return;
      }

      toast("Bạn không có quyền xem mục này.", "warning");
    } catch (e) {
      toast("Không tải được bài nộp: " + (e.message || e), "danger");
      console.error(e);
    }
  })();
});
