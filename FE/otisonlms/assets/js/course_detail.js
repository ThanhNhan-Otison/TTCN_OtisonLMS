
// ===== Role helpers =====
function getRole() {
  return (localStorage.getItem("role") || "").toUpperCase();
}

function isUserRole() {
  return getRole() === "USER";
}

function isTeacher() {
  return getRole() === "TEACHER";
}
function isAdmin() {
  return getRole() === "ADMIN";
}

// ===== UI =====
function updateEnrollUI({ enrolled }) {
  const btnEnroll = document.getElementById("btnEnroll");
  const badge = document.getElementById("enrollState");
  const btnUpload = document.getElementById("uploadBtn");
  if (!badge) return;

  // mặc định ẩn
  if (btnEnroll) btnEnroll.style.display = "none";
  if (btnUpload) btnUpload.style.display = "none";

  // if (isTeacher()) {
  //   badge.className = "badge text-bg-info";
  //   badge.innerText = "Giảng viên ";
  //   if (btnUpload) btnUpload.style.display = "";
  //   return;
  // }

  if (isAdmin()) {
    badge.className = "badge text-bg-info";
    badge.innerText = "Admin ";
    return;
  }

  if (isUserRole()) {
    if (enrolled) {
      badge.className = "badge text-bg-success";
      badge.innerText = "Đã đăng ký";
    } else {
      badge.className = "badge text-bg-warning";
      badge.innerText = "Chưa đăng ký";
      if (btnEnroll) btnEnroll.style.display = "";
    }
  }

}



// function updateUploadUI(courseId) {
//   const btnGoUpload = document.getElementById("btnGoUpload");
//   if (!btnGoUpload) return;

//   btnGoUpload.style.display = "none";

//   if (isTeacher()) {
//     btnGoUpload.style.display = "";
//     btnGoUpload.href = `upload.html?courseId=${encodeURIComponent(courseId)}`;
//   }
//   if (isAdmin()) {
//     btnGoUpload.style.display = "";
//     btnGoUpload.href = `upload.html?courseId=${encodeURIComponent(courseId)}`;
//   }
// }
function updateUploadUI(courseId) {
  const uploadBtn = document.getElementById("uploadBtn");
  if (!uploadBtn) return;

  // mặc định ẩn hết
  uploadBtn.style.display = "none";

  // chỉ TEACHER hoặc ADMIN mới hiện
  if (isTeacher() || isAdmin()) {
    uploadBtn.style.display = "";
    uploadBtn.href = `upload.html?courseId=${encodeURIComponent(courseId)}`;
  }
}


// ===== Data =====
async function loadCourse(courseId) {
  const c = await apiFetch(`/courses/${courseId}`);
  document.getElementById("title").innerText = c.name ?? "(no name)";
  document.getElementById("desc").innerText = c.description ?? "";
}

async function loadLessons(courseId) {
  const ul = document.getElementById("lessonList");
  if (!ul) return;

  ul.innerHTML = "";

  const lessons = await apiFetch(`/lessons/course/${courseId}`);
  if (!lessons || lessons.length === 0) {
    ul.innerHTML = `<li class="list-group-item">Chưa có bài học.</li>`;
    return;
  }

  lessons.forEach((l) => {
    ul.insertAdjacentHTML(
      "beforeend",
      `
      <li class="list-group-item d-flex align-items-center">
        <div class="me-auto">
          <div class="fw-semibold">${l.lessonName ?? "Bài học"}</div>
          <div class="small-muted">${(l.content ?? "").slice(0, 80)}</div>
        </div>
        <a class="btn btn-sm btn-outline-primary" href="lesson.html?id=${l.lessonId}">
          Xem
        </a>
      </li>
      `
    );
  });
}

async function checkEnroll(courseId) {
  try {
    const enrollments = await apiFetch("/enrollments/me");
    const enrolled =
      Array.isArray(enrollments) &&
      enrollments.some((e) => Number(e.courseId) === Number(courseId));

    updateEnrollUI({ enrolled });
    return enrolled;
  } catch {
    updateEnrollUI({ enrolled: false });
    return false;
  }
}

// ===== Main =====
// document.addEventListener("DOMContentLoaded", async () => {
//   const courseId = qs("id");

//   await loadCourse(courseId);
//   await loadLessons(courseId);

//   updateUploadUI(courseId);
//   await checkEnroll(courseId);

//   const btnEnroll = document.getElementById("btnEnroll");
//   if (btnEnroll) {
//     btnEnroll.onclick = async () => {
//       try {
//         await apiFetch("/enrollments", {
//           method: "POST",
//           json: { courseId: Number(courseId) },
//         });
//         toast("Đăng ký thành công", "success");
//         await checkEnroll(courseId);
//       } catch (e) {
//         toast("Đăng ký thất bại: " + e.message, "danger");
//       }
//     };
//   }

//   const handleLogout = () => {
//     clearAuth();
//     location.href = "login.html";
//   };
//   document.getElementById("logout")?.addEventListener("click", handleLogout);
//   document.getElementById("navLogout")?.addEventListener("click", handleLogout);
// });
document.addEventListener("DOMContentLoaded", async () => {
  const courseId = qs("id");

  // đảm bảo role/userInfo đã có
  if (typeof tryLoadMe === "function") await tryLoadMe();

  await loadCourse(courseId);

  // cập nhật UI upload theo role (ẩn/hiện)
  updateUploadUI(courseId);

  // USER: phải check enroll trước
  let enrolled = false;
  if (isUserRole()) {
    enrolled = await checkEnroll(courseId);

    if (enrolled) {
      await loadLessons(courseId);
    } else {
      // chưa đăng ký: không gọi lessons (tránh 403)
      const ul = document.getElementById("lessonList");
      if (ul) ul.innerHTML = `<li class="list-group-item">Bạn cần đăng ký để xem danh sách bài học.</li>`;
    }
  } else {
    // TEACHER/ADMIN: load luôn
    await loadLessons(courseId);
  }

  // nút đăng ký
  const btnEnroll = document.getElementById("btnEnroll");
  if (btnEnroll) {
    btnEnroll.onclick = async () => {
      try {
        await apiFetch("/enrollments", {
          method: "POST",
          json: { courseId: Number(courseId) },
        });
        toast("Đăng ký thành công", "success");

        // sau khi đăng ký xong -> check lại -> load lessons
        const ok = await checkEnroll(courseId);
        if (ok) await loadLessons(courseId);

      } catch (e) {
        toast("Đăng ký thất bại: " + e.message, "danger");
      }
    };
  }

  // logout
  const handleLogout = () => {
    clearAuth();
    location.href = "login.html";
  };
  document.getElementById("logout")?.addEventListener("click", handleLogout);
  document.getElementById("navLogout")?.addEventListener("click", handleLogout);
});