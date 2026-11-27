import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

export const PLATFORM_OPTIONS = ["instagram", "youtube"] as const;
export type Platform = (typeof PLATFORM_OPTIONS)[number];
export type LiveFeed = {
  _id: string;
  platform: Platform;
  accountId: string;
  createdAt?: string;
};
export type LiveFeedForm = { platform: Platform; accountId: string };

export const liveFeedApi = createApi({
  reducerPath: "liveFeedApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["LiveFeed"],
  endpoints: (builder) => ({
    getLiveFeeds: builder.query<LiveFeed[], void>({
      query: () => ({ url: "/api/social-live-feeds", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "LiveFeed" as const, id: _id })),
              { type: "LiveFeed", id: "LIST" },
            ]
          : [{ type: "LiveFeed", id: "LIST" }],
    }),
    getLiveFeedById: builder.query<LiveFeed, string>({
      query: (id) => ({ url: `/api/social-live-feeds/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "LiveFeed", id }],
    }),
    createLiveFeed: builder.mutation<LiveFeed, LiveFeedForm>({
      query: (data) => ({
        url: "/api/social-live-feeds",
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "LiveFeed", id: "LIST" }],
    }),
    updateLiveFeed: builder.mutation<
      LiveFeed,
      { id: string; data: LiveFeedForm }
    >({
      query: ({ id, data }) => ({
        url: `/api/social-live-feeds/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "LiveFeed", id },
        { type: "LiveFeed", id: "LIST" },
      ],
    }),
    deleteLiveFeed: builder.mutation<LiveFeed, string>({
      query: (id) => ({
        url: `/api/social-live-feeds/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "LiveFeed", id },
        { type: "LiveFeed", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetLiveFeedsQuery,
  useGetLiveFeedByIdQuery,
  useCreateLiveFeedMutation,
  useUpdateLiveFeedMutation,
  useDeleteLiveFeedMutation,
} = liveFeedApi;
