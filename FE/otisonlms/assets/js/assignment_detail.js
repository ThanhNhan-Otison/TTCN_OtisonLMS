// // // assets/js/assignment_detail.js
// // document.addEventListener("DOMContentLoaded", () => {
// //   const id = qs("id");       // assignmentId (nếu xem/sửa)
// //   const mode = qs("mode");   // "create" hoặc null

// //   // ===== boxes =====
// //   const infoBox = document.getElementById("infoBox");
// //   const submitBox = document.getElementById("submitBox");
// //   const createBox = document.getElementById("createBox");

// //   // ===== info fields =====
// //   const aTitle = document.getElementById("aTitle");
// //   const aDesc = document.getElementById("aDesc");
// //   const aDue = document.getElementById("aDue");
// //   const aMax = document.getElementById("aMax");
// //   const aCourse = document.getElementById("aCourse");
// //   const aLesson = document.getElementById("aLesson");

// //   // ===== submit fields =====
// //   const answer = document.getElementById("answer");
// //   const fileInput = document.getElementById("file");
// //   const btnSubmit = document.getElementById("btnSubmit");

// //   // ===== create/edit fields =====
// //   const btnCreate = document.getElementById("btnCreate");
// //   const cTitle = document.getElementById("cTitle");
// //   const cDesc = document.getElementById("cDesc");
// //   const cDue = document.getElementById("cDue");
// //   const cMaxScore = document.getElementById("cMaxScore");
// //   const cCourseId = document.getElementById("cCourseId");
// //   const cLessonId = document.getElementById("cLessonId");

// //   // ===== state =====
// //   let currentLessonId = "";   // lessonId của assignment khi edit
// //   let currentCourseId = "";   // courseId suy ra (nếu BE có trả)
// //   let currentAssignment = null;

// //   async function ensureMe() {
// //     if (localStorage.getItem("token") && !localStorage.getItem("role")) {
// //       await tryLoadMe();
// //     }
// //   }

// //   function normalizeRole(r = "") {
// //     return String(r).toUpperCase().replace("ROLE_", "");
// //   }

// //   function isUser() {
// //     const role = normalizeRole(localStorage.getItem("role") || "");
// //     return role === "USER" || role === "STUDENT";
// //   }

// //   function isTeacher() {
// //     const role = normalizeRole(localStorage.getItem("role") || "");
// //     return role === "TEACHER" || role === "ADMIN";
// //   }

// //   function isEditMode() {
// //     return !!id && mode !== "create";
// //   }

// //   function showByRole() {
// //     if (infoBox) infoBox.style.display = "block";
// //     if (submitBox) submitBox.style.display = isUser() ? "block" : "none";
// //     if (createBox) createBox.style.display = isTeacher() ? "block" : "none";
// //   }

// //   function fmtDate(d) {
// //     if (!d) return "-";
// //     const s = String(d);
// //     return s.length >= 10 ? s.slice(0, 10) : s;
// //   }

// //   function resetCreateForm() {
// //     if (cTitle) cTitle.value = "";
// //     if (cDesc) cDesc.value = "";
// //     if (cDue) cDue.value = "";
// //     if (cMaxScore) cMaxScore.value = "";
// //     if (cCourseId) cCourseId.value = "";

// //     if (cLessonId) {
// //       cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
// //       cLessonId.value = "";
// //       cLessonId.disabled = true;
// //     }
// //   }

// //   // ===== dropdown course (Teacher) =====
// //   async function loadCourseDropdown() {
// //     if (!cCourseId) return;
// //     cCourseId.innerHTML = `<option value="">-- Chọn khóa học --</option>`;

// //     const courses = await apiFetch("/courses");
// //     (courses || []).forEach((c) => {
// //       const courseId = c.courseId ?? c.id;
// //       const courseName = c.courseName ?? c.name ?? `Course ${courseId}`;
// //       if (courseId == null) return;

// //       const opt = document.createElement("option");
// //       opt.value = String(courseId);
// //       opt.textContent = courseName;
// //       cCourseId.appendChild(opt);
// //     });
// //   }

// //   async function loadLessonsByCourse(courseId) {
// //     if (!cLessonId) return;

// //     cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
// //     cLessonId.disabled = true;

// //     if (!courseId) return;

// //     const lessons = await apiFetch(`/lessons/course/${courseId}`);
// //     (lessons || []).forEach((l) => {
// //       const lid = l.lessonId ?? l.id;
// //       const name = l.lessonName ?? l.name ?? `Lesson ${lid}`;
// //       if (lid == null) return;

// //       const opt = document.createElement("option");
// //       opt.value = String(lid);
// //       opt.textContent = name;
// //       cLessonId.appendChild(opt);
// //     });

// //     cLessonId.disabled = false;
// //   }

