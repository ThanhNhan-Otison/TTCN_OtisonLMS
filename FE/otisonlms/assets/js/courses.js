
// // assets/js/courses.js
// document.addEventListener("DOMContentLoaded", function () {
//   let all = [];
//   let page = 1;
//   let adminTab = "all"; // all | draft | publish | hidden

//   // ===== helpers =====
//   function getRoleUpper() {
//     // ưu tiên hàm trong auth.js nếu có
//     if (typeof getStoredRole === "function") return String(getStoredRole() || "").toUpperCase();
//     return String(localStorage.getItem("role") || "").toUpperCase();
//   }

//   function statusBadge(st) {
//     const s = String(st || "").toLowerCase();
//     if (s === "publish") return `<span class="badge text-bg-success">PUBLIC</span>`;
//     if (s === "hidden") return `<span class="badge text-bg-secondary">HIDDEN</span>`;
//     return `<span class="badge text-bg-warning">DRAFT</span>`;
//   }

//   async function setCourseStatus(courseId, status) {
//     // Backend bạn đang để prefix /api/v1 trong api.js => chỉ cần path sau /api/v1
//     // PATCH /api/v1/admin/courses/{id}/status  body: { "status": "publish|hidden|draft" }
//     return apiFetch(`/admin/courses/${courseId}/status`, {
//       method: "PATCH",
//       json: { status }, // "publish" | "hidden" | "draft"
//     });
//   }

//   // ===== render =====
//   function render() {
//     const q = document.getElementById("q").value.trim().toLowerCase();
//     const pageSize = parseInt(document.getElementById("pageSize").value, 10);

//     const role = getRoleUpper();
//     const isAdmin = role === "ADMIN";

//     // USER/TEACHER chỉ xem publish
//     let viewList = all;

//     if (!isAdmin) {
//       // USER / TEACHER
//       viewList = all.filter(c =>
//         String(c.status || "").toLowerCase() === "publish"
//       );
//     } else {
//       // ADMIN lọc theo tab
//       if (adminTab !== "all") {
//         viewList = all.filter(c =>
//           String(c.status || "").toLowerCase() === adminTab
//         );
//       }
//     }


//     const filtered = viewList.filter((c) =>
//       (c.courseName || c.name || "").toLowerCase().includes(q)
//     );
//     const meta = paginate(filtered, page, pageSize);

//     document.getElementById("meta").innerText =
//       `Hiển thị ${meta.items.length}/${meta.total} (Trang ${meta.page}/${meta.totalPages})`;

//     const list = document.getElementById("courseList");
//     list.innerHTML = "";

//     meta.items.forEach((c) => {
//       const id = c.courseId ?? c.id;
//       const title = c.courseName ?? c.name ?? "(no name)";
//       const desc = c.description ?? c.moTa ?? "";
//       const st = c.status;


//       const adminBtns = isAdmin
//         ? renderAdminCourseAction(id, st)
//         : "";

//       list.insertAdjacentHTML(
//         "beforeend",
//         `
//         <div class="col-md-4">
//           <div class="card shadow-soft p-3 h-100">
//             <div class="d-flex align-items-start">
//               <div class="me-auto">
//                 <div class="fw-bold">${title}</div>
//                 <div class="small-muted">${desc}</div>
//               </div>
//               ${isAdmin ? statusBadge(st) : `<span class="badge badge-soft">Course</span>`}
//             </div>

//             <div class="mt-3 d-flex gap-2 flex-wrap">
//               <a class="btn btn-primary btn-sm" href="course_detail.html?id=${id}">Xem chi tiết</a>
//               ${adminBtns}
//             </div>
//           </div>
//         </div>
//       `
//       );
//     });

//     renderPager("pager", meta, (p) => {
//       page = p;
//       render();
//     });
//   }

//   // ===== init =====
//   (async () => {
//     try {
//       // trang này đang requireAuth() ở HTML rồi, nên cứ fetch bình thường
//       const courses = await apiFetch("/courses");
//       all = Array.isArray(courses) ? courses : [];

//       // show dashboard button only for ADMIN
//       const role = getRoleUpper();

//       // show dashboard button only for ADMIN
//       const dashboardBtn = document.getElementById("dashboardBtn");
//       if (dashboardBtn) dashboardBtn.classList.toggle("d-none", role !== "ADMIN");

//       // ✅ show ADMIN tabs only for ADMIN
//       const tabsWrap = document.getElementById("adminCourseTabs");
//       if (tabsWrap) tabsWrap.classList.toggle("d-none", role !== "ADMIN");

//       //show buttons only for TEACHER

//       const btnAssignments = document.getElementById("btnAssignments");
//       const btnUpload = document.getElementById("btnUpload");

