import Link from "next/link";
import { ProductService } from "@/features/products/product.service";
import { CategoryService } from "@/features/categories/category.service";
import { ProductCard } from "@/components/storefront/product-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, Star, Zap, Shield, Heart } from "lucide-react";

export const revalidate = 60; // ISR cache revalidation every 60s

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    ProductService.getFeatured(8),
    CategoryService.getAll(),
  ]);

  const rootCategories = categories.filter((c) => !c.parent).slice(0, 4);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-zinc-50 to-zinc-50 dark:from-emerald-950/20 dark:via-zinc-950 dark:to-zinc-950 py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next-Gen Enterprise Commerce Architecture</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                Curated Design. <br />
                <span className="text-emerald-600 dark:text-emerald-400">Peak Performance.</span> <br />
                Modern Living.
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto lg:mx-0">
                Discover artisan audio headphones, ergonomic computing setups, luxury wardrobe staples, and intelligent home gear engineered without compromise.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products"
                  className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto font-semibold gap-2 shadow-lg shadow-emerald-600/20")}
                >
                  <span>Explore All Collections</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products?category=audio-headphones"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto font-semibold")}
                >
                  Browse Audio Gear
                </Link>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">40+</p>
                  <p className="text-xs text-zinc-500">Curated Products</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">4.9★</p>
                  <p className="text-xs text-zinc-500">Verified Reviews</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$0.00</p>
                  <p className="text-xs text-zinc-500">100% Free Stack</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
                  alt="Aura Pro ANC Headphones"
                  className="w-full h-80 sm:h-96 object-cover object-center hover:scale-105 transition-transform duration-700"
                />
                <div className="p-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Featured Spotlight
                    </span>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-zinc-900 dark:text-white">4.9 (48 reviews)</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Aura Pro Wireless ANC Headphones
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    Studio-grade titanium drivers with 45-hour playback, multipoint pairing, and cloud-soft memory foam.
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xl font-bold text-zinc-900 dark:text-white">$299.99</span>
                    <Link
                      href="/products/aura-pro-wireless-anc-headphones"
                      className={cn(buttonVariants({ size: "sm" }), "text-xs font-semibold")}
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Browse by Department
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Explore meticulously engineered essentials tailored for your daily routine
            </p>
          </div>
          <Link href="/categories" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
            <span>View All Categories</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rootCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-6 flex flex-col justify-between h-48 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-zinc-500 line-clamp-2">{category.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                <span>{category._count?.products || 0} Products</span>
                <span className="p-1 rounded-full bg-white dark:bg-zinc-800 shadow-xs group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured & Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <Zap className="h-3.5 w-3.5" />
              <span>Handpicked Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Featured Trending Pieces
            </h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
            <span>Explore Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>

      {/* 4. Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-zinc-900 dark:bg-emerald-950 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl border border-zinc-800 dark:border-emerald-900">
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              Exclusive Welcome Offer
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Take 10% Off Your First Order.
            </h3>
            <p className="text-sm sm:text-base text-zinc-300">
              Apply promotional code <span className="font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-emerald-300">WELCOME10</span> at checkout for instant savings across all departments.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className={cn(buttonVariants({ size: "lg" }), "bg-white text-zinc-900 hover:bg-zinc-100 font-semibold shadow-md")}
              >
                Shop Curated Pieces Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
