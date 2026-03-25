import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateProductContent, streamProductContent } from "@/lib/ai-client";
import type { Tone } from "@/lib/prompt-templates";

const generateSchema = z.object({
  productId: z.string(),
  tone: z
    .enum(["Professional", "Casual", "Luxury", "Playful", "Technical"])
    .default("Professional"),
  stream: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { productId, tone, stream } = parsed.data;

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productData = {
      title: product.title,
      price: product.price,
      category: product.category || undefined,
      description: product.description || undefined,
    };

    // Streaming response
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            let fullContent = "";
            for await (const chunk of streamProductContent(
              productData,
              tone as Tone
            )) {
              fullContent += chunk;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
            }

            // Save completed generation
            const cleaned = fullContent
              .replace(/^```json?\s*\n?/i, "")
              .replace(/\n?```\s*$/i, "");
            try {
              const content = JSON.parse(cleaned);
              await saveContent(productId, content);
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ done: true, content })}\n\n`)
              );
            } catch {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ done: true, raw: fullContent })}\n\n`)
              );
            }
          } catch (e) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: e instanceof Error ? e.message : "Generation failed" })}\n\n`
              )
            );
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming response
    const content = await generateProductContent(productData, tone as Tone);

    await saveContent(productId, content);

    await db.activity.create({
      data: {
        type: "ai",
        message: `Generated AI content for "${product.title}"`,
      },
    });

    return NextResponse.json(content);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 500 }
    );
  }
}

async function saveContent(
  productId: string,
  content: {
    title: string;
    description: string;
    bullets: string[];
    seoTitle: string;
    seoDescription: string;
  }
) {
  await db.product.update({
    where: { id: productId },
    data: {
      aiTitle: content.title,
      aiDescription: content.description,
      aiBullets: JSON.stringify(content.bullets),
      seoTitle: content.seoTitle,
      seoDescription: content.seoDescription,
      aiGenerated: true,
      status: "ready",
    },
  });
}
