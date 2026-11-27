import type { AuthUser } from "../services/authApi";

export const TOKEN_KEY = "jdax_admin_token";
export const USER_KEY = "jdax_admin_user";
export const USER_ID_KEY = "jdax_admin_user_id";
export const SESSION_EVENT = "jdax-session-change";

export function tokenExpiration(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    return typeof payload.exp === "number" && Number.isFinite(payload.exp) ? payload.exp * 1000 : null;
  } catch { return null; }
}

export function getValidToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expires = token && tokenExpiration(token);
  return token && expires && expires > Date.now() ? token : null;
}

export function saveSession(token: string, user: AuthUser) {
  const expires = tokenExpiration(token);
  if (!expires || expires <= Date.now() || !user?._id) throw new Error("Invalid or expired session returned by server.");
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ID_KEY, user._id);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}
