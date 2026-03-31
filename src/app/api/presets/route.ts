import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { DEFAULT_PRESETS } from "@/lib/theme-presets";

export async function GET() {
  let presets = await db.themePreset.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  // Auto-seed defaults if table is empty
  if (presets.length === 0) {
    for (const def of DEFAULT_PRESETS) {
      await db.themePreset.create({
        data: {
          name: def.name,
          slug: def.slug,
          category: def.category,
          isDefault: true,
          colors: JSON.stringify(def.colors),
          typography: JSON.stringify(def.typography),
          sections: JSON.stringify(def.sections),
          badges: JSON.stringify(def.badges),
          description: def.description,
        },
      });
    }
    presets = await db.themePreset.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  }

  return NextResponse.json(presets);
}

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  colors: z.string(),
  typography: z.string(),
  sections: z.string(),
  badges: z.string(),
  description: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const preset = await db.themePreset.create({ data: parsed.data });
    return NextResponse.json(preset, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create preset" },
      { status: 500 }
    );
  }
}
