"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAppSelector } from "@/lib/redux/hooks";

interface UseThrottledInfiniteScrollOptions {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  isFetching?: boolean;
  fetchNextPage: () => Promise<any> | void;
  throttleIntervalMs?: number;
}

export function useThrottledInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  isFetching = false,
  fetchNextPage,
  throttleIntervalMs: customThrottleMs,
}: UseThrottledInfiniteScrollOptions) {
  const reduxThrottleMs = useAppSelector(
    (state) => state.ui?.throttleIntervalMs ?? 300
  );
  const throttleInterval = customThrottleMs ?? reduxThrottleMs;

  const lastFetchTimeRef = useRef<number>(0);
  const trailingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const hasNextPageRef = useRef<boolean>(Boolean(hasNextPage));

  useEffect(() => {
    isFetchingRef.current = isFetchingNextPage || isFetching;
  }, [isFetchingNextPage, isFetching]);

  useEffect(() => {
    hasNextPageRef.current = Boolean(hasNextPage);
  }, [hasNextPage]);

  // Clean up trailing timer on unmount
  useEffect(() => {
    return () => {
      if (trailingTimerRef.current) {
        clearTimeout(trailingTimerRef.current);
      }
    };
  }, []);

  const triggerFetchNext = useCallback(() => {
    if (!hasNextPageRef.current || isFetchingRef.current) {
      return false;
    }

    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;

    if (timeSinceLastFetch >= throttleInterval) {
      lastFetchTimeRef.current = now;
      if (trailingTimerRef.current) {
        clearTimeout(trailingTimerRef.current);
        trailingTimerRef.current = null;
      }
      fetchNextPage();
      return true;
    }

    // If within throttle window, schedule trailing trigger if not already pending
    if (!trailingTimerRef.current) {
      const remainingTime = throttleInterval - timeSinceLastFetch;
      trailingTimerRef.current = setTimeout(() => {
        trailingTimerRef.current = null;
        if (hasNextPageRef.current && !isFetchingRef.current) {
          lastFetchTimeRef.current = Date.now();
          fetchNextPage();
        }
      }, remainingTime);
    }

    return false;
  }, [throttleInterval, fetchNextPage]);

  return {
    triggerFetchNext,
    throttleInterval,
  };
}