//       const isTeacher = role === "TEACHER";
//       if (btnAssignments) btnAssignments.classList.toggle("d-none", !isTeacher);
//       if (btnUpload) btnUpload.classList.toggle("d-none", !isTeacher);


//       render();
//     } catch (e) {
//       if (typeof toast === "function") toast("Không tải được khóa học: " + e.message, "danger");
//       console.error(e);
//     }
//   })();

//   // search + paging
//   document.getElementById("q").addEventListener("input", () => {
//     page = 1;
//     render();
//   });
//   document.getElementById("pageSize").addEventListener("change", () => {
//     page = 1;
//     render();
//   });

//   // ADMIN actions (event delegation)
//   document.getElementById("courseList").addEventListener("click", async (e) => {
//     const btn = e.target.closest("button[data-act]");
//     if (!btn) return;

//     const role = getRoleUpper();
//     if (role !== "ADMIN") return;

//     const id = btn.dataset.id;
//     const act = btn.dataset.act; // publish/hidden/draft

//     try {
//       await setCourseStatus(id, act);
//       if (typeof toast === "function") {
//         const label = act === "publish" ? "PUBLIC" : act === "hidden" ? "HIDDEN" : "DRAFT";
//         toast(`Đã cập nhật: ${label}`, "success");
//       }

//       // update local list để render lại ngay
//       all = all.map((c) => {
//         const cid = c.courseId ?? c.id;
//         return String(cid) === String(id) ? { ...c, status: act } : c;
//       });

//       render();
//     } catch (err) {
//       if (typeof toast === "function") toast("Cập nhật thất bại: " + (err.message || err), "danger");
//       console.error(err);
//     }
//   });
//   function renderAdminCourseAction(id, status) {
//     const st = String(status || "").toLowerCase();

//     // ĐÃ PUBLIC → chỉ cho ẨN
//     if (st === "publish") {
//       return `
//       <button class="btn btn-outline-secondary btn-sm"
//               data-act="hidden"
//               data-id="${id}">
//         Ẩn
//       </button>
//     `;
//     }

//     // DRAFT hoặc HIDDEN → cho DUYỆT
//     return `
//     <button class="btn btn-outline-success btn-sm"
//             data-act="publish"
//             data-id="${id}">
//       Duyệt
//     </button>
//   `;
//   }
//   document.querySelectorAll("#adminCourseTabs button").forEach(btn => {
//     btn.addEventListener("click", () => {
//       document.querySelectorAll("#adminCourseTabs button")
//         .forEach(b => b.classList.remove("active"));

//       btn.classList.add("active");
//       adminTab = btn.dataset.tab; // all | draft | publish | hidden
//       page = 1;
//       render();
//     });
//   });


// });


