import OpenAI from "openai";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { buildProductPrompt, type Tone } from "@/lib/prompt-templates";

export interface GeneratedContent {
  title: string;
  description: string;
  bullets: string[];
  seoTitle: string;
  seoDescription: string;
}

async function getApiKey(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const setting = await db.setting.findUnique({
    where: { key_userId: { key: "openai_api_key", userId: session.user.id } },
  });

  return setting?.value || process.env.OPENAI_API_KEY || null;
}

export async function generateProductContent(
  product: {
    title: string;
    price: number;
    category?: string;
    description?: string;
  },
  tone: Tone = "Professional"
): Promise<GeneratedContent> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error(
      "OpenAI API key not configured. Add it in Settings or set OPENAI_API_KEY environment variable."
    );
  }

  const client = new OpenAI({ apiKey });
  const prompt = buildProductPrompt(product, tone);

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty response from AI");

  // Strip markdown fences if present
  const cleaned = raw.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  try {
    const parsed = JSON.parse(cleaned) as GeneratedContent;

    if (!parsed.title || !parsed.description || !parsed.bullets) {
      throw new Error("Incomplete content generated");
    }

    return parsed;
  } catch {
    throw new Error(`Failed to parse AI response: ${cleaned.slice(0, 200)}`);
  }
}

/**
 * Streaming variant — yields tokens as they arrive.
 */
export async function* streamProductContent(
  product: {
    title: string;
    price: number;
    category?: string;
    description?: string;
  },
  tone: Tone = "Professional"
): AsyncGenerator<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error("OpenAI API key not configured.");
  }

  const client = new OpenAI({ apiKey });
  const prompt = buildProductPrompt(product, tone);

  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
