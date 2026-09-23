import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

interface ConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            select: { images: { take: 1 } },
          },
        },
      },
      addresses: true,
      payments: true,
    },
  });

  if (!order) notFound();

  const shippingAddr = order.addresses.find((a) => a.type === "SHIPPING") || order.addresses[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Success Banner */}
      <div className="text-center space-y-3">
        <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Order Payment Succeeded
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Thank you for your order!
        </h1>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          We have received your order <span className="font-mono font-bold text-zinc-900 dark:text-white">{order.orderNumber}</span>. A receipt has been sent to your registered email.
        </p>
      </div>

      {/* Order Status Pill */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-white">Fulfillment Status: {order.status}</p>
            <p className="text-zinc-500">Estimated Delivery: 2-4 business days</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/account/orders" className={buttonVariants({ variant: "outline", size: "sm" })}>
            View All Orders
          </Link>
          <Link href="/products" className={buttonVariants({ size: "sm" })}>
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Purchased Items */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Items Ordered</h2>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {order.items.map((it) => (
              <div key={it.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-900 dark:text-white">{it.productName}</p>
                  <p className="text-zinc-500">{it.variantTitle} • Qty: {it.quantity}</p>
                </div>
                <span className="font-bold text-zinc-900 dark:text-white">{formatPrice(Number(it.totalAmount))}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Promotional Discount</span>
                <span>-{formatPrice(Number(order.discountAmount))}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500">
              <span>Sales Tax</span>
              <span>{formatPrice(Number(order.taxAmount))}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Shipping</span>
              <span>{Number(order.shippingAmount) === 0 ? "FREE" : formatPrice(Number(order.shippingAmount))}</span>
            </div>
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-extrabold text-sm text-zinc-900 dark:text-white">
              <span>Total Paid</span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatPrice(Number(order.totalAmount))}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Summary */}
        <div className="space-y-6">
          {shippingAddr && (
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 text-xs">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>Shipping Address</span>
              </h2>
              <p className="font-semibold text-zinc-900 dark:text-white pt-1">
                {shippingAddr.firstName} {shippingAddr.lastName}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">{shippingAddr.addressLine1}</p>
              {shippingAddr.addressLine2 && <p className="text-zinc-600 dark:text-zinc-400">{shippingAddr.addressLine2}</p>}
              <p className="text-zinc-600 dark:text-zinc-400">
                {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}
              </p>
              <p className="text-zinc-500 pt-1">Phone: {shippingAddr.phone}</p>
            </div>
          )}

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 text-xs">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Payment Method</h2>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Status</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Payment Gateway</span>
              <span className="font-medium text-zinc-900 dark:text-white">Mock Payment Provider</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Date Processed</span>
              <span className="font-medium text-zinc-900 dark:text-white">{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
