"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Heart, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/features/wishlist/wishlist-context";
import { useCart } from "@/features/cart/cart-context";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    brand?: string | null;
    basePrice: string | number;
    compareAtPrice?: string | number | null;
    ratingAverage?: string | number;
    ratingCount?: number;
    category?: { name: string; slug: string } | null;
    images?: { url: string; altText?: string | null }[];
    variants?: { id: string; price: string | number; inventory?: { availableQuantity: number } | null }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { refreshCart } = useCart();
  const [isAdding, setIsAdding] = React.useState(false);
  const [addedSuccess, setAddedSuccess] = React.useState(false);

  const primaryImage = product.images?.[0]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
  const basePriceNum = typeof product.basePrice === "string" ? parseFloat(product.basePrice) : Number(product.basePrice);
  const comparePriceNum = product.compareAtPrice ? (typeof product.compareAtPrice === "string" ? parseFloat(product.compareAtPrice) : Number(product.compareAtPrice)) : null;
  const ratingNum = product.ratingAverage ? (typeof product.ratingAverage === "string" ? parseFloat(product.ratingAverage) : Number(product.ratingAverage)) : 0;
  const wishlisted = isWishlisted(product.id);

  const discountPercent = comparePriceNum && comparePriceNum > basePriceNum
    ? Math.round(((comparePriceNum - basePriceNum) / comparePriceNum) * 100)
    : null;

  const defaultVariant = product.variants?.[0];
  const isOutOfStock = defaultVariant?.inventory?.availableQuantity === 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!defaultVariant || isOutOfStock) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: defaultVariant.id, quantity: 1 }),
      });

      if (res.ok) {
        await refreshCart();
        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 1500);
      }
    } catch {
      // ignore
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    await toggleWishlist(product.id);
  };

  return (
    <div className="group relative flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Link href={`/products/${product.slug}`}>
          <img
            src={primaryImage}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Discount Badge */}
        {discountPercent && (
          <div className="absolute top-2.5 left-2.5">
            <Badge variant="destructive" className="font-bold text-[11px] shadow-sm">
              -{discountPercent}%
            </Badge>
          </div>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-2.5 left-2.5">
            <Badge variant="secondary" className="font-semibold text-[11px] bg-zinc-900/80 text-white backdrop-blur-sm">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-red-500 dark:hover:text-red-400 shadow-sm transition-colors cursor-pointer"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>

        {/* Quick Add Overlay on Hover */}
        {!isOutOfStock && defaultVariant && (
          <div className="absolute inset-x-2 bottom-2 hidden group-hover:block transition-all">
            <Button
              size="sm"
              className="w-full text-xs font-semibold shadow-md"
              onClick={handleQuickAdd}
              isLoading={isAdding}
            >
              {addedSuccess ? "Added to Bag! ✓" : "Quick Add"}
            </Button>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 p-4 justify-between space-y-2">
        <div className="space-y-1">
          {product.category && (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {product.category.name}
            </span>
          )}

          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              {product.name}
            </h3>
          </Link>

          {product.brand && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.brand}</p>
          )}
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-zinc-900 dark:text-white">
              {formatPrice(basePriceNum)}
            </span>
            {comparePriceNum && comparePriceNum > basePriceNum && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(comparePriceNum)}
              </span>
            )}
          </div>

          {ratingNum > 0 && (
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{ratingNum.toFixed(1)}</span>
              {product.ratingCount ? <span className="text-[10px]">({product.ratingCount})</span> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
