import { apiClient } from "../api/client";
import { resolveUrl } from "../api/endpoints";
import { useAuthStore, type User } from "./auth-store";

interface LoginResponse {
  auth_token: string;
  refresh: string;
  id: number;
  username: string;
  full_name: string;
  email: string;
  photo: string;
  lang: string;
  theme: string;
  [key: string]: unknown;
}

export async function login(
  username: string,
  password: string,
  type: string = "normal",
): Promise<User> {
  const url = resolveUrl("auth");
  const data = await apiClient.post<LoginResponse>(url, { username, password, type });

  const { setTokens, setUser } = useAuthStore.getState();
  setTokens(data.auth_token, data.refresh);

  const user: User = { ...data };
  setUser(user);
  return user;
}

export async function register(
  data: Record<string, unknown>,
  type: string = "public",
  existing: boolean = false,
): Promise<User> {
  const url = resolveUrl("auth-register");
  const payload: Record<string, unknown> = { ...data, type };
  if (type === "private") {
    payload.existing = existing;
  }

  const response = await apiClient.post<LoginResponse>(url, payload);
  const { setTokens, setUser } = useAuthStore.getState();
  setTokens(response.auth_token, response.refresh);

  const user: User = { ...response };
  setUser(user);
  return user;
}

export async function forgotPassword(data: Record<string, unknown>): Promise<void> {
  const url = resolveUrl("users-password-recovery");
  await apiClient.post(url, data);
}

export async function changePasswordFromRecovery(data: Record<string, unknown>): Promise<void> {
  const url = resolveUrl("users-change-password-from-recovery");
  await apiClient.post(url, data);
}

export async function refreshCurrentUser(): Promise<User> {
  const url = resolveUrl("user-me");
  const data = await apiClient.get<User>(url);

  const { setUser } = useAuthStore.getState();
  setUser(data);
  return data;
}

export async function cancelAccount(data: Record<string, unknown>): Promise<void> {
  const url = resolveUrl("users-cancel-account");
  await apiClient.post(url, data);
}
