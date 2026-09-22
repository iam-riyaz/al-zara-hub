"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, CreditCard, Tag, CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/features/cart/cart-context";

export default function CheckoutPage() {
  const router = useRouter();
  const { refreshCart } = useCart();

  const [cart, setCart] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Form State
  const [shippingAddress, setShippingAddress] = React.useState({
    firstName: "Alex",
    lastName: "Chen",
    phone: "+1-555-0201",
    addressLine1: "450 Townsend St",
    addressLine2: "Apt 4B",
    city: "San Francisco",
    state: "CA",
    postalCode: "94107",
    country: "US",
  });

  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<any>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false);

  const [simulateFailure, setSimulateFailure] = React.useState(false);

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !cart) return;
    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: cart.subtotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Invalid coupon code");
      }

      setAppliedCoupon(data.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCouponError(err.message);
      } else {
        setCouponError("Could not validate coupon");
      }
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;

    setIsPlacingOrder(true);
    setErrorMessage(null);

    try {
      // 1. Phase 1: Checkout API (reserves inventory, creates pending order)
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress,
          couponCode: appliedCoupon?.code,
          idempotencyKey: `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok || !checkoutData.success) {
        throw new Error(checkoutData.error?.message || "Checkout failed. Please review your details.");
      }

      const order = checkoutData.data.order;
      const paymentIntent = checkoutData.data.paymentIntent;

      // 2. Phase 2: Confirm Payment (or simulate decline)
      const confirmRes = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          transactionId: paymentIntent.transactionId,
          simulateFailure,
        }),
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok || !confirmData.success) {
        throw new Error(confirmData.error?.message || "Payment declined");
      }

      await refreshCart();
      router.push(`/checkout/confirmation/${order.orderNumber}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An error occurred during checkout processing");
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Preparing secure checkout...
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const discount = appliedCoupon?.calculatedDiscount || 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.08 * 100) / 100;
  const shipping = subtotal > 150 ? 0 : 15.0;
  const finalTotal = Math.round((taxableAmount + tax + shipping) * 100) / 100;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <Link href="/products">
          <Button size="sm">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Bag</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Secure Checkout
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="h-4 w-4" />
          <span>256-Bit Encrypted</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left 2 Cols: Form Steps */}
        <div className="lg:col-span-2 space-y-8">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Shipping Address */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Shipping Address</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">First Name</label>
                <Input
                  value={shippingAddress.firstName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Last Name</label>
                <Input
                  value={shippingAddress.lastName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Street Address</label>
              <Input
                value={shippingAddress.addressLine1}
                onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">City</label>
                <Input
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">State</label>
                <Input
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">ZIP Code</label>
                <Input
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Phone for Delivery Updates</label>
              <Input
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* 2. Payment Method (Mock Payment Provider) */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Payment Method</h2>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">Mock Payment Provider</span>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Zero-Cost Sandbox
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                This environment simulates complete credit card and gateway settlement with atomic stock reservation and webhook verification.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <Input placeholder="4242 •••• •••• 4242" defaultValue="4242 •••• •••• 4242" disabled />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="12/28" defaultValue="12/28" disabled />
                  <Input placeholder="888" defaultValue="888" disabled />
                </div>
              </div>

              {/* Simulation outcome toggle for testing */}
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between text-xs">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">Gateway simulation outcome:</span>
                <button
                  type="button"
                  onClick={() => setSimulateFailure(!simulateFailure)}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                    simulateFailure ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                  }`}
                >
                  {simulateFailure ? "Simulate: Card Decline" : "Simulate: Success (Approved)"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Order Confirmation */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Order Summary</h2>

          {/* Items Preview */}
          <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800 max-h-60 overflow-y-auto pr-1">
            {items.map((item: any) => (
              <div key={item.id} className="pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80"}
                    alt=""
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white line-clamp-1">{item.product.name}</p>
                    <p className="text-zinc-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-zinc-900 dark:text-white">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          {/* Coupon Input */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Promo code (e.g. WELCOME10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="text-xs uppercase"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyCoupon}
                isLoading={isApplyingCoupon}
                className="shrink-0"
              >
                Apply
              </Button>
            </div>
            {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
            {appliedCoupon && (
              <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{appliedCoupon.message}</span>
              </div>
            )}
          </div>

          {/* Calculation lines */}
          <div className="space-y-2 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500">
              <span>Sales Tax (8%)</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Express Delivery</span>
              <span className="font-semibold text-zinc-900 dark:text-white">
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </span>
            </div>
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-sm font-extrabold text-zinc-900 dark:text-white">
              <span>Total Due</span>
              <span className="text-base text-emerald-600 dark:text-emerald-400">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full font-semibold shadow-lg shadow-emerald-600/20"
            isLoading={isPlacingOrder}
          >
            Authorize & Place Order
          </Button>
        </div>
      </form>
    </div>
  );
}
