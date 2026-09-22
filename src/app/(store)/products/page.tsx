import Link from "next/link";
import { ProductService } from "@/features/products/product.service";
import { CategoryService } from "@/features/categories/category.service";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    inStock?: string;
    sortBy?: "newest" | "price-asc" | "price-desc" | "rating-desc" | "name-asc";
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const minRating = params.minRating ? parseFloat(params.minRating) : undefined;
  const inStockOnly = params.inStock === "true";

  const [productsResult, categories] = await Promise.all([
    ProductService.list({
      search: params.search,
      categorySlug: params.category,
      brand: params.brand,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      sortBy: params.sortBy,
      page,
      limit: 12,
    }),
    CategoryService.getAll(),
  ]);

  const { items, total, totalPages, hasNextPage, hasPrevPage } = productsResult;

  // Collect unique brands from categories for filter list
  const popularBrands = ["Acoustix", "Apex Computes", "Atelier Zara", "Chronos", "Crema & Co", "VeloSport", "Roam Gear"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header / Title */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {params.category
            ? categories.find((c) => c.slug === params.category)?.name || "Category Products"
            : params.search
            ? `Search Results for "${params.search}"`
            : "All Collections"}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing {items.length} of {total} products found
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
              {(params.category || params.search || params.brand || params.minPrice || params.inStock) && (
                <Link href="/products" className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
                  <X className="h-3 w-3" />
                  <span>Reset</span>
                </Link>
              )}
            </div>

            {/* Department / Category Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Department</label>
              <div className="space-y-1 text-sm">
                <Link
                  href={`/products?${new URLSearchParams({ ...params, category: "", page: "1" }).toString()}`}
                  className={`block px-2 py-1 rounded-md text-xs transition-colors ${!params.category ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"}`}
                >
                  All Categories ({total})
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?${new URLSearchParams({ ...params, category: c.slug, page: "1" }).toString()}`}
                    className={`block px-2 py-1 rounded-md text-xs transition-colors ${params.category === c.slug ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"}`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Brand</label>
              <div className="space-y-1 text-xs">
                {popularBrands.map((b) => (
                  <Link
                    key={b}
                    href={`/products?${new URLSearchParams({ ...params, brand: params.brand === b ? "" : b, page: "1" }).toString()}`}
                    className={`block px-2 py-1 rounded-md transition-colors ${params.brand === b ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"}`}
                  >
                    {b}
                  </Link>
                ))}
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Link
                href={`/products?${new URLSearchParams({ ...params, inStock: inStockOnly ? "" : "true", page: "1" }).toString()}`}
                className="flex items-center justify-between text-xs font-medium cursor-pointer"
              >
                <span>In-Stock Only</span>
                <span className={`h-4 w-4 rounded border flex items-center justify-center ${inStockOnly ? "bg-emerald-600 border-emerald-600 text-white" : "border-zinc-300 dark:border-zinc-700"}`}>
                  {inStockOnly && "✓"}
                </span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <section className="lg:col-span-3 space-y-6">
          {/* Top Sort Controls */}
          <div className="flex flex-wrap items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 gap-4">
            <span className="text-xs text-zinc-500 font-medium">Sort results:</span>
            <div className="flex items-center gap-2 text-xs">
              {[
                { label: "Newest", value: "newest" },
                { label: "Price: Low to High", value: "price-asc" },
                { label: "Price: High to Low", value: "price-desc" },
                { label: "Highest Rated", value: "rating-desc" },
              ].map((s) => (
                <Link
                  key={s.value}
                  href={`/products?${new URLSearchParams({ ...params, sortBy: s.value, page: "1" }).toString()}`}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${(!params.sortBy && s.value === "newest") || params.sortBy === s.value ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"}`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Product Items */}
          {items.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No products found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No items match your active filters. Try broadening your criteria or reset filters.
              </p>
              <Link href="/products" className="mt-4 inline-block">
                <Button size="sm" variant="outline">
                  Clear All Filters
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              {hasPrevPage && (
                <Link href={`/products?${new URLSearchParams({ ...params, page: (page - 1).toString() }).toString()}`}>
                  <Button variant="outline" size="sm">Previous</Button>
                </Link>
              )}
              <span className="text-xs text-zinc-500 font-medium px-2">
                Page {page} of {totalPages}
              </span>
              {hasNextPage && (
                <Link href={`/products?${new URLSearchParams({ ...params, page: (page + 1).toString() }).toString()}`}>
                  <Button variant="outline" size="sm">Next</Button>
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
