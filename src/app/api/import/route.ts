import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { scrapeKaloData, parseManualImport } from "@/lib/kalo-scraper";

const importSchema = z.object({
  url: z.string().url("Invalid URL"),
  source: z.string().optional().default("Kalo Data"),
});

const manualImportSchema = z.object({
  products: z.array(z.record(z.string(), z.unknown())),
  source: z.string().optional().default("Kalo Data"),
  url: z.string().optional().default("manual-import"),
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

    // Manual JSON import
    if (body.products && Array.isArray(body.products)) {
      const parsed = manualImportSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0].message },
          { status: 400 }
        );
      }
      return handleManualImport(parsed.data);
    }

    // URL-based scrape import
    const parsed = importSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    return handleUrlImport(parsed.data.url, parsed.data.source);
  } catch {
    return NextResponse.json(
      { error: "Failed to create import job" },
      { status: 500 }
    );
  }
}

async function handleUrlImport(url: string, source: string) {
  const job = await db.importJob.create({
    data: { url, source, status: "running" },
  });

  await db.activity.create({
    data: { type: "import", message: `Import started from ${url}` },
  });

  try {
    const result = await scrapeKaloData(url);

    let imported = 0;
    for (const p of result.products) {
      try {
        await db.product.create({
          data: {
            title: p.title,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            category: p.category,
            images: JSON.stringify(p.images),
            variants: JSON.stringify(p.variants),
            source: p.source,
            kaloSourceUrl: p.kaloSourceUrl,
            status: "draft",
            importJobId: job.id,
          },
        });
        imported++;
      } catch (e) {
        result.errors.push(
          `Failed to save "${p.title}": ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }

    const updatedJob = await db.importJob.update({
      where: { id: job.id },
      data: {
        status: result.errors.length > 0 && imported === 0 ? "failed" : "completed",
        productsFound: result.totalFound,
        productsImported: imported,
        errors: result.errors.length,
        errorLog: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
        finishedAt: new Date(),
      },
    });

    await db.activity.create({
      data: {
        type: imported > 0 ? "import" : "error",
        message:
          imported > 0
            ? `Imported ${imported} products from ${source}`
            : `Import failed: ${result.errors[0] || "No products found"}`,
      },
    });

    return NextResponse.json(updatedJob, { status: 201 });
  } catch (e) {
    await db.importJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        errors: 1,
        errorLog: JSON.stringify([e instanceof Error ? e.message : String(e)]),
        finishedAt: new Date(),
      },
    });

    return NextResponse.json(
      { error: "Import failed", jobId: job.id },
      { status: 500 }
    );
  }
}

async function handleManualImport(data: {
  products: Record<string, unknown>[];
  source: string;
  url: string;
}) {
  const job = await db.importJob.create({
    data: {
      url: data.url,
      source: data.source,
      status: "running",
    },
  });

  const result = parseManualImport(data.products, data.url);
  let imported = 0;

  for (const p of result.products) {
    try {
      await db.product.create({
        data: {
          title: p.title,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          category: p.category,
          images: JSON.stringify(p.images),
          variants: JSON.stringify(p.variants),
          source: p.source,
          kaloSourceUrl: p.kaloSourceUrl,
          status: "draft",
          importJobId: job.id,
        },
      });
      imported++;
    } catch (e) {
      result.errors.push(
        `Failed to save "${p.title}": ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  const updatedJob = await db.importJob.update({
    where: { id: job.id },
    data: {
      status: "completed",
      productsFound: result.totalFound,
      productsImported: imported,
      errors: result.errors.length,
      errorLog: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
      finishedAt: new Date(),
    },
  });

  await db.activity.create({
    data: {
      type: "import",
      message: `Manually imported ${imported} products`,
    },
  });

  return NextResponse.json(updatedJob, { status: 201 });
}
