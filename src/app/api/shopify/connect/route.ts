import { NextResponse } from "next/server";
import { testConnection } from "@/lib/shopify-client";
import { getShopifyConfig } from "@/lib/shopify-helpers";

export async function GET() {
  const config = await getShopifyConfig();
  if (!config) {
    return NextResponse.json(
      { connected: false, error: "Shopify credentials not configured. Add them in Settings." },
      { status: 200 }
    );
  }

  try {
    const shop = await testConnection(config);
    return NextResponse.json({ connected: true, shop });
  } catch (e) {
    return NextResponse.json({
      connected: false,
      error: e instanceof Error ? e.message : "Connection failed",
    });
  }
}
