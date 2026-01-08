// assets/js/lesson.js
document.addEventListener("DOMContentLoaded", () => {
  const lessonId = qs("id");

  const $ = (id) => document.getElementById(id);
  const setText = (id, txt) => { const el = $(id); if (el) el.textContent = txt ?? ""; };

  /* ================= ELEMENTS ================= */
  const videoEl = $("video");        // <video>
  const frameEl = $("videoFrame");   // <iframe>
  const msgEl   = $("videoMsg");     // message video

  const docLink = $("docLink");      // <a>
  const docMsg  = $("docMsg");       // message file

  /* ================= HELPERS ================= */
  const isHttp = (u) => typeof u === "string" && /^https?:\/\//i.test(u);
  const isWinPath = (u) => typeof u === "string" && /^[a-zA-Z]:\\/.test(u);

  const toYoutubeEmbed = (url) => {
    try {
      if (!url) return "";
      if (url.includes("youtube.com/watch")) {
        const u = new URL(url);
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
      if (url.includes("youtube.com/embed/")) return url;
      return "";
    } catch {
      return "";
    }
  };

  /* ================= VIDEO UI ================= */
  const resetVideoUI = () => {
    videoEl?.pause?.();
    videoEl?.removeAttribute("src");
    videoEl?.classList.add("d-none");

    frameEl?.removeAttribute("src");
    frameEl?.classList.add("d-none");

    if (msgEl) {
      msgEl.textContent = "";
      msgEl.classList.add("d-none");
    }
  };

  const showVideoMsg = (t) => {
    if (!msgEl) return;
    msgEl.textContent = t;
    msgEl.classList.remove("d-none");
  };

  const showVideo = (src) => {
    if (!videoEl) return;
    videoEl.src = src;
    videoEl.classList.remove("d-none");
  };

  const showFrame = (src) => {
    if (!frameEl) return;
    frameEl.src = src;
    frameEl.classList.remove("d-none");
  };

  const resolveVideoUrl = (raw) => {
    if (!raw) return { type: "none" };

    if (isWinPath(raw)) {
      return { type: "msg", text: "Video là đường dẫn máy tính (C:\\...), không xem được trên web." };
    }

    if (isHttp(raw) && (raw.includes("youtube.com") || raw.includes("youtu.be"))) {
      const embed = toYoutubeEmbed(raw);
      return embed
        ? { type: "iframe", src: embed }
        : { type: "msg", text: "Link YouTube không hợp lệ." };
    }

    if (isHttp(raw) && raw.toLowerCase().endsWith(".mp4")) {
      return { type: "video", src: raw };
    }

    if (raw.startsWith("/")) {
      return { type: "video", src: `http://localhost:8080${raw}` };
    }

    return { type: "msg", text: "Định dạng video không hỗ trợ: " + raw };
  };

  /* ================= MAIN ================= */
  (async () => {
    try {
      const l = await apiFetch(`/lessons/${lessonId}`);

      /* ===== TEXT ===== */
      setText("lessonName", l.lessonName ?? l.title ?? l.ten ?? "Bài học");
      setText("content", l.content ?? l.noiDung ?? "");

      /* ===== VIDEO ===== */
      resetVideoUI();
      const rawVideo = l.videoUrl ?? l.video_url ?? l.videoURL ?? l.video ?? "";
      const r = resolveVideoUrl(rawVideo);

      if (r.type === "none") showVideoMsg("Bài học chưa có video.");
      if (r.type === "msg") showVideoMsg(r.text);
      if (r.type === "iframe") showFrame(r.src);
      if (r.type === "video") showVideo(r.src);

      /* ===== FILE ===== */
      if (docLink) docLink.classList.add("d-none");
      if (docMsg)  docMsg.classList.add("d-none");

      const rawFile = l.fileUrl ?? l.file_url ?? "";

      if (!rawFile) {
        if (docMsg) {
          docMsg.textContent = "Bài học không có tài liệu đính kèm.";
          docMsg.classList.remove("d-none");
        }
      } else {
        const href = rawFile.startsWith("/")
          ? `http://localhost:8080${rawFile}`
          : rawFile;

        if (docLink) {
          docLink.href = href;
          docLink.classList.remove("d-none");
        }
      }

    } catch (e) {
      toast("Không tải được bài học: " + (e.message || e), "danger");
    }
  })();

  /* ===== LOGOUT ===== */
  const handleLogout = () => { clearAuth(); location.href = "login.html"; };
  $("logout")?.addEventListener("click", handleLogout);
  $("navLogout")?.addEventListener("click", handleLogout);
});
