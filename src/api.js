
const API_BASE = "http://localhost:8000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Backend request failed");
  }

  return response.json();
}

export const api = {
  health: () => request("/api/health"),

  savePatient: (patient) =>
    request("/api/patients", {
      method: "POST",
      body: JSON.stringify({ patient }),
    }),

  getPatients: () => request("/api/patients"),

  
saveAnalysis: (analysis) =>
  request("/api/analyses", {
    method: "POST",
    body: JSON.stringify(analysis),
  }),


  getAnalyses: () => request("/api/analyses"),

  getPatientAnalyses: (id) =>
    request(`/api/analyses/${encodeURIComponent(id)}`),
  explainFindings: (findings) =>
  request("/api/ai/explain", {
    method: "POST",
    body: JSON.stringify({ findings }),
  }),
};
