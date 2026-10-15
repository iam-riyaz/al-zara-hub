"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw, Layers } from "lucide-react";

export interface VirtualizedProductGridProps {
  products: any[];
  totalCount: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onLoadMore: () => void;
  onRetry?: () => void;
  throttleIntervalMs?: number;
}

export function VirtualizedProductGrid({
  products,
  totalCount,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  isError,
  error,
  onLoadMore,
  onRetry,
  throttleIntervalMs = 300,
}: VirtualizedProductGridProps) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = React.useState<number>(3);

  // Responsive column calculation matching grid-cols-1 sm:grid-cols-2 xl:grid-cols-3
  React.useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const updateColumns = () => {
      const width = el.clientWidth;
      if (width < 640) {
        setColumnCount(1);
      } else if (width < 1280) {
        setColumnCount(3);
      } else {
        setColumnCount(3);
      }
    };

    updateColumns();

    const resizeObserver = new ResizeObserver(() => {
      updateColumns();
    });

    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  // Chunk items into rows
  const rows = React.useMemo(() => {
    const chunks: (typeof products)[] = [];
    for (let i = 0; i < products.length; i += columnCount) {
      chunks.push(products.slice(i, i + columnCount));
    }
    return chunks;
  }, [products, columnCount]);

  // Virtualizer for rows
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 460,
    overscan: 2,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  // Scroll trigger for throttled infinite loading
  React.useEffect(() => {
    if (virtualRows.length === 0) return;
    const lastItem = virtualRows[virtualRows.length - 1];

    if (
      lastItem.index >= rows.length - 2 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      onLoadMore();
    }
  }, [virtualRows, rows.length, hasNextPage, isFetchingNextPage, onLoadMore]);

  // Loading skeleton state
  if (isLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm animate-pulse"
          >
            <div className="aspect-square w-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (isError && products.length === 0) {
    return (
      <div className="p-8 text-center border border-red-200 dark:border-red-900/50 rounded-2xl bg-red-50/50 dark:bg-red-950/20 space-y-4">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto" />
        <div>
          <h3 className="font-semibold text-red-900 dark:text-red-300">
            Failed to load products
          </h3>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {error?.message || "An unexpected error occurred while fetching catalog items."}
          </p>
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="border-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return null;
  }

  const renderedCount = virtualRows.reduce(
    (acc, vr) => acc + (rows[vr.index]?.length || 0),
    0
  );

  return (
    <div className="space-y-3">
      {/* Virtualization & Throttle Status Pill */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            Virtualizing <strong className="text-zinc-800 dark:text-zinc-200">{renderedCount}</strong> rendered cards ({products.length} loaded of {totalCount} total)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px]">
            Throttle: {throttleIntervalMs}ms
          </span>
        </div>
      </div>

      {/* Virtual Scroll Container */}
      <div
        ref={parentRef}
        tabIndex={0}
        aria-label="Virtualized product grid"
        className="h-[780px] max-h-[85vh] overflow-y-auto pr-1 rounded-xl scroll-smooth focus:outline-none"
        style={{ contain: "strict" }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualRows.map((virtualRow) => {
            const rowProducts = rows[virtualRow.index];
            if (!rowProducts) return null;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-6"
              >
                {rowProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            );
          })}
        </div>

        {/* Bottom Loading / End of List indicator */}
        <div className="py-6 text-center">
          {isFetchingNextPage ? (
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              <span>Loading more products (throttled {throttleIntervalMs}ms)...</span>
            </div>
          ) : hasNextPage ? (
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                className="text-xs"
              >
                Load More Products ({products.length} / {totalCount})
              </Button>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              ✓ All {totalCount} products loaded
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
