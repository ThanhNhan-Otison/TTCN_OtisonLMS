
// // assets/js/api.js
// const API_BASE = "http://localhost:8080/api/v1";

// // ===== JWT header =====
// function getAuthHeader() {
//   const token = localStorage.getItem("token");
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// // ===== Unified fetch (JWT + JSON + FormData) =====
// async function apiFetch(path, options = {}) {
//   const headers = {
//     ...(options.headers || {}),
//     ...getAuthHeader(),
//   };

//   // JSON body
//   if (options.json) {
//     headers["Content-Type"] = "application/json";
//     options.body = JSON.stringify(options.json);
//     delete options.json;
//   }

//   // FormData body → KHÔNG set Content-Type
//   if (options.body instanceof FormData) {
//     delete headers["Content-Type"];
//   }

//   const res = await fetch(`${API_BASE}${path}`, {
//     ...options,
//     headers,
//   });

//   // đọc response an toàn
//   const ct = res.headers.get("content-type") || "";
//   const data = ct.includes("application/json")
//     ? await res.json().catch(() => null)
//     : await res.text().catch(() => null);

//   if (!res.ok) {
//     const msg =
//       (data && data.message)
//         ? data.message
//         : (typeof data === "string" ? data : `HTTP ${res.status}`);
//     throw new Error(msg);
//   }

//   return data;
// }

// assets/js/api.js
const API_BASE = "http://localhost:8080/api/v1";

// ===== JWT header =====
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ===== Unified fetch (JWT + JSON + FormData) =====
async function apiFetch(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
    ...getAuthHeader(),
  };

  // JSON body
  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.json);
    delete options.json;
  }

  // FormData body → KHÔNG set Content-Type
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // đọc response (cố gắng parse JSON trước, fallback text)
  let data = null;
  const ct = (res.headers.get("content-type") || "").toLowerCase();

  if (ct.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => "");
    // đôi khi BE trả JSON nhưng content-type sai → thử parse
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    // ưu tiên message từ BE
    let msg = `HTTP ${res.status}`;

    if (data && typeof data === "object" && data.message) {
      msg = data.message;
    } else if (typeof data === "string" && data.trim() !== "") {
      msg = data.trim();
    } else if (res.status === 401 || res.status === 403) {
      msg = "Bạn chưa đăng nhập hoặc không có quyền. Vui lòng đăng nhập lại.";
    }

    const err = new Error(msg);
    err.status = res.status;
    err.raw = data;
    throw err;
  }

  return data;
}