// //   // ===== load assignment detail =====
// //   async function loadAssignmentDetail() {
// //     if (!id) {
// //       // mode=create (chưa có id) -> info placeholder
// //       if (aTitle) aTitle.textContent = "Tạo bài tập mới";
// //       if (aDesc) aDesc.textContent = "";
// //       if (aDue) aDue.textContent = "-";
// //       if (aMax) aMax.textContent = "-";
// //       if (aCourse) aCourse.textContent = "-";
// //       if (aLesson) aLesson.textContent = "-";
// //       return null;
// //     }

// //     const a = await apiFetch(`/assignments/${id}`);
// //     currentAssignment = a;

// //     // Info box
// //     if (aTitle) aTitle.textContent = a.title ?? a.assignmentName ?? "Bài tập";
// //     if (aDesc) aDesc.textContent = a.description ?? a.moTa ?? "";
// //     if (aDue) aDue.textContent = fmtDate(a.deadline ?? a.dueDate); // ưu tiên deadline
// //     if (aMax) aMax.textContent = String(a.maxScore ?? a.diemToiDa ?? "-");

// //     const courseText =
// //       a.courseName ??
// //       a.course?.courseName ??
// //       a.course?.name ??
// //       "-";
// //     const lessonText =
// //       a.lessonName ??
// //       a.lesson?.lessonName ??
// //       a.lesson?.name ??
// //       "-";

// //     if (aCourse) aCourse.textContent = courseText;
// //     if (aLesson) aLesson.textContent = lessonText;

// //     // Lấy lessonId thật (nhiều kiểu BE trả)
// //     const lid =
// //       a.lessonId?.lessonId ??
// //       a.lesson?.lessonId ??
// //       a.lessonId ??
// //       a.lesson?.id ??
// //       "";
// //     currentLessonId = lid ? String(lid) : "";

// //     // Nếu BE có trả courseId
// //     const cid =
// //       a.courseId ??
// //       a.course?.courseId ??
// //       a.course?.id ??
// //       "";
// //     currentCourseId = cid ? String(cid) : "";

// //     // Teacher: fill form để sửa
// //     if (isTeacher()) {
// //       if (cTitle) cTitle.value = a.title ?? "";
// //       if (cDesc) cDesc.value = a.description ?? "";

// //       const rawDue = a.deadline ?? a.dueDate ?? "";
// //       if (cDue && rawDue) cDue.value = String(rawDue).slice(0, 10);

// //       const ms = a.maxScore ?? a.diemToiDa ?? "";
// //       if (cMaxScore && ms !== null && ms !== undefined) cMaxScore.value = ms;

// //       // Với edit: không bắt buộc courseId.
// //       // Nhưng để hiển thị đúng dropdown: nếu có cid thì set + load lessons
// //       if (cCourseId) cCourseId.value = currentCourseId || "";

// //       if (currentCourseId) {
// //         await loadLessonsByCourse(currentCourseId);
// //         if (cLessonId) cLessonId.value = currentLessonId || "";
// //       } else {
// //         // nếu BE không trả courseId: vẫn set được lessonId (nếu dropdown đang có sẵn)
// //         if (cLessonId) {
// //           // ít nhất cho phép teacher nhìn thấy lessonId (dù không load theo course)
// //           // giữ dropdown disabled khi edit theo yêu cầu
// //           cLessonId.innerHTML = `<option value="${currentLessonId}">Lesson ID: ${currentLessonId}</option>`;
// //           cLessonId.value = currentLessonId;
// //           cLessonId.disabled = true;
// //         }
// //         if (cCourseId) {
// //           cCourseId.innerHTML = `<option value="">(Không có courseId từ BE)</option>`;
// //           cCourseId.disabled = true;
// //         }
// //       }

// //       // ✅ Edit mode: teacher không được đổi khóa/bài
// //       if (isEditMode()) {
// //         if (cCourseId) cCourseId.disabled = true;
// //         if (cLessonId) cLessonId.disabled = true;
// //       }
// //     }

// //     return a;
// //   }

// //   // ===== submit (USER) =====
// //   async function submitAssignment() {
// //     if (!id) {
// //       toast("Bài tập chưa có ID để nộp.", "warning");
// //       return;
// //     }

// //     const content = (answer?.value || "").trim();
// //     const file = fileInput?.files?.[0] || null;

// //     if (!content && !file) {
// //       toast("Bạn cần nhập link/nội dung hoặc chọn file để nộp.", "warning");
// //       return;
// //     }

// //     const form = new FormData();
// //     form.append("assignmentId", String(Number(id)));
// //     form.append("content", content);
// //     if (file) form.append("file", file);

// //     await apiFetch("/submissions", { method: "POST", body: form });

// //     toast("Nộp bài thành công", "success");
// //     if (answer) answer.value = "";
// //     if (fileInput) fileInput.value = "";
// //   }

// //   // ===== create/update (TEACHER) =====
// //   function buildPayload() {
// //     const titleVal = cTitle?.value?.trim() || "";
// //     if (!titleVal) throw new Error("Bạn chưa nhập tiêu đề.");

