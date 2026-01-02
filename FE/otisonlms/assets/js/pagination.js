function paginate(array, page=1, pageSize=6){
  const total = array.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page), totalPages);
  const start = (p - 1) * pageSize;
  return {
    page: p,
    pageSize,
    total,
    totalPages,
    items: array.slice(start, start + pageSize),
  };
}

function renderPager(containerId, meta, onPage){
  const el = document.getElementById(containerId);
  if(!el) return;

  let html = `<nav><ul class="pagination pagination-sm mb-0">`;

  const disabledPrev = meta.page <= 1 ? "disabled" : "";
  const disabledNext = meta.page >= meta.totalPages ? "disabled" : "";

  html += `<li class="page-item ${disabledPrev}">
    <a class="page-link" href="#" data-p="${meta.page-1}">«</a>
  </li>`;

  for(let i=1;i<=meta.totalPages;i++){
    const active = i === meta.page ? "active" : "";
    html += `<li class="page-item ${active}">
      <a class="page-link" href="#" data-p="${i}">${i}</a>
    </li>`;
  }

  html += `<li class="page-item ${disabledNext}">
    <a class="page-link" href="#" data-p="${meta.page+1}">»</a>
  </li>`;

  html += `</ul></nav>`;
  el.innerHTML = html;

  el.querySelectorAll("a.page-link").forEach(a=>{
    a.addEventListener("click",(e)=>{
      e.preventDefault();
      const p = parseInt(a.dataset.p,10);
      if(!isNaN(p)) onPage(p);
    });
  });
}
