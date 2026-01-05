
// // ===== Role helpers =====
// function getRole() {
//   return (localStorage.getItem("role") || "").toUpperCase();
// }

// function isUserRole() {
//   return getRole() === "USER";
// }

// function isTeacher() {
//   return getRole() === "TEACHER";
// }
// function isAdmin() {
//   return getRole() === "ADMIN";
// }

// // ===== UI =====
// function updateEnrollUI({ enrolled }) {
//   const btnEnroll = document.getElementById("btnEnroll");
//   const badge = document.getElementById("enrollState");
//   const btnUpload = document.getElementById("uploadBtn");
//   if (!badge) return;

//   // mặc định ẩn
//   if (btnEnroll) btnEnroll.style.display = "none";
//   if (btnUpload) btnUpload.style.display = "none";

//   // if (isTeacher()) {
//   //   badge.className = "badge text-bg-info";
//   //   badge.innerText = "Giảng viên ";
//   //   if (btnUpload) btnUpload.style.display = "";
//   //   return;
//   // }

//   if (isAdmin()) {
//     badge.className = "badge text-bg-info";
//     badge.innerText = "Admin ";
//     return;
//   }

//   if (isUserRole()) {
//     if (enrolled) {
//       badge.className = "badge text-bg-success";
//       badge.innerText = "Đã đăng ký";
//     } else {
//       badge.className = "badge text-bg-warning";
//       badge.innerText = "Chưa đăng ký";
//       if (btnEnroll) btnEnroll.style.display = "";
//     }
//   }

// }



// // function updateUploadUI(courseId) {
// //   const btnGoUpload = document.getElementById("btnGoUpload");
// //   if (!btnGoUpload) return;

// //   btnGoUpload.style.display = "none";

// //   if (isTeacher()) {
// //     btnGoUpload.style.display = "";
// //     btnGoUpload.href = `upload.html?courseId=${encodeURIComponent(courseId)}`;
// //   }
// //   if (isAdmin()) {
// //     btnGoUpload.style.display = "";
// //     btnGoUpload.href = `upload.html?courseId=${encodeURIComponent(courseId)}`;
// //   }
// // }
// function updateUploadUI(courseId) {
//   const uploadBtn = document.getElementById("uploadBtn");
//   if (!uploadBtn) return;

//   // mặc định ẩn hết
//   uploadBtn.style.display = "none";

//   // chỉ TEACHER hoặc ADMIN mới hiện
//   if (isTeacher() || isAdmin()) {
//     uploadBtn.style.display = "";
//     uploadBtn.href = `upload.html?courseId=${encodeURIComponent(courseId)}`;
//   }
// }


// // ===== Data =====
// async function loadCourse(courseId) {
//   const c = await apiFetch(`/courses/${courseId}`);
//   document.getElementById("title").innerText = c.name ?? "(no name)";
//   document.getElementById("desc").innerText = c.description ?? "";
// }

// async function loadLessons(courseId) {
//   const ul = document.getElementById("lessonList");
//   if (!ul) return;

//   ul.innerHTML = "";

//   const lessons = await apiFetch(`/lessons/course/${courseId}`);
//   if (!lessons || lessons.length === 0) {
//     ul.innerHTML = `<li class="list-group-item">Chưa có bài học.</li>`;
//     return;
//   }

//   lessons.forEach((l) => {
//     ul.insertAdjacentHTML(
//       "beforeend",
//       `
//       <li class="list-group-item d-flex align-items-center">
//         <div class="me-auto">
//           <div class="fw-semibold">${l.lessonName ?? "Bài học"}</div>
//           <div class="small-muted">${(l.content ?? "").slice(0, 80)}</div>
//         </div>
//         <a class="btn btn-sm btn-outline-primary" href="lesson.html?id=${l.lessonId}">
//           Xem
//         </a>
//       </li>
//       `
//     );
//   });
// }

// async function checkEnroll(courseId) {
//   try {
//     const enrollments = await apiFetch("/enrollments/me");
//     const enrolled =
//       Array.isArray(enrollments) &&
//       enrollments.some((e) => Number(e.courseId) === Number(courseId));

