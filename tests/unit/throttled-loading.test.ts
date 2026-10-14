// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/lib/redux/store";
import { useThrottledInfiniteScroll } from "@/features/products/hooks/use-throttled-infinite-scroll";
import { buildProductsQueryString } from "@/features/products/hooks/use-products-query";

describe("Throttled Product Loading", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createWrapper = () => {
    const store = makeStore();
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(Provider, { store, children });
    };
  };

  it("builds correct URL query string for TanStack Query fetching", () => {
    const qs = buildProductsQueryString(
      {
        search: "leather",
        category: "footwear-sneakers",
        minPrice: 50,
        maxPrice: 250,
        inStock: true,
        sortBy: "price-asc",
        limit: 24,
      },
      2
    );

    expect(qs).toContain("search=leather");
    expect(qs).toContain("category=footwear-sneakers");
    expect(qs).toContain("minPrice=50");
    expect(qs).toContain("maxPrice=250");
    expect(qs).toContain("inStock=true");
    expect(qs).toContain("sortBy=price-asc");
    expect(qs).toContain("page=2");
    expect(qs).toContain("limit=24");
  });

  it("triggers fetch immediately on first invocation", () => {
    const fetchNextPage = vi.fn();
    const wrapper = createWrapper();

    const { result } = renderHook(
      () =>
        useThrottledInfiniteScroll({
          hasNextPage: true,
          isFetchingNextPage: false,
          isFetching: false,
          fetchNextPage,
          throttleIntervalMs: 300,
        }),
      { wrapper }
    );

    act(() => {
      const triggered = result.current.triggerFetchNext();
      expect(triggered).toBe(true);
    });

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("throttles rapid repeated triggers within the 300ms window", () => {
    const fetchNextPage = vi.fn();
    const wrapper = createWrapper();

    const { result } = renderHook(
      () =>
        useThrottledInfiniteScroll({
          hasNextPage: true,
          isFetchingNextPage: false,
          isFetching: false,
          fetchNextPage,
          throttleIntervalMs: 300,
        }),
      { wrapper }
    );

    // Call 1: should execute immediately
    act(() => {
      result.current.triggerFetchNext();
    });
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    // Rapid scrolling triggers at +50ms, +100ms, +150ms: must NOT trigger new immediate calls
    vi.advanceTimersByTime(50);
    act(() => {
      const called = result.current.triggerFetchNext();
      expect(called).toBe(false);
    });
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);
    act(() => {
      result.current.triggerFetchNext();
    });
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    // Advance to end of throttle window (total 300ms passed)
    // Trailing call scheduled from the throttle window should now fire!
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(fetchNextPage).toHaveBeenCalledTimes(2);
  });

  it("prevents duplicate concurrent requests while a fetch is already in flight", () => {
    const fetchNextPage = vi.fn();
    const wrapper = createWrapper();

    const { result, rerender } = renderHook(
      ({ isFetchingNextPage }) =>
        useThrottledInfiniteScroll({
          hasNextPage: true,
          isFetchingNextPage,
          isFetching: false,
          fetchNextPage,
          throttleIntervalMs: 300,
        }),
      {
        wrapper,
        initialProps: { isFetchingNextPage: true },
      }
    );

    // While fetching is in progress, trigger should be blocked
    act(() => {
      const triggered = result.current.triggerFetchNext();
      expect(triggered).toBe(false);
    });
    expect(fetchNextPage).not.toHaveBeenCalled();

    // Now request finishes
    rerender({ isFetchingNextPage: false });
    vi.advanceTimersByTime(350);

    act(() => {
      const triggered = result.current.triggerFetchNext();
      expect(triggered).toBe(true);
    });
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("does not trigger when hasNextPage is false", () => {
    const fetchNextPage = vi.fn();
    const wrapper = createWrapper();

    const { result } = renderHook(
      () =>
        useThrottledInfiniteScroll({
          hasNextPage: false,
          isFetchingNextPage: false,
          isFetching: false,
          fetchNextPage,
          throttleIntervalMs: 300,
        }),
      { wrapper }
    );

    act(() => {
      const triggered = result.current.triggerFetchNext();
      expect(triggered).toBe(false);
    });
    expect(fetchNextPage).not.toHaveBeenCalled();
  });
});
