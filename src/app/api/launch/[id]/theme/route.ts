import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPresetForCategory } from "@/lib/theme-presets";
import { buildAndSaveThemeZip } from "@/lib/theme-builder";
import type { WebsiteCopy } from "@/lib/copy-generator";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const project = await db.launchProject.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.product) {
      return NextResponse.json(
        { error: "No product imported yet." },
        { status: 400 }
      );
    }

    await db.launchProject.update({
      where: { id },
      data: { status: "building" },
    });

    const preset = getPresetForCategory(
      project.product.category || "General"
    );

    const dbPreset = await db.themePreset.findUnique({
      where: { slug: preset.slug },
    });

    const websiteCopy: WebsiteCopy | null = project.websiteCopy
      ? JSON.parse(project.websiteCopy)
      : null;

    const zipPath = await buildAndSaveThemeZip({
      preset,
      product: {
        title: project.product.title,
        price: project.product.price,
        category: project.product.category || "General",
        description: project.product.description || undefined,
      },
      websiteCopy,
      storeName: project.name,
    });

    await db.launchProject.update({
      where: { id },
      data: {
        themePresetId: dbPreset?.id || null,
        themeZipPath: zipPath,
        status: "ready",
        currentStep: 5,
      },
    });

    await db.activity.create({
      data: {
        type: "publish",
        message: `Theme built for "${project.product.title}" — ${preset.name} preset`,
      },
    });

    return NextResponse.json({
      downloadUrl: zipPath,
      preset: preset.name,
      category: preset.category,
    });
  } catch (e) {
    await db.launchProject.update({
      where: { id },
      data: {
        status: "error",
        errorLog: JSON.stringify([
          e instanceof Error ? e.message : "Theme build failed",
        ]),
      },
    });

    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Theme build failed" },
      { status: 500 }
    );
  }
}
