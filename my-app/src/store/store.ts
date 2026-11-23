import { configureStore } from "@reduxjs/toolkit";
import { liveFeedApi } from "../services/liveFeedApi";
import { contentScheduleApi } from "../services/contentScheduleApi";
import { dashboardVisitorApi } from "../services/dashboardVisitorApi";

export const store = configureStore({
  reducer: {
    [liveFeedApi.reducerPath]: liveFeedApi.reducer,
    [contentScheduleApi.reducerPath]: contentScheduleApi.reducer,
    [dashboardVisitorApi.reducerPath]: dashboardVisitorApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(liveFeedApi.middleware, contentScheduleApi.middleware, dashboardVisitorApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
