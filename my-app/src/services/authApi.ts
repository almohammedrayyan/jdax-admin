import axiosClient, { type ApiResponse } from "../api/axiosClient";

export type AuthUser = { _id: string; email: string; name?: string };
type AuthResult = { user: AuthUser; token: string };

export async function register(name: string, email: string, password: string) {
  const response = await axiosClient.post<ApiResponse<AuthResult>>("/api/auth/register", { name, email, password });
  return response.data.data;
}

export async function login(email: string, password: string) {
  const response = await axiosClient.post<ApiResponse<AuthResult>>("/api/auth/login", { email, password });
  return response.data.data;
}

export async function getCurrentUser(token: string) {
  const response = await axiosClient.get<ApiResponse<AuthUser>>("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
  return response.data.data;
}

export async function logout(token: string) {
  await axiosClient.post("/api/auth/logout", {}, { headers: { Authorization: `Bearer ${token}` } });
}