//     updateEnrollUI({ enrolled });
//     return enrolled;
//   } catch {
//     updateEnrollUI({ enrolled: false });
//     return false;
//   }
// }

// // ===== Main =====
// // document.addEventListener("DOMContentLoaded", async () => {
// //   const courseId = qs("id");

// //   await loadCourse(courseId);
// //   await loadLessons(courseId);

// //   updateUploadUI(courseId);
// //   await checkEnroll(courseId);

// //   const btnEnroll = document.getElementById("btnEnroll");
// //   if (btnEnroll) {
// //     btnEnroll.onclick = async () => {
// //       try {
// //         await apiFetch("/enrollments", {
// //           method: "POST",
// //           json: { courseId: Number(courseId) },
// //         });
// //         toast("Đăng ký thành công", "success");
// //         await checkEnroll(courseId);
// //       } catch (e) {
// //         toast("Đăng ký thất bại: " + e.message, "danger");
// //       }
// //     };
// //   }

// //   const handleLogout = () => {
// //     clearAuth();
// //     location.href = "login.html";
// //   };
// //   document.getElementById("logout")?.addEventListener("click", handleLogout);
// //   document.getElementById("navLogout")?.addEventListener("click", handleLogout);
// // });
// document.addEventListener("DOMContentLoaded", async () => {
//   const courseId = qs("id");

//   // đảm bảo role/userInfo đã có
//   if (typeof tryLoadMe === "function") await tryLoadMe();

//   await loadCourse(courseId);

//   // cập nhật UI upload theo role (ẩn/hiện)
//   updateUploadUI(courseId);

//   // USER: phải check enroll trước
//   let enrolled = false;
//   if (isUserRole()) {
//     enrolled = await checkEnroll(courseId);

//     if (enrolled) {
//       await loadLessons(courseId);
//     } else {
//       // chưa đăng ký: không gọi lessons (tránh 403)
//       const ul = document.getElementById("lessonList");
//       if (ul) ul.innerHTML = `<li class="list-group-item">Bạn cần đăng ký để xem danh sách bài học.</li>`;
//     }
//   } else {
//     // TEACHER/ADMIN: load luôn
//     await loadLessons(courseId);
//   }

//   // nút đăng ký
//   const btnEnroll = document.getElementById("btnEnroll");
//   if (btnEnroll) {
//     btnEnroll.onclick = async () => {
//       try {
//         await apiFetch("/enrollments", {
//           method: "POST",
//           json: { courseId: Number(courseId) },
//         });
//         toast("Đăng ký thành công", "success");

//         // sau khi đăng ký xong -> check lại -> load lessons
//         const ok = await checkEnroll(courseId);
//         if (ok) await loadLessons(courseId);

//       } catch (e) {
//         toast("Đăng ký thất bại: " + e.message, "danger");
//       }
//     };
//   }

//   // logout
//   const handleLogout = () => {
//     clearAuth();
//     location.href = "login.html";
//   };
//   document.getElementById("logout")?.addEventListener("click", handleLogout);
//   document.getElementById("navLogout")?.addEventListener("click", handleLogout);
// });

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

  function updateUploadUI(courseId) {
    const uploadBtn = $("uploadBtn");
    if (!uploadBtn) return;

    // only TEACHER/ADMIN
    const ok = isTeacher() || isAdmin();
    setVisible(uploadBtn, ok);

    if (ok) uploadBtn.href = `upload.html?courseId=${encodeURIComponent(courseId)}`;
  }

  function setLessonMessage(msg) {
    const ul = $("lessonList");
    if (ul) ul.innerHTML = `<li class="list-group-item">${msg}</li>`;
  }

  // ===== Data =====
  async function loadCourse(courseId) {
    const c = await apiFetch(`/courses/${courseId}`);
    const title = $("title");
    const desc = $("desc");
    if (title) title.innerText = c?.name ?? "(no name)";
    if (desc) desc.innerText = c?.description ?? "";
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

    await loadCourse(courseId);
    updateUploadUI(courseId);

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
