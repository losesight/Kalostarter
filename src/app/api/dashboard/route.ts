import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [
    totalProducts,
    publishedProducts,
    draftProducts,
    readyProducts,
    errorCount,
    aiGeneratedCount,
    recentActivity,
    recentJobs,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "published" } }),
    db.product.count({ where: { status: "draft" } }),
    db.product.count({ where: { status: "ready" } }),
    db.product.count({ where: { status: "error" } }),
    db.product.count({ where: { aiGenerated: true } }),
    db.activity.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    db.importJob.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
  ]);

  const importedToday = await db.product.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  return NextResponse.json({
    totalProducts,
    publishedProducts,
    draftProducts,
    readyProducts,
    errorCount,
    aiGeneratedCount,
    importedToday,
    recentActivity,
    recentJobs,
  });
}
