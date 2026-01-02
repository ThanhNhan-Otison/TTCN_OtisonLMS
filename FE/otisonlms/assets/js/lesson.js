// assets/js/lesson.js

document.addEventListener("DOMContentLoaded", function () {
  const lessonId = qs("id");

  function toYoutubeEmbed(url) {
    try {
      if (!url) return "";
      if (url.includes("youtube.com/watch")) {
        const u = new URL(url);
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1].split("?")[0];
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
      if (url.includes("youtube.com/embed/")) return url;
      return "";
    } catch {
      return "";
    }
  }

  function isHttpUrl(u) {
    return typeof u === "string" && (u.startsWith("http://") || u.startsWith("https://"));
  }

  function isWindowsPath(u) {
    return typeof u === "string" && /^[a-zA-Z]:\\/.test(u);
  }

  (async () => {
    try {
      const l = await apiFetch(`/lessons/${lessonId}`);

      document.getElementById("lessonName").innerText =
        l.lessonName ?? l.title ?? l.ten ?? "Bài học";
      document.getElementById("content").innerText =
        l.content ?? l.noiDung ?? "";

      // hỗ trợ nhiều tên field backend có thể trả
      const rawVideo = l.videoUrl ?? l.video_url ?? l.videoURL ?? l.video ?? "";

      const videoWrap = document.getElementById("videoWrap"); // container
      const videoEl = document.getElementById("video");       // <video>
      const iframeEl = document.getElementById("videoFrame"); // <iframe>
      const videoMsg = document.getElementById("videoMsg");   // <div> thông báo

      // reset UI
      if (videoEl) { videoEl.pause?.(); videoEl.src = ""; videoEl.classList.add("d-none"); }
      if (iframeEl) { iframeEl.src = ""; iframeEl.classList.add("d-none"); }
      if (videoMsg) { videoMsg.textContent = ""; videoMsg.classList.add("d-none"); }

      if (!rawVideo) {
        if (videoMsg) { videoMsg.textContent = "Bài học chưa có video."; videoMsg.classList.remove("d-none"); }
        return;
      }

      // Windows path -> báo lỗi
      if (isWindowsPath(rawVideo)) {
        if (videoMsg) {
          videoMsg.textContent = "Video đang là đường dẫn máy tính (C:\\...), không xem được trên web. Hãy upload lên server hoặc dùng link https.";
          videoMsg.classList.remove("d-none");
        }
        return;
      }

      // YouTube -> iframe
      if (isHttpUrl(rawVideo) && (rawVideo.includes("youtube.com") || rawVideo.includes("youtu.be"))) {
        const embed = toYoutubeEmbed(rawVideo);
        if (!embed) {
          if (videoMsg) { videoMsg.textContent = "Link YouTube không hợp lệ."; videoMsg.classList.remove("d-none"); }
          return;
        }
        if (iframeEl) {
          iframeEl.src = embed;
          iframeEl.classList.remove("d-none");
        }
        return;
      }

      // Nếu là URL http(s) mp4 trực tiếp
      if (isHttpUrl(rawVideo) && rawVideo.toLowerCase().endsWith(".mp4")) {
        if (videoEl) {
          videoEl.src = rawVideo;
          videoEl.classList.remove("d-none");
        }
        return;
      }

      // Nếu backend trả dạng "/videos/xxx.mp4"
      if (typeof rawVideo === "string" && rawVideo.startsWith("/")) {
        const url = `http://localhost:8080${rawVideo}`;
        if (videoEl) {
          videoEl.src = url;
          videoEl.classList.remove("d-none");
        }
        return;
      }

      // fallback
      if (videoMsg) {
        videoMsg.textContent = "Định dạng video không hỗ trợ: " + rawVideo;
        videoMsg.classList.remove("d-none");
      }

    } catch (e) {
      toast("Không tải được bài học: " + e.message, "danger");
    }
  })();

  const handleLogout = () => { clearAuth(); location.href = "login.html"; };
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) logoutBtn.onclick = handleLogout;
  const navLogoutBtn = document.getElementById("navLogout");
  if (navLogoutBtn) navLogoutBtn.onclick = handleLogout;
});
