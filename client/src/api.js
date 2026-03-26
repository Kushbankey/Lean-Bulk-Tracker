const BASE = import.meta.env.PROD ? "" : "";

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getLogs: () => request("/api/logs"),
  getLog: (date) => request(`/api/logs/${date}`),
  saveLog: (data) => request("/api/logs", { method: "POST", body: JSON.stringify(data) }),

  getSettings: () => request("/api/settings"),
  updateSettings: (data) => request("/api/settings", { method: "PUT", body: JSON.stringify(data) }),

  getStats: () => request("/api/stats"),

  exportCSV: () => `${BASE}/api/export`,

  resetAll: () => request("/api/reset", { method: "DELETE" }),
};
