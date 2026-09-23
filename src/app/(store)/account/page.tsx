import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { User, Package, MapPin, Heart, Shield, ArrowRight } from "lucide-react";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/account");

  const [orders, addresses] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { items: true },
    }),
    prisma.address.findMany({
      where: { userId: user.id },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            My Account
          </h1>
          <p className="text-xs text-zinc-500">Welcome back, {user.firstName} {user.lastName}</p>
        </div>
        {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
          <Link
            href="/admin"
            className={cn(buttonVariants({ variant: "outline" }), "text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 gap-1.5 text-xs font-semibold")}
          >
            <Shield className="h-4 w-4" />
            <span>Open Admin Dashboard</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center">
              {user.firstName[0]}
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">{user.firstName} {user.lastName}</h2>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Account Role</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{user.role}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Member Since</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Saved Addresses</span>
            </h2>
            <span className="text-xs text-zinc-500">{addresses.length} saved</span>
          </div>

          {addresses.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4">No addresses saved yet.</p>
          ) : (
            <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {addresses.map((a) => (
                <div key={a.id} className="pt-2 space-y-0.5">
                  <p className="font-semibold text-zinc-900 dark:text-white">{a.addressLine1}</p>
                  <p className="text-zinc-500">{a.city}, {a.state} {a.postalCode}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-sm text-xs font-semibold">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white pb-1">Quick Access</h2>
          <Link href="/account/orders" className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between transition-colors">
            <span className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
              <Package className="h-4 w-4 text-emerald-600" />
              <span>Order History</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          </Link>
          <Link href="/wishlist" className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between transition-colors">
            <span className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
              <Heart className="h-4 w-4 text-emerald-600" />
              <span>My Wishlist</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            View All Orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 text-center text-xs text-zinc-500">
            No orders placed yet.
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {orders.map((o) => (
              <div key={o.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">{o.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-zinc-500">{o.items.length} items • Placed on {formatDate(o.createdAt)}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">{formatPrice(Number(o.totalAmount))}</span>
                  <Link
                    href={`/account/orders/${o.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
