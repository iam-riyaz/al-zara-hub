"use client";

import * as React from "react";
import { Boxes, AlertTriangle, Check, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminInventoryPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [adjustModal, setAdjustModal] = React.useState<{ variantId: string; currentQty: number; title: string } | null>(null);
  const [newQty, setNewQty] = React.useState(10);
  const [reason, setReason] = React.useState("Warehouse restock intake");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchInventory = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/inventory/${adjustModal.variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newQuantity: newQty,
          reason,
        }),
      });

      if (res.ok) {
        setAdjustModal(null);
        await fetchInventory();
      }
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = products.flatMap((p) =>
    (p.variants || []).map((v: any) => ({
      ...v,
      productName: p.name,
      productSlug: p.slug,
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Inventory & Stock Allocation
          </h1>
          <p className="text-xs text-zinc-500">Atomic real-time warehouse stock tracking and manual adjustments</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInventory} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Stock</span>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="p-4">Variant / Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Available</th>
                <th className="p-4">Reserved</th>
                <th className="p-4">Sold Units</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {variants.map((v) => {
                const avail = v.inventory?.availableQuantity ?? 0;
                const reserved = v.inventory?.reservedQuantity ?? 0;
                const sold = v.inventory?.soldQuantity ?? 0;
                const isLow = avail <= 5 && avail > 0;
                const isOut = avail <= 0;

                return (
                  <tr key={v.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-zinc-900 dark:text-white">{v.productName}</p>
                      <p className="text-[10px] text-zinc-400">{v.title}</p>
                    </td>
                    <td className="p-4 font-mono font-medium text-zinc-700 dark:text-zinc-300">{v.sku}</td>
                    <td className="p-4">
                      <span className={`font-extrabold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-emerald-600"}`}>
                        {avail} units
                      </span>
                    </td>
                    <td className="p-4 font-medium text-zinc-500">{reserved} units</td>
                    <td className="p-4 font-medium text-zinc-700 dark:text-zinc-300">{sold} units</td>
                    <td className="p-4">
                      {isOut ? (
                        <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>
                      ) : isLow ? (
                        <Badge variant="warning" className="text-[10px]">Low Stock Warning</Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px]">Optimal</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2.5"
                        onClick={() => {
                          setAdjustModal({
                            variantId: v.id,
                            currentQty: avail,
                            title: `${v.productName} - ${v.title}`,
                          });
                          setNewQty(avail);
                        }}
                      >
                        Adjust
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Adjust Stock Level</h2>
              <button onClick={() => setAdjustModal(null)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500">{adjustModal.title}</p>

            <form onSubmit={handleAdjustStock} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">New Available Quantity</label>
                <Input
                  type="number"
                  min="0"
                  value={newQty}
                  onChange={(e) => setNewQty(parseInt(e.target.value, 10))}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Audit Adjustment Reason</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Physical cycle count or restock intake"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setAdjustModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Save Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
