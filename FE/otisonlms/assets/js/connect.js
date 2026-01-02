// // assets/js/connect.js
// // All logic from connect.html inline script, wrapped in DOMContentLoaded
// const API_BASE = "http://localhost:8080/api/v1";
// document.addEventListener('DOMContentLoaded', function() {
//       // Ẩn/hiện trường khóa học theo role
//       const courseFieldWrap = document.getElementById("courseFieldWrap");
//       if (courseFieldWrap && typeof isTeacherOrAdmin === "function") {
//         if (!isTeacherOrAdmin()) {
//           courseFieldWrap.style.display = "none";
//         } else {
//           courseFieldWrap.style.display = "";
//         }
//       }
//     // Populate course dropdown from API
//     async function populateCourseDropdown() {
//       const select = document.getElementById("courseName");
//       if (!select) return;
//       try {
//         const courses = await apiFetch("/courses");
//         if (!Array.isArray(courses)) throw new Error("Dữ liệu trả về không hợp lệ");
//         if (courses.length === 0) {
//           select.innerHTML = '<option value="">Không có khóa học nào</option>';
//         } else {
//           select.innerHTML = '<option value="">Chọn khóa học</option>' +
//             courses.map(c => `<option value="${c.courseName || c.name}">${c.courseName || c.name}</option>`).join("");
//         }
//       } catch (e) {
//         select.innerHTML = '<option value="">Không tải được khóa học</option>';
//         if (window.toast) toast(e.message, "danger");
//       }
//     }
//     populateCourseDropdown();
//   const STORAGE_KEY = "friendConnections";
//   const form = document.getElementById("connectionForm");
//   const listWrap = document.getElementById("connectionList");
//   const empty = document.getElementById("emptyState");
//   const counter = document.getElementById("counter");
//   const status = document.getElementById("formStatus");

//   const ownerName = document.getElementById("ownerName");
//   const ownerEmail = document.getElementById("ownerEmail");
//   const friendName = document.getElementById("friendName");
//   const friendEmail = document.getElementById("friendEmail");
//   const courseName = document.getElementById("courseName");
//   const note = document.getElementById("note");
//   const clearBtn = document.getElementById("clearAll");
//   const filterKeyword = document.getElementById("filterKeyword");
//   const filterCourse = document.getElementById("filterCourse");

//   function readStore(){
//     try{
//       const raw = localStorage.getItem(STORAGE_KEY);
//       return raw ? JSON.parse(raw) : [];
//     }catch(err){
//       console.warn("Cannot parse friendConnections", err);
//       return [];
//     }
//   }

//   function saveStore(items){
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
//   }

//   function formatDate(value){
//     return new Date(value).toLocaleString("vi-VN", { hour12:false });
//   }

//   function buildCourseFilter(data){
//     const current = filterCourse.value;
//     const options = ["", ...new Set(data.map(item => item.courseName).filter(Boolean))];
//     filterCourse.innerHTML = options.map(value => {
//       const label = value || "Tất cả khóa học";
//       const selected = value === current ? "selected" : "";
//       return `<option value="${value}">${label}</option>`;
//     }).join("");
//     if(!options.includes(current)) filterCourse.value = "";
//   }

//   function applyFilters(data){
//     const kw = filterKeyword.value.trim().toLowerCase();
//     const course = filterCourse.value;
//     return data.filter(item => {
//       const haystack = `${item.friendName} ${item.friendEmail || ""} ${item.ownerName} ${item.ownerEmail}`.toLowerCase();
//       const matchKw = !kw || haystack.includes(kw);
//       const matchCourse = !course || item.courseName === course;
//       return matchKw && matchCourse;
//     });
//   }

//   function render(){
//     const data = readStore();
//     buildCourseFilter(data);
//     const filtered = applyFilters(data);
//     counter.textContent = filtered.length ? `${filtered.length}/${data.length} yêu cầu` : data.length ? `0/${data.length} yêu cầu` : "";