// //     // ✅ lessonId là bắt buộc khi CREATE
// //     // ✅ khi EDIT: lấy currentLessonId (vì dropdown bị khóa)
// //     const lessonIdVal =
// //       (cLessonId?.value ? Number(cLessonId.value) : null) ||
// //       (currentLessonId ? Number(currentLessonId) : null);

// //     if (!lessonIdVal) throw new Error("Bạn chưa chọn bài học.");

// //     return {
// //       title: titleVal,
// //       description: cDesc?.value?.trim() || "",
// //       deadline: cDue?.value || null, // ✅ đúng entity của bạn
// //       // Nếu BE bạn dùng dueDate thì đổi key này thành dueDate
// //       maxScore: (cMaxScore?.value === "" ? null : Number(cMaxScore?.value)),
// //       lessonId: lessonIdVal
// //     };
// //   }

// //   async function createAssignment() {
// //     const payload = buildPayload();
// //     await apiFetch("/assignments", { method: "POST", json: payload });
// //     toast("Tạo bài tập thành công", "success");
// //     resetCreateForm();
// //   }

// //   async function updateAssignment() {
// //     const payload = buildPayload();
// //     // ✅ edit: không đổi lessonId/courseId do dropdown disable, payload vẫn có lessonId hiện tại
// //     await apiFetch(`/assignments/${id}`, { method: "PUT", json: payload });
// //     toast("Cập nhật bài tập thành công", "success");

// //     // (tuỳ bạn) load lại infoBox sau khi update để cập nhật UI
// //     await loadAssignmentDetail();
// //   }

// //   // ===== main =====
// //   (async () => {
// //     try {
// //       await ensureMe();
// //       showByRole();

// //       // Teacher: chuẩn bị dropdown khi CREATE
// //       if (isTeacher()) {
// //         if (!isEditMode()) {
// //           await loadCourseDropdown();

// //           // chọn course -> load lessons
// //           cCourseId?.addEventListener("change", async () => {
// //             const cid = cCourseId.value;
// //             if (!cid) {
// //               if (cLessonId) {
// //                 cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
// //                 cLessonId.value = "";
// //                 cLessonId.disabled = true;
// //               }
// //               return;
// //             }
// //             await loadLessonsByCourse(cid);
// //           });
// //         }
// //       }

// //       // load info + fill form if teacher
// //       await loadAssignmentDetail();

// //       // USER submit
// //       if (btnSubmit) {
// //         btnSubmit.onclick = async () => {
// //           try {
// //             if (!isUser()) return;
// //             await submitAssignment();
// //           } catch (e) {
// //             toast("Nộp bài thất bại: " + (e.message || e), "danger");
// //           }
// //         };
// //       }

// //       // Teacher save
// //       if (btnCreate) {
// //         btnCreate.onclick = async () => {
// //           try {
// //             if (!isTeacher()) return;

// //             if (mode === "create" || !id) {
// //               await createAssignment();
// //             } else {
// //               await updateAssignment();
// //             }
// //           } catch (e) {
// //             toast("Lưu thất bại: " + (e.message || e), "danger");
// //             console.error(e);
// //           }
// //         };
// //       }
// //     } catch (e) {
// //       toast("Lỗi: " + (e.message || e), "danger");
// //       console.error(e);
// //     }
// //   })();

// //   const handleLogout = () => {
// //     clearAuth();
// //     location.href = "login.html";
// //   };
// //   document.getElementById("logout")?.addEventListener("click", handleLogout);
// //   document.getElementById("navLogout")?.addEventListener("click", handleLogout);
// // });

// // assets/js/assignment_detail.js
// document.addEventListener("DOMContentLoaded", () => {
//   const id = qs("id");       // assignmentId (xem/sửa)
//   const mode = qs("mode");   // "create" hoặc null

//   // ===== boxes =====
//   const infoBox = document.getElementById("infoBox");
//   const submitBox = document.getElementById("submitBox");
//   const createBox = document.getElementById("createBox");

//   // ===== info fields =====
//   const aTitle = document.getElementById("aTitle");
//   const aDesc = document.getElementById("aDesc");
//   const aDue = document.getElementById("aDue");
//   const aMax = document.getElementById("aMax");
//   const aCourse = document.getElementById("aCourse");
//   const aLesson = document.getElementById("aLesson");

//   // ===== submit fields =====
//   const answer = document.getElementById("answer");
//   const fileInput = document.getElementById("file");
//   const btnSubmit = document.getElementById("btnSubmit");

//   // ===== create/edit fields =====
//   const btnCreate = document.getElementById("btnCreate");
//   const cTitle = document.getElementById("cTitle");
//   const cDesc = document.getElementById("cDesc");
//   const cDue = document.getElementById("cDue");
//   const cMaxScore = document.getElementById("cMaxScore");
//   const cCourseId = document.getElementById("cCourseId"); // chỉ dùng khi CREATE
//   const cLessonId = document.getElementById("cLessonId"); // dùng CREATE + hiển thị khi EDIT

