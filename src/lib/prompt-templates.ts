export type Tone = "Professional" | "Casual" | "Luxury" | "Playful" | "Technical";

const toneDescriptions: Record<Tone, string> = {
  Professional:
    "Clear, authoritative, and trust-building. Use industry terms where appropriate but keep it accessible.",
  Casual:
    "Friendly and conversational, like talking to a friend. Use contractions and everyday language.",
  Luxury:
    "Elegant and aspirational. Emphasize craftsmanship, exclusivity, and premium quality.",
  Playful:
    "Fun and energetic. Use puns, exclamation marks, and enthusiasm. Make the reader smile.",
  Technical:
    "Detailed and spec-focused. Lead with features, measurements, and technical advantages.",
};

export function buildProductPrompt(
  product: {
    title: string;
    price: number;
    category?: string;
    description?: string;
  },
  tone: Tone
) {
  return `You are an expert e-commerce copywriter. Generate product content for a Shopify listing.

PRODUCT DATA:
- Title: ${product.title}
- Price: $${product.price.toFixed(2)}
- Category: ${product.category || "General"}
${product.description ? `- Existing description: ${product.description}` : ""}

BRAND TONE: ${tone}
${toneDescriptions[tone]}

Generate the following in JSON format:
{
  "title": "Optimized product title (max 150 chars, include key selling point)",
  "description": "HTML product description (2-3 short paragraphs with <p> tags, persuasive and conversion-optimized)",
  "bullets": ["5 key feature/benefit bullet points, each 1 sentence"],
  "seoTitle": "SEO title (max 60 chars, include primary keyword)",
  "seoDescription": "Meta description (max 160 chars, include CTA)"
}

IMPORTANT:
- Return ONLY valid JSON, no markdown fences or extra text
- Make the description compelling and conversion-focused
- Include specific details and benefits, not generic filler
- SEO title and description should differ from the product title`;
}
