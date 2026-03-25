import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const synced = await db.product.findMany({
    where: { shopifyProductId: { not: null } },
    orderBy: { syncedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      shopifyProductId: true,
      syncedAt: true,
    },
  });

  const stats = {
    totalSynced: synced.length,
    pendingPublish: await db.product.count({ where: { status: "ready" } }),
    failedSyncs: await db.product.count({ where: { status: "error" } }),
  };

  return NextResponse.json({ synced, stats });
}