//   // ===== state =====
//   let currentAssignment = null;
//   let currentLessonId = "";   // lessonId của assignment khi EDIT
//   let currentCourseId = "";   // courseId suy ra từ lessonId (không lấy từ assignment nữa)

//   // cache để giảm call
//   const lessonCache = new Map(); // key: lessonId => lessonObj
//   const courseCache = new Map(); // key: courseId => courseObj

//   // ----------------- helpers -----------------
//   async function ensureMe() {
//     if (localStorage.getItem("token") && !localStorage.getItem("role")) {
//       await tryLoadMe();
//     }
//   }

//   function normalizeRole(r = "") {
//     return String(r).toUpperCase().replace("ROLE_", "");
//   }

//   function isUser() {
//     const role = normalizeRole(localStorage.getItem("role") || "");
//     return role === "USER" || role === "STUDENT";
//   }

//   function isTeacher() {
//     const role = normalizeRole(localStorage.getItem("role") || "");
//     return role === "TEACHER" || role === "ADMIN";
//   }

//   function isEditMode() {
//     return !!id && mode !== "create";
//   }

//   function showByRole() {
//     if (infoBox) infoBox.style.display = "block";
//     if (submitBox) submitBox.style.display = isUser() ? "block" : "none";
//     if (createBox) createBox.style.display = isTeacher() ? "block" : "none";
//   }

//   function fmtDate(d) {
//     if (!d) return "-";
//     const s = String(d);
//     return s.length >= 10 ? s.slice(0, 10) : s;
//   }

//   function safeText(el, txt) {
//     if (!el) return;
//     el.textContent = (txt === null || txt === undefined || txt === "") ? "-" : String(txt);
//   }

//   function resetCreateForm() {
//     if (cTitle) cTitle.value = "";
//     if (cDesc) cDesc.value = "";
//     if (cDue) cDue.value = "";
//     if (cMaxScore) cMaxScore.value = "";
//     if (cCourseId) cCourseId.value = "";

//     if (cLessonId) {
//       cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
//       cLessonId.value = "";
//       cLessonId.disabled = true;
//     }
//   }

//   // ----------------- API fetch helpers (lesson -> course) -----------------
//   async function fetchLessonById(lessonId) {
//     const key = String(lessonId || "").trim();
//     if (!key) return null;
//     if (lessonCache.has(key)) return lessonCache.get(key);

//     // ✅ sửa endpoint nếu BE bạn khác
//     const lesson = await apiFetch(`/lessons/${key}`);
//     lessonCache.set(key, lesson);
//     return lesson;
//   }

//   async function fetchCourseById(courseId) {
//     const key = String(courseId || "").trim();
//     if (!key) return null;
//     if (courseCache.has(key)) return courseCache.get(key);

//     // ✅ sửa endpoint nếu BE bạn khác
//     const course = await apiFetch(`/courses/${key}`);
//     courseCache.set(key, course);
//     return course;
//   }

//   function extractLessonIdFromAssignment(a) {
//     // nhiều kiểu serialize khác nhau
//     const lid =
//       a?.lessonId?.lessonId ??
//       a?.lesson?.lessonId ??
//       a?.lessonId ??
//       a?.lesson?.id ??
//       a?.ma_bh ?? // nếu BE trả field theo DB
//       "";
//     return lid ? String(lid) : "";
//   }

//   function extractCourseIdFromLesson(lesson) {
//     const cid =
//       lesson?.courseId ??
//       lesson?.course?.courseId ??
//       lesson?.course?.id ??
//       lesson?.ma_kh ??
//       "";
//     return cid ? String(cid) : "";
//   }

//   function extractLessonName(lesson) {
//     return (
//       lesson?.lessonName ??
//       lesson?.name ??
//       lesson?.tenBH ??
//       (lesson?.lessonId ? `Lesson ${lesson.lessonId}` : "")
//     );
//   }

//   function extractCourseName(course) {
//     return (
//       course?.courseName ??
//       course?.name ??
//       course?.tenKH ??
//       (course?.courseId ? `Course ${course.courseId}` : "")
//     );
//   }

//   // ----------------- dropdowns for CREATE -----------------
//   async function loadCourseDropdown() {
//     if (!cCourseId) return;
//     cCourseId.innerHTML = `<option value="">-- Chọn khóa học --</option>`;

//     const courses = await apiFetch("/courses");
//     (courses || []).forEach((c) => {
//       const courseId = c.courseId ?? c.id;
//       const courseName = c.courseName ?? c.name ?? `Course ${courseId}`;
//       if (courseId == null) return;

//       const opt = document.createElement("option");
//       opt.value = String(courseId);
//       opt.textContent = courseName;
//       cCourseId.appendChild(opt);
//     });
//   }

