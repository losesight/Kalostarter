import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateAlignedCopy } from "@/lib/copy-generator";
import type { AdAnalysisResult } from "@/lib/ad-intelligence";
import type { PricingResult } from "@/lib/pricing-engine";

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
      data: { status: "copywriting" },
    });

    const adAnalysis: AdAnalysisResult | null = project.adAnalysis
      ? JSON.parse(project.adAnalysis)
      : null;

    const pricingResult: PricingResult | null = project.pricingResult
      ? JSON.parse(project.pricingResult)
      : null;

    const copyResult = await generateAlignedCopy(
      {
        title: project.product.title,
        price: project.product.price,
        category: project.product.category || "General",
        description: project.product.description || undefined,
      },
      adAnalysis,
      pricingResult
    );

    await db.launchProject.update({
      where: { id },
      data: {
        websiteCopy: JSON.stringify(copyResult.websiteCopy),
        adCopy: JSON.stringify(copyResult.adCopy),
        status: "building",
        currentStep: 5,
      },
    });

    await db.activity.create({
      data: {
        type: "ai",
        message: `Copy generated for "${project.product.title}" — website + ${copyResult.adCopy.angles.length} ad angles`,
      },
    });

    return NextResponse.json(copyResult);
  } catch (e) {
    await db.launchProject.update({
      where: { id },
      data: {
        status: "error",
        errorLog: JSON.stringify([
          e instanceof Error ? e.message : "Copy generation failed",
        ]),
      },
    });

    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Copy generation failed" },
      { status: 500 }
    );
  }
}
