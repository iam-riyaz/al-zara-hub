"use client";

import * as React from "react";
import { Star, Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Check, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/features/cart/cart-context";
import { useWishlist } from "@/features/wishlist/wishlist-context";

interface ProductDetailsClientProps {
  product: any;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { refreshCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);
  const [addSuccess, setAddSuccess] = React.useState(false);

  const images = product.images || [];
  const variants = product.variants || [];
  const selectedVariant = variants[selectedVariantIndex] || variants[0];
  const availableStock = selectedVariant?.inventory?.availableQuantity ?? 0;
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= (selectedVariant?.inventory?.lowStockThreshold ?? 5);

  const currentPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice);
  const comparePrice = selectedVariant?.compareAtPrice ? Number(selectedVariant.compareAtPrice) : (product.compareAtPrice ? Number(product.compareAtPrice) : null);
  const discountPercent = comparePrice && comparePrice > currentPrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : null;

  const handleAddToCart = async () => {
    if (!selectedVariant || isOutOfStock) return;
    setIsAdding(true);
    setAddSuccess(false);

    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity,
        }),
      });

      if (res.ok) {
        await refreshCart();
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2500);
      }
    } catch {
      // ignore
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
      {/* 1. Left: Image Gallery */}
      <div className="space-y-4">
        {/* Main Display Image */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <img
            src={images[activeImageIndex]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"}
            alt={images[activeImageIndex]?.altText || product.name}
            className="w-full h-full object-cover object-center"
          />
          {discountPercent && (
            <div className="absolute top-4 left-4">
              <Badge variant="destructive" className="text-xs font-bold px-3 py-1 shadow-md">
                Save {discountPercent}%
              </Badge>
            </div>
          )}
        </div>

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img: any, idx: number) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-20 w-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  activeImageIndex === idx
                    ? "border-emerald-600 dark:border-emerald-400 ring-2 ring-emerald-600/30"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Right: Product Details & Controls */}
      <div className="space-y-6">
        {/* Brand & Title */}
        <div className="space-y-2">
          {product.brand && (
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {product.brand}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {product.name}
          </h1>

          {/* Ratings & SKU */}
          <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-zinc-900 dark:text-white">
                {Number(product.ratingAverage || 0).toFixed(1)}
              </span>
              <span>({product.ratingCount || 0} reviews)</span>
            </div>
            <span>•</span>
            <span>SKU: <span className="font-mono text-zinc-700 dark:text-zinc-300">{selectedVariant?.sku || product.sku}</span></span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-3 pt-2">
          <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {formatPrice(currentPrice)}
          </span>
          {comparePrice && comparePrice > currentPrice && (
            <span className="text-lg text-zinc-400 line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* Variants Selector */}
        {variants.length > 1 && (
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Select Option / Variant:
            </label>
            <div className="flex flex-wrap gap-2.5">
              {variants.map((v: any, idx: number) => {
                const isSelected = selectedVariantIndex === idx;
                const vStock = v.inventory?.availableQuantity ?? 0;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariantIndex(idx);
                      setQuantity(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300"
                    } ${vStock <= 0 ? "opacity-40 line-through" : ""}`}
                  >
                    <span>{v.title}</span>
                    {vStock <= 0 && <span className="ml-1 text-[10px] text-red-500">(Sold Out)</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock Badge */}
        <div className="pt-2">
          {isOutOfStock ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Out of Stock</span>
            </div>
          ) : isLowStock ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Only {availableStock} left in stock - order soon!</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Check className="h-3.5 w-3.5" />
              <span>In Stock ({availableStock} units ready to ship)</span>
            </div>
          )}
        </div>

        {/* Quantity & CTA Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          {/* Quantity Selector */}
          <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden h-11 shrink-0 bg-white dark:bg-zinc-900">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="px-3 py-2 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 cursor-pointer"
            >
              -
            </button>
            <span className="w-10 text-center text-sm font-semibold text-zinc-900 dark:text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
              disabled={quantity >= availableStock || isOutOfStock}
              className="px-3 py-2 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="flex-1 font-semibold gap-2 shadow-lg shadow-emerald-600/20 h-11"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            isLoading={isAdding}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{addSuccess ? "Added to Cart! ✓" : isOutOfStock ? "Sold Out" : "Add to Cart"}</span>
          </Button>

          {/* Wishlist Button */}
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-4 cursor-pointer"
            onClick={() => toggleWishlist(product.id)}
            aria-label="Wishlist"
          >
            <Heart className={`h-5 w-5 ${isWishlisted(product.id) ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>

        {/* Trust Guarantees */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-500">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
            <Truck className="h-4 w-4 mx-auto text-emerald-600" />
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">Express Delivery</p>
            <p className="text-[10px]">2-4 business days</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
            <RotateCcw className="h-4 w-4 mx-auto text-emerald-600" />
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">30-Day Returns</p>
            <p className="text-[10px]">Free return label</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
            <ShieldCheck className="h-4 w-4 mx-auto text-emerald-600" />
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">2-Year Warranty</p>
            <p className="text-[10px]">Guaranteed support</p>
          </div>
        </div>
      </div>
    </div>
  );
}
