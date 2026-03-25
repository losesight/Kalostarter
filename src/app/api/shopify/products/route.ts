import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createProduct,
  publishProduct,
  uploadImageToProduct,
} from "@/lib/shopify-client";
import { getShopifyConfig } from "@/lib/shopify-helpers";

const publishSchema = z.object({
  productIds: z.array(z.string()).min(1),
});

export async function POST(req: Request) {
  const config = await getShopifyConfig();
  if (!config) {
    return NextResponse.json({ error: "Shopify not connected" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = publishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const results: { productId: string; shopifyId: string | null; error?: string }[] = [];

    for (const localId of parsed.data.productIds) {
      const product = await db.product.findUnique({ where: { id: localId } });
      if (!product) {
        results.push({ productId: localId, shopifyId: null, error: "Not found" });
        continue;
      }

      try {
        const shopifyProduct = await createProduct(config, {
          title: product.aiTitle || product.title,
          descriptionHtml: product.aiDescription || product.description || "",
          productType: product.category || "",
          seoTitle: product.seoTitle || undefined,
          seoDescription: product.seoDescription || undefined,
        });

        // Upload images
        const images: string[] = JSON.parse(product.images || "[]");
        for (const img of images) {
          try {
            await uploadImageToProduct(config, shopifyProduct.id, img, product.title);
          } catch {
            // Image upload failure is non-fatal
          }
        }

        // Publish to Online Store
        try {
          await publishProduct(config, shopifyProduct.id);
        } catch {
          // Publish failure is non-fatal — product exists as draft in Shopify
        }

        await db.product.update({
          where: { id: localId },
          data: {
            status: "published",
            shopifyProductId: shopifyProduct.id,
            syncedAt: new Date(),
          },
        });

        await db.activity.create({
          data: {
            type: "publish",
            message: `Published "${product.title}" to Shopify`,
          },
        });

        results.push({ productId: localId, shopifyId: shopifyProduct.id });
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);

        await db.product.update({
          where: { id: localId },
          data: { status: "error" },
        });

        await db.activity.create({
          data: {
            type: "error",
            message: `Failed to publish "${product.title}": ${errorMsg}`,
          },
        });

        results.push({ productId: localId, shopifyId: null, error: errorMsg });
      }
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Publish operation failed" },
      { status: 500 }
    );
  }
}
