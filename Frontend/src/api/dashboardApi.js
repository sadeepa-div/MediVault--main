const API_URL = (import.meta.env.VITE_API_URL || "/api")
  .replace(/\\/g, "/")
  .replace(/\/$/, "");

export async function dashboardRequest(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("medivault_token");
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
}
