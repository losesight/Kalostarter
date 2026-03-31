import * as cheerio from "cheerio";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export interface CompetitorPrice {
  title: string;
  price: number;
  source: string;
  url?: string;
  rating?: number;
  reviewCount?: number;
}

export interface PricingTier {
  name: string;
  price: number;
  compareAtPrice: number | null;
  margin: string;
  strategy: string;
}

export interface OfferStructure {
  headline: string;
  mainOffer: string;
  bonuses: string[];
  guarantee: string;
  urgency: string;
  stackValue: string;
}

export interface PricingResult {
  competitors: CompetitorPrice[];
  averagePrice: number;
  priceRange: { min: number; max: number };
  recommendedTiers: PricingTier[];
  offerStructure: OfferStructure;
  reasoning: string;
}

export async function scrapeGoogleShopping(
  query: string
): Promise<CompetitorPrice[]> {
  const results: CompetitorPrice[] = [];

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.google.com/search?q=${encodedQuery}&tbm=shop&hl=en`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) return results;

    const html = await response.text();
    const $ = cheerio.load(html);

    $(".sh-dgr__grid-result, .sh-dlr__list-result, [data-docid]").each(
      (_, el) => {
        try {
          const card = $(el);
          const title = card
            .find("h3, .tAxDx, [data-name]")
            .first()
            .text()
            .trim();
          const priceText = card
            .find(".a8Pemb, .HRLxBb, [data-price]")
            .first()
            .text()
            .trim();
          const source = card
            .find(".aULzUe, .IuHnof")
            .first()
            .text()
            .trim();
          const ratingText = card
            .find("[aria-label*='rating'], .Rsc7Yb")
            .first()
            .attr("aria-label");

          if (title && priceText) {
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
            if (!isNaN(price) && price > 0) {
              let rating: number | undefined;
              if (ratingText) {
                const rMatch = ratingText.match(/([\d.]+)/);
                if (rMatch) rating = parseFloat(rMatch[1]);
              }

              results.push({
                title: title.slice(0, 120),
                price,
                source: source || "Google Shopping",
                rating,
              });
            }
          }
        } catch {
          // skip malformed
        }
      }
    );
  } catch {
    // Google Shopping may block; return empty
  }

  return results.slice(0, 10);
}

async function getApiKey(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const setting = await db.setting.findUnique({
    where: { key_userId: { key: "openai_api_key", userId: session.user.id } },
  });

  return setting?.value || process.env.OPENAI_API_KEY || null;
}

export async function generatePricingRecommendation(
  productTitle: string,
  productPrice: number,
  productCategory: string,
  competitors: CompetitorPrice[]
): Promise<PricingResult> {
  const apiKey = await getApiKey();

  const competitorSummary =
    competitors.length > 0
      ? competitors
          .map(
            (c) =>
              `- ${c.title}: $${c.price.toFixed(2)} (${c.source}${c.rating ? `, ${c.rating}★` : ""})`
          )
          .join("\n")
      : "No competitor data available — recommend pricing based on category norms.";

  const avgPrice =
    competitors.length > 0
      ? competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length
      : productPrice;

  const priceRange =
    competitors.length > 0
      ? {
          min: Math.min(...competitors.map((c) => c.price)),
          max: Math.max(...competitors.map((c) => c.price)),
        }
      : { min: productPrice * 0.7, max: productPrice * 2.5 };

  if (!apiKey) {
    return buildFallbackPricing(
      productTitle,
      productPrice,
      competitors,
      avgPrice,
      priceRange
    );
  }

  const client = new OpenAI({ apiKey });
  const prompt = `You are a pricing strategist for e-commerce. Analyze this product and competitor data, then recommend optimal pricing.

PRODUCT: "${productTitle}"
CATEGORY: ${productCategory}
CURRENT/KALO PRICE: $${productPrice.toFixed(2)}

COMPETITOR PRICES:
${competitorSummary}

AVERAGE MARKET PRICE: $${avgPrice.toFixed(2)}
PRICE RANGE: $${priceRange.min.toFixed(2)} - $${priceRange.max.toFixed(2)}

Return JSON:
{
  "recommendedTiers": [
    { "name": "Economy", "price": X.XX, "compareAtPrice": X.XX or null, "margin": "XX%", "strategy": "Why this price point works" },
    { "name": "Standard", "price": X.XX, "compareAtPrice": X.XX or null, "margin": "XX%", "strategy": "Why this price point works" },
    { "name": "Premium", "price": X.XX, "compareAtPrice": X.XX or null, "margin": "XX%", "strategy": "Why this price point works" }
  ],
  "offerStructure": {
    "headline": "Irresistible offer headline",
    "mainOffer": "Core offer description",
    "bonuses": ["Bonus 1", "Bonus 2", "Bonus 3"],
    "guarantee": "Risk-reversal guarantee text",
    "urgency": "Time-limited urgency angle",
    "stackValue": "Total perceived value of the full offer"
  },
  "reasoning": "2-3 sentence explanation of the pricing strategy"
}

Return ONLY valid JSON.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    max_tokens: 1500,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty AI response");

  const cleaned = raw
    .replace(/^```json?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "");

  try {
    const parsed = JSON.parse(cleaned) as {
      recommendedTiers: PricingTier[];
      offerStructure: OfferStructure;
      reasoning: string;
    };

    return {
      competitors,
      averagePrice: avgPrice,
      priceRange,
      recommendedTiers: parsed.recommendedTiers,
      offerStructure: parsed.offerStructure,
      reasoning: parsed.reasoning,
    };
  } catch {
    return buildFallbackPricing(
      productTitle,
      productPrice,
      competitors,
      avgPrice,
      priceRange
    );
  }
}

function buildFallbackPricing(
  _productTitle: string,
  productPrice: number,
  competitors: CompetitorPrice[],
  avgPrice: number,
  priceRange: { min: number; max: number }
): PricingResult {
  const basePrice = Math.max(productPrice, avgPrice * 0.9);

  return {
    competitors,
    averagePrice: avgPrice,
    priceRange,
    recommendedTiers: [
      {
        name: "Economy",
        price: Math.round(basePrice * 1.5 * 100) / 100,
        compareAtPrice: Math.round(basePrice * 2.5 * 100) / 100,
        margin: "50%",
        strategy: "Competitive entry price to capture price-sensitive buyers",
      },
      {
        name: "Standard",
        price: Math.round(basePrice * 2.2 * 100) / 100,
        compareAtPrice: Math.round(basePrice * 3.5 * 100) / 100,
        margin: "120%",
        strategy: "Sweet spot pricing with perceived value anchoring",
      },
      {
        name: "Premium",
        price: Math.round(basePrice * 3.0 * 100) / 100,
        compareAtPrice: Math.round(basePrice * 5.0 * 100) / 100,
        margin: "200%",
        strategy: "Premium positioning for maximum margin per sale",
      },
    ],
    offerStructure: {
      headline: "Special Launch Offer",
      mainOffer: "Get the product at our introductory price",
      bonuses: [
        "Free express shipping",
        "Extended 60-day guarantee",
        "Priority customer support",
      ],
      guarantee: "60-Day Money-Back Guarantee — no questions asked",
      urgency: "Launch pricing available for a limited time only",
      stackValue: `$${(basePrice * 5).toFixed(2)} total value`,
    },
    reasoning:
      "Fallback pricing based on standard e-commerce markup multipliers. Configure an OpenAI API key for AI-powered pricing recommendations.",
  };
}
