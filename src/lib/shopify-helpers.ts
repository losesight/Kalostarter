import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ShopifyConfig } from "@/lib/shopify-client";

/**
 * Retrieves the Shopify config from the authenticated user's settings.
 * Returns null if credentials are missing.
 */
export async function getShopifyConfig(): Promise<ShopifyConfig | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const settings = await db.setting.findMany({
    where: {
      userId: session.user.id,
      key: { in: ["shopify_store_domain", "shopify_access_token"] },
    },
  });

  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  if (!map.shopify_store_domain || !map.shopify_access_token) return null;

  let domain = map.shopify_store_domain.trim();
  domain = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (!domain.includes(".")) domain = `${domain}.myshopify.com`;

  return {
    storeDomain: domain,
    accessToken: map.shopify_access_token.trim(),
  };
}
