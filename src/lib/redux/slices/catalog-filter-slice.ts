import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CatalogFilterState {
  search: string;
  category: string;
  brand: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  minRating: number | undefined;
  inStockOnly: boolean;
  sortBy: "newest" | "price-asc" | "price-desc" | "rating-desc" | "name-asc";
}

const initialState: CatalogFilterState = {
  search: "",
  category: "",
  brand: "",
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  inStockOnly: false,
  sortBy: "newest",
};

export const catalogFilterSlice = createSlice({
  name: "catalogFilter",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    setBrand: (state, action: PayloadAction<string>) => {
      state.brand = action.payload;
    },
    setPriceRange: (
      state,
      action: PayloadAction<{ min?: number; max?: number }>
    ) => {
      state.minPrice = action.payload.min;
      state.maxPrice = action.payload.max;
    },
    setMinRating: (state, action: PayloadAction<number | undefined>) => {
      state.minRating = action.payload;
    },
    setInStockOnly: (state, action: PayloadAction<boolean>) => {
      state.inStockOnly = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<
        "newest" | "price-asc" | "price-desc" | "rating-desc" | "name-asc"
      >
    ) => {
      state.sortBy = action.payload;
    },
    setAllFilters: (
      state,
      action: PayloadAction<Partial<CatalogFilterState>>
    ) => {
      return { ...state, ...action.payload };
    },
    resetFilters: () => initialState,
  },
});

export const {
  setSearch,
  setCategory,
  setBrand,
  setPriceRange,
  setMinRating,
  setInStockOnly,
  setSortBy,
  setAllFilters,
  resetFilters,
} = catalogFilterSlice.actions;

export default catalogFilterSlice.reducer;
