"use client";

import * as React from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, CheckCircle2, AlertCircle, RefreshCw, Search } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
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

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const orderNum = (o.orderNumber || "").toLowerCase();
    const email = (o.user?.email || "").toLowerCase();
    const firstName = (o.user?.firstName || "").toLowerCase();
    const lastName = (o.user?.lastName || "").toLowerCase();
    const shippingName = (o.addresses?.[0]?.firstName || "").toLowerCase() + " " + (o.addresses?.[0]?.lastName || "").toLowerCase();

    return (
      orderNum.includes(q) ||
      email.includes(q) ||
      firstName.includes(q) ||
      lastName.includes(q) ||
      shippingName.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Order Fulfillment & Tracking
          </h1>
          <p className="text-xs text-zinc-500">Supervise order processing, carrier dispatch, and lifecycle state machines</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 text-xs">
          {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {st} ({st === "ALL" ? orders.length : orders.filter((o) => o.status === st).length})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Search ref, customer, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs"
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
        </div>
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
              {isLoading && orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>Loading platform orders...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300">No orders found</p>
                    <p className="text-[11px] text-zinc-400">
                      {searchQuery ? "Try refining your search terms or filters" : "Orders placed by customers will appear here."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const customerName = order.user?.firstName
                    ? `${order.user.firstName} ${order.user.lastName || ""}`.trim()
                    : order.addresses?.[0]?.firstName
                    ? `${order.addresses[0].firstName} ${order.addresses[0].lastName || ""}`.trim()
                    : "Customer";

                  const customerEmail = order.user?.email || "Guest Checkout";
                  const destination = order.addresses?.[0]?.city
                    ? `${order.addresses[0].city}, ${order.addresses[0].state || order.addresses[0].country}`
                    : null;

                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-zinc-900 dark:text-white">
                        {order.orderNumber}
                      </td>
                      <td className="p-4 text-zinc-500 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="p-4 text-zinc-700 dark:text-zinc-300">
                        <p className="font-semibold text-zinc-900 dark:text-white">{customerName}</p>
                        <p className="text-[10px] text-zinc-400">{customerEmail}</p>
                        {destination && (
                          <p className="text-[10px] text-zinc-400">{destination}</p>
                        )}
                      </td>
                      <td className="p-4 text-zinc-500 whitespace-nowrap">
                        {order.items?.length || 1} items
                      </td>
                      <td className="p-4 font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                        {formatPrice(Number(order.totalAmount))}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"} className="text-[10px]">
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[11px]">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
