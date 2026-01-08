
// assets/js/course_detail.js
(() => {
  const $ = (id) => document.getElementById(id);

  const normalizeRole = (r) => String(r || "").toUpperCase().replace("ROLE_", "");
  const getRole = () => normalizeRole(localStorage.getItem("role"));
  const hasToken = () => !!localStorage.getItem("token");

  const isUser = () => getRole() === "USER";
  const isTeacher = () => getRole() === "TEACHER";
  const isAdmin = () => getRole() === "ADMIN";

  function setVisible(el, yes) {
    if (!el) return;
    el.style.display = yes ? "" : "none";
  }

  // ===== UI =====
  function updateEnrollUI(enrolled) {
    const btnEnroll = $("btnEnroll");
    const badge = $("enrollState");
    if (!badge) return;

    // default: hide enroll button
    setVisible(btnEnroll, false);

    if (isTeacher()) {
      badge.className = "badge text-bg-info";
      badge.innerText = "Giảng viên";
      return;
    }

    if (isAdmin()) {
      badge.className = "badge text-bg-info";
      badge.innerText = "Admin";
      return;
    }

    if (isUser()) {
      if (enrolled) {
        badge.className = "badge text-bg-success";
        badge.innerText = "Đã đăng ký";
      } else {
        badge.className = "badge text-bg-warning";
        badge.innerText = "Chưa đăng ký";
        setVisible(btnEnroll, true);
      }
      return;
    }

    // fallback (chưa login hoặc role trống)
    badge.className = "badge text-bg-secondary";
    badge.innerText = "Khách";
  }

  // function updateUploadUI(courseId) {
  //   const uploadBtn = $("uploadBtn");
  //   if (!uploadBtn) return;

  //   // only TEACHER/ADMIN
  //   const ok = isTeacher() || isAdmin();
  //   setVisible(uploadBtn, ok);

  //   if (ok) uploadBtn.href = `upload.html?courseId=${encodeURIComponent(courseId)}`;
  // }
  //-----
  // function updateUploadUI(course) {
  //   const uploadBtn = $("uploadBtn");
  //   if (!uploadBtn) return;

  //   uploadBtn.style.display = "none";

  //   const role = getRole();
  //   const user = JSON.parse(localStorage.getItem("userInfo") || "null");
  //   if (!user) return;

  //   // ADMIN: luôn được upload
  //   if (role === "ADMIN") {
  //     uploadBtn.style.display = "";
  //     uploadBtn.href = `upload.html?courseId=${course.id}`;
  //     return;
  //   }

  //   // TEACHER: chỉ khi là người tạo course
  //   if (role === "TEACHER" && course.teacherId === user.userId) {
  //     uploadBtn.style.display = "";
  //     uploadBtn.href = `upload.html?courseId=${course.id}`;
  //   }
  // }
  //---
  function updateUploadUI(course) {
  const uploadBtn = document.getElementById("uploadBtn");
  if (!uploadBtn) return;

  uploadBtn.style.display = "none";

  const role = getRole();
  const user = JSON.parse(localStorage.getItem("userInfo") || "null");
  if (!user) return;

  // ADMIN: luôn được upload
  if (role === "ADMIN") {
    uploadBtn.style.display = "";
    uploadBtn.href = `upload.html?courseId=${course.id}`;
    return;
  }

  // TEACHER: chỉ người tạo course
  if (role === "TEACHER" && Number(course.teacherId) === Number(user.id)) {
    uploadBtn.style.display = "";
    uploadBtn.href = `upload.html?courseId=${course.id}`;
  }
}



  function setLessonMessage(msg) {
    const ul = $("lessonList");
    if (ul) ul.innerHTML = `<li class="list-group-item">${msg}</li>`;
  }

  // ===== Data =====
  // async function loadCourse(courseId) {
  //   const c = await apiFetch(`/courses/${courseId}`);
  //   const title = $("title");
  //   const desc = $("desc");
  //   if (title) title.innerText = c?.name ?? "(no name)";
  //   if (desc) desc.innerText = c?.description ?? "";
  // }
  async function loadCourse(courseId) {
    const c = await apiFetch(`/courses/${courseId}`);
    $("title").innerText = c?.name ?? "(no name)";
    $("desc").innerText = c?.description ?? "";
    return c;
  }


  async function loadLessons(courseId) {
    const ul = $("lessonList");
    if (!ul) return;

    ul.innerHTML = "";
    const lessons = await apiFetch(`/lessons/course/${courseId}`);

    if (!Array.isArray(lessons) || lessons.length === 0) {
      setLessonMessage("Chưa có bài học.");
      return;
    }

    ul.innerHTML = lessons.map((l) => `
      <li class="list-group-item d-flex align-items-center">
        <div class="me-auto">
          <div class="fw-semibold">${l.lessonName ?? "Bài học"}</div>
          <div class="small-muted">${String(l.content ?? "").slice(0, 80)}</div>
        </div>
        <a class="btn btn-sm btn-outline-primary" href="lesson.html?id=${l.lessonId}">
          Xem
        </a>
      </li>
    `).join("");
  }

  async function checkEnroll(courseId) {
    try {
      const enrollments = await apiFetch("/enrollments/me");
      const enrolled =
        Array.isArray(enrollments) &&
        enrollments.some((e) => Number(e.courseId) === Number(courseId));

      updateEnrollUI(enrolled);
      return enrolled;
    } catch {
      // nếu bị 401/403 (chưa login) hoặc lỗi khác -> coi như chưa enrolled
      updateEnrollUI(false);
      return false;
    }
  }

  async function initAuthState() {
    // Chỉ gọi /auth/me khi có token và thiếu role/userInfo
    if (hasToken() && (!localStorage.getItem("role") || !localStorage.getItem("userInfo"))) {
      if (typeof tryLoadMe === "function") {
        await tryLoadMe();
      }
    }
  }

  // ===== Main =====
  document.addEventListener("DOMContentLoaded", async () => {
    const courseId = qs("id");
    if (!courseId) return;

    await initAuthState();

    const course = await loadCourse(courseId);
    // updateUploadUI(courseId);
    updateUploadUI(course);

    // USER: chỉ được xem lessons khi đã enroll
    if (isUser()) {
      const enrolled = await checkEnroll(courseId);
      if (enrolled) await loadLessons(courseId);
      else setLessonMessage("Bạn cần đăng ký để xem danh sách bài học.");
    } else if (isTeacher() || isAdmin()) {
      // TEACHER/ADMIN: load luôn
      updateEnrollUI(false); // để badge hiển thị Teacher/Admin
      await loadLessons(courseId);
    } else {
      // Khách (chưa login): vẫn xem được course info, nhưng không xem lessons
      updateEnrollUI(false);
      setLessonMessage("Vui lòng đăng nhập và đăng ký để xem danh sách bài học.");
    }

    // Enroll button (USER)
    const btnEnroll = $("btnEnroll");
    if (btnEnroll) {
      btnEnroll.onclick = async () => {
        try {
          await apiFetch("/enrollments", {
            method: "POST",
            json: { courseId: Number(courseId) },
          });
          toast?.("Đăng ký thành công", "success");

          const ok = await checkEnroll(courseId);
          if (ok) await loadLessons(courseId);
        } catch (e) {
          toast?.("Đăng ký thất bại: " + (e.message || e), "danger");
        }
      };
    }

    // Logout (nếu navbar có)
    const handleLogout = () => {
      clearAuth();
      location.href = "login.html";
    };
    $("logout")?.addEventListener("click", handleLogout);
    $("navLogout")?.addEventListener("click", handleLogout);
  });
})();
