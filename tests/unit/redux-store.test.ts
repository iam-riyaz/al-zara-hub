import { describe, it, expect } from "vitest";
import { makeStore } from "@/lib/redux/store";
import {
  setThrottleIntervalMs,
  toggleFilterDrawer,
  setViewLayout,
  setLastAddedItem,
  resetUiState,
} from "@/lib/redux/slices/ui-slice";
import {
  setSearch,
  setCategory,
  setPriceRange,
  setInStockOnly,
  setSortBy,
  resetFilters,
} from "@/lib/redux/slices/catalog-filter-slice";

describe("Redux Toolkit Store & Slices", () => {
  it("initializes with default UI and catalog filter states", () => {
    const store = makeStore();
    const state = store.getState();

    expect(state.ui).toBeDefined();
    expect(state.ui.throttleIntervalMs).toBe(300);
    expect(state.ui.filterDrawerOpen).toBe(false);
    expect(state.ui.viewLayout).toBe("grid");

    expect(state.catalogFilter).toBeDefined();
    expect(state.catalogFilter.search).toBe("");
    expect(state.catalogFilter.inStockOnly).toBe(false);
    expect(state.catalogFilter.sortBy).toBe("newest");
  });

  it("updates UI state on actions", () => {
    const store = makeStore();

    store.dispatch(setThrottleIntervalMs(500));
    expect(store.getState().ui.throttleIntervalMs).toBe(500);

    store.dispatch(toggleFilterDrawer());
    expect(store.getState().ui.filterDrawerOpen).toBe(true);

    store.dispatch(setViewLayout("compact"));
    expect(store.getState().ui.viewLayout).toBe("compact");

    store.dispatch(setLastAddedItem({ id: "prod_123", name: "Wireless Headphones" }));
    expect(store.getState().ui.lastAddedItem?.name).toBe("Wireless Headphones");

    store.dispatch(resetUiState());
    expect(store.getState().ui.throttleIntervalMs).toBe(300);
    expect(store.getState().ui.filterDrawerOpen).toBe(false);
  });

  it("updates catalog filters correctly", () => {
    const store = makeStore();

    store.dispatch(setSearch("headphones"));
    expect(store.getState().catalogFilter.search).toBe("headphones");

    store.dispatch(setCategory("audio-headphones"));
    expect(store.getState().catalogFilter.category).toBe("audio-headphones");

    store.dispatch(setPriceRange({ min: 50, max: 200 }));
    expect(store.getState().catalogFilter.minPrice).toBe(50);
    expect(store.getState().catalogFilter.maxPrice).toBe(200);

    store.dispatch(setInStockOnly(true));
    expect(store.getState().catalogFilter.inStockOnly).toBe(true);

    store.dispatch(setSortBy("price-asc"));
    expect(store.getState().catalogFilter.sortBy).toBe("price-asc");

    store.dispatch(resetFilters());
    expect(store.getState().catalogFilter.search).toBe("");
    expect(store.getState().catalogFilter.category).toBe("");
  });
});
