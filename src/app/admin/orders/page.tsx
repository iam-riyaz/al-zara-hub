"use client";

import * as React from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fetchOrders = React.useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setActionMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Status update failed");
      }

      setActionMessage(`Order status successfully updated to ${newStatus}`);
      await fetchOrders();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to update status");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = statusFilter === "ALL"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Order Fulfillment & Tracking
          </h1>
          <p className="text-xs text-zinc-500">Supervise order processing, carrier dispatch, and lifecycle state machines</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {actionMessage && (
        <div className="p-3 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === st
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900"
            }`}
          >
            {st} ({st === "ALL" ? orders.length : orders.filter((o) => o.status === st).length})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 font-mono font-bold text-zinc-900 dark:text-white">{order.orderNumber}</td>
                  <td className="p-4 text-zinc-500">{formatDate(order.createdAt)}</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">
                    {order.user?.firstName ? `${order.user.firstName} ${order.user.lastName}` : "Customer"}
                  </td>
                  <td className="p-4 text-zinc-500">{order.items?.length || 1} items</td>
                  <td className="p-4 font-bold text-zinc-900 dark:text-white">{formatPrice(Number(order.totalAmount))}</td>
                  <td className="p-4">
                    <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"} className="text-[10px]">
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[11px]">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id || ["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs p-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 cursor-pointer"
                    >
                      <option value={order.status} disabled>Update Status...</option>
                      {order.status === "PENDING" && <option value="CONFIRMED">CONFIRMED</option>}
                      {order.status === "CONFIRMED" && <option value="PROCESSING">PROCESSING</option>}
                      {order.status === "PROCESSING" && <option value="SHIPPED">SHIPPED</option>}
                      {order.status === "SHIPPED" && <option value="DELIVERED">DELIVERED</option>}
                      {["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status) && (
                        <option value="CANCELLED">CANCELLED</option>
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
