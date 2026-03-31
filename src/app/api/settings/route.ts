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

  const userId = session.user.id;

  try {
    const body: Record<string, string> = await req.json();

    // Verify the user actually exists in DB (JWT may outlive a DB reset)
    const userExists = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!userExists) {
      return NextResponse.json(
        { error: "Session expired. Please log out and log back in." },
        { status: 401 }
      );
    }

    const ops = Object.entries(body).map(([key, value]) =>
      db.setting.upsert({
        where: { key_userId: { key, userId } },
        update: { value },
        create: { key, value, userId },
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
