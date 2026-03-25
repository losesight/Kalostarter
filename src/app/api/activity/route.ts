import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const type = searchParams.get("type");

  const where = type ? { type } : {};

  const activities = await db.activity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const activity = await db.activity.create({
      data: {
        type: body.type,
        message: body.message,
        userId: body.userId,
      },
    });
    return NextResponse.json(activity, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
