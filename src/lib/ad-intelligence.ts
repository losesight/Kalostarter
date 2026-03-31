import OpenAI from "openai";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export interface AdIntelligenceInput {
  productTitle: string;
  productCategory: string;
  productPrice: number;
  adContent?: string;
  adPlatform?: string;
  adMetrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    ctr?: number;
  };
}

export interface CustomerAvatar {
  demographics: {
    ageRange: string;
    gender: string;
    income: string;
    location: string;
  };
  psychographics: {
    painPoints: string[];
    desires: string[];
    objections: string[];
    buyingTriggers: string[];
  };
  platforms: string[];
}

export interface AdAnalysisResult {
  contentFormat: {
    type: string;
    reasoning: string;
    recommendedFormats: string[];
  };
  creativePerformance: {
    hooks: string[];
    emotionalTriggers: string[];
    whyItWorks: string;
    weaknesses: string[];
  };
  facebookPrediction: {
    estimatedCTR: string;
    estimatedCPM: string;
    estimatedROAS: string;
    confidence: string;
    reasoning: string;
  };
  customerAvatar: CustomerAvatar;
  adCopyAngles: {
    angle: string;
    headline: string;
    primaryText: string;
    cta: string;
  }[];
  messagingFramework: {
    uniqueMechanism: string;
    bigPromise: string;
    proofPoints: string[];
    urgencyAngle: string;
  };
}

async function getApiKey(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const setting = await db.setting.findUnique({
    where: { key_userId: { key: "openai_api_key", userId: session.user.id } },
  });

  return setting?.value || process.env.OPENAI_API_KEY || null;
}

function buildAdIntelligencePrompt(input: AdIntelligenceInput): string {
  const adSection = input.adContent
    ? `
EXISTING AD CONTENT:
"${input.adContent}"

AD PLATFORM: ${input.adPlatform || "Unknown"}
${input.adMetrics ? `AD METRICS: Views: ${input.adMetrics.views || "N/A"}, Likes: ${input.adMetrics.likes || "N/A"}, Comments: ${input.adMetrics.comments || "N/A"}, Shares: ${input.adMetrics.shares || "N/A"}, CTR: ${input.adMetrics.ctr || "N/A"}%` : ""}`
    : "No existing ad content provided — generate recommendations based on the product alone.";

  return `You are a world-class performance marketer and creative strategist specializing in direct-response advertising on Facebook/Meta, TikTok, and Instagram.

PRODUCT:
- Title: ${input.productTitle}
- Category: ${input.productCategory}
- Price: $${input.productPrice.toFixed(2)}

${adSection}

Analyze this product and any provided ad data. Return a JSON object with these exact fields:

{
  "contentFormat": {
    "type": "UGC | Static | Video | Carousel | Story",
    "reasoning": "Why this format works for this product",
    "recommendedFormats": ["Top 3 formats ranked by expected performance"]
  },
  "creativePerformance": {
    "hooks": ["5 attention-grabbing hooks for the first 3 seconds of an ad"],
    "emotionalTriggers": ["3-4 psychological triggers this product can leverage"],
    "whyItWorks": "If existing ad was provided, explain why it performs. Otherwise, explain the ideal creative approach.",
    "weaknesses": ["2-3 things to avoid or improve"]
  },
  "facebookPrediction": {
    "estimatedCTR": "X.X% - X.X%",
    "estimatedCPM": "$X - $X",
    "estimatedROAS": "X.Xx - X.Xx",
    "confidence": "Low | Medium | High",
    "reasoning": "Basis for these estimates"
  },
  "customerAvatar": {
    "demographics": {
      "ageRange": "XX-XX",
      "gender": "Male | Female | Both",
      "income": "$XXk-$XXk",
      "location": "US/UK/Global etc."
    },
    "psychographics": {
      "painPoints": ["3-4 specific pain points"],
      "desires": ["3-4 desires/aspirations"],
      "objections": ["3-4 likely purchase objections"],
      "buyingTriggers": ["3-4 things that would make them buy NOW"]
    },
    "platforms": ["Where this avatar spends time online"]
  },
  "adCopyAngles": [
    {
      "angle": "Name of the angle (e.g., Problem-Solution, Social Proof, Fear of Missing Out)",
      "headline": "Ad headline for this angle",
      "primaryText": "Full primary text (2-3 paragraphs, direct-response style)",
      "cta": "Call to action text"
    }
  ],
  "messagingFramework": {
    "uniqueMechanism": "The unique mechanism or differentiator for this product",
    "bigPromise": "The #1 transformation or result the customer gets",
    "proofPoints": ["3-4 proof elements (social proof, authority, scarcity, etc.)"],
    "urgencyAngle": "Why the customer should buy now vs. later"
  }
}

Provide exactly 3 different ad copy angles. Return ONLY valid JSON, no markdown fences or extra text.`;
}

export async function analyzeAd(
  input: AdIntelligenceInput
): Promise<AdAnalysisResult> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error(
      "OpenAI API key not configured. Add it in Settings or set OPENAI_API_KEY."
    );
  }

  const client = new OpenAI({ apiKey });
  const prompt = buildAdIntelligencePrompt(input);

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty response from AI");

  const cleaned = raw
    .replace(/^```json?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "");

  try {
    const parsed = JSON.parse(cleaned) as AdAnalysisResult;
    if (!parsed.customerAvatar || !parsed.adCopyAngles || !parsed.facebookPrediction) {
      throw new Error("Incomplete ad analysis");
    }
    return parsed;
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error(`Failed to parse AI response: ${cleaned.slice(0, 300)}`);
    }
    throw e;
  }
}
