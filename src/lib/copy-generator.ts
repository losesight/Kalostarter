import OpenAI from "openai";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { AdAnalysisResult } from "@/lib/ad-intelligence";
import type { PricingResult } from "@/lib/pricing-engine";

export interface WebsiteCopy {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    urgencyBanner: string;
  };
  productSection: {
    title: string;
    description: string;
    bullets: string[];
    guaranteeText: string;
  };
  socialProof: {
    headline: string;
    testimonialPrompts: string[];
    statsLine: string;
  };
  faq: { question: string; answer: string }[];
  seo: {
    title: string;
    metaDescription: string;
    keywords: string[];
  };
}

export interface GeneratedAdCopy {
  angles: {
    name: string;
    headline: string;
    primaryText: string;
    description: string;
    cta: string;
  }[];
  emailSubjectLines: string[];
  smsMessages: string[];
}

export interface CopyGeneratorResult {
  websiteCopy: WebsiteCopy;
  adCopy: GeneratedAdCopy;
}

async function getApiKey(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const setting = await db.setting.findUnique({
    where: { key_userId: { key: "openai_api_key", userId: session.user.id } },
  });

  return setting?.value || process.env.OPENAI_API_KEY || null;
}

export async function generateAlignedCopy(
  product: {
    title: string;
    price: number;
    category: string;
    description?: string;
  },
  adAnalysis: AdAnalysisResult | null,
  pricingResult: PricingResult | null
): Promise<CopyGeneratorResult> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error(
      "OpenAI API key not configured. Add it in Settings or set OPENAI_API_KEY."
    );
  }

  const client = new OpenAI({ apiKey });

  const adContext = adAnalysis
    ? `
AD INTELLIGENCE CONTEXT:
- Customer avatar: ${adAnalysis.customerAvatar.demographics.ageRange} ${adAnalysis.customerAvatar.demographics.gender}, ${adAnalysis.customerAvatar.demographics.income}
- Pain points: ${adAnalysis.customerAvatar.psychographics.painPoints.join(", ")}
- Desires: ${adAnalysis.customerAvatar.psychographics.desires.join(", ")}
- Buying triggers: ${adAnalysis.customerAvatar.psychographics.buyingTriggers.join(", ")}
- Objections to address: ${adAnalysis.customerAvatar.psychographics.objections.join(", ")}
- Unique mechanism: ${adAnalysis.messagingFramework.uniqueMechanism}
- Big promise: ${adAnalysis.messagingFramework.bigPromise}
- Proof points: ${adAnalysis.messagingFramework.proofPoints.join(", ")}
- Best hooks: ${adAnalysis.creativePerformance.hooks.slice(0, 3).join(" | ")}
- Emotional triggers: ${adAnalysis.creativePerformance.emotionalTriggers.join(", ")}`
    : "No ad intelligence available — generate copy based on the product alone.";

  const pricingContext = pricingResult
    ? `
PRICING CONTEXT:
- Recommended price: $${pricingResult.recommendedTiers[1]?.price.toFixed(2) || pricingResult.recommendedTiers[0]?.price.toFixed(2)}
- Compare-at price: $${pricingResult.recommendedTiers[1]?.compareAtPrice?.toFixed(2) || "N/A"}
- Offer headline: ${pricingResult.offerStructure.headline}
- Bonuses: ${pricingResult.offerStructure.bonuses.join(", ")}
- Guarantee: ${pricingResult.offerStructure.guarantee}
- Urgency: ${pricingResult.offerStructure.urgency}
- Stack value: ${pricingResult.offerStructure.stackValue}`
    : "";

  const prompt = `You are an elite e-commerce copywriter who specializes in high-converting Shopify stores. Generate website copy and ad copy that are aligned in messaging.

PRODUCT:
- Title: ${product.title}
- Category: ${product.category}
- Price: $${product.price.toFixed(2)}
${product.description ? `- Description: ${product.description}` : ""}

${adContext}
${pricingContext}

CRITICAL: The website copy and ad copy must use the SAME messaging angles, hooks, and emotional triggers. When someone clicks an ad, the landing page must feel like a natural continuation of that ad.

Return JSON:
{
  "websiteCopy": {
    "hero": {
      "headline": "Bold, benefit-driven headline (match top ad hook)",
      "subheadline": "Supporting line that addresses the #1 pain point",
      "ctaText": "Action-oriented CTA button text",
      "urgencyBanner": "Urgency/scarcity banner text"
    },
    "productSection": {
      "title": "Feature-focused product title",
      "description": "2-3 paragraph HTML description with <p> tags — benefit-focused, conversion-optimized",
      "bullets": ["5 feature/benefit bullet points"],
      "guaranteeText": "Risk-reversal guarantee copy"
    },
    "socialProof": {
      "headline": "Social proof section headline",
      "testimonialPrompts": ["3 realistic testimonial-style statements"],
      "statsLine": "A stats/credibility line (e.g., '10,000+ happy customers')"
    },
    "faq": [
      { "question": "Common question", "answer": "Persuasive answer" }
    ],
    "seo": {
      "title": "SEO title (max 60 chars)",
      "metaDescription": "Meta description (max 160 chars, includes CTA)",
      "keywords": ["5-8 target keywords"]
    }
  },
  "adCopy": {
    "angles": [
      {
        "name": "Angle name",
        "headline": "Ad headline (max 40 chars)",
        "primaryText": "Full ad primary text (2-3 short paragraphs)",
        "description": "Ad description line (max 30 chars)",
        "cta": "CTA text"
      }
    ],
    "emailSubjectLines": ["5 email subject lines for launch/promo"],
    "smsMessages": ["3 SMS messages under 160 chars"]
  }
}

Provide exactly 3 ad copy angles and 4 FAQ items. Return ONLY valid JSON.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty AI response");

  const cleaned = raw
    .replace(/^```json?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "");

  try {
    const parsed = JSON.parse(cleaned) as CopyGeneratorResult;
    if (!parsed.websiteCopy || !parsed.adCopy) {
      throw new Error("Incomplete copy generation");
    }
    return parsed;
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error(`Failed to parse AI response: ${cleaned.slice(0, 300)}`);
    }
    throw e;
  }
}