//   async function loadLessonsByCourse(courseId) {
//     if (!cLessonId) return;

//     cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
//     cLessonId.disabled = true;
//     if (!courseId) return;

//     const lessons = await apiFetch(`/lessons/course/${courseId}`);
//     (lessons || []).forEach((l) => {
//       const lid = l.lessonId ?? l.id;
//       const name = l.lessonName ?? l.name ?? `Lesson ${lid}`;
//       if (lid == null) return;

//       const opt = document.createElement("option");
//       opt.value = String(lid);
//       opt.textContent = name;
//       cLessonId.appendChild(opt);
//     });

//     cLessonId.disabled = false;
//   }

//   // ----------------- load assignment detail + info -----------------
//   async function fillInfoBoxFromLessonChain(lessonId) {
//     // Suy ra courseName từ lessonId
//     safeText(aCourse, "-");
//     safeText(aLesson, "-");

//     if (!lessonId) return;

//     try {
//       const lesson = await fetchLessonById(lessonId);
//       if (lesson) {
//         const lessonName = extractLessonName(lesson);
//         safeText(aLesson, lessonName || `Lesson ID: ${lessonId}`);

//         const cid = extractCourseIdFromLesson(lesson);
//         currentCourseId = cid || "";
//         if (cid) {
//           const course = await fetchCourseById(cid);
//           const courseName = extractCourseName(course);
//           safeText(aCourse, courseName || `Course ID: ${cid}`);
//         } else {
//           // không có courseId trong lesson
//           safeText(aCourse, "-");
//         }
//       } else {
//         safeText(aLesson, `Lesson ID: ${lessonId}`);
//       }
//     } catch (e) {
//       // không chặn UI
//       safeText(aLesson, `Lesson ID: ${lessonId}`);
//       safeText(aCourse, "-");
//     }
//   }

//   async function loadAssignmentDetail() {
//     if (!id) {
//       // mode=create chưa có id
//       if (aTitle) aTitle.textContent = "Tạo bài tập mới";
//       safeText(aDesc, "");
//       safeText(aDue, "-");
//       safeText(aMax, "-");
//       safeText(aCourse, "-");
//       safeText(aLesson, "-");
//       return null;
//     }

//     const a = await apiFetch(`/assignments/${id}`);
//     currentAssignment = a;

//     // Info basic
//     if (aTitle) aTitle.textContent = a.title ?? a.assignmentName ?? "Bài tập";
//     if (aDesc) aDesc.textContent = a.description ?? a.moTa ?? "";
//     safeText(aDue, fmtDate(a.deadline ?? a.dueDate));
//     safeText(aMax, a.maxScore ?? a.diemToiDa ?? "-");

//     // ✅ lấy lessonId từ assignment rồi suy courseName từ lessonId
//     currentLessonId = extractLessonIdFromAssignment(a);
//     await fillInfoBoxFromLessonChain(currentLessonId);

//     // Teacher fill form edit
//     if (isTeacher()) {
//       if (cTitle) cTitle.value = a.title ?? "";
//       if (cDesc) cDesc.value = a.description ?? "";
//       const rawDue = a.deadline ?? a.dueDate ?? "";
//       if (cDue && rawDue) cDue.value = String(rawDue).slice(0, 10);

//       const ms = a.maxScore ?? a.diemToiDa ?? "";
//       if (cMaxScore && ms !== null && ms !== undefined) cMaxScore.value = ms;

//       // ✅ EDIT: không cho đổi course/lesson
//       if (isEditMode()) {
//         // course dropdown: disable + chỉ hiển thị tên (suy từ lesson)
//         if (cCourseId) {
//           cCourseId.innerHTML = `<option value="">(Khoá học: xem ở info phía trên)</option>`;
//           cCourseId.value = "";
//           cCourseId.disabled = true;
//         }

//         // lesson dropdown: disable + show 1 option lessonId hiện tại
//         if (cLessonId) {
//           cLessonId.innerHTML = currentLessonId
//             ? `<option value="${currentLessonId}">Lesson ID: ${currentLessonId}</option>`
//             : `<option value="">(Không có lessonId)</option>`;
//           cLessonId.value = currentLessonId || "";
//           cLessonId.disabled = true;
//         }
//       } else {
//         // (hiếm) nếu teacher vào mà không edit mode thì vẫn cho chọn
//       }
//     }

//     return a;
//   }

//   // ----------------- submit (USER) -----------------
//   async function submitAssignment() {
//     if (!id) {
//       toast("Bài tập chưa có ID để nộp.", "warning");
//       return;
//     }

//     const content = (answer?.value || "").trim();
//     const file = fileInput?.files?.[0] || null;

//     if (!content && !file) {
//       toast("Bạn cần nhập link/nội dung hoặc chọn file để nộp.", "warning");
//       return;
//     }

//     const form = new FormData();
//     form.append("assignmentId", String(Number(id)));
//     form.append("content", content);
//     if (file) form.append("file", file);

