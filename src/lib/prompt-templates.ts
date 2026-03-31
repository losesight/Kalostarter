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

const categoryInstructions: Record<string, string> = {
  Supplements: `CATEGORY-SPECIFIC GUIDELINES (Supplements/Health):
- Lead with health benefits and results customers can expect
- Mention key ingredients and their scientifically-backed benefits
- Include dosage/serving information in the description
- Use trust language: "clinically studied", "third-party tested", "GMP certified"
- Include a disclaimer: "These statements have not been evaluated by the FDA"
- Bullets should cover: key ingredient, benefit, purity/testing, suggested use, value proposition
- Avoid medical claims — focus on wellness and lifestyle improvement`,

  Electronics: `CATEGORY-SPECIFIC GUIDELINES (Electronics/Tech):
- Lead with the primary technical advantage or innovation
- Include specific specs: dimensions, battery life, connectivity, compatibility
- Mention what's in the box and compatibility with common devices
- Use comparison language: "faster than", "lasts longer than", "works with"
- Bullets should cover: key spec, compatibility, battery/power, build quality, warranty
- Reference use cases: gaming, work, travel, content creation`,

  Beauty: `CATEGORY-SPECIFIC GUIDELINES (Beauty/Skincare):
- Lead with the skin concern it addresses and visible results
- Highlight hero ingredients with brief explanations of their benefits
- Mention skin types it's suitable for
- Use sensory language: texture, scent, feel on skin
- Bullets should cover: hero ingredient, skin benefit, skin type, application method, clean/cruelty-free status
- Reference dermatological testing or clinical studies if applicable`,

  Home: `CATEGORY-SPECIFIC GUIDELINES (Home & Kitchen):
- Lead with the problem it solves in the home or how it improves daily life
- Include dimensions, materials, and weight
- Describe ease of setup, maintenance, and cleaning
- Use lifestyle language: "transforms your space", "effortless entertaining"
- Bullets should cover: material quality, dimensions, ease of use, care/cleaning, style versatility
- Mention if eco-friendly, BPA-free, or sustainably sourced`,

  Fashion: `CATEGORY-SPECIFIC GUIDELINES (Fashion/Apparel):
- Lead with the style statement and occasions it's perfect for
- Include fabric composition, weight, and care instructions
- Reference the fit: true-to-size, oversized, slim, relaxed
- Use aspirational language: "elevate your wardrobe", "effortlessly chic"
- Bullets should cover: fabric quality, fit guide, versatility, care instructions, sustainability
- Mention size range and inclusive sizing if applicable`,

  Fitness: `CATEGORY-SPECIFIC GUIDELINES (Fitness/Sports):
- Lead with the performance benefit and what workouts it's designed for
- Include durability specs: weight capacity, material strength, grip type
- Mention portability and storage if relevant
- Use motivational language: "push your limits", "built for champions"
- Bullets should cover: primary use case, durability, comfort/ergonomics, portability, guarantee
- Reference specific exercises or muscle groups it targets`,
};

import { resolveCategory } from "@/lib/theme-presets";

export function buildProductPrompt(
  product: {
    title: string;
    price: number;
    category?: string;
    description?: string;
  },
  tone: Tone
) {
  const resolvedCategory = product.category
    ? resolveCategory(product.category)
    : "Electronics";

  const categoryGuide = categoryInstructions[resolvedCategory] || "";

  return `You are an expert e-commerce copywriter. Generate product content for a Shopify listing.

PRODUCT DATA:
- Title: ${product.title}
- Price: $${product.price.toFixed(2)}
- Category: ${product.category || "General"}
${product.description ? `- Existing description: ${product.description}` : ""}

BRAND TONE: ${tone}
${toneDescriptions[tone]}

${categoryGuide}

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
- SEO title and description should differ from the product title
- Tailor the language and selling points to the ${resolvedCategory} category`;
}
