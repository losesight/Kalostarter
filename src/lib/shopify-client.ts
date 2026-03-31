const API_VERSION = "2025-01";

export interface ShopifyConfig {
  storeDomain: string;
  accessToken: string;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  status: string;
  onlineStoreUrl: string | null;
  totalInventory: number;
  variants: { edges: { node: { id: string; title: string; price: string } }[] };
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function shopifyGraphQL<T>(
  config: ShopifyConfig,
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const url = `https://${config.storeDomain}/admin/api/${API_VERSION}/graphql.json`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": config.accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function testConnection(config: ShopifyConfig) {
  const query = `{
    shop {
      name
      email
      myshopifyDomain
      plan { displayName }
    }
  }`;

  const result = await shopifyGraphQL<{
    shop: {
      name: string;
      email: string;
      myshopifyDomain: string;
      plan: { displayName: string };
    };
  }>(config, query);

  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  return result.data!.shop;
}

export async function listThemes(config: ShopifyConfig) {
  const query = `{
    themes(first: 10) {
      edges {
        node {
          id
          name
          role
        }
      }
    }
  }`;

  const result = await shopifyGraphQL<{
    themes: { edges: { node: { id: string; name: string; role: string } }[] };
  }>(config, query);

  if (result.errors?.length) throw new Error(result.errors[0].message);

  return result.data!.themes.edges.map((e) => e.node);
}

export async function createProduct(
  config: ShopifyConfig,
  product: {
    title: string;
    descriptionHtml?: string;
    productType?: string;
    vendor?: string;
    tags?: string[];
    seoTitle?: string;
    seoDescription?: string;
  }
) {
  const query = `
    mutation productCreate($product: ProductCreateInput!) {
      productCreate(product: $product) {
        product {
          id
          title
          handle
          status
          onlineStoreUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    product: {
      title: product.title,
      descriptionHtml: product.descriptionHtml || "",
      productType: product.productType || "",
      vendor: product.vendor || "fflame Import",
      tags: product.tags || [],
      seo: {
        title: product.seoTitle || product.title,
        description: product.seoDescription || "",
      },
    },
  };

  const result = await shopifyGraphQL<{
    productCreate: {
      product: { id: string; title: string; handle: string; status: string; onlineStoreUrl: string | null };
      userErrors: { field: string[]; message: string }[];
    };
  }>(config, query, variables);

  if (result.errors?.length) throw new Error(result.errors[0].message);

  const payload = result.data!.productCreate;
  if (payload.userErrors.length > 0) {
    throw new Error(payload.userErrors.map((e) => e.message).join(", "));
  }

  return payload.product;
}

export async function createProductVariants(
  config: ShopifyConfig,
  productId: string,
  variants: { optionValues: { name: string; optionName: string }[]; price: string }[]
) {
  const query = `
    mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkCreate(productId: $productId, variants: $variants) {
        productVariants { id title price }
        userErrors { field message }
      }
    }
  `;

  const result = await shopifyGraphQL<{
    productVariantsBulkCreate: {
      productVariants: { id: string; title: string; price: string }[];
      userErrors: { field: string[]; message: string }[];
    };
  }>(config, query, { productId, variants });

  if (result.errors?.length) throw new Error(result.errors[0].message);

  const payload = result.data!.productVariantsBulkCreate;
  if (payload.userErrors.length > 0) {
    throw new Error(payload.userErrors.map((e) => e.message).join(", "));
  }

  return payload.productVariants;
}

export async function publishProduct(config: ShopifyConfig, productId: string) {
  // First get the publication ID for the online store
  const pubQuery = `{
    publications(first: 5) {
      edges {
        node { id name }
      }
    }
  }`;

  const pubResult = await shopifyGraphQL<{
    publications: { edges: { node: { id: string; name: string } }[] };
  }>(config, pubQuery);

  if (pubResult.errors?.length) throw new Error(pubResult.errors[0].message);

  const onlineStore = pubResult.data!.publications.edges.find(
    (e) => e.node.name === "Online Store"
  );

  if (!onlineStore) {
    throw new Error("Online Store publication not found");
  }

  const query = `
    mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        publishable { ... on Product { id title } }
        userErrors { field message }
      }
    }
  `;

  const result = await shopifyGraphQL<{
    publishablePublish: {
      publishable: { id: string; title: string };
      userErrors: { field: string[]; message: string }[];
    };
  }>(config, query, {
    id: productId,
    input: [{ publicationId: onlineStore.node.id }],
  });

  if (result.errors?.length) throw new Error(result.errors[0].message);
  return result.data!.publishablePublish.publishable;
}

export async function uploadImageToProduct(
  config: ShopifyConfig,
  productId: string,
  imageUrl: string,
  altText?: string
) {
  const query = `
    mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { ... on MediaImage { id image { url altText } } }
        mediaUserErrors { field message }
      }
    }
  `;

  const result = await shopifyGraphQL<{
    productCreateMedia: {
      media: { id: string; image: { url: string; altText: string } }[];
      mediaUserErrors: { field: string[]; message: string }[];
    };
  }>(config, query, {
    productId,
    media: [
      {
        originalSource: imageUrl,
        alt: altText || "",
        mediaContentType: "IMAGE",
      },
    ],
  });

  if (result.errors?.length) throw new Error(result.errors[0].message);
  return result.data!.productCreateMedia.media;
}
