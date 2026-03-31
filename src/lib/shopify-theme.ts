import type { ShopifyConfig } from "@/lib/shopify-client";

const API_VERSION = "2025-01";

/**
 * Uploads a product template JSON to the Shopify theme via the REST Asset API.
 * The template will be available as `product.{suffix}.json` in the theme.
 *
 * Uses REST because the Asset API is not available via GraphQL.
 */
export async function uploadProductTemplate(
  config: ShopifyConfig,
  themeId: string,
  templateSuffix: string,
  templateJson: string
) {
  const url = `https://${config.storeDomain}/admin/api/${API_VERSION}/themes/${themeId}/assets.json`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": config.accessToken,
    },
    body: JSON.stringify({
      asset: {
        key: `templates/product.${templateSuffix}.json`,
        value: templateJson,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to upload template: ${res.status} ${(body as { errors?: string }).errors || res.statusText}`
    );
  }

  return res.json();
}

/**
 * Checks if a product template already exists on the theme.
 */
export async function templateExists(
  config: ShopifyConfig,
  themeId: string,
  templateSuffix: string
): Promise<boolean> {
  const url = `https://${config.storeDomain}/admin/api/${API_VERSION}/themes/${themeId}/assets.json?asset[key]=templates/product.${templateSuffix}.json`;

  const res = await fetch(url, {
    headers: { "X-Shopify-Access-Token": config.accessToken },
  });

  return res.ok;
}

/**
 * Gets the active theme ID (role === "main").
 */
export async function getActiveThemeId(config: ShopifyConfig): Promise<string> {
  const url = `https://${config.storeDomain}/admin/api/${API_VERSION}/themes.json`;

  const res = await fetch(url, {
    headers: { "X-Shopify-Access-Token": config.accessToken },
  });

  if (!res.ok) throw new Error(`Failed to list themes: ${res.status}`);

  const data = (await res.json()) as { themes: { id: number; role: string }[] };
  const main = data.themes.find((t) => t.role === "main");

  if (!main) throw new Error("No active theme found");
  return String(main.id);
}

/**
 * Updates a product's template suffix via GraphQL so Shopify renders it
 * with the category-specific product template.
 */
export async function setProductTemplateSuffix(
  config: ShopifyConfig,
  shopifyProductId: string,
  templateSuffix: string
) {
  const url = `https://${config.storeDomain}/admin/api/${API_VERSION}/graphql.json`;

  const query = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id templateSuffix }
        userErrors { field message }
      }
    }
  `;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": config.accessToken,
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          id: shopifyProductId,
          templateSuffix,
        },
      },
    }),
  });

  if (!res.ok) throw new Error(`GraphQL error: ${res.status}`);

  const result = (await res.json()) as {
    data?: {
      productUpdate: {
        product: { id: string; templateSuffix: string };
        userErrors: { field: string[]; message: string }[];
      };
    };
    errors?: { message: string }[];
  };

  if (result.errors?.length) throw new Error(result.errors[0].message);

  const payload = result.data!.productUpdate;
  if (payload.userErrors.length > 0) {
    throw new Error(payload.userErrors.map((e) => e.message).join(", "));
  }

  return payload.product;
}

/**
 * Ensures a category template exists on the active Shopify theme.
 * Uploads it if missing. Returns the template suffix to use.
 */
export async function ensureTemplateUploaded(
  config: ShopifyConfig,
  templateSuffix: string,
  templateJson: string
): Promise<string> {
  const themeId = await getActiveThemeId(config);
  const exists = await templateExists(config, themeId, templateSuffix);

  if (!exists) {
    await uploadProductTemplate(config, themeId, templateSuffix, templateJson);
  }

  return templateSuffix;
}
