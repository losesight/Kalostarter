import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getShopifyConfig } from "@/lib/shopify-helpers";
import {
  testConnection,
  createProduct,
  publishProduct,
  uploadImageToProduct,
} from "@/lib/shopify-client";
import type { ShopifyConfig } from "@/lib/shopify-client";
import type { PricingResult } from "@/lib/pricing-engine";
import type { WebsiteCopy } from "@/lib/copy-generator";

const inlineCredsSchema = z.object({
  storeDomain: z.string().optional(),
  accessToken: z.string().optional(),
  pricingTier: z.number().optional(),
});

function normalizeStoreDomain(raw: string): string {
  let domain = raw.trim();
  domain = domain.replace(/^https?:\/\//, "");
  domain = domain.replace(/\/+$/, "");
  if (!domain.includes(".")) {
    domain = `${domain}.myshopify.com`;
  }
  return domain;
}

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
        { error: "No product imported yet." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = inlineCredsSchema.safeParse(body);
    const opts = parsed.success ? parsed.data : {};

    // Resolve Shopify config: inline credentials > saved settings
    let config: ShopifyConfig | null = null;

    if (opts.storeDomain && opts.accessToken) {
      const cleanDomain = normalizeStoreDomain(opts.storeDomain);
      config = {
        storeDomain: cleanDomain,
        accessToken: opts.accessToken.trim(),
      };

      // Save the normalized credentials for future use (non-blocking)
      try {
        const session = await auth();
        const userId = session?.user?.id;
        if (userId) {
          const userExists = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
          if (userExists) {
            for (const [key, value] of [
              ["shopify_store_domain", cleanDomain],
              ["shopify_access_token", opts.accessToken.trim()],
            ] as const) {
              await db.setting.upsert({
                where: { key_userId: { key, userId } },
                update: { value },
                create: { key, value, userId },
              });
            }
          }
        }
      } catch {
        // Credential save failed — non-fatal, proceed with publish
      }
    } else {
      config = await getShopifyConfig();
    }

    if (!config) {
      return NextResponse.json(
        {
          error: "Shopify not connected. Provide store domain and access token.",
          needsCredentials: true,
        },
        { status: 400 }
      );
    }

    // Verify connection
    let shop;
    try {
      shop = await testConnection(config);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      const hint = msg.includes("fetch failed") || msg.includes("ENOTFOUND")
        ? ` — Check that "${config.storeDomain}" is your correct .myshopify.com domain.`
        : "";
      return NextResponse.json(
        {
          error: `Shopify connection failed: ${msg}${hint}`,
          needsCredentials: true,
        },
        { status: 400 }
      );
    }

    await db.launchProject.update({
      where: { id },
      data: { status: "publishing" },
    });

    // Build the product description from generated copy
    const websiteCopy: WebsiteCopy | null = project.websiteCopy
      ? JSON.parse(project.websiteCopy)
      : null;

    const pricingResult: PricingResult | null = project.pricingResult
      ? JSON.parse(project.pricingResult)
      : null;

    const tierIndex = opts.pricingTier ?? 1; // default to "Standard" tier
    const selectedTier = pricingResult?.recommendedTiers?.[tierIndex];
    const finalPrice = selectedTier?.price ?? project.product.price;
    const compareAtPrice = selectedTier?.compareAtPrice ?? null;

    let descriptionHtml = project.product.description || "";
    if (websiteCopy) {
      descriptionHtml = websiteCopy.productSection.description;
      if (websiteCopy.productSection.bullets?.length) {
        descriptionHtml += "<ul>" +
          websiteCopy.productSection.bullets.map((b) => `<li>${b}</li>`).join("") +
          "</ul>";
      }
      if (websiteCopy.productSection.guaranteeText) {
        descriptionHtml += `<p><strong>${websiteCopy.productSection.guaranteeText}</strong></p>`;
      }
    }

    const seoTitle = websiteCopy?.seo?.title || project.product.title;
    const seoDescription = websiteCopy?.seo?.metaDescription || "";

    // Create product on Shopify
    const shopifyProduct = await createProduct(config, {
      title: websiteCopy?.productSection?.title || project.product.title,
      descriptionHtml,
      productType: project.product.category || "",
      vendor: "fflame Import",
      tags: pricingResult
        ? [`price:${finalPrice}`, project.product.category || ""].filter(Boolean)
        : [project.product.category || ""].filter(Boolean),
      seoTitle,
      seoDescription,
    });

    // Upload images
    const images: string[] = project.product.images
      ? JSON.parse(project.product.images)
      : [];

    let uploadedImages = 0;
    for (const imageUrl of images.slice(0, 10)) {
      try {
        if (imageUrl && imageUrl.startsWith("http")) {
          await uploadImageToProduct(
            config,
            shopifyProduct.id,
            imageUrl,
            project.product.title
          );
          uploadedImages++;
        }
      } catch {
        // Non-fatal: continue with other images
      }
    }

    // Publish to Online Store
    try {
      await publishProduct(config, shopifyProduct.id);
    } catch {
      // Non-fatal: product is created but may not be visible yet
    }

    // Update local product record
    await db.product.update({
      where: { id: project.product.id },
      data: {
        status: "published",
        shopifyProductId: shopifyProduct.id,
        syncedAt: new Date(),
        aiGenerated: !!websiteCopy,
        aiTitle: websiteCopy?.productSection?.title || null,
        aiDescription: descriptionHtml || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        price: finalPrice,
        compareAtPrice,
      },
    });

    // Advance the launch project
    await db.launchProject.update({
      where: { id },
      data: {
        status: "building",
        currentStep: 6,
      },
    });

    await db.activity.create({
      data: {
        type: "publish",
        message: `Published "${project.product.title}" to Shopify store ${shop.name}`,
      },
    });

    const storeUrl = `https://${config.storeDomain}/admin/products/${shopifyProduct.id.replace("gid://shopify/Product/", "")}`;

    return NextResponse.json({
      shopifyProductId: shopifyProduct.id,
      shopifyHandle: shopifyProduct.handle,
      shopifyAdminUrl: storeUrl,
      shopName: shop.name,
      price: finalPrice,
      compareAtPrice,
      imagesUploaded: uploadedImages,
    });
  } catch (e) {
    await db.launchProject.update({
      where: { id },
      data: {
        status: "error",
        errorLog: JSON.stringify([
          e instanceof Error ? e.message : "Publish failed",
        ]),
      },
    });

    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Publish to Shopify failed" },
      { status: 500 }
    );
  }
}