//     await apiFetch("/submissions", { method: "POST", body: form });

//     toast("Nộp bài thành công", "success");
//     if (answer) answer.value = "";
//     if (fileInput) fileInput.value = "";
//   }

//   // ----------------- create/update (TEACHER) -----------------
//   function buildPayload() {
//     const titleVal = cTitle?.value?.trim() || "";
//     if (!titleVal) throw new Error("Bạn chưa nhập tiêu đề.");

//     // ✅ assignment request KHÔNG cần courseId
//     // lessonId: CREATE lấy từ dropdown, EDIT lấy currentLessonId
//     const lessonIdVal = isEditMode()
//       ? (currentLessonId ? Number(currentLessonId) : null)
//       : (cLessonId?.value ? Number(cLessonId.value) : null);

//     if (!lessonIdVal) throw new Error("Bạn chưa chọn bài học.");

//     return {
//       title: titleVal,
//       description: cDesc?.value?.trim() || "",
//       deadline: cDue?.value || null,           // đúng entity của bạn
//       maxScore: (cMaxScore?.value === "" ? null : Number(cMaxScore?.value)),
//       lessonId: lessonIdVal                    // BE của bạn đang map ManyToOne Lesson
//     };
//   }

//   async function createAssignment() {
//     const payload = buildPayload();
//     await apiFetch("/assignments", { method: "POST", json: payload });
//     toast("Tạo bài tập thành công", "success");
//     resetCreateForm();
//   }

//   async function updateAssignment() {
//     const payload = buildPayload();
//     await apiFetch(`/assignments/${id}`, { method: "PUT", json: payload });
//     toast("Cập nhật bài tập thành công", "success");

//     // refresh info
//     await loadAssignmentDetail();
//   }

//   // ----------------- main -----------------
//   (async () => {
//     try {
//       await ensureMe();
//       showByRole();

//       // Teacher + CREATE mode: cần dropdown course/lesson để chọn lessonId
//       if (isTeacher() && !isEditMode()) {
//         await loadCourseDropdown();

//         cCourseId?.addEventListener("change", async () => {
//           const cid = cCourseId.value;
//           if (!cid) {
//             if (cLessonId) {
//               cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
//               cLessonId.value = "";
//               cLessonId.disabled = true;
//             }
//             return;
//           }
//           await loadLessonsByCourse(cid);
//         });
//       }

//       // load assignment info (suy courseName từ lessonId)
//       await loadAssignmentDetail();

//       // USER submit
//       if (btnSubmit) {
//         btnSubmit.onclick = async () => {
//           try {
//             if (!isUser()) return;
//             await submitAssignment();
//           } catch (e) {
//             toast("Nộp bài thất bại: " + (e.message || e), "danger");
//           }
//         };
//       }

//       // Teacher save
//       if (btnCreate) {
//         btnCreate.onclick = async () => {
//           try {
//             if (!isTeacher()) return;

//             if (mode === "create" || !id) {
//               await createAssignment();
//             } else {
//               await updateAssignment();
//             }
//           } catch (e) {
//             toast("Lưu thất bại: " + (e.message || e), "danger");
//             console.error(e);
//           }
//         };
//       }
//     } catch (e) {
//       toast("Lỗi: " + (e.message || e), "danger");
//       console.error(e);
//     }
//   })();

//   const handleLogout = () => {
//     clearAuth();
//     location.href = "login.html";
//   };
//   document.getElementById("logout")?.addEventListener("click", handleLogout);
//   document.getElementById("navLogout")?.addEventListener("click", handleLogout);
// });

