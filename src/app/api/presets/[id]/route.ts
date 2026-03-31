import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_PRESETS } from "@/lib/theme-presets";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const preset = await db.themePreset.findUnique({
    where: { id },
    include: { products: { select: { id: true, title: true, status: true } } },
  });

  if (!preset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(preset);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const preset = await db.themePreset.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(preset);
  } catch {
    return NextResponse.json({ error: "Failed to update preset" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const preset = await db.themePreset.findUnique({ where: { id } });
  if (!preset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (preset.isDefault) {
    return NextResponse.json({ error: "Cannot delete default presets" }, { status: 400 });
  }

  await db.themePreset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

/**
 * POST /api/presets/[id]/reset — resets a default preset to its original values
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await db.themePreset.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const original = DEFAULT_PRESETS.find((p) => p.slug === existing.slug);
  if (!original) {
    return NextResponse.json({ error: "No default found for this preset" }, { status: 400 });
  }

  const updated = await db.themePreset.update({
    where: { id },
    data: {
      colors: JSON.stringify(original.colors),
      typography: JSON.stringify(original.typography),
      sections: JSON.stringify(original.sections),
      badges: JSON.stringify(original.badges),
      description: original.description,
    },
  });

  return NextResponse.json(updated);
}
