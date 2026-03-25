import { NextResponse } from "next/server";
import { listThemes } from "@/lib/shopify-client";
import { getShopifyConfig } from "@/lib/shopify-helpers";

export async function GET() {
  const config = await getShopifyConfig();
  if (!config) {
    return NextResponse.json({ error: "Shopify not connected" }, { status: 400 });
  }

  try {
    const themes = await listThemes(config);
    return NextResponse.json(themes);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to list themes" },
      { status: 500 }
    );
  }
}