// assets/js/courses.js
document.addEventListener("DOMContentLoaded", function () {
  let all = [];
  let page = 1;
  let adminTab = "all"; // all | draft | publish | hidden

  const $ = (id) => document.getElementById(id);

  // ===== helpers =====
  function getRoleUpper() {
    // ưu tiên hàm trong auth.js nếu có
    let r = "";
    if (typeof getStoredRole === "function") r = getStoredRole();
    else r = localStorage.getItem("role");

    return String(r || "").toUpperCase().replace("ROLE_", "");
  }

  function statusBadge(st) {
    const s = String(st || "").toLowerCase();
    if (s === "publish") return `<span class="badge text-bg-success">PUBLIC</span>`;
    if (s === "hidden") return `<span class="badge text-bg-secondary">HIDDEN</span>`;
    return `<span class="badge text-bg-warning">DRAFT</span>`;
  }

  async function setCourseStatus(courseId, status) {
    // PATCH /api/v1/admin/courses/{id}/status  body: { "status": "publish|hidden|draft" }
    return apiFetch(`/admin/courses/${courseId}/status`, {
      method: "PATCH",
      json: { status }, // "publish" | "hidden" | "draft"
    });
  }

  function renderAdminCourseAction(id, status) {
    const st = String(status || "").toLowerCase();

    // ĐÃ PUBLIC → chỉ cho ẨN
    if (st === "publish") {
      return `
        <button class="btn btn-outline-secondary btn-sm"
                data-act="hidden"
                data-id="${id}">
          Ẩn
        </button>
      `;
    }

    // DRAFT hoặc HIDDEN → cho DUYỆT
    return `
      <button class="btn btn-outline-success btn-sm"
              data-act="publish"
              data-id="${id}">
        Duyệt
      </button>
    `;
  }

  // ===== render =====
  function render() {
    const qEl = $("q");
    const pageSizeEl = $("pageSize");
    const list = $("courseList");
    const metaEl = $("meta");

    if (!qEl || !pageSizeEl || !list || !metaEl) return;

    const q = qEl.value.trim().toLowerCase();
    const pageSize = parseInt(pageSizeEl.value, 10) || 6;

    const role = getRoleUpper();
    const isAdmin = role === "ADMIN";

    // USER/TEACHER chỉ xem publish
    let viewList = all;

    if (!isAdmin) {
      viewList = all.filter(c => String(c.status || "").toLowerCase() === "publish");
    } else {
      // ADMIN lọc theo tab
      if (adminTab !== "all") {
        viewList = all.filter(c => String(c.status || "").toLowerCase() === adminTab);
      }
    }

    const filtered = viewList.filter((c) =>
      (c.courseName || c.name || "").toLowerCase().includes(q)
    );

    const meta = paginate(filtered, page, pageSize);

    metaEl.innerText = `Hiển thị ${meta.items.length}/${meta.total} (Trang ${meta.page}/${meta.totalPages})`;

    list.innerHTML = "";

    meta.items.forEach((c) => {
      const id = c.courseId ?? c.id;
      const title = c.courseName ?? c.name ?? "(no name)";
      const desc = c.description ?? c.moTa ?? "";
      const st = c.status;

      const adminBtns = isAdmin ? renderAdminCourseAction(id, st) : "";

      list.insertAdjacentHTML(
        "beforeend",
        `
        <div class="col-md-4">
          <div class="card shadow-soft p-3 h-100">
            <div class="d-flex align-items-start">
              <div class="me-auto">
                <div class="fw-bold">${title}</div>
                <div class="small-muted">${desc}</div>
              </div>
              ${isAdmin ? statusBadge(st) : `<span class="badge badge-soft">Course</span>`}
            </div>

            <div class="mt-3 d-flex gap-2 flex-wrap">
              <a class="btn btn-primary btn-sm" href="course_detail.html?id=${id}">Xem chi tiết</a>
              ${adminBtns}
            </div>
          </div>
        </div>
      `
      );
    });

    renderPager("pager", meta, (p) => {
      page = p;
      render();
    });
  }

  // ===== init =====
  (async () => {
    try {
      // ✅ CHUẨN HÓA: không cần requireAuth inline trong HTML nữa
      requireAuth("login.html");

      // ✅ đảm bảo có userInfo/role (nhất là trường hợp token có nhưng role chưa có)
      await tryLoadMe();

      const courses = await apiFetch("/courses");
      all = Array.isArray(courses) ? courses : [];

      const role = getRoleUpper();

      // show dashboard button only for ADMIN (nếu navbar có id này)
      const dashboardBtn = $("dashboardBtn");
      if (dashboardBtn) dashboardBtn.classList.toggle("d-none", role !== "ADMIN");

      // show ADMIN tabs only for ADMIN
      const tabsWrap = $("adminCourseTabs");
      if (tabsWrap) tabsWrap.classList.toggle("d-none", role !== "ADMIN");

      // show buttons only for TEACHER
      const btnAssignments = $("btnAssignments");
      const btnUpload = $("btnUpload");

      const isTeacher = role === "TEACHER";
      if (btnAssignments) btnAssignments.classList.toggle("d-none", !isTeacher);
      if (btnUpload) btnUpload.classList.toggle("d-none", !isTeacher);

      render();
    } catch (e) {
      if (typeof toast === "function") toast("Không tải được khóa học: " + (e.message || e), "danger");
      console.error(e);
    }
  })();

  // search + paging
  $("q")?.addEventListener("input", () => {
    page = 1;
    render();
  });

  $("pageSize")?.addEventListener("change", () => {
    page = 1;
    render();
  });

  // ADMIN actions (event delegation)
  $("courseList")?.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;

    const role = getRoleUpper();
    if (role !== "ADMIN") return;

    const id = btn.dataset.id;
    const act = btn.dataset.act; // publish/hidden/draft

    try {
      await setCourseStatus(id, act);
      if (typeof toast === "function") {
        const label = act === "publish" ? "PUBLIC" : act === "hidden" ? "HIDDEN" : "DRAFT";
        toast(`Đã cập nhật: ${label}`, "success");
      }

      // update local list để render lại ngay
      all = all.map((c) => {
        const cid = c.courseId ?? c.id;
        return String(cid) === String(id) ? { ...c, status: act } : c;
      });

      render();
    } catch (err) {
      if (typeof toast === "function") toast("Cập nhật thất bại: " + (err.message || err), "danger");
      console.error(err);
    }
  });

  // ADMIN tabs
  document.querySelectorAll("#adminCourseTabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#adminCourseTabs button")
        .forEach((b) => b.classList.remove("active"));

      btn.classList.add("active");
      adminTab = btn.dataset.tab || "all"; // all | draft | publish | hidden
      page = 1;
      render();
    });
  });
});
