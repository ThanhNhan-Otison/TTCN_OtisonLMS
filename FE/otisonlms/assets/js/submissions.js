// assets/js/submissions.js
// All logic from submissions.html inline script, wrapped in DOMContentLoaded

document.addEventListener('DOMContentLoaded', function() {
  const assignmentId = qs("assignmentId");

  (async ()=>{
    try {
      let data = [];
      if (assignmentId) {
        document.getElementById("modeTag").innerText = "Theo bài tập #" + assignmentId;
        data = await apiFetch(`/submissions/assignment/${assignmentId}`);
      } else {
        document.getElementById("modeTag").innerText = "Của tôi";
        data = await apiFetch(`/submissions/me`);
      }

      const ul = document.getElementById("list");
      ul.innerHTML = "";

      if (!data || data.length === 0) {
        ul.innerHTML = `<li class="list-group-item">Chưa có bài nộp.</li>`;
        return;
      }

      data.forEach(s=>{
        ul.insertAdjacentHTML("beforeend", `
          <li class="list-group-item">
            <div class="fw-semibold">Submission #${s.submissionId ?? s.id}</div>
            <div class="small-muted">Nội dung: ${(s.content ?? s.link ?? "").slice(0,120)}</div>
            <div class="small-muted">Điểm: ${s.score ?? "-"}</div>
          </li>
        `);
      });
    } catch (e) {
      toast("Không tải được bài nộp: " + e.message, "danger");
    }
  })();

  const handleLogout = ()=>{ clearAuth(); location.href="login.html"; };
  document.getElementById("logout").onclick = handleLogout;
  document.getElementById("navLogout").onclick = handleLogout;
});
