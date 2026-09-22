import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { OrderService } from "@/features/orders/order.service";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Truck, Package, Clock, CheckCircle2 } from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let order: any;
  try {
    order = await OrderService.getOrderById(id, user.id);
  } catch {
    notFound();
  }

  const shippingAddr = order.addresses.find((a: any) => a.type === "SHIPPING") || order.addresses[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Orders</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Order {order.orderNumber}
            </h1>
            <p className="text-xs text-zinc-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {order.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Tracking */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-600" />
          <span>Fulfillment & Progress Timeline</span>
        </h2>
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200 dark:before:bg-emerald-900">
          {order.statusHistory.map((sh: any) => (
            <div key={sh.id} className="relative space-y-1">
              <span className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full bg-emerald-600 ring-4 ring-white dark:ring-zinc-900" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{sh.toStatus}</span>
                <span className="text-zinc-400">{formatDate(sh.createdAt)}</span>
              </div>
              {sh.notes && <p className="text-xs text-zinc-600 dark:text-zinc-400">{sh.notes}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Items & Financial Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Ordered Items ({order.items.length})</h2>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {order.items.map((it: any) => (
              <div key={it.id} className="py-4 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-900 dark:text-white">{it.productName}</p>
                  <p className="text-zinc-500">{it.variantTitle} • SKU: {it.variantSku}</p>
                  <p className="text-zinc-500">Qty: {it.quantity} × {formatPrice(Number(it.unitPrice))}</p>
                </div>
                <span className="font-bold text-zinc-900 dark:text-white">{formatPrice(Number(it.totalAmount))}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span>-{formatPrice(Number(order.discountAmount))}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500">
              <span>Sales Tax (8%)</span>
              <span>{formatPrice(Number(order.taxAmount))}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Shipping</span>
              <span>{Number(order.shippingAmount) === 0 ? "FREE" : formatPrice(Number(order.shippingAmount))}</span>
            </div>
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-extrabold text-sm text-zinc-900 dark:text-white">
              <span>Total Amount</span>
              <span className="text-base text-emerald-600 dark:text-emerald-400">{formatPrice(Number(order.totalAmount))}</span>
            </div>
          </div>
        </div>

        {/* Shipping details */}
        {shippingAddr && (
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 text-xs shadow-sm">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span>Delivery Details</span>
            </h2>
            <div className="space-y-1 pt-1 text-zinc-600 dark:text-zinc-400">
              <p className="font-bold text-zinc-900 dark:text-white">{shippingAddr.firstName} {shippingAddr.lastName}</p>
              <p>{shippingAddr.addressLine1}</p>
              {shippingAddr.addressLine2 && <p>{shippingAddr.addressLine2}</p>}
              <p>{shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}</p>
              <p className="pt-2 text-zinc-500">Phone: {shippingAddr.phone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
