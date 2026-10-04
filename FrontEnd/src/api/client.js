/**
 * لایهٔ ارتباط با بک‌اند (لاراول / PHP)
 * VITE_API_URL را در .env تنظیم کن. پیش‌فرض: /api (پروکسی Vite → لاراول)
 */
const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

const TOKEN_KEY = "taskline_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      // فالبک برای Apache/Laragon که گاهی Authorization را حذف می‌کند
      headers["X-Auth-Token"] = token;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    let msg = data?.error || data?.message || `خطای سرور (${res.status})`;
    if (res.status === 405) {
      msg = "این عملیات در سرور پشتیبانی نمی‌شود (متد HTTP اشتباه یا route ناقص).";
    }
    if (res.status === 401) {
      // نشست منقضی — توکن را پاک کن
      setToken(null);
    }
    throw new ApiError(msg, res.status);
  }
  return data;
}

// ---------- Auth ----------
export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),

  // Users
  listUsers: () => request("/users"),
  updateMe: (patch) => request("/users/me", { method: "PATCH", body: patch }),
  changePassword: (payload) => request("/users/me/password", { method: "POST", body: payload }),
  inviteUser: (payload) => request("/users/invite", { method: "POST", body: payload }),
  updateRole: (id, role) => request(`/users/${id}/role`, { method: "PATCH", body: { role } }),

  // Projects
  listProjects: () => request("/projects"),
  createProject: (payload) => request("/projects", { method: "POST", body: payload }),
  updateProject: (id, payload) =>
    request(`/projects/${id}`, { method: "PATCH", body: payload }),
  deleteProject: (id) => request(`/projects/${id}`, { method: "DELETE" }),
  listProjectMembers: (projectId) => request(`/projects/${projectId}/members`),
  addProjectMember: (projectId, payload) =>
    request(`/projects/${projectId}/members`, { method: "POST", body: payload }),
    removeProjectMember: (projectId, userId) =>
    request(`/projects/${projectId}/members/${userId}`, { method: "DELETE" }),
  getUser: (id) => request(`/users/${id}`),
  getBoard: (projectId) => request(`/projects/${projectId}/board`),
  listLabels: (projectId) => request(`/projects/${projectId}/labels`),
  createLabel: (projectId, payload) =>
    request(`/projects/${projectId}/labels`, { method: "POST", body: payload }),
  updateLabel: (id, payload) => request(`/labels/${id}`, { method: "PATCH", body: payload }),
  deleteLabel: (id) => request(`/labels/${id}`, { method: "DELETE" }),

  // Columns
  createColumn: (projectId, payload) =>
    request(`/projects/${projectId}/columns`, { method: "POST", body: payload }),
  updateColumn: (id, payload) => request(`/columns/${id}`, { method: "PATCH", body: payload }),
  deleteColumn: (id) => request(`/columns/${id}`, { method: "DELETE" }),

  // Tasks
  createTask: (columnId, payload) =>
    request(`/columns/${columnId}/tasks`, { method: "POST", body: payload }),
  getTask: (id) => request(`/tasks/${id}`),
  updateTask: (id, payload) => request(`/tasks/${id}`, { method: "PATCH", body: payload }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),

  // Checklist
  addChecklist: (taskId, text) =>
    request(`/tasks/${taskId}/checklist`, { method: "POST", body: { text } }),
  updateChecklist: (id, payload) =>
    request(`/checklist/${id}`, { method: "PATCH", body: payload }),
  deleteChecklist: (id) => request(`/checklist/${id}`, { method: "DELETE" }),

  // Comments
  addComment: (taskId, text) =>
    request(`/tasks/${taskId}/comments`, { method: "POST", body: { text } }),
  updateComment: (id, text) =>
    request(`/comments/${id}`, { method: "PATCH", body: { text } }),
  deleteComment: (id) => request(`/comments/${id}`, { method: "DELETE" }),

  // Attachments (multipart)
  async uploadAttachment(taskId, file) {
    const headers = { Accept: "application/json" };
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers["X-Auth-Token"] = token;
    }
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/tasks/${taskId}/attachments`, {
      method: "POST",
      headers,
      body: form,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { error: text };
    }
    if (!res.ok) {
      if (res.status === 401) setToken(null);
      throw new ApiError(data?.error || `خطای سرور (${res.status})`, res.status);
    }
    return data;
  },
  deleteAttachment: (id) => request(`/attachments/${id}`, { method: "DELETE" }),
};


export default api;
