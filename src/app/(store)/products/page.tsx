import { ProductService } from "@/features/products/product.service";
import { CategoryService } from "@/features/categories/category.service";
import { ProductCatalogClient } from "@/components/storefront/product-catalog-client";

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

  const [rawProductsResult, categories] = await Promise.all([
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
      limit: 24,
    }),
    CategoryService.getAll(),
  ]);

  // Safely serialize Prisma Decimals and Dates for client hydration
  const initialData = JSON.parse(JSON.stringify(rawProductsResult));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  const popularBrands = [
    "Acoustix",
    "Apex Computes",
    "Atelier Zara",
    "Chronos",
    "Crema & Co",
    "VeloSport",
    "Roam Gear",
  ];

  return (
    <ProductCatalogClient
      initialData={initialData}
      categories={serializedCategories}
      popularBrands={popularBrands}
      initialParams={params}
    />
  );
}