//     if(!filtered.length){
//       empty.style.display = "block";
//       listWrap.innerHTML = "";
//       return;
//     }

//     empty.style.display = "none";
//     listWrap.innerHTML = filtered.map(item=>{
//       const originalIndex = data.indexOf(item);
//       return `
//       <div class="list-group-item py-3">
//         <div class="d-flex justify-content-between align-items-center">
//           <div>
//             <strong>${item.friendName}</strong>
//             <div class="text-muted small">${item.friendEmail || "Chưa có email"}</div>
//           </div>
//           <div class="text-muted small text-end">
//             ${formatDate(item.createdAt)}
//             <div>${item.ownerName}</div>
//           </div>
//         </div>
//         <div class="mt-2 small">${item.note}</div>
//         <div class="mt-2">
//           <span class="badge text-bg-light text-primary">${item.courseName || "Chưa rõ khóa"}</span>
//         </div>
//         <div class="mt-2 text-muted small">Người gửi: ${item.ownerName} (${item.ownerEmail})</div>
//         <div class="d-flex gap-3 mt-2">
//           ${item.friendEmail ? `<a class="btn btn-sm btn-outline-primary" href="mailto:${item.friendEmail}?subject=Ket%20noi%20hoc%20chung&body=Chao%20${item.friendName},%20minh%20la%20${item.ownerName}%20muon%20hoc%20chung%20khoa%20${item.courseName}" target="_blank">Gửi email</a>` : ""}
//           <button class="btn btn-sm btn-link text-danger px-0" data-index="${originalIndex}">Xóa yêu cầu</button>
//         </div>
//       </div>
//       `;
//     }).join("");
//   }

//   form.addEventListener("submit", (e)=>{
//     e.preventDefault();
//     if(!form.checkValidity()){
//       form.reportValidity();
//       return;
//     }

//     const payload = {
//       ownerName: ownerName.value.trim(),
//       ownerEmail: ownerEmail.value.trim(),
//       friendName: friendName.value.trim(),
//       friendEmail: friendEmail.value.trim(),
//       courseName: courseName.value.trim(),
//       note: note.value.trim(),
//       createdAt: Date.now()
//     };

//     const data = readStore();
//     data.unshift(payload);
//     saveStore(data);
//     form.reset();
//     status.textContent = "Đã lưu yêu cầu kết nối.";
//     render();
//   });

//   listWrap.addEventListener("click", (e)=>{
//     if(e.target.matches("button[data-index]")){
//       const idx = Number(e.target.getAttribute("data-index"));
//       const data = readStore();
//       data.splice(idx, 1);
//       saveStore(data);
//       render();
//     }
//   });

//   filterKeyword.addEventListener("input", ()=> render());
//   filterCourse.addEventListener("change", ()=> render());

//   clearBtn.addEventListener("click", ()=>{
//     if(confirm("Xóa toàn bộ yêu cầu đã lưu?")){
//       localStorage.removeItem(STORAGE_KEY);
//       render();
//     }
//   });

//   // Đổi nút đăng nhập/đăng xuất
//   const navAuthBtn = document.getElementById("navAuthBtn");
//   if (navAuthBtn) {
//     const isValidAuth = (val) => {
//       if (!val) return false;
//       if (typeof val !== "string") return false;
//       if (val.trim() === "" || val === "null" || val === "undefined") return false;
//       return true;
//     };
//     const syncNavAuthBtn = ()=>{
//       const authed = isValidAuth(localStorage.getItem("auth"));
//       if (authed) {
//         navAuthBtn.textContent = "Đăng xuất";
//         navAuthBtn.classList.remove("btn-primary");
//         navAuthBtn.classList.add("btn-outline-danger");
//       } else {
//         navAuthBtn.textContent = "Đăng nhập";
//         navAuthBtn.classList.remove("btn-outline-danger");
//         navAuthBtn.classList.add("btn-primary");
//       }
//     };
//     syncNavAuthBtn();
//     navAuthBtn.onclick = ()=>{
//       if (isValidAuth(localStorage.getItem("auth"))) {
//         if (typeof clearAuth === "function") clearAuth();
//         syncNavAuthBtn();
//         window.location.href = "login.html";
//       } else {
//         window.location.href = "login.html";
//       }
//     };
//   }

