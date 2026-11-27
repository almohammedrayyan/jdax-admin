import axios, { type AxiosError } from "axios";

export type ApiResponse<T> = { success: boolean; message?: string; data: T };

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
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
  (error: AxiosError<ApiResponse<unknown>>) =>
    Promise.reject(
      new Error(
        error.response?.data?.message || "Unable to complete the request.",
      ),
    ),
);

export default axiosClient;
