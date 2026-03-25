import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const importSchema = z.object({
  url: z.string().url("Invalid URL"),
  source: z.string().optional().default("Kalo Data"),
});

export async function GET() {
  const jobs = await db.importJob.findMany({
    orderBy: { startedAt: "desc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = importSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const job = await db.importJob.create({
      data: {
        url: parsed.data.url,
        source: parsed.data.source,
        status: "queued",
      },
    });

    await db.activity.create({
      data: {
        type: "import",
        message: `Import job started for ${parsed.data.url}`,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create import job" },
      { status: 500 }
    );
  }
}
