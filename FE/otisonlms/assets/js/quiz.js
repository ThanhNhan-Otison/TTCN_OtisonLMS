// assets/js/quiz.js
// All logic from quiz.html inline script, wrapped in DOMContentLoaded

document.addEventListener('DOMContentLoaded', function() {
  let current = [];

  document.getElementById("btnLoad").onclick = async ()=>{
    const id = document.getElementById("lessonId").value;
    if(!id) return toast("Nhập lessonId", "warning");

    try{
      // ví dụ endpoint bạn sẽ làm: GET /quizzes/lesson/{lessonId}
      const quiz = await apiFetch(`/quizzes/lesson/${id}`);
      current = quiz || [];
      renderQuiz();
    }catch(e){
      toast("Không tải quiz: " + e.message, "danger");
    }
  };

  function renderQuiz(){
    const box = document.getElementById("quizBox");
    box.innerHTML = "";
    if(!current || current.length === 0){
      box.innerHTML = `<div class="small-muted">Chưa có câu hỏi.</div>`;
      document.getElementById("btnSubmit").style.display = "none";
      return;
    }

    current.forEach((q,idx)=>{
      box.insertAdjacentHTML("beforeend", `
        <div class="border rounded-3 p-3 mb-2 bg-white">
          <div class="fw-semibold">${idx+1}. ${q.question ?? q.content}</div>
          ${(q.options||[]).map((op,i)=>`
            <div class="form-check mt-2">
              <input class="form-check-input" type="radio" name="q${idx}" value="${i}">
              <label class="form-check-label">${op}</label>
            </div>
          `).join("")}
        </div>
      `);
    });

    document.getElementById("btnSubmit").style.display = "inline-block";
  }

  document.getElementById("btnSubmit").onclick = async ()=>{
    try{
      // ví dụ endpoint bạn sẽ làm: POST /quizzes/submit
      const answers = current.map((q,idx)=>{
        const chosen = document.querySelector(`input[name="q${idx}"]:checked`);
        return { questionId: q.id, choiceIndex: chosen ? parseInt(chosen.value,10) : null };
      });
      const result = await apiFetch(`/quizzes/submit`, { method:"POST", json: { answers }});
      toast("Nộp quiz xong. Kết quả: " + (result?.score ?? "OK"), "success");
    }catch(e){
      toast("Nộp quiz lỗi: " + e.message, "danger");
    }
  };

  document.getElementById("logout").onclick = ()=>{ clearAuth(); location.href="login.html"; };
});
