"use client";

import * as React from "react";
import { Star, ShieldCheck, Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const fetchReviews = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        // Fetch products and collect reviews
        const prodData = await res.json();
        // Alternatively, fetch reviews directly or from products
        const revs: any[] = [];
        for (const p of prodData.data || []) {
          const detailRes = await fetch(`/api/products/${p.slug}`);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            for (const r of detailData.data?.reviews || []) {
              revs.push({ ...r, productName: p.name, productSlug: p.slug });
            }
          }
        }
        setReviews(revs);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleModerate = async (reviewId: string, status: "APPROVED" | "REJECTED") => {
    setUpdatingId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
        );
      }
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Customer Review Moderation
          </h1>
          <p className="text-xs text-zinc-500">Review feedback submissions and safeguard community rating credibility</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReviews} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Review Content</th>
                <th className="p-4">Status</th>
                <th className="p-4">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 font-bold text-zinc-900 dark:text-white max-w-[150px] truncate">
                    {rev.productName}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {rev.user?.firstName} {rev.user?.lastName}
                    </p>
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{rev.rating}</span>
                    </div>
                  </td>
                  <td className="p-4 max-w-sm">
                    <p className="font-bold text-zinc-900 dark:text-white line-clamp-1">{rev.title}</p>
                    <p className="text-[11px] text-zinc-500 line-clamp-2">{rev.comment}</p>
                  </td>
                  <td className="p-4">
                    <Badge variant={rev.status === "APPROVED" ? "success" : "secondary"} className="text-[10px]">
                      {rev.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs font-semibold text-emerald-600 border-emerald-300 dark:border-emerald-800"
                        disabled={updatingId === rev.id || rev.status === "APPROVED"}
                        onClick={() => handleModerate(rev.id, "APPROVED")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs font-semibold text-red-600 border-red-300 dark:border-red-900"
                        disabled={updatingId === rev.id || rev.status === "REJECTED"}
                        onClick={() => handleModerate(rev.id, "REJECTED")}
                      >
                        Reject
                      </Button>
                    </div>
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
