// assets/js/submissions.js
document.addEventListener("DOMContentLoaded", function () {
  const assignmentId = qs("assignmentId");

  // ====== FILE URL HELPERS ======
  function getApiOrigin() {
    const base = window.API_BASE || "http://localhost:8080/api/v1";
    try {
      if (base.startsWith("http")) return new URL(base).origin;
      return "http://localhost:8080";
    } catch {
      return "http://localhost:8080";
    }
  }

  function buildFileUrl(fileUrl) {
    if (!fileUrl) return "";
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    const origin = getApiOrigin();
    return origin + (fileUrl.startsWith("/") ? fileUrl : "/" + fileUrl);
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

  // ====== RENDER (TEACHER) ======
  function renderListTeacher(data) {
    const ul = document.getElementById("list");
    if (!ul) return console.error("Không tìm thấy #list");

    ul.innerHTML = "";
    if (!data || data.length === 0) {
      ul.innerHTML = `<li class="list-group-item">Chưa có bài nộp.</li>`;
      return;
    }

    data.forEach((s) => {
      const fileAbs = s.fileUrl ? buildFileUrl(s.fileUrl) : "";
      const graded = s.score !== null && s.score !== undefined;

      ul.insertAdjacentHTML(
        "beforeend",
        `
        <li class="list-group-item">
          <div class="fw-semibold">
            ${s.courseName ?? "-"} • ${s.lessonName ?? "-"} • ${s.assignmentTitle ?? "-"}
          </div>

          <div class="small-muted">
            SV: ${s.studentName ?? ""} (${s.studentEmail ?? "-"}) • Nộp lúc: ${s.submittedAt ?? "-"}
          </div>

          <div class="small-muted mt-1">
            Nội dung: ${(s.content ?? "").trim() ? (s.content ?? "").slice(0, 120) : "<i>(Không có nội dung)</i>"}
          </div>

          ${
            s.fileUrl
              ? `
            <div class="small-muted mt-2">
              File:
              <a class="btn btn-sm btn-outline-secondary ms-2"
                href="${fileAbs}" target="_blank" rel="noopener">
                Xem file
              </a>

              <a class="btn btn-sm btn-outline-primary ms-2"
                 href="${fileAbs}" download>
                Tải file
              </a>
            </div>
          `
              : `<div class="small-muted mt-2"><i>(Không có file)</i></div>`
          }

          <div class="small-muted mt-2">
            Điểm: ${s.score ?? "-"} ${s.feedback ? `• Nhận xét: ${s.feedback}` : ""}
          </div>

          ${
            graded
              ? `<button class="btn btn-sm btn-outline-secondary mt-2" disabled>Đã chấm</button>`
              : `<button class="btn btn-sm btn-outline-primary mt-2" data-grade="${s.submissionId}">Chấm điểm</button>`
          }
        </li>
      `
      );
    });

    bindGradeButtons();
  }

  // ====== RENDER (USER) ======
  function renderListUser(data) {
    const ul = document.getElementById("list");
    if (!ul) return console.error("Không tìm thấy #list");

    ul.innerHTML = "";
    if (!data || data.length === 0) {
      ul.innerHTML = `<li class="list-group-item">Chưa có bài nộp.</li>`;
      return;
    }

    data.forEach((s) => {
      const fileAbs = s.fileUrl ? buildFileUrl(s.fileUrl) : "";
      const content = (s.content ?? "").trim();

      // ✅ Ưu tiên title (nếu BE trả về), fallback mới dùng submissionId
      const title =
        s.assignmentTitle ||
        s.assignmentName ||
        (s.assignmentId ? `Bài tập #${s.assignmentId}` : `Submission #${s.submissionId ?? "-"}`);

      ul.insertAdjacentHTML(
        "beforeend",
        `
        <li class="list-group-item">
          <div class="fw-semibold">${title}</div>

          <div class="small-muted mt-1">
            Nội dung: ${content ? content : "<i>(Không có nội dung)</i>"}
          </div>

          ${
            s.fileUrl
              ? `
            <div class="small-muted mt-2">
              File:
              <a class="btn btn-sm btn-outline-secondary ms-2"
                 href="${fileAbs}" target="_blank" rel="noopener">
                Xem file
              </a>

              <a class="btn btn-sm btn-outline-primary ms-2"
                 href="${fileAbs}" download>
                Tải file
              </a>
            </div>
          `
              : `<div class="small-muted mt-2"><i>(Không có file)</i></div>`
          }

          <div class="small-muted mt-2">Điểm: ${s.score ?? "-"}</div>
          ${s.feedback ? `<div class="small-muted">Nhận xét: ${s.feedback}</div>` : ""}
        </li>
      `
      );
    });
  }

  // ====== GRADE MODAL ======
  function bindGradeButtons() {
    const modalEl = document.getElementById("gradeModal");
    if (!modalEl) return;

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    const sidEl = document.getElementById("gradeSubmissionId");
    const scoreEl = document.getElementById("gradeScore");
    const feedbackEl = document.getElementById("gradeFeedback");
    const notifyEl = document.getElementById("notifyStudent");
    const infoEl = document.getElementById("gradeTargetInfo");
    const formEl = document.getElementById("gradeForm");
    const submitBtn = document.getElementById("gradeSubmitBtn");

    document.querySelectorAll("[data-grade]").forEach((btn) => {
      btn.onclick = () => {
        const sid = btn.getAttribute("data-grade");
        sidEl.value = sid;
        scoreEl.value = "";
        feedbackEl.value = "";
        notifyEl.checked = true;
        if (infoEl) infoEl.textContent = `Submission ID: ${sid}`;
        modal.show();
        setTimeout(() => scoreEl.focus(), 150);
      };
    });

    formEl.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const sid = sidEl.value;
        const score = (scoreEl.value || "").trim();
        const feedback = (feedbackEl.value || "").trim();
        const notify = notifyEl.checked;

        if (!sid) return toast("Thiếu submissionId", "danger");
        if (score === "") return toast("Vui lòng nhập điểm", "warning");

        submitBtn.disabled = true;
        submitBtn.textContent = "Đang lưu...";

        await apiFetch(
          `/submissions/${sid}/grade?score=${encodeURIComponent(score)}&feedback=${encodeURIComponent(
            feedback
          )}&notify=${notify ? "true" : "false"}`,
          { method: "POST" }
        );

        toast("Chấm điểm thành công", "success");
        modal.hide();
        location.reload();
      } catch (e2) {
        toast("Chấm điểm thất bại: " + (e2.message || e2), "danger");
        console.error(e2);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Lưu điểm";
      }
    };
  }

  // ====== LOADERS ======
  async function loadTeacherDashboard() {
    const modeTag = document.getElementById("modeTag");
    if (modeTag) modeTag.innerText = "Các khóa tôi dạy";

    const data = await apiFetch(`/submissions/teacher`);
    renderListTeacher(data);

    try {
      const stats = await apiFetch(`/submissions/teacher/stats`);
      const statsEl = document.getElementById("stats");
      if (statsEl) {
        statsEl.innerText = `Tổng lượt nộp: ${stats.totalSubmissions} • Tổng SV đã nộp: ${stats.totalStudents}`;
      }
    } catch (e) {
      console.warn("Không tải được stats teacher:", e);
    }
  }

  async function loadTeacherByAssignment(aid) {
    const modeTag = document.getElementById("modeTag");
    if (modeTag) modeTag.innerText = "Theo bài tập #" + aid;

    const data = await apiFetch(`/submissions/assignments/${aid}`);
    renderListTeacher(data);

    try {
      const stats = await apiFetch(`/submissions/assignments/${aid}/stats`);
      const statsEl = document.getElementById("stats");
      if (statsEl) {
        statsEl.innerText = `SV đã nộp: ${stats.totalStudentsSubmitted ?? stats.totalStudents ?? "-"} • Tổng lượt nộp: ${
          stats.totalSubmissions ?? "-"
        }`;
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

      // nếu có assignmentId -> chỉ teacher xem list theo assignment
      if (assignmentId) {
        if (isTeacher()) {
          await loadTeacherByAssignment(assignmentId);
          return;
        }
        toast("Trang này chỉ để xem. Nộp bài ở Chi tiết bài tập.", "info");
        await loadUserView();
        return;
      }

      // không có assignmentId
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
