"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { PaginatedResult } from "../product.types";

export interface ProductsQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sortBy?: "newest" | "price-asc" | "price-desc" | "rating-desc" | "name-asc";
  limit?: number;
}

export function buildProductsQueryString(
  params: ProductsQueryParams,
  page: number
): string {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.category) searchParams.set("category", params.category);
  if (params.brand) searchParams.set("brand", params.brand);
  if (params.minPrice !== undefined && !isNaN(params.minPrice))
    searchParams.set("minPrice", params.minPrice.toString());
  if (params.maxPrice !== undefined && !isNaN(params.maxPrice))
    searchParams.set("maxPrice", params.maxPrice.toString());
  if (params.minRating !== undefined && !isNaN(params.minRating))
    searchParams.set("minRating", params.minRating.toString());
  if (params.inStock) searchParams.set("inStock", "true");
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  searchParams.set("page", page.toString());
  searchParams.set("limit", (params.limit || 24).toString());

  return searchParams.toString();
}

export async function fetchProductsPage(
  params: ProductsQueryParams,
  page: number
): Promise<PaginatedResult<any>> {
  const qs = buildProductsQueryString(params, page);
  const response = await fetch(`/api/products?${qs}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  const json = await response.json();
  if (!json.success || !json.data) {
    throw new Error(json.error?.message || "Failed to parse product data");
  }
  return json.data;
}

export function useInfiniteProductsQuery(
  params: ProductsQueryParams,
  initialData?: PaginatedResult<any>
) {
  return useInfiniteQuery({
    queryKey: ["products", params],
    queryFn: ({ pageParam = 1 }) => fetchProductsPage(params, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [1],
        }
      : undefined,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useProductBySlugQuery(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch product details");
      const json = await res.json();
      return json.data;
    },
    enabled: Boolean(slug),
    staleTime: 60 * 1000,
  });
}
