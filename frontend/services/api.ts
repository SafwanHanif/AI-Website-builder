import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse, Project, Version } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  signup: (email: string, password: string, name?: string) =>
    api.post<AuthResponse>("/auth/signup", { email, password, name }).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data),

  me: () => api.get<{ id: string; email: string; name: string | null }>("/auth/me").then((r) => r.data),
};

// Projects
export const projectsApi = {
  list: () => api.get<Project[]>("/projects/").then((r) => r.data),

  get: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),

  create: (data: { title: string; description?: string; prompt: string }) =>
    api.post<Project>("/projects/", data).then((r) => r.data),

  update: (id: string, data: { title?: string; description?: string }) =>
    api.put<Project>(`/projects/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/projects/${id}`),

  generate: (id: string) => api.post(`/projects/${id}/generate`).then((r) => r.data),

  edit: (id: string, prompt: string) =>
    api.post<{ message: string; version_number: number; changed_components: string[] }>(
      `/projects/${id}/edit`,
      { prompt }
    ).then((r) => r.data),

  exportUrl: (id: string, format: string = "zip") =>
    `${api.defaults.baseURL}/projects/${id}/export?format=${format}`,
};

// Versions
export const versionsApi = {
  list: (projectId: string) =>
    api.get<Version[]>(`/projects/${projectId}/versions`).then((r) => r.data),

  create: (projectId: string, message?: string) =>
    api.post<Version>(`/projects/${projectId}/versions`, { message }).then((r) => r.data),

  restore: (projectId: string, versionId: string) =>
    api.post(`/projects/${projectId}/versions/${versionId}/restore`).then((r) => r.data),
};

export default api;
