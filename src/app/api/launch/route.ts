import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { scrapeKaloData } from "@/lib/kalo-scraper";

const createSchema = z.object({
  kaloUrl: z.string().url("Invalid Kalo Data URL"),
  name: z.string().optional(),
});

const manualSchema = z.object({
  manual: z.literal(true),
  kaloUrl: z.string().optional().default("manual-import"),
  name: z.string().optional(),
  title: z.string().min(1, "Product title is required"),
  price: z.number().min(0, "Price must be positive"),
  category: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
});

export async function GET() {
  try {
    const projects = await db.launchProject.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, title: true, images: true, price: true, category: true } },
        themePreset: { select: { id: true, name: true, slug: true, category: true } },
      },
    });
    return NextResponse.json(projects);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to list projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.manual) {
      return handleManualCreate(body);
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { kaloUrl, name } = parsed.data;

    const project = await db.launchProject.create({
      data: {
        name: name || "New Launch",
        kaloUrl,
        status: "importing",
        currentStep: 1,
      },
    });

    (async () => {
      try {
        const result = await scrapeKaloData(kaloUrl);

        if (result.products.length === 0) {
          await db.launchProject.update({
            where: { id: project.id },
            data: {
              status: "error",
              errorLog: JSON.stringify(
                result.errors.length > 0
                  ? result.errors
                  : ["KaloData blocked the request (Cloudflare protection). Use the manual import form instead."]
              ),
            },
          });
          return;
        }

        const kaloProduct = result.products[0];

        const product = await db.product.create({
          data: {
            title: kaloProduct.title,
            price: kaloProduct.price,
            compareAtPrice: kaloProduct.compareAtPrice,
            category: kaloProduct.category,
            images: JSON.stringify(kaloProduct.images),
            variants: JSON.stringify(kaloProduct.variants),
            source: kaloProduct.source,
            kaloSourceUrl: kaloProduct.kaloSourceUrl,
            status: "draft",
          },
        });

        await db.launchProject.update({
          where: { id: project.id },
          data: {
            productId: product.id,
            rawProductData: JSON.stringify(kaloProduct),
            status: "analyzing",
            currentStep: 2,
            name: name || kaloProduct.title.slice(0, 60),
          },
        });

        await db.activity.create({
          data: {
            type: "import",
            message: `Launch project created: "${kaloProduct.title}"`,
          },
        });
      } catch (e) {
        await db.launchProject.update({
          where: { id: project.id },
          data: {
            status: "error",
            errorLog: JSON.stringify([
              e instanceof Error ? e.message : "Import failed",
            ]),
          },
        });
      }
    })();

    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create project" },
      { status: 500 }
    );
  }
}

async function handleManualCreate(body: unknown) {
  const parsed = manualSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { kaloUrl, name, title, price, category, description, images } = parsed.data;

  try {
    const product = await db.product.create({
      data: {
        title,
        price,
        category: category || "General",
        description: description || null,
        images: JSON.stringify(images),
        variants: JSON.stringify([{ name: "Default" }]),
        source: "manual",
        kaloSourceUrl: kaloUrl || null,
        status: "draft",
      },
    });

    const project = await db.launchProject.create({
      data: {
        name: name || title.slice(0, 60),
        kaloUrl: kaloUrl || "manual-import",
        status: "analyzing",
        currentStep: 2,
        productId: product.id,
        rawProductData: JSON.stringify({ title, price, category, description, images }),
      },
    });

    await db.activity.create({
      data: {
        type: "import",
        message: `Launch project created (manual): "${title}"`,
      },
    });

    const full = await db.launchProject.findUnique({
      where: { id: project.id },
      include: {
        product: { select: { id: true, title: true, images: true, price: true, category: true } },
        themePreset: { select: { id: true, name: true, slug: true, category: true } },
      },
    });

    return NextResponse.json(full, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create project" },
      { status: 500 }
    );
  }
}
