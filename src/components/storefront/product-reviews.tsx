"use client";

import * as React from "react";
import { Star, ShieldCheck, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface ProductReviewsProps {
  productId: string;
  initialReviews: any[];
  ratingAverage: number;
  ratingCount: number;
}

export function ProductReviews({
  productId,
  initialReviews,
  ratingAverage,
  ratingCount,
}: ProductReviewsProps) {
  const [reviews, setReviews] = React.useState(initialReviews);
  const [rating, setRating] = React.useState(5);
  const [title, setTitle] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          title,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to submit review. You must be signed in.");
      }

      setSubmitSuccess(true);
      setReviews([data.data, ...reviews]);
      setTitle("");
      setComment("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Could not submit review");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pt-12 border-t border-zinc-200 dark:border-zinc-800">
      {/* Header & Rating Breakdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Customer Reviews</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${
                    s <= Math.round(ratingAverage)
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-300 dark:text-zinc-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              {Number(ratingAverage).toFixed(1)} out of 5
            </span>
            <span className="text-sm text-zinc-500">({ratingCount} verified reviews)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left 2 Cols: Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <p className="text-sm text-zinc-500 py-6">No customer reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((rev: any) => (
              <div
                key={rev.id}
                className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {rev.user?.firstName?.charAt(0) || "U"}
                    </div>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                      {rev.user?.firstName} {rev.user?.lastName}
                    </span>
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="h-3 w-3" />
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-400">{formatDate(rev.createdAt)}</span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-700"
                      }`}
                    />
                  ))}
                  <h4 className="ml-2 text-xs font-bold text-zinc-900 dark:text-white">{rev.title}</h4>
                </div>

                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{rev.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Right 1 Col: Write a Review Form */}
        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4 h-fit">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Write a Review</h3>
            <p className="text-xs text-zinc-500">Share your thoughts and feedback with fellow shoppers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {submitError && (
              <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/50 rounded-md border border-red-200 dark:border-red-900 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="p-3 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 rounded-md border border-emerald-200 dark:border-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Thank you! Your review has been submitted.</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Headline</label>
              <Input
                placeholder="Key takeaway in a few words"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Detailed Feedback</label>
              <textarea
                rows={3}
                placeholder="How did the product perform? Fit, finish, acoustics, battery?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <Button type="submit" size="sm" className="w-full" isLoading={isSubmitting}>
              Submit Review
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
