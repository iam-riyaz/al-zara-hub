import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ProductService } from "@/features/products/product.service";
import { ProductDetailsClient } from "@/components/storefront/product-details-client";
import { ProductReviews } from "@/components/storefront/product-reviews";
import { ProductCard } from "@/components/storefront/product-card";
import { ChevronRight } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await ProductService.getBySlug(slug);
    return {
      title: `${product.name} | Al-Zara Hub`,
      description: product.shortDescription || product.description.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.shortDescription || product.description.slice(0, 160),
        images: product.images.map((img) => img.url),
      },
    };
  } catch {
    return {
      title: "Product Not Found | Al-Zara Hub",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: any;
  try {
    product = await ProductService.getBySlug(slug);
  } catch (error) {
    notFound();
  }

  const relatedProducts = await ProductService.getRelated(product.id, product.categoryId, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 font-medium overflow-x-auto">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        <Link href="/products" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        <span className="text-zinc-900 dark:text-white font-semibold truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase */}
      <ProductDetailsClient product={product} />

      {/* Full Description & Specifications Tab */}
      <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Product Overview & Specs</h2>
        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          <p>{product.description}</p>
        </div>

        {/* Specifications Table */}
        <div className="max-w-2xl rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs">
          <div className="grid grid-cols-2 p-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-white">
            <span>Property</span>
            <span>Specification</span>
          </div>
          <div className="grid grid-cols-2 p-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <span className="text-zinc-500">Brand</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{product.brand || "Al-Zara Studio"}</span>
          </div>
          <div className="grid grid-cols-2 p-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <span className="text-zinc-500">Base SKU</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200">{product.sku}</span>
          </div>
          <div className="grid grid-cols-2 p-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <span className="text-zinc-500">Standard Tax Rate</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{(Number(product.taxRate) * 100).toFixed(0)}% VAT / Sales Tax</span>
          </div>
          <div className="grid grid-cols-2 p-3">
            <span className="text-zinc-500">Warranty Protection</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">2-Year International Limited Warranty</span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ProductReviews
        productId={product.id}
        initialReviews={product.reviews || []}
        ratingAverage={Number(product.ratingAverage || 0)}
        ratingCount={product.ratingCount || 0}
      />

      {/* Related Products Recommendations */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">You May Also Like</h2>
            <Link
              href={`/products?category=${product.category?.slug}`}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              More from {product.category?.name} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel: any) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
