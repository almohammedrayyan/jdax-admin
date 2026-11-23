import { configureStore } from "@reduxjs/toolkit";
import { liveFeedApi } from "../services/liveFeedApi";
import { contentScheduleApi } from "../services/contentScheduleApi";

export const store = configureStore({
  reducer: {
    [liveFeedApi.reducerPath]: liveFeedApi.reducer,
    [contentScheduleApi.reducerPath]: contentScheduleApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(liveFeedApi.middleware, contentScheduleApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
