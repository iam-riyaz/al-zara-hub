import Link from "next/link";
import { AdminAnalyticsService } from "@/features/admin/analytics.service";
import { formatPrice, formatDate } from "@/lib/utils";
import { DollarSign, ShoppingBag, Package, Users, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminOverviewPage() {
  const metrics = await AdminAnalyticsService.getOverviewMetrics();

  const statCards = [
    {
      label: "Total Sales Revenue",
      value: formatPrice(metrics.totalRevenue),
      subtext: `Avg order value: ${formatPrice(metrics.averageOrderValue)}`,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      label: "Total Orders",
      value: metrics.totalOrders.toString(),
      subtext: `${metrics.pendingOrders} pending confirmation`,
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
    },
    {
      label: "Active Products",
      value: metrics.totalProducts.toString(),
      subtext: "Across 12 categories",
      icon: Package,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
    },
    {
      label: "Registered Customers",
      value: metrics.totalUsers.toString(),
      subtext: "Verified user accounts",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50",
    },
    {
      label: "Low-Stock Alerts",
      value: metrics.lowStockCount.toString(),
      subtext: "Variants ≤ 5 units available",
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
    },
    {
      label: "Pending Orders",
      value: metrics.pendingOrders.toString(),
      subtext: "Require processing / pickup",
      icon: Clock,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Executive Overview
        </h1>
        <p className="text-xs text-zinc-500">Live platform operations and commercial performance analytics</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two columns: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              View All Orders →
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {metrics.recentOrders.map((o: any) => (
              <div key={o.id} className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">{o.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-zinc-500">
                    {o.user?.firstName} {o.user?.lastName} ({o.user?.email})
                  </p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="font-bold text-zinc-900 dark:text-white">{formatPrice(Number(o.totalAmount))}</p>
                  <p className="text-[10px] text-zinc-400">{formatDate(o.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Top Performing Products</h2>
            <Link href="/admin/products" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              Manage Products →
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {metrics.topProducts.map((tp: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-900 dark:text-white">{tp.productName}</p>
                  <p className="text-zinc-500">Units Sold: {tp._sum.quantity || 0}</p>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(Number(tp._sum.totalAmount || 0))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
