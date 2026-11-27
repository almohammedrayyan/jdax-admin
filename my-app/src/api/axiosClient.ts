import axios, { type AxiosError } from "axios";
import { clearSession, getValidToken } from "../auth/session";

export type ApiResponse<T> = { success: boolean; message?: string; data: T };

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = getValidToken();
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse<unknown>;

    if (payload.success === false) {
      return Promise.reject(
        new Error(payload.message || "Unable to complete the request."),
      );
    }

    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const token = getValidToken();
    if (error.response?.status === 401 && token && error.config?.headers?.Authorization === `Bearer ${token}` && !["/api/auth/login", "/api/auth/register"].includes(error.config?.url || "")) clearSession();
    return Promise.reject(Object.assign(new Error(error.response?.data?.message || "Unable to complete the request."), { status: error.response?.status }));
  },
);

export default axiosClient;
