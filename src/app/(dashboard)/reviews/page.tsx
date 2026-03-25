"use client";

import {
  Star,
  MessageSquare,
  Download,
  Filter,
  ArrowUpDown,
  ThumbsUp,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { useFetch } from "@/lib/use-fetch";
import { clsx } from "clsx";

interface ReviewData {
  id: string;
  productTitle: string;
  author: string | null;
  rating: number;
  text: string;
  date: string | null;
  verified: boolean;
  helpful: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={clsx("h-3 w-3", i < rating ? "fill-warning text-warning" : "fill-transparent text-text-muted/30")}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { data, loading } = useFetch(
    () =>
      fetch("/api/reviews").then((r) =>
        r.json() as Promise<{
          reviews: ReviewData[];
          stats: { totalReviews: number; avgRating: string; fiveStar: number; lowRated: number };
        }>
      ),
    []
  );

  const reviews = data?.reviews ?? [];
  const stats = data?.stats ?? { totalReviews: 0, avgRating: "0", fiveStar: 0, lowRated: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.75rem] font-extralight tracking-tight text-text-primary">
            <span className="gradient-text font-light">Reviews</span>
          </h2>
          <p className="mt-1 text-[0.85rem] font-light text-text-muted">
            Extracted product reviews from source — stored for export and reference
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 py-2.5 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 py-2.5 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
            <ExternalLink className="h-4 w-4" /> Push to Judge.me
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <p className="text-[0.8rem] font-medium text-warning">Review extraction notice</p>
          <p className="mt-1 text-[0.7rem] font-light text-text-secondary">
            Reviews are collected only where legally and technically permitted. robots.txt and platform terms are respected.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total Reviews" value={stats.totalReviews} change={`From ${reviews.length > 0 ? new Set(reviews.map((r) => r.productTitle)).size : 0} products`} changeType="neutral" icon={MessageSquare} accentColor="purple" />
        <StatCard label="Avg. Rating" value={stats.avgRating} change="Across all products" changeType="positive" icon={Star} accentColor="yellow" />
        <StatCard label="5-Star" value={stats.fiveStar} change={stats.totalReviews > 0 ? `${Math.round((stats.fiveStar / stats.totalReviews) * 100)}% of total` : "—"} changeType="positive" icon={ThumbsUp} accentColor="green" />
        <StatCard label="Low Rated" value={stats.lowRated} change="< 3 stars" changeType={stats.lowRated > 0 ? "negative" : "neutral"} icon={AlertCircle} accentColor="red" />
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-10 items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
          <Filter className="h-3.5 w-3.5" /> Filter by Product
        </button>
        <button className="flex h-10 items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
          <ArrowUpDown className="h-3.5 w-3.5" /> Sort by Rating
        </button>
        <div className="ml-auto text-[0.65rem] font-light text-text-muted">
          Showing {reviews.length} of {stats.totalReviews} reviews
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl border border-border-primary bg-bg-card p-5">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[0.85rem] font-light text-text-primary">{review.productTitle}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    <span className="text-[0.65rem] text-text-muted font-light">{review.rating}/5</span>
                  </div>
                </div>
                {review.verified && <span className="dash-badge green">Verified</span>}
              </div>
              <p className="text-[0.8rem] font-light leading-relaxed text-text-secondary">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center justify-between text-[0.65rem] text-text-muted font-light">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-text-secondary">{review.author || "Anonymous"}</span>
                  <span>{review.date}</span>
                </div>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" /> {review.helpful} found helpful
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
