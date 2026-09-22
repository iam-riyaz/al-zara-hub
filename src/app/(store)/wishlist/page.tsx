"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-context";
import { useWishlist } from "@/features/wishlist/wishlist-context";

export default function WishlistPage() {
  const { refreshCart } = useCart();
  const { refreshWishlist } = useWishlist();

  const [wishlist, setWishlist] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  const fetchWishlist = React.useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setWishlist(data.data);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId: string) => {
    setActionLoadingId(productId);
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        await fetchWishlist();
        await refreshWishlist();
      }
    } catch {
      // ignore
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMoveToCart = async (productId: string, variantId?: string) => {
    setActionLoadingId(productId);
    try {
      const res = await fetch("/api/wishlist/move-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId }),
      });
      if (res.ok) {
        await fetchWishlist();
        await refreshWishlist();
        await refreshCart();
      }
    } catch {
      // ignore
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Loading saved items...
      </div>
    );
  }

  const items = wishlist?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-500">
          <Heart className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Your wishlist is empty</h2>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto">
          Save pieces you love to track pricing and purchase later when you&apos;re ready.
        </p>
        <div className="pt-2">
          <Link href="/products">
            <Button size="lg" className="font-semibold">
              Discover Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">My Wishlist</h1>
        <p className="text-xs text-zinc-500">{items.length} pieces saved to your personal collection</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item: any) => {
          const product = item.product;
          const defaultVariant = product.variants?.[0];
          const primaryImage = product.images?.[0]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80";

          return (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col justify-between shadow-2xs group"
            >
              <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <Link href={`/products/${product.slug}`}>
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button
                  onClick={() => handleRemove(product.id)}
                  disabled={actionLoadingId === product.id}
                  className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center text-zinc-400 hover:text-red-500 shadow-sm transition-colors cursor-pointer"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white hover:text-emerald-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    {formatPrice(product.basePrice)}
                  </p>
                </div>

                <Button
                  size="sm"
                  className="w-full gap-2 text-xs font-semibold"
                  onClick={() => handleMoveToCart(product.id, defaultVariant?.id)}
                  isLoading={actionLoadingId === product.id}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Move to Cart</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
