// assets/js/connect_anon.js
// All logic from connect_anon.html inline script, wrapped in DOMContentLoaded

document.addEventListener('DOMContentLoaded', function() {
    // Populate course dropdown from API
    async function populateCourseDropdown() {
      const select = document.getElementById("anonCourse");
      if (!select) return;
      try {
        const courses = await apiFetch("/courses");
        select.innerHTML = '<option value="">Chọn khóa học</option>' +
          courses.map(c => `<option value="${c.courseName || c.name}">${c.courseName || c.name}</option>`).join("");
      } catch (e) {
        select.innerHTML = '<option value="">Không tải được khóa học</option>';
      }
    }
    populateCourseDropdown();
  const STORAGE_KEY = "anonConnections";
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

  function readStore(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveStore(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

  function buildCourseFilter(data){
    const current = filterCourse.value;
    const options = ["", ...new Set(data.map(item => item.course).filter(Boolean))];
    filterCourse.innerHTML = options.map(value => {
      const label = value || "Tất cả khóa học";
      const selected = value === current ? "selected" : "";
      return `<option value="${value}">${label}</option>`;
    }).join("");
    if(!options.includes(current)) filterCourse.value = "";
  }

  function applyFilters(data){
    const kw = filterKeyword.value.trim().toLowerCase();
    const course = filterCourse.value;
    return data.filter(item => {
      const haystack = `${item.email} ${item.note || ""}`.toLowerCase();
      const matchKw = !kw || haystack.includes(kw);
      const matchCourse = !course || item.course === course;
      return matchKw && matchCourse;
    });
  }

  function render(){
    const data = readStore();
    buildCourseFilter(data);
    const filtered = applyFilters(data);
    counter.textContent = filtered.length ? `${filtered.length}/${data.length} nhu cầu` : data.length ? `0/${data.length} nhu cầu` : "";

    if(!filtered.length){
      empty.style.display = "block";
      list.innerHTML = "";
      return;
    }

    empty.style.display = "none";
    list.innerHTML = filtered.map(item => {
      const idx = data.indexOf(item);
      const mailto = `mailto:${encodeURIComponent(item.email)}?subject=Hoc%20chung%20${encodeURIComponent(item.course)}&body=Chao%20ban%2C%20minh%20cung%20muon%20hoc%20${encodeURIComponent(item.course)}`;
      return `
        <div class="list-group-item py-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="course-chip">${item.course}</span>
              <div class="text-muted small mt-1">${new Date(item.createdAt).toLocaleString("vi-VN",{hour12:false})}</div>
            </div>
            <a class="btn btn-sm btn-outline-primary" href="${mailto}">Liên hệ</a>
          </div>
          <div class="mt-2 fw-semibold">${item.email}</div>
          <div class="mt-1 text-muted small">${item.note || "Không có ghi chú"}</div>
          <button class="btn btn-sm btn-link text-danger px-0 mt-2" data-index="${idx}">Xóa</button>
        </div>
      `;
    }).join("");
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }
    const payload = {
      course: courseInput.value.trim(),
      email: emailInput.value.trim(),
      note: noteInput.value.trim(),
      createdAt: Date.now()
    };
    const data = readStore();
    data.unshift(payload);
    saveStore(data);
    form.reset();
    status.textContent = "Đã lưu nhu cầu ghép nhóm.";
    render();
  });

  list.addEventListener("click", e => {
    if(e.target.matches("button[data-index]")){
      const idx = Number(e.target.getAttribute("data-index"));
      const data = readStore();
      data.splice(idx, 1);
      saveStore(data);
      render();
    }
  });

  clearBtn.addEventListener("click", ()=>{
    if(confirm("Xóa toàn bộ nhu cầu đã lưu?")){
      localStorage.removeItem(STORAGE_KEY);
      render();
    }
  });

  filterKeyword.addEventListener("input", render);
  filterCourse.addEventListener("change", render);

  render();
});
