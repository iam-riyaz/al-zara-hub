import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  filterDrawerOpen: boolean;
  viewLayout: "grid" | "compact";
  throttleIntervalMs: number;
  lastAddedItem: { id: string; name: string } | null;
}

const initialState: UiState = {
  filterDrawerOpen: false,
  viewLayout: "grid",
  throttleIntervalMs: 300,
  lastAddedItem: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleFilterDrawer: (state) => {
      state.filterDrawerOpen = !state.filterDrawerOpen;
    },
    setFilterDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.filterDrawerOpen = action.payload;
    },
    setViewLayout: (state, action: PayloadAction<"grid" | "compact">) => {
      state.viewLayout = action.payload;
    },
    setThrottleIntervalMs: (state, action: PayloadAction<number>) => {
      state.throttleIntervalMs = action.payload;
    },
    setLastAddedItem: (state, action: PayloadAction<{ id: string; name: string } | null>) => {
      state.lastAddedItem = action.payload;
    },
    resetUiState: () => initialState,
  },
});

export const {
  toggleFilterDrawer,
  setFilterDrawerOpen,
  setViewLayout,
  setThrottleIntervalMs,
  setLastAddedItem,
  resetUiState,
} = uiSlice.actions;

export default uiSlice.reducer;
