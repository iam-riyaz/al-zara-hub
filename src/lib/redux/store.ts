import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/ui-slice";
import catalogFilterReducer from "./slices/catalog-filter-slice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      ui: uiReducer,
      catalogFilter: catalogFilterReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
