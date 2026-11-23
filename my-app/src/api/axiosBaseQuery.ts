import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig } from "axios";
import axiosClient, { type ApiResponse } from "./axiosClient";

type AxiosBaseQueryError = { status?: number; data: { message: string } };

export const axiosBaseQuery = (): BaseQueryFn<
  AxiosRequestConfig,
  unknown,
  AxiosBaseQueryError
> => async (config) => {
  try {
    const response = await axiosClient.request(config);
    const payload = response.data as ApiResponse<unknown>;

    return { data: payload.data };
  } catch (error) {
    return {
      error: {
        data: {
          message:
            error instanceof Error ? error.message : "Unable to complete the request.",
        },
      },
    };
  }
};
