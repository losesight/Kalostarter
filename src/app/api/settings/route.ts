import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.setting.findMany({
    where: { userId: session.user.id },
  });

  const mapped: Record<string, string> = {};
  for (const s of settings) mapped[s.key] = s.value;

  return NextResponse.json(mapped);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: Record<string, string> = await req.json();

    const ops = Object.entries(body).map(([key, value]) =>
      db.setting.upsert({
        where: { key_userId: { key, userId: session.user!.id! } },
        update: { value },
        create: { key, value, userId: session.user!.id! },
      })
    );

    await Promise.all(ops);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
