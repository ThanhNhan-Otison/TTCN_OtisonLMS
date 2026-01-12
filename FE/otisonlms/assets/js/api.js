// assets/js/api.js
const API_BASE = "http://localhost:8080/api/v1";

// ===== Helpers =====
const getToken = () => localStorage.getItem("token");

const buildHeaders = (customHeaders = {}) => {
  const token = getToken();
  return {
    ...customHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseResponse = async (res) => {
  const ct = (res.headers.get("content-type") || "").toLowerCase();

  // content-type đúng JSON
  if (ct.includes("application/json")) {
    return res.json().catch(() => null);
  }

  // fallback: text -> try parse JSON
  const text = await res.text().catch(() => "");
  if (!text) return "";
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const buildErrorMessage = (res, data) => {
  if (data && typeof data === "object" && data.message) return data.message;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (res.status === 401 || res.status === 403)
    return "Bạn chưa đăng nhập hoặc không có quyền. Vui lòng đăng nhập lại.";
  return `HTTP ${res.status}`;
};

// ===== Unified fetch (JWT + JSON + FormData) =====
async function apiFetch(path, options = {}) {
  const { json, headers: customHeaders, ...rest } = options;

  const headers = buildHeaders(customHeaders);

  // Body + content-type
  let body = rest.body;

  // JSON body
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  // FormData body -> không set Content-Type
  if (body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body,
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    const err = new Error(buildErrorMessage(res, data));
    err.status = res.status;
    err.raw = data;
    throw err;
  }

  return data;
}
