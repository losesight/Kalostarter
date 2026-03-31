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
 * Primary scraper: launches a headless Chromium browser via Playwright,
 * navigates to the KaloData URL like a real user, waits for content to
 * render, then extracts product data from the fully-loaded page.
 */
async function scrapeWithBrowser(url: string): Promise<ScrapeResult> {
  const errors: string[] = [];
  const products: KaloProduct[] = [];

  let browser;
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch({
      headless: true,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
      locale: "en-US",
    });

    // Hide webdriver detection
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      (window as unknown as Record<string, unknown>).chrome = { runtime: {} };
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Wait for content to be present
    await page.waitForTimeout(2000);

    const html = await page.content();
    const $ = cheerio.load(html);

    // Strategy 1: __NEXT_DATA__
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

    // Strategy 2: Inline JSON in scripts
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
            // continue
          }
        }
      });
    }

    // Strategy 3: Extract visible product info from the rendered page
    if (products.length === 0) {
      try {
        const extracted = await page.evaluate(() => {
          const data: Record<string, unknown> = {};

          // Try common KaloData selectors
          const titleEl =
            document.querySelector("h1") ||
            document.querySelector('[class*="product-title"]') ||
            document.querySelector('[class*="productTitle"]') ||
            document.querySelector('[class*="title"]');
          if (titleEl) data.title = titleEl.textContent?.trim();

          const priceEls = document.querySelectorAll(
            '[class*="price"], [class*="Price"]'
          );
          priceEls.forEach((el) => {
            const text = el.textContent?.trim() || "";
            const match = text.match(/\$?([\d,.]+)/);
            if (match && !data.price) {
              data.price = parseFloat(match[1].replace(/,/g, ""));
            }
          });

          const imageEls = document.querySelectorAll(
            'img[src*="product"], img[src*="image"], img[class*="product"], img[class*="gallery"], .product-image img, [class*="media"] img'
          );
          const images: string[] = [];
          imageEls.forEach((img) => {
            const src =
              img.getAttribute("src") || img.getAttribute("data-src");
            if (src && !src.includes("logo") && !src.includes("icon")) {
              images.push(src);
            }
          });
          data.images = images;

          // Try to find category
          const breadcrumbs = document.querySelectorAll(
            '[class*="breadcrumb"] a, nav a'
          );
          breadcrumbs.forEach((a) => {
            const text = a.textContent?.trim();
            if (text && text.length > 2 && text.length < 30) {
              data.category = text;
            }
          });

          // Try to find revenue/units sold from KaloData-specific elements
          const statEls = document.querySelectorAll(
            '[class*="stat"], [class*="metric"], [class*="data-value"]'
          );
          statEls.forEach((el) => {
            const text = el.textContent?.trim() || "";
            if (text.includes("revenue") || text.includes("Revenue")) {
              data.revenue = text;
            }
            if (
              text.includes("units") ||
              text.includes("sold") ||
              text.includes("Units")
            ) {
              const match = text.match(/([\d,]+)/);
              if (match) data.unitsSold = parseInt(match[1].replace(/,/g, ""));
            }
          });

          return data;
        });

        if (extracted.title && String(extracted.title).length > 2) {
          products.push({
            title: String(extracted.title),
            price:
              typeof extracted.price === "number" ? extracted.price : 0,
            images: Array.isArray(extracted.images)
              ? (extracted.images as string[])
              : [],
            variants: [{ name: "Default" }],
            source: "kalodata.com",
            kaloSourceUrl: url,
            category: extracted.category
              ? String(extracted.category)
              : extractCategory(url),
            revenue: extracted.revenue ? String(extracted.revenue) : undefined,
            unitsSold:
              typeof extracted.unitsSold === "number"
                ? extracted.unitsSold
                : undefined,
          });
        }
      } catch (e) {
        errors.push(`DOM extraction failed: ${e}`);
      }
    }

    // Strategy 4: Parse product cards from HTML
    if (products.length === 0) {
      const productCards = $(
        '[class*="product"], [class*="Product"], [data-product]'
      );

      productCards.each((_, el) => {
        try {
          const card = $(el);
          const title = card
            .find('[class*="title"], [class*="name"], h3, h4')
            .first()
            .text()
            .trim();
          const priceText = card
            .find('[class*="price"], [class*="Price"]')
            .first()
            .text()
            .trim();
          const image =
            card.find("img").first().attr("src") ||
            card.find("img").first().attr("data-src") ||
            "";

          if (title && title.length > 2) {
            const price =
              parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
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
          // skip
        }
      });
    }

    if (products.length === 0) {
      errors.push(
        "Could not extract product data from this page. The page may require login or the data format is unrecognized. Try manual entry instead."
      );
    }

    return { products, errors, totalFound: products.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push(`Browser scrape failed: ${msg}`);
    return { products, errors, totalFound: 0 };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/**
 * Fallback scraper using plain HTTP (no browser). Fast but gets blocked
 * by Cloudflare-protected sites.
 */
async function scrapeWithHttp(url: string): Promise<ScrapeResult> {
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
            // continue
          }
        }
      });
    }

    return { products, errors, totalFound: products.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push(`HTTP fetch failed: ${msg}`);
    return { products, errors, totalFound: 0 };
  }
}

/**
 * Main entry point: tries the headless browser first (bypasses Cloudflare),
 * falls back to plain HTTP if Playwright is unavailable.
 */
export async function scrapeKaloData(url: string): Promise<ScrapeResult> {
  // Try browser-based scraping first
  try {
    const result = await scrapeWithBrowser(url);
    if (result.products.length > 0) return result;

    // If browser got nothing, try HTTP as fallback
    const httpResult = await scrapeWithHttp(url);
    if (httpResult.products.length > 0) return httpResult;

    // Return whichever had better error info
    return result.errors.length > 0 ? result : httpResult;
  } catch {
    // Playwright not available, fall back to HTTP
    return scrapeWithHttp(url);
  }
}

function normalizeKaloProduct(
  raw: Record<string, unknown>,
  sourceUrl: string
): KaloProduct {
  const title =
    (raw.title as string) ||
    (raw.product_title as string) ||
    (raw.name as string) ||
    "Untitled Product";

  const price = parseFloat(
    String(raw.price || raw.unit_price || raw.avg_price || 0)
  );

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
 * Fallback when all scraping methods are blocked.
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
