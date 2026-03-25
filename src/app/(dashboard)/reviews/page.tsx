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
} from "lucide-react";
import { Card } from "@/components/card";
import { StatCard } from "@/components/stat-card";
import { clsx } from "clsx";

const mockReviews = [
  { id: "r1", product: "Wireless Bluetooth Earbuds Pro", author: "Alex M.", rating: 5, text: "Incredible sound quality for the price! The noise cancellation is surprisingly good. Battery lasts way longer than my old AirPods. Highly recommend for anyone looking for budget premium earbuds.", date: "Mar 18, 2026", verified: true, helpful: 24 },
  { id: "r2", product: "Smart Watch Fitness Tracker", author: "Jamie K.", rating: 4, text: "Great fitness tracker with accurate heart rate monitoring. The sleep tracking is a nice bonus. Only complaint is the screen could be a bit brighter in direct sunlight.", date: "Mar 15, 2026", verified: true, helpful: 18 },
  { id: "r3", product: "LED Ring Light 10-inch", author: "Sarah T.", rating: 5, text: "Perfect for my video calls and content creation! Three light modes and the dimmer works smoothly. Very sturdy build. My zoom meetings look so much more professional now.", date: "Mar 12, 2026", verified: false, helpful: 9 },
  { id: "r4", product: "Portable Blender USB Rechargeable", author: "Michael R.", rating: 3, text: "Works okay for thin smoothies but struggles with frozen fruit. Charging is convenient via USB-C. Good for travel if you stick to softer ingredients.", date: "Mar 10, 2026", verified: true, helpful: 7 },
  { id: "r5", product: "Gaming Mouse Pad XXL RGB", author: "Chris W.", rating: 5, text: "The RGB lighting is insane — 14 different modes! Surface is super smooth for my mouse. Huge size covers my entire desk. Build quality is premium for the price point.", date: "Mar 8, 2026", verified: true, helpful: 31 },
  { id: "r6", product: "Mini Projector HD 1080P", author: "Dana L.", rating: 4, text: "Really impressed with the image quality in a dark room. Built-in speakers are decent. Fan noise is noticeable but not annoying. Great value for movie nights!", date: "Mar 5, 2026", verified: false, helpful: 15 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={clsx(
            "h-3 w-3",
            i < rating ? "fill-warning text-warning" : "fill-transparent text-text-muted/30"
          )}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
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
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 py-2.5 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
            <ExternalLink className="h-4 w-4" />
            Push to Judge.me
          </button>
        </div>
      </div>

      {/* Legal notice */}
      <div className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <p className="text-[0.8rem] font-medium text-warning">Review extraction notice</p>
          <p className="mt-1 text-[0.7rem] font-light text-text-secondary">
            Reviews are collected only where legally and technically permitted. robots.txt and platform terms are respected. Review data is stored locally for manual review and export — not auto-published.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total Reviews" value={156} change="From 8 products" changeType="neutral" icon={MessageSquare} accentColor="purple" />
        <StatCard label="Avg. Rating" value="4.3" change="Across all products" changeType="positive" icon={Star} accentColor="yellow" />
        <StatCard label="5-Star" value={89} change="57% of total" changeType="positive" icon={ThumbsUp} accentColor="green" />
        <StatCard label="Low Rated" value={12} change="< 3 stars" changeType="negative" icon={AlertCircle} accentColor="red" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button className="flex h-10 items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
          <Filter className="h-3.5 w-3.5" />
          Filter by Product
        </button>
        <button className="flex h-10 items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
          <ArrowUpDown className="h-3.5 w-3.5" />
          Sort by Rating
        </button>
        <div className="ml-auto text-[0.65rem] font-light text-text-muted">
          Showing {mockReviews.length} of 156 reviews
        </div>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {mockReviews.map((review) => (
          <div key={review.id} className="rounded-xl border border-border-primary bg-bg-card p-5">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[0.85rem] font-light text-text-primary">{review.product}</p>
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
                  <span className="font-medium text-text-secondary">{review.author}</span>
                  <span>{review.date}</span>
                </div>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {review.helpful} found helpful
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
