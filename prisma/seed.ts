import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash("admin123", 12);

  const user = await prisma.user.upsert({
    where: { email: "admin@fflame.io" },
    update: {},
    create: {
      email: "admin@fflame.io",
      name: "Admin",
      hashedPassword,
      role: "admin",
    },
  });

  const products = [
    { title: "Wireless Bluetooth Earbuds Pro", price: 29.99, compareAtPrice: 49.99, status: "published", category: "Electronics", variants: JSON.stringify([{ name: "Black" }, { name: "White" }, { name: "Blue" }]), images: JSON.stringify(["https://placehold.co/80x80/1e1e2a/d946ef?text=E"]), source: "kalodata.com", aiGenerated: true, shopifyProductId: "gid://shopify/Product/8001", syncedAt: new Date() },
    { title: "LED Ring Light 10-inch", price: 18.50, compareAtPrice: 34.99, status: "ready", category: "Photography", variants: JSON.stringify([{ name: "10 inch" }, { name: "12 inch" }]), images: JSON.stringify(["https://placehold.co/80x80/1e1e2a/a855f7?text=L"]), source: "kalodata.com", aiGenerated: true },
    { title: "Portable Blender USB Rechargeable", price: 22.00, status: "draft", category: "Kitchen", variants: JSON.stringify([{ name: "Pink" }, { name: "Blue" }, { name: "Green" }, { name: "White" }]), images: JSON.stringify(["https://placehold.co/80x80/1e1e2a/6366f1?text=B"]), source: "kalodata.com", aiGenerated: false },
    { title: "Smart Watch Fitness Tracker", price: 35.99, compareAtPrice: 69.99, status: "published", category: "Wearables", variants: JSON.stringify([{ name: "S" }, { name: "M" }, { name: "L" }, { name: "XL" }, { name: "XXL" }]), images: JSON.stringify(["https://placehold.co/80x80/1e1e2a/22c55e?text=W"]), source: "kalodata.com", aiGenerated: true, shopifyProductId: "gid://shopify/Product/8002", syncedAt: new Date() },
    { title: "Phone Holder Car Mount Magnetic", price: 12.99, status: "error", category: "Auto Accessories", variants: JSON.stringify([{ name: "Universal" }]), images: JSON.stringify(["https://placehold.co/80x80/1e1e2a/ef4444?text=P"]), source: "kalodata.com", aiGenerated: false },
    { title: "Mini Projector HD 1080P", price: 89.99, compareAtPrice: 149.99, status: "ready", category: "Electronics", variants: JSON.stringify([{ name: "Standard" }, { name: "Pro" }]), images: JSON.stringify(["https://placehold.co/80x80/1e1e2a/eab308?text=M"]), source: "kalodata.com", aiGenerated: true },
    { title: "Electric Milk Frother Handheld", price: 9.99, status: "draft", category: "Kitchen", variants: JSON.stringify([{ name: "Standard" }]), images: JSON.stringify(["https://placehold.co/80x80/1e1e2a/3b82f6?text=F"]), source: "kalodata.com", aiGenerated: false },
    { title: "Gaming Mouse Pad XXL RGB", price: 15.99, compareAtPrice: 24.99, status: "published", category: "Gaming", variants: JSON.stringify([{ name: "XL" }, { name: "XXL" }, { name: "XXXL" }]), images: JSON.stringify(["https://placehold.co/80x80/1e1e2a/d946ef?text=G"]), source: "kalodata.com", aiGenerated: true, shopifyProductId: "gid://shopify/Product/8003", syncedAt: new Date() },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  await prisma.importJob.createMany({
    data: [
      { source: "Kalo Data", url: "https://kalodata.com/product/trending?region=US", status: "completed", productsFound: 24, productsImported: 22, errors: 2, finishedAt: new Date() },
      { source: "Kalo Data", url: "https://kalodata.com/product/electronics?sort=revenue", status: "running", productsFound: 18, productsImported: 11, errors: 0 },
      { source: "Kalo Data", url: "https://kalodata.com/product/kitchen?min_rating=4", status: "queued", productsFound: 0, productsImported: 0, errors: 0 },
    ],
  });

  const activityData = [
    { type: "publish", message: 'Published "Wireless Bluetooth Earbuds Pro" to Shopify', userId: user.id },
    { type: "ai", message: "Generated SEO content for 6 products", userId: user.id },
    { type: "import", message: "Imported 22 products from Kalo Data trending feed", userId: user.id },
    { type: "error", message: 'Failed to upload images for "Phone Holder Car Mount"', userId: user.id },
    { type: "sync", message: "Synced inventory for 3 products with Shopify", userId: user.id },
    { type: "publish", message: 'Published "Smart Watch Fitness Tracker" to Shopify', userId: user.id },
    { type: "ai", message: "Generated product descriptions for batch #14", userId: user.id },
    { type: "import", message: "Imported 15 products from Kalo Data electronics feed", userId: user.id },
  ];

  for (let i = 0; i < activityData.length; i++) {
    await prisma.activity.create({
      data: {
        ...activityData[i],
        createdAt: new Date(Date.now() - i * 15 * 60 * 1000),
      },
    });
  }

  const reviews = [
    { author: "Alex M.", rating: 5, text: "Incredible sound quality for the price! The noise cancellation is surprisingly good.", date: "Mar 18, 2026", verified: true, helpful: 24 },
    { author: "Jamie K.", rating: 4, text: "Great fitness tracker with accurate heart rate monitoring. The sleep tracking is a nice bonus.", date: "Mar 15, 2026", verified: true, helpful: 18 },
    { author: "Sarah T.", rating: 5, text: "Perfect for my video calls and content creation! Three light modes and the dimmer works smoothly.", date: "Mar 12, 2026", verified: false, helpful: 9 },
    { author: "Michael R.", rating: 3, text: "Works okay for thin smoothies but struggles with frozen fruit. Good for travel.", date: "Mar 10, 2026", verified: true, helpful: 7 },
    { author: "Chris W.", rating: 5, text: "The RGB lighting is insane — 14 different modes! Surface is super smooth for my mouse.", date: "Mar 8, 2026", verified: true, helpful: 31 },
    { author: "Dana L.", rating: 4, text: "Really impressed with the image quality in a dark room. Great value for movie nights!", date: "Mar 5, 2026", verified: false, helpful: 15 },
  ];

  const allProducts = await prisma.product.findMany();
  for (let i = 0; i < reviews.length; i++) {
    await prisma.review.create({
      data: {
        ...reviews[i],
        productId: allProducts[i % allProducts.length].id,
      },
    });
  }

  // Theme presets
  const presetDefs = [
    { name: "Supplements & Health", slug: "supplements", category: "Supplements", description: "Clean, clinical design with ingredient tables and lab-tested badges", colors: JSON.stringify({ accent: "#22c55e", accentLight: "#bbf7d0", background: "#f0fdf4", buttonBg: "#16a34a", buttonText: "#ffffff", badgeBg: "#dcfce7", badgeText: "#166534" }), typography: JSON.stringify({ headingFont: "Poppins", bodyFont: "Inter", headingScale: 110, bodyScale: 100 }), sections: "[]", badges: JSON.stringify([{ text: "Lab Tested", color: "#22c55e", icon: "shield" }, { text: "GMP Certified", color: "#16a34a", icon: "check_circle" }, { text: "Third Party Verified", color: "#15803d", icon: "verified" }]) },
    { name: "Electronics & Tech", slug: "electronics", category: "Electronics", description: "Technical layout with specs tables and warranty highlights", colors: JSON.stringify({ accent: "#3b82f6", accentLight: "#bfdbfe", background: "#eff6ff", buttonBg: "#2563eb", buttonText: "#ffffff", badgeBg: "#dbeafe", badgeText: "#1e40af" }), typography: JSON.stringify({ headingFont: "Inter", bodyFont: "Inter", headingScale: 105, bodyScale: 100 }), sections: "[]", badges: JSON.stringify([{ text: "1-Year Warranty", color: "#3b82f6", icon: "shield" }, { text: "Fast Shipping", color: "#2563eb", icon: "truck" }, { text: "Tech Certified", color: "#1d4ed8", icon: "check_circle" }]) },
    { name: "Beauty & Skincare", slug: "beauty", category: "Beauty", description: "Elegant design with ingredient spotlights and review carousels", colors: JSON.stringify({ accent: "#f43f5e", accentLight: "#fecdd3", background: "#fff1f2", buttonBg: "#e11d48", buttonText: "#ffffff", badgeBg: "#ffe4e6", badgeText: "#9f1239" }), typography: JSON.stringify({ headingFont: "Playfair Display", bodyFont: "Lato", headingScale: 115, bodyScale: 100 }), sections: "[]", badges: JSON.stringify([{ text: "Cruelty Free", color: "#f43f5e", icon: "heart" }, { text: "Dermatologist Tested", color: "#e11d48", icon: "check_circle" }, { text: "Clean Beauty", color: "#be123c", icon: "leaf" }]) },
    { name: "Home & Kitchen", slug: "home-kitchen", category: "Home", description: "Warm layout with room galleries and care instructions", colors: JSON.stringify({ accent: "#f59e0b", accentLight: "#fde68a", background: "#fffbeb", buttonBg: "#d97706", buttonText: "#ffffff", badgeBg: "#fef3c7", badgeText: "#92400e" }), typography: JSON.stringify({ headingFont: "Nunito", bodyFont: "Inter", headingScale: 110, bodyScale: 100 }), sections: "[]", badges: JSON.stringify([{ text: "Eco-Friendly", color: "#f59e0b", icon: "leaf" }, { text: "Easy Assembly", color: "#d97706", icon: "tool" }, { text: "Satisfaction Guaranteed", color: "#b45309", icon: "heart" }]) },
    { name: "Fashion & Apparel", slug: "fashion", category: "Fashion", description: "Stylish layout with size guides and lookbook galleries", colors: JSON.stringify({ accent: "#a855f7", accentLight: "#e9d5ff", background: "#faf5ff", buttonBg: "#9333ea", buttonText: "#ffffff", badgeBg: "#f3e8ff", badgeText: "#6b21a8" }), typography: JSON.stringify({ headingFont: "Cormorant Garamond", bodyFont: "Inter", headingScale: 120, bodyScale: 100 }), sections: "[]", badges: JSON.stringify([{ text: "Sustainably Sourced", color: "#a855f7", icon: "leaf" }, { text: "True to Size", color: "#9333ea", icon: "ruler" }, { text: "Premium Fabric", color: "#7e22ce", icon: "star" }]) },
    { name: "Fitness & Sports", slug: "fitness", category: "Fitness", description: "Bold, energetic layout with workout use cases and athlete reviews", colors: JSON.stringify({ accent: "#f97316", accentLight: "#fed7aa", background: "#fff7ed", buttonBg: "#ea580c", buttonText: "#ffffff", badgeBg: "#ffedd5", badgeText: "#9a3412" }), typography: JSON.stringify({ headingFont: "Oswald", bodyFont: "Inter", headingScale: 115, bodyScale: 100 }), sections: "[]", badges: JSON.stringify([{ text: "Pro Approved", color: "#f97316", icon: "star" }, { text: "Heavy Duty", color: "#ea580c", icon: "shield" }, { text: "30-Day Guarantee", color: "#c2410c", icon: "heart" }]) },
  ];

  for (const def of presetDefs) {
    await prisma.themePreset.upsert({
      where: { slug: def.slug },
      update: {},
      create: { ...def, isDefault: true },
    });
  }

  console.log("Seed complete: 1 user, 8 products, 3 jobs, 8 activities, 6 reviews, 6 theme presets");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
