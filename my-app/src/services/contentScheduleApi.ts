import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

export const CONTENT_CATEGORIES = [
  "upsc",
  "tnpsc",
  "ssc",
  "rrb",
  "banking",
  "college-programme",
  "gs-function",
  "jee",
  "neet",
] as const;
export const TNPSC_GROUPS = ["group-1", "group-2", "group-4"] as const;
export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];
export type TnpscGroup = (typeof TNPSC_GROUPS)[number];
export type ContentSchedule = {
  _id: string;
  category: ContentCategory;
  group: TnpscGroup | null;
  title: string;
  venue?: string;
  scheduledAt: string;
  createdAt?: string;
};
export type ContentScheduleForm = Pick<
  ContentSchedule,
  "category" | "group" | "title" | "venue" | "scheduledAt"
>;

export const contentScheduleApi = createApi({
  reducerPath: "contentScheduleApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["ContentSchedule"],
  endpoints: (builder) => ({
    getContentSchedules: builder.query<ContentSchedule[], void>({
      query: () => ({ url: "/api/content-schedules/get-all", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "ContentSchedule" as const,
                id: _id,
              })),
              { type: "ContentSchedule", id: "LIST" },
            ]
          : [{ type: "ContentSchedule", id: "LIST" }],
    }),
    createContentSchedule: builder.mutation<
      ContentSchedule,
      ContentScheduleForm
    >({
      query: (data) => ({
        url: "/api/content-schedules",
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "ContentSchedule", id: "LIST" }],
    }),
    createBulkContentSchedules: builder.mutation<ContentSchedule[], ContentScheduleForm[]>({
      query: (rows) => ({ url: "/api/content-schedules/bulk", method: "POST", data: { rows } }),
      invalidatesTags: [{ type: "ContentSchedule", id: "LIST" }],
    }),
    updateContentSchedule: builder.mutation<
      ContentSchedule,
      { id: string; data: ContentScheduleForm }
    >({
      query: ({ id, data }) => ({
        url: `/api/content-schedules/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "ContentSchedule", id },
        { type: "ContentSchedule", id: "LIST" },
      ],
    }),
    deleteContentSchedule: builder.mutation<ContentSchedule, string>({
      query: (id) => ({
        url: `/api/content-schedules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "ContentSchedule", id },
        { type: "ContentSchedule", id: "LIST" },
      ],
    }),
  }),
});
export const {
  useGetContentSchedulesQuery,
  useCreateContentScheduleMutation,
  useCreateBulkContentSchedulesMutation,
  useUpdateContentScheduleMutation,
  useDeleteContentScheduleMutation,
} = contentScheduleApi;
