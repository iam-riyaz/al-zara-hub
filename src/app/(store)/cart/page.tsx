"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/features/cart/cart-context";

export default function CartPage() {
  const router = useRouter();
  const { refreshCart } = useCart();

  const [cart, setCart] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [updatingItemId, setUpdatingItemId] = React.useState<string | null>(null);
  const [couponCode, setCouponCode] = React.useState("");
  const [couponMessage, setCouponMessage] = React.useState<string | null>(null);

  const fetchCart = React.useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCart(data.data);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    setUpdatingItemId(itemId);
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCart(data.data);
          await refreshCart();
        }
      }
    } catch {
      // ignore
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdatingItemId(itemId);
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCart(data.data);
          await refreshCart();
        }
      }
    } catch {
      // ignore
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Loading shopping bag...
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Your shopping bag is empty</h2>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto">
          You haven&apos;t added any items to your bag yet. Explore our curated collections to get started.
        </p>
        <div className="pt-2">
          <Link
            href="/products"
            className={cn(buttonVariants({ size: "lg" }), "font-semibold")}
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Shopping Bag</h1>
        <p className="text-xs text-zinc-500">{cart.itemCount} items ready for checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left 2 Cols: Cart Line Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map((item: any) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                    <img
                      src={item.product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <Link href={`/products/${item.product.slug}`} className="hover:text-emerald-600 transition-colors">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-1">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-zinc-500">{item.product.variantTitle}</p>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                      {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden h-8 bg-white dark:bg-zinc-900 text-xs">
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                      disabled={updatingItemId === item.id || item.quantity <= 1}
                      className="px-2.5 py-1 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-zinc-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                      disabled={updatingItemId === item.id || item.quantity >= item.availableQuantity}
                      className="px-2.5 py-1 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={updatingItemId === item.id}
                    className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-zinc-500 pt-2">
            <Link href="/products" className="hover:text-emerald-600 transition-colors font-medium">
              ← Continue Shopping
            </Link>
            <span>All prices verified server-side</span>
          </div>
        </div>

        {/* Right 1 Col: Order Summary */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Order Summary</h2>

          {/* Calculations */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Estimated Sales Tax (8%)</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{formatPrice(cart.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Shipping</span>
              <span className="font-semibold text-zinc-900 dark:text-white">
                {cart.shippingAmount === 0 ? "FREE" : formatPrice(cart.shippingAmount)}
              </span>
            </div>
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-sm font-extrabold text-zinc-900 dark:text-white">
              <span>Estimated Total</span>
              <span className="text-base text-emerald-600 dark:text-emerald-400">{formatPrice(cart.totalAmount)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className={cn(buttonVariants({ size: "lg" }), "w-full font-semibold gap-2 shadow-lg shadow-emerald-600/20 flex items-center justify-center")}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Trust guarantee */}
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex items-center gap-2.5 text-[11px] text-zinc-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Bank-level 256-bit encryption. 30-day money-back guarantee.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
