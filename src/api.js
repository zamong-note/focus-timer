// API 클라이언트
// 배포 시 .env 의 REACT_APP_API_URL 을 Railway 백엔드 주소로 설정하세요.
const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  getSubjects: () => req("/subjects"),
  addSubject: (name) =>
    req("/subjects", { method: "POST", body: JSON.stringify({ name }) }),
  deleteSubject: (id) => req(`/subjects/${id}`, { method: "DELETE" }),

  getSessions: ({ subjectId, range } = {}) => {
    const p = new URLSearchParams();
    if (subjectId) p.set("subject_id", subjectId);
    if (range) p.set("range", range);
    const qs = p.toString();
    return req(`/sessions${qs ? "?" + qs : ""}`);
  },
  addSession: (subjectId, duration) =>
    req("/sessions", {
      method: "POST",
      body: JSON.stringify({ subject_id: subjectId, duration }),
    }),
  deleteSession: (id) => req(`/sessions/${id}`, { method: "DELETE" }),

  getStats: () => req("/stats"),
};
