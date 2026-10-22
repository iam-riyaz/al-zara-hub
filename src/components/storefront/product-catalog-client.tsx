"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInfiniteProductsQuery } from "@/features/products/hooks/use-products-query";
import { useThrottledInfiniteScroll } from "@/features/products/hooks/use-throttled-infinite-scroll";
import { VirtualizedProductGrid } from "./virtualized-product-grid";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setThrottleIntervalMs } from "@/lib/redux/slices/ui-slice";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PaginatedResult } from "@/features/products/product.types";
import { SlidersHorizontal, X, Clock } from "lucide-react";

export interface ProductCatalogClientProps {
  initialData: PaginatedResult<any>;
  categories: { id: string; name: string; slug: string }[];
  popularBrands: string[];
  initialParams: {
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    inStock?: string;
    sortBy?: "newest" | "price-asc" | "price-desc" | "rating-desc" | "name-asc";
    page?: string;
  };
}

export function ProductCatalogClient({
  initialData,
  categories,
  popularBrands,
  initialParams,
}: ProductCatalogClientProps) {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const throttleIntervalMs = useAppSelector(
    (state) => state.ui.throttleIntervalMs
  );

  // Read latest query parameters from URL searchParams
  const category = searchParams.get("category") || initialParams.category || undefined;
  const search = searchParams.get("search") || initialParams.search || undefined;
  const brand = searchParams.get("brand") || initialParams.brand || undefined;
  const minPrice = searchParams.get("minPrice")
    ? parseFloat(searchParams.get("minPrice")!)
    : initialParams.minPrice
    ? parseFloat(initialParams.minPrice)
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? parseFloat(searchParams.get("maxPrice")!)
    : initialParams.maxPrice
    ? parseFloat(initialParams.maxPrice)
    : undefined;
  const minRating = searchParams.get("minRating")
    ? parseFloat(searchParams.get("minRating")!)
    : initialParams.minRating
    ? parseFloat(initialParams.minRating)
    : undefined;
  const inStock =
    searchParams.get("inStock") === "true" || initialParams.inStock === "true";
  const sortBy =
    (searchParams.get("sortBy") as any) || initialParams.sortBy || "newest";

  const queryParams = React.useMemo(
    () => ({
      category,
      search,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sortBy,
      limit: 24,
    }),
    [category, search, brand, minPrice, maxPrice, minRating, inStock, sortBy]
  );

  // TanStack Query Infinite Query
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
    refetch,
  } = useInfiniteProductsQuery(queryParams, initialData);

  // Throttled Infinite Scroll Hook
  const { triggerFetchNext } = useThrottledInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
    throttleIntervalMs,
  });

  // Flattened products array across all loaded pages
  const allProducts = React.useMemo(() => {
    if (!data?.pages) return initialData.items || [];
    return data.pages.flatMap((page) => page.items);
  }, [data?.pages, initialData.items]);

  const totalCount = data?.pages?.[0]?.total ?? initialData.total ?? 0;
  const activeCategory = categories.find((c) => c.slug === category);

  // Convert current params to a helper object for links
  const currentParamsRecord: Record<string, string> = {};
  if (category) currentParamsRecord.category = category;
  if (search) currentParamsRecord.search = search;
  if (brand) currentParamsRecord.brand = brand;
  if (minPrice !== undefined) currentParamsRecord.minPrice = minPrice.toString();
  if (maxPrice !== undefined) currentParamsRecord.maxPrice = maxPrice.toString();
  if (minRating !== undefined) currentParamsRecord.minRating = minRating.toString();
  if (inStock) currentParamsRecord.inStock = "true";
  if (sortBy) currentParamsRecord.sortBy = sortBy;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header / Title */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {activeCategory
            ? activeCategory.name
            : search
            ? `Search Results for "${search}"`
            : "All Collections"}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing {allProducts.length} of {totalCount} products found
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="space-y-6">
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                <span>Filters</span>
              </div>
              {(category || search || brand || minPrice !== undefined || inStock) && (
                <Link
                  href="/products"
                  className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  <span>Reset</span>
                </Link>
              )}
            </div>

            {/* Department / Category Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Department
              </label>
              <div className="space-y-1 text-sm max-h-60 overflow-y-auto pr-1">
                <Link
                  href={`/products?${new URLSearchParams({ ...currentParamsRecord, category: "", page: "1" }).toString()}`}
                  className={`block px-2 py-1 rounded-md text-xs transition-colors ${
                    !category
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  All Categories ({totalCount})
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?${new URLSearchParams({ ...currentParamsRecord, category: c.slug, page: "1" }).toString()}`}
                    className={`block px-2 py-1 rounded-md text-xs transition-colors ${
                      category === c.slug
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Brand
              </label>
              <div className="space-y-1 text-xs">
                {popularBrands.map((b) => (
                  <Link
                    key={b}
                    href={`/products?${new URLSearchParams({
                      ...currentParamsRecord,
                      brand: brand === b ? "" : b,
                      page: "1",
                    }).toString()}`}
                    className={`block px-2 py-1 rounded-md transition-colors ${
                      brand === b
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    {b}
                  </Link>
                ))}
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Link
                href={`/products?${new URLSearchParams({
                  ...currentParamsRecord,
                  inStock: inStock ? "" : "true",
                  page: "1",
                }).toString()}`}
                className="flex items-center justify-between text-xs font-medium cursor-pointer"
              >
                <span>In-Stock Only</span>
                <span
                  className={`h-4 w-4 rounded border flex items-center justify-center ${
                    inStock
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {inStock && "✓"}
                </span>
              </Link>
            </div>

            {/* Redux Throttle Control */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-emerald-600" />
                  Throttle Interval
                </span>
                <span className="text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                  {throttleIntervalMs}ms
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[150, 300, 500].map((ms) => (
                  <button
                    key={ms}
                    type="button"
                    onClick={() => dispatch(setThrottleIntervalMs(ms))}
                    className={`py-1 text-[11px] rounded font-medium transition-colors cursor-pointer ${
                      throttleIntervalMs === ms
                        ? "bg-emerald-600 text-white font-semibold"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                    }`}
                  >
                    {ms}ms
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <section className="lg:col-span-3 space-y-6">
          {/* Top Sort Controls */}
          <div className="flex flex-wrap items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 gap-4">
            <span className="text-xs text-zinc-500 font-medium">Sort results:</span>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {[
                { label: "Newest", value: "newest" },
                { label: "Price: Low to High", value: "price-asc" },
                { label: "Price: High to Low", value: "price-desc" },
                { label: "Highest Rated", value: "rating-desc" },
              ].map((s) => (
                <Link
                  key={s.value}
                  href={`/products?${new URLSearchParams({
                    ...currentParamsRecord,
                    sortBy: s.value,
                    page: "1",
                  }).toString()}`}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    (!sortBy && s.value === "newest") || sortBy === s.value
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Virtualized Product Grid / Empty State */}
          {allProducts.length === 0 && !isLoading ? (
            <div className="text-center py-16 px-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                No products found
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No items match your active filters. Try broadening your criteria or reset filters.
              </p>
              <Link
                href="/products"
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" }),
                  "mt-4 inline-block"
                )}
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <VirtualizedProductGrid
              products={allProducts}
              totalCount={totalCount}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isLoading={isLoading}
              isError={isError}
              error={error as Error | null}
              onLoadMore={triggerFetchNext}
              onRetry={refetch}
              throttleIntervalMs={throttleIntervalMs}
            />
          )} 
          
        </section>
      </div>
    </div>
  );
}
