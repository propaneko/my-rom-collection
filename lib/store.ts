import { configureStore } from "@reduxjs/toolkit";
import { romsApi } from "./services/roms";
import { screenscraperApi } from "./services/screenscraper";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [romsApi.reducerPath]: romsApi.reducer,
      [screenscraperApi.reducerPath]: screenscraperApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(romsApi.middleware)
        .concat(screenscraperApi.middleware),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
