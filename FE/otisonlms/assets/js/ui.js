function toast(msg, type="primary") {
  const wrap = document.getElementById("toastWrap");
  if (!wrap) return alert(msg);

  const id = "t" + Date.now();
  wrap.insertAdjacentHTML("beforeend", `
    <div id="${id}" class="toast align-items-center text-bg-${type} border-0 show mb-2" role="alert">
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="document.getElementById('${id}').remove()"></button>
      </div>
    </div>
  `);
  setTimeout(()=>{ const el=document.getElementById(id); if(el) el.remove(); }, 3500);
}

function qs(name){
  return new URLSearchParams(window.location.search).get(name);
}

function role() {
  const r = localStorage.getItem("role");
  return r ? r.trim().toUpperCase() : null;
}

function isTeacherOrAdmin() {
  const r = role();
  return r === "TEACHER" || r === "ADMIN";
}