// assets/js/assignment_detail.js
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const id = qs("id");            // assignmentId
  const mode = qs("mode");        // "create" | null
  const isEdit = () => !!id && mode !== "create";

  // ===== DOM =====
  const infoBox = $("infoBox");
  const submitBox = $("submitBox");
  const createBox = $("createBox");

  const aTitle = $("aTitle");
  const aDesc = $("aDesc");
  const aDue = $("aDue");
  const aMax = $("aMax");
  const aCourse = $("aCourse");
  const aLesson = $("aLesson");

  const answer = $("answer");
  const fileInput = $("file");
  const btnSubmit = $("btnSubmit");

  const btnCreate = $("btnCreate");
  const cTitle = $("cTitle");
  const cDesc = $("cDesc");
  const cDue = $("cDue");
  const cMaxScore = $("cMaxScore");
  const cCourseId = $("cCourseId");   // chỉ dùng khi CREATE
  const cLessonId = $("cLessonId");   // CREATE + hiển thị khi EDIT

  // ===== cache =====
  const lessonCache = new Map();
  const courseCache = new Map();

  // ===== helpers =====
  const roleUpper = () =>
    String(localStorage.getItem("role") || "").toUpperCase().replace("ROLE_", "");

  const isUser = () => ["USER", "STUDENT"].includes(roleUpper());
  const isTeacher = () => ["TEACHER", "ADMIN"].includes(roleUpper());

  const show = (el, yes) => el && (el.style.display = yes ? "block" : "none");
  const setText = (el, v) => el && (el.textContent = (v === null || v === undefined || v === "" ? "-" : String(v)));

  const fmtDate = (d) => {
    if (!d) return "-";
    const s = String(d);
    return s.length >= 10 ? s.slice(0, 10) : s;
  };

  async function ensureMe() {
    if (localStorage.getItem("token") && !localStorage.getItem("role")) {
      await tryLoadMe();
    }
  }

  // ===== extractors =====
  function getLessonIdFromAssignment(a) {
    return String(
      a?.lessonId?.lessonId ??
      a?.lesson?.lessonId ??
      a?.lessonId ??
      a?.lesson?.id ??
      ""
    );
  }

  function getCourseIdFromLesson(lesson) {
    return String(
      lesson?.courseId ??
      lesson?.course?.courseId ??
      lesson?.course?.id ??
      ""
    );
  }

  function getLessonName(lesson, fallbackId) {
    return (
      lesson?.lessonName ??
      lesson?.name ??
      (fallbackId ? `Lesson ID: ${fallbackId}` : "-")
    );
  }

  function getCourseName(course, fallbackId) {
    return (
      course?.courseName ??
      course?.name ??
      (fallbackId ? `Course ID: ${fallbackId}` : "-")
    );
  }

  // ===== API helpers =====
  async function fetchLesson(lessonId) {
    const key = String(lessonId || "").trim();
    if (!key) return null;
    if (lessonCache.has(key)) return lessonCache.get(key);

    // ⚠️ nếu BE bạn không có /lessons/{id} thì sửa endpoint ở đây
    const lesson = await apiFetch(`/lessons/${key}`);
    lessonCache.set(key, lesson);
    return lesson;
  }

  async function fetchCourse(courseId) {
    const key = String(courseId || "").trim();
    if (!key) return null;
    if (courseCache.has(key)) return courseCache.get(key);

    // /courses/{id} thường có
    const course = await apiFetch(`/courses/${key}`);
    courseCache.set(key, course);
    return course;
  }

  // ===== UI: show boxes by role =====
  function showByRole() {
    show(infoBox, true);
    show(submitBox, isUser());
    show(createBox, isTeacher());
  }

  // ===== CREATE form helpers =====
  function resetCreateForm() {
    if (cTitle) cTitle.value = "";
    if (cDesc) cDesc.value = "";
    if (cDue) cDue.value = "";
    if (cMaxScore) cMaxScore.value = "";
    if (cCourseId) cCourseId.value = "";

    if (cLessonId) {
      cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
      cLessonId.value = "";
      cLessonId.disabled = true;
    }
  }

  async function loadCourseDropdown() {
    if (!cCourseId) return;
    cCourseId.innerHTML = `<option value="">-- Chọn khóa học --</option>`;

    const courses = await apiFetch("/courses");
    (courses || []).forEach((c) => {
      const cid = c.courseId ?? c.id;
      const name = c.courseName ?? c.name ?? `Course ${cid}`;
      if (cid == null) return;
      const opt = document.createElement("option");
      opt.value = String(cid);
      opt.textContent = name;
      cCourseId.appendChild(opt);
    });
  }

  async function loadLessonsByCourse(courseId) {
    if (!cLessonId) return;

    cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
    cLessonId.disabled = true;
    if (!courseId) return;

    const lessons = await apiFetch(`/lessons/course/${courseId}`);
    (lessons || []).forEach((l) => {
      const lid = l.lessonId ?? l.id;
      const name = l.lessonName ?? l.name ?? `Lesson ${lid}`;
      if (lid == null) return;
      const opt = document.createElement("option");
      opt.value = String(lid);
      opt.textContent = name;
      cLessonId.appendChild(opt);
    });

    cLessonId.disabled = false;
  }

  // ===== load info =====
  async function fillCourseLessonNameByLessonId(lessonId) {
    setText(aLesson, "-");
    setText(aCourse, "-");
    if (!lessonId) return;

    try {
      const lesson = await fetchLesson(lessonId);
      setText(aLesson, getLessonName(lesson, lessonId));

      const cid = getCourseIdFromLesson(lesson);
      if (cid) {
        const course = await fetchCourse(cid);
        setText(aCourse, getCourseName(course, cid));
      }
    } catch {
      setText(aLesson, `Lesson ID: ${lessonId}`);
      setText(aCourse, "-");
    }
  }

  async function loadAssignmentDetail() {
    if (!id) {
      setText(aTitle, "Tạo bài tập mới");
      setText(aDesc, "");
      setText(aDue, "-");
      setText(aMax, "-");
      setText(aCourse, "-");
      setText(aLesson, "-");
      return { lessonId: "" };
    }

    const a = await apiFetch(`/assignments/${id}`);

    // info box
    setText(aTitle, a.title ?? a.assignmentName ?? "Bài tập");
    setText(aDesc, a.description ?? a.moTa ?? "");
    setText(aDue, fmtDate(a.deadline ?? a.dueDate));
    setText(aMax, a.maxScore ?? a.diemToiDa ?? "-");

    const lessonId = getLessonIdFromAssignment(a);
    await fillCourseLessonNameByLessonId(lessonId);

    // teacher fill edit form
    if (isTeacher()) {
      if (cTitle) cTitle.value = a.title ?? "";
      if (cDesc) cDesc.value = a.description ?? "";
      const rawDue = a.deadline ?? a.dueDate ?? "";
      if (cDue && rawDue) cDue.value = String(rawDue).slice(0, 10);

      const ms = a.maxScore ?? a.diemToiDa ?? "";
      if (cMaxScore && ms !== null && ms !== undefined) cMaxScore.value = ms;

      if (isEdit()) {
        // edit: khóa course/lesson
        if (cCourseId) {
          cCourseId.innerHTML = `<option value="">(Khoá học: xem ở thông tin phía trên)</option>`;
          cCourseId.disabled = true;
        }
        if (cLessonId) {
          cLessonId.innerHTML = lessonId
            ? `<option value="${lessonId}">Lesson ID: ${lessonId}</option>`
            : `<option value="">(Không có lessonId)</option>`;
          cLessonId.value = lessonId || "";
          cLessonId.disabled = true;
        }
      }
    }

    return { lessonId };
  }

  // ===== submit =====
  async function submitAssignment() {
    if (!id) throw new Error("Bài tập chưa có ID để nộp.");

    const content = (answer?.value || "").trim();
    const file = fileInput?.files?.[0] || null;

    if (!content && !file) throw new Error("Bạn cần nhập link/nội dung hoặc chọn file để nộp.");

    const form = new FormData();
    form.append("assignmentId", String(Number(id)));
    form.append("content", content);
    if (file) form.append("file", file);

    await apiFetch("/submissions", { method: "POST", body: form });

    toast?.("Nộp bài thành công", "success");
    if (answer) answer.value = "";
    if (fileInput) fileInput.value = "";
  }

  // ===== create/update =====
  function buildPayload(editLessonId) {
    const titleVal = cTitle?.value?.trim() || "";
    if (!titleVal) throw new Error("Bạn chưa nhập tiêu đề.");

    const lessonIdVal = isEdit()
      ? (editLessonId ? Number(editLessonId) : null)
      : (cLessonId?.value ? Number(cLessonId.value) : null);

    if (!lessonIdVal) throw new Error("Bạn chưa chọn bài học.");

    return {
      title: titleVal,
      description: cDesc?.value?.trim() || "",
      deadline: cDue?.value || null,
      maxScore: (cMaxScore?.value === "" ? null : Number(cMaxScore?.value)),
      lessonId: lessonIdVal,
    };
  }

  async function saveAssignment(editLessonId) {
    const payload = buildPayload(editLessonId);

    if (!isEdit()) {
      await apiFetch("/assignments", { method: "POST", json: payload });
      toast?.("Tạo bài tập thành công", "success");
      resetCreateForm();
      return;
    }

    await apiFetch(`/assignments/${id}`, { method: "PUT", json: payload });
    toast?.("Cập nhật bài tập thành công", "success");
    await loadAssignmentDetail();
  }

  // ===== main =====
  (async () => {
    try {
      await ensureMe();
      showByRole();

      // teacher + create mode: dropdown course/lesson
      if (isTeacher() && !isEdit()) {
        await loadCourseDropdown();
        cCourseId?.addEventListener("change", async () => {
          const cid = cCourseId.value;
          if (!cid) {
            if (cLessonId) {
              cLessonId.innerHTML = `<option value="">-- Chọn bài học --</option>`;
              cLessonId.value = "";
              cLessonId.disabled = true;
            }
            return;
          }
          await loadLessonsByCourse(cid);
        });
      }

      const { lessonId } = await loadAssignmentDetail();

      btnSubmit?.addEventListener("click", async () => {
        if (!isUser()) return;
        try { await submitAssignment(); }
        catch (e) { toast?.("Nộp bài thất bại: " + (e.message || e), "danger"); }
      });

      btnCreate?.addEventListener("click", async () => {
        if (!isTeacher()) return;
        try { await saveAssignment(lessonId); }
        catch (e) { toast?.("Lưu thất bại: " + (e.message || e), "danger"); }
      });
    } catch (e) {
      toast?.("Lỗi: " + (e.message || e), "danger");
      console.error(e);
    }
  })();

  // logout
  const handleLogout = () => {
    clearAuth();
    location.href = "login.html";
  };
  $("logout")?.addEventListener("click", handleLogout);
  $("navLogout")?.addEventListener("click", handleLogout);
});
