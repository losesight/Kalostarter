import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { analyzeAd } from "@/lib/ad-intelligence";

const adDataSchema = z.object({
  adContent: z.string().optional(),
  adPlatform: z.string().optional(),
  adMetrics: z
    .object({
      views: z.number().optional(),
      likes: z.number().optional(),
      comments: z.number().optional(),
      shares: z.number().optional(),
      ctr: z.number().optional(),
    })
    .optional(),
});

export async function POST(
  req: Request,
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
        { error: "No product imported yet. Complete step 1 first." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = adDataSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await db.launchProject.update({
      where: { id },
      data: { adData: JSON.stringify(parsed.data), status: "analyzing" },
    });

    const analysis = await analyzeAd({
      productTitle: project.product.title,
      productCategory: project.product.category || "General",
      productPrice: project.product.price,
      adContent: parsed.data.adContent,
      adPlatform: parsed.data.adPlatform,
      adMetrics: parsed.data.adMetrics,
    });

    await db.launchProject.update({
      where: { id },
      data: {
        adAnalysis: JSON.stringify(analysis),
        status: "pricing",
        currentStep: 3,
      },
    });

    await db.activity.create({
      data: {
        type: "ai",
        message: `Ad intelligence completed for "${project.product.title}"`,
      },
    });

    return NextResponse.json(analysis);
  } catch (e) {
    await db.launchProject.update({
      where: { id },
      data: {
        status: "error",
        errorLog: JSON.stringify([
          e instanceof Error ? e.message : "Ad analysis failed",
        ]),
      },
    });

    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ad analysis failed" },
      { status: 500 }
    );
  }
}
