import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  scrapeGoogleShopping,
  generatePricingRecommendation,
} from "@/lib/pricing-engine";

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
      data: { status: "pricing" },
    });

    const competitors = await scrapeGoogleShopping(project.product.title);

    const pricingResult = await generatePricingRecommendation(
      project.product.title,
      project.product.price,
      project.product.category || "General",
      competitors
    );

    await db.launchProject.update({
      where: { id },
      data: {
        competitorData: JSON.stringify(competitors),
        pricingResult: JSON.stringify(pricingResult),
        status: "copywriting",
        currentStep: 4,
      },
    });

    await db.activity.create({
      data: {
        type: "ai",
        message: `Pricing analysis completed for "${project.product.title}" — ${competitors.length} competitors found`,
      },
    });

    return NextResponse.json(pricingResult);
  } catch (e) {
    await db.launchProject.update({
      where: { id },
      data: {
        status: "error",
        errorLog: JSON.stringify([
          e instanceof Error ? e.message : "Pricing analysis failed",
        ]),
      },
    });

    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Pricing analysis failed" },
      { status: 500 }
    );
  }
}
