import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Package, ArrowLeft, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      payments: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="space-y-1">
        <Link href="/account" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Account</span>
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Order History
        </h1>
        <p className="text-xs text-zinc-500">Track and review all previous purchases</p>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">No orders placed yet</h2>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You have not placed any orders yet. Discover our curated collections to place your first order.
          </p>
          <Link href="/products" className={cn(buttonVariants({ size: "sm" }), "inline-block pt-2")}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 shadow-sm">
          {orders.map((order) => (
            <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                    {order.orderNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {order.status}
                  </span>
                  <span className="text-xs text-zinc-400">
                    Payment: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{order.paymentStatus}</span>
                  </span>
                </div>

                <p className="text-xs text-zinc-500">
                  Placed on {formatDate(order.createdAt)} • {order.items.length} items
                </p>

                <div className="flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                  {order.items.map((it) => (
                    <span key={it.id} className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      {it.productName} ({it.quantity})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0">
                <div className="text-right">
                  <p className="text-xs text-zinc-400">Total Amount</p>
                  <p className="text-base font-extrabold text-zinc-900 dark:text-white">
                    {formatPrice(Number(order.totalAmount))}
                  </p>
                </div>
                <Link
                  href={`/account/orders/${order.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1 text-xs")}
                >
                  <span>Order Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
