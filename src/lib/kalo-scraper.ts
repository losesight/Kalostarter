import * as cheerio from "cheerio";

export interface KaloProduct {
  title: string;
  price: number;
  compareAtPrice?: number;
  category?: string;
  images: string[];
  variants: { name: string }[];
  source: string;
  kaloSourceUrl: string;
  revenue?: string;
  unitsSold?: number;
}

export interface ScrapeResult {
  products: KaloProduct[];
  errors: string[];
  totalFound: number;
}

/**
 * Attempts to fetch and parse product data from a KaloData URL.
 *
 * Kalo Data uses React SSR with Cloudflare protection, so direct HTML
 * scraping may be limited. This scraper extracts what it can from the
 * initial HTML payload and any embedded __NEXT_DATA__ or script tags.
 * Falls back gracefully if the page is behind a login wall.
 */
export async function scrapeKaloData(url: string): Promise<ScrapeResult> {
  const errors: string[] = [];
  const products: KaloProduct[] = [];

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      errors.push(`HTTP ${response.status}: ${response.statusText}`);
      return { products, errors, totalFound: 0 };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Strategy 1: Look for __NEXT_DATA__ JSON payload (Next.js SSR)
    const nextDataScript = $("script#__NEXT_DATA__").text();
    if (nextDataScript) {
      try {
        const nextData = JSON.parse(nextDataScript);
        const pageProps = nextData?.props?.pageProps;

        if (pageProps?.products || pageProps?.data?.products) {
          const rawProducts =
            pageProps.products || pageProps.data.products || [];
          for (const raw of rawProducts) {
            products.push(normalizeKaloProduct(raw, url));
          }
        }

        if (pageProps?.product) {
          products.push(normalizeKaloProduct(pageProps.product, url));
        }
      } catch (e) {
        errors.push(`Failed to parse __NEXT_DATA__: ${e}`);
      }
    }

    // Strategy 2: Look for inline JSON in script tags
    if (products.length === 0) {
      $("script").each((_, el) => {
        const text = $(el).text();
        if (
          text.includes('"products"') ||
          text.includes('"productList"') ||
          text.includes('"items"')
        ) {
          try {
            const jsonMatch = text.match(
              /(?:products|productList|items)\s*[=:]\s*(\[[\s\S]*?\]);?/
            );
            if (jsonMatch?.[1]) {
              const items = JSON.parse(jsonMatch[1]);
              for (const raw of items) {
                products.push(normalizeKaloProduct(raw, url));
              }
            }
          } catch {
            // Not valid JSON, continue
          }
        }
      });
    }

    // Strategy 3: Parse product cards from HTML structure
    if (products.length === 0) {
      const productCards = $(
        '[class*="product"], [class*="Product"], [data-product]'
      );

      productCards.each((_, el) => {
        try {
          const card = $(el);
          const title =
            card.find('[class*="title"], [class*="name"], h3, h4').first().text().trim();
          const priceText =
            card.find('[class*="price"], [class*="Price"]').first().text().trim();
          const image =
            card.find("img").first().attr("src") ||
            card.find("img").first().attr("data-src") ||
            "";

          if (title && title.length > 2) {
            const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
            products.push({
              title,
              price,
              images: image ? [image] : [],
              variants: [{ name: "Default" }],
              source: "kalodata.com",
              kaloSourceUrl: url,
              category: extractCategory(url),
            });
          }
        } catch {
          // Skip malformed card
        }
      });
    }

    // If Cloudflare/login wall blocked us
    if (
      products.length === 0 &&
      (html.includes("cf-browser-verification") ||
        html.includes("challenge-platform") ||
        html.includes("login") && html.length < 5000)
    ) {
      errors.push(
        "Page is behind Cloudflare protection or requires login. " +
          "Use the manual JSON import instead."
      );
    }

    return { products, errors, totalFound: products.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push(`Fetch failed: ${msg}`);
    return { products, errors, totalFound: 0 };
  }
}

function normalizeKaloProduct(raw: Record<string, unknown>, sourceUrl: string): KaloProduct {
  const title =
    (raw.title as string) ||
    (raw.product_title as string) ||
    (raw.name as string) ||
    "Untitled Product";

  const price =
    parseFloat(String(raw.price || raw.unit_price || raw.avg_price || 0));

  const compareAtPrice = raw.compare_at_price
    ? parseFloat(String(raw.compare_at_price))
    : raw.original_price
      ? parseFloat(String(raw.original_price))
      : undefined;

  const images: string[] = [];
  if (raw.image) images.push(String(raw.image));
  if (raw.images && Array.isArray(raw.images)) {
    images.push(...(raw.images as string[]));
  }
  if (raw.thumbnail) images.push(String(raw.thumbnail));
  if (raw.cover) images.push(String(raw.cover));

  const category =
    (raw.category as string) ||
    (raw.product_category as string) ||
    extractCategory(sourceUrl);

  return {
    title,
    price,
    compareAtPrice,
    category,
    images,
    variants: [{ name: "Default" }],
    source: "kalodata.com",
    kaloSourceUrl: sourceUrl,
    revenue: raw.revenue ? String(raw.revenue) : undefined,
    unitsSold: raw.units_sold
      ? parseInt(String(raw.units_sold))
      : raw.sold
        ? parseInt(String(raw.sold))
        : undefined,
  };
}

function extractCategory(url: string): string {
  try {
    const u = new URL(url);
    const segments = u.pathname.split("/").filter(Boolean);
    if (segments.length > 1) {
      return segments[segments.length - 1]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  } catch {
    // ignore
  }
  return "General";
}

/**
 * Manual import: accepts a JSON array of products directly.
 * This is the fallback when scraping is blocked.
 */
export function parseManualImport(
  jsonData: Record<string, unknown>[],
  sourceUrl: string
): ScrapeResult {
  const products: KaloProduct[] = [];
  const errors: string[] = [];

  for (let i = 0; i < jsonData.length; i++) {
    try {
      products.push(normalizeKaloProduct(jsonData[i], sourceUrl));
    } catch (e) {
      errors.push(`Row ${i}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { products, errors, totalFound: products.length };
}
