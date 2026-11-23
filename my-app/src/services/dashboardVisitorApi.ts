import { createApi } from "@reduxjs/toolkit/query/react";
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
export type DashboardVisitors = { latest: Omit<VisitorSnapshot, "_id" | "snapshotDate" | "startDate"> & { snapshotDate: string | null }; snapshots: VisitorSnapshot[] };

export const dashboardVisitorApi = createApi({
  reducerPath: "dashboardVisitorApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getDashboardVisitors: builder.query<DashboardVisitors, void>({
      query: () => ({ url: "/api/events/realtime-visitors", method: "GET" }),
      transformResponse: (response: DashboardVisitors | VisitorSnapshot[]) => {
        if (Array.isArray(response)) {
          const latest = response[0];
          return {
            latest: {
              totalUsers: latest?.totalUsers ?? 0,
              newUsers: latest?.newUsers ?? 0,
              totalSessions: latest?.totalSessions ?? 0,
              totalViews: latest?.totalViews ?? 0,
              snapshotDate: latest?.snapshotDate ?? null,
            },
            snapshots: response,
          };
        }
        return response;
      },
    }),
  }),
});

export const { useGetDashboardVisitorsQuery } = dashboardVisitorApi;
