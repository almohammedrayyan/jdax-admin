import { createApi } from "@reduxjs/toolkit/query/react";
import axiosClient from "../api/axiosClient";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

export type VisitorSnapshot = {
  _id: string;
  snapshotDate: string;
  startDate: string;
  totalUsers: number;
  newUsers: number;
  totalSessions: number;
  totalViews: number;
};
export type DashboardVisitors = {
  totalUsers: number;
  newUsers: number;
  totalSessions: number;
  totalViews: number;
  snapshotDate: string | null;
};

export const dashboardVisitorApi = createApi({
  reducerPath: "dashboardVisitorApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getDashboardVisitors: builder.query<DashboardVisitors, void>({
      async queryFn() {
        try {
          const response = await axiosClient.get<DashboardVisitors & { data?: { latest?: DashboardVisitors } | VisitorSnapshot[] }>("/api/events/realtime-visitors");
          const nestedLatest = Array.isArray(response.data.data)
            ? response.data.data[0]
            : response.data.data?.latest;
          return {
            data: {
              totalUsers: response.data.totalUsers ?? nestedLatest?.totalUsers ?? 0,
              newUsers: response.data.newUsers ?? nestedLatest?.newUsers ?? 0,
              totalSessions: response.data.totalSessions ?? nestedLatest?.totalSessions ?? 0,
              totalViews: response.data.totalViews ?? nestedLatest?.totalViews ?? 0,
              snapshotDate: response.data.snapshotDate ?? nestedLatest?.snapshotDate ?? null,
            },
          };
        } catch (error) {
          return { error: { status: 500, data: { message: error instanceof Error ? error.message : "Unable to load visitor totals." } } };
        }
      },
    }),
  }),
});

export const { useGetDashboardVisitorsQuery } = dashboardVisitorApi;
