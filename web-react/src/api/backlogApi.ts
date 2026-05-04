import type { BacklogStats, Project } from "../types/backlogStats";

const API_BASE = "/api/v1";
const TOKEN_KEY = "taiga.authToken";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body && typeof body === "object" && "_error_message" in body) {
        message = String((body as { _error_message: unknown })._error_message);
      }
    } catch {
      // ignore body parse errors
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export interface LoginResponse {
  auth_token: string;
  id: number;
  username: string;
  full_name?: string;
  email?: string;
  [key: string]: unknown;
}

export async function loginAndGetToken(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "normal", username, password }),
  });
  const data = await handleJson<LoginResponse>(res);
  if (data.auth_token) {
    setStoredToken(data.auth_token);
  }
  return data;
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`, {
    headers: { ...authHeaders() },
  });
  return handleJson<Project[]>(res);
}

export async function fetchProjectStats(projectId: number): Promise<BacklogStats> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/stats`, {
    headers: { ...authHeaders() },
  });
  return handleJson<BacklogStats>(res);
}

export function logout(): void {
  setStoredToken(null);
}