//   render();
// });
// assets/js/connect.js

// assets/js/connect.js

const API_BASE = "http://localhost:8080/api/v1";

// ===== Helpers =====
const isValidAuth = (val) => {
  if (!val) return false;
  if (typeof val !== "string") return false;
  const v = val.trim();
  return !(v === "" || v === "null" || v === "undefined");
};

// ===== API Fetch =====
async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const auth = localStorage.getItem("auth");
  if (isValidAuth(auth)) headers["Authorization"] = auth;

  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return res.text();
  }
  return res.json();
}

// ===== Auth Clear (fallback) =====
function clearAuthLocal() {
  localStorage.removeItem("auth");
  localStorage.removeItem("role");
}

document.addEventListener("DOMContentLoaded", async function () {
  // ✅ BỎ logic ẩn courseFieldWrap để không mất trường khóa học

  // ===== Populate course dropdown from API =====
  async function populateCourseDropdown() {
    const select = document.getElementById("courseName");
    if (!select) return;

    try {
      const raw = await apiFetch("/courses");

      // hỗ trợ nhiều dạng response
      const courses = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.content)
        ? raw.content
        : [];

      if (!Array.isArray(courses)) {
        throw new Error("Dữ liệu trả về không hợp lệ (không phải mảng)");
      }

      if (courses.length === 0) {
        select.innerHTML = '<option value="">Không có khóa học nào</option>';
        return;
      }

      select.innerHTML =
        '<option value="">Chọn khóa học</option>' +
        courses
          .map((c) => {
            const name = c.courseName || c.name || "";
            const value = c.courseId ?? c.id ?? name;
            return `<option value="${String(value)}">${name}</option>`;
          })
          .join("");
    } catch (e) {
      console.error("populateCourseDropdown error:", e);
      select.innerHTML = '<option value="">Không tải được khóa học</option>';
      if (window.toast) window.toast(e.message, "danger");
    }
  }

  await populateCourseDropdown();

  // ===== Friend connections localStorage =====
  const STORAGE_KEY = "friendConnections";
  const form = document.getElementById("connectionForm");
  const listWrap = document.getElementById("connectionList");
  const empty = document.getElementById("emptyState");
  const counter = document.getElementById("counter");
  const status = document.getElementById("formStatus");

  const ownerName = document.getElementById("ownerName");
  const ownerEmail = document.getElementById("ownerEmail");
  const friendName = document.getElementById("friendName");
  const friendEmail = document.getElementById("friendEmail");
  const courseName = document.getElementById("courseName");
  const note = document.getElementById("note");
  const clearBtn = document.getElementById("clearAll");
  const filterKeyword = document.getElementById("filterKeyword");
  const filterCourse = document.getElementById("filterCourse");

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn("Cannot parse friendConnections", err);
      return [];
    }
  }

  function saveStore(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function formatDate(value) {
    return new Date(value).toLocaleString("vi-VN", { hour12: false });
  }

  function buildCourseFilter(data) {
    if (!filterCourse) return;
    const current = filterCourse.value;

    const options = ["", ...new Set(data.map((item) => item.courseName).filter(Boolean))];
    filterCourse.innerHTML = options
      .map((value) => {
        const label = value || "Tất cả khóa học";
        const selected = value === current ? "selected" : "";
        return `<option value="${value}" ${selected}>${label}</option>`;
      })
      .join("");

    if (!options.includes(current)) filterCourse.value = "";
  }

  function applyFilters(data) {
    const kw = (filterKeyword?.value || "").trim().toLowerCase();
    const course = filterCourse?.value || "";

    return data.filter((item) => {
      const haystack = `${item.friendName} ${item.friendEmail || ""} ${item.ownerName} ${item.ownerEmail}`.toLowerCase();
      const matchKw = !kw || haystack.includes(kw);
      const matchCourse = !course || item.courseName === course;
      return matchKw && matchCourse;
    });
  }

  function render() {
    const data = readStore();
    buildCourseFilter(data);
    const filtered = applyFilters(data);

    if (counter) {
      counter.textContent = filtered.length
        ? `${filtered.length}/${data.length} yêu cầu`
        : data.length
        ? `0/${data.length} yêu cầu`
        : "";
    }

    if (!listWrap || !empty) return;

    if (!filtered.length) {
      empty.style.display = "block";
      listWrap.innerHTML = "";
      return;
    }

    empty.style.display = "none";
    listWrap.innerHTML = filtered
      .map((item) => {
        const originalIndex = data.indexOf(item);
        return `
        <div class="list-group-item py-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${item.friendName}</strong>
              <div class="text-muted small">${item.friendEmail || "Chưa có email"}</div>
            </div>
            <div class="text-muted small text-end">
              ${formatDate(item.createdAt)}
              <div>${item.ownerName}</div>
            </div>
          </div>
          <div class="mt-2 small">${item.note || ""}</div>
          <div class="mt-2">
            <span class="badge text-bg-light text-primary">${item.courseName || "Chưa rõ khóa"}</span>
          </div>
          <div class="mt-2 text-muted small">Người gửi: ${item.ownerName} (${item.ownerEmail})</div>
          <div class="d-flex gap-3 mt-2">
            ${
              item.friendEmail
                ? `<a class="btn btn-sm btn-outline-primary" href="mailto:${item.friendEmail}?subject=Ket%20noi%20hoc%20chung" target="_blank">Gửi email</a>`
                : ""
            }
            <button class="btn btn-sm btn-link text-danger px-0" data-index="${originalIndex}">Xóa yêu cầu</button>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // ===== Events =====
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const payload = {
        ownerName: (ownerName?.value || "").trim(),
        ownerEmail: (ownerEmail?.value || "").trim(),
        friendName: (friendName?.value || "").trim(),
        friendEmail: (friendEmail?.value || "").trim(),
        courseName: (courseName?.value || "").trim(),
        note: (note?.value || "").trim(),
        createdAt: Date.now(),
      };

      const data = readStore();
      data.unshift(payload);
      saveStore(data);

      form.reset();
      if (status) status.textContent = "Đã lưu yêu cầu kết nối.";
      render();
    });
  }

  if (listWrap) {
    listWrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-index]");
      if (!btn) return;

      const idx = Number(btn.getAttribute("data-index"));
      const data = readStore();
      data.splice(idx, 1);
      saveStore(data);
      render();
    });
  }

  if (filterKeyword) filterKeyword.addEventListener("input", () => render());
  if (filterCourse) filterCourse.addEventListener("change", () => render());

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Xóa toàn bộ yêu cầu đã lưu?")) {
        localStorage.removeItem(STORAGE_KEY);
        render();
      }
    });
  }

  // ===== Nút Đăng nhập/Đăng xuất =====
  const navAuthBtn = document.getElementById("navAuthBtn");
  if (navAuthBtn) {
    const syncNavAuthBtn = () => {
      const authed = isValidAuth(localStorage.getItem("auth"));
      if (authed) {
        navAuthBtn.textContent = "Đăng xuất";
        navAuthBtn.classList.remove("btn-primary");
        navAuthBtn.classList.add("btn-outline-danger");
      } else {
        navAuthBtn.textContent = "Đăng nhập";
        navAuthBtn.classList.remove("btn-outline-danger");
        navAuthBtn.classList.add("btn-primary");
      }
    };

    syncNavAuthBtn();

    navAuthBtn.addEventListener("click", () => {
      const authed = isValidAuth(localStorage.getItem("auth"));
      if (authed) {
        if (typeof window.clearAuth === "function") window.clearAuth();
        else clearAuthLocal();

        syncNavAuthBtn();
        window.location.href = "home.html";
      } else {
        window.location.href = "login.html";
      }
    });
  }

  render();
});
