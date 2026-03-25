import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { title: true } } },
  });

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "0";
  const fiveStar = reviews.filter((r) => r.rating === 5).length;
  const lowRated = reviews.filter((r) => r.rating < 3).length;

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      ...r,
      productTitle: r.product.title,
    })),
    stats: { totalReviews, avgRating, fiveStar, lowRated },
  });
}
