export interface MockProduct {
  id: string;
  title: string;
  source: string;
  price: number;
  compareAtPrice?: number;
  status: "draft" | "ready" | "published" | "error";
  image: string;
  category: string;
  variants: number;
  syncedAt?: string;
  shopifyId?: string;
  aiGenerated: boolean;
}

export interface ImportJob {
  id: string;
  source: string;
  url: string;
  status: "running" | "completed" | "failed" | "queued";
  productsFound: number;
  productsImported: number;
  errors: number;
  startedAt: string;
  finishedAt?: string;
}

export interface ActivityItem {
  id: string;
  type: "import" | "publish" | "ai" | "error" | "sync";
  message: string;
  timestamp: string;
}

export const mockProducts: MockProduct[] = [
  {
    id: "p1",
    title: "Wireless Bluetooth Earbuds Pro",
    source: "kalodata.com",
    price: 29.99,
    compareAtPrice: 49.99,
    status: "published",
    image: "https://placehold.co/80x80/1e1e2a/d946ef?text=E",
    category: "Electronics",
    variants: 3,
    syncedAt: "2 hours ago",
    shopifyId: "gid://shopify/Product/8001",
    aiGenerated: true,
  },
  {
    id: "p2",
    title: "LED Ring Light 10-inch",
    source: "kalodata.com",
    price: 18.5,
    compareAtPrice: 34.99,
    status: "ready",
    image: "https://placehold.co/80x80/1e1e2a/a855f7?text=L",
    category: "Photography",
    variants: 2,
    aiGenerated: true,
  },
  {
    id: "p3",
    title: "Portable Blender USB Rechargeable",
    source: "kalodata.com",
    price: 22.0,
    status: "draft",
    image: "https://placehold.co/80x80/1e1e2a/6366f1?text=B",
    category: "Kitchen",
    variants: 4,
    aiGenerated: false,
  },
  {
    id: "p4",
    title: "Smart Watch Fitness Tracker",
    source: "kalodata.com",
    price: 35.99,
    compareAtPrice: 69.99,
    status: "published",
    image: "https://placehold.co/80x80/1e1e2a/22c55e?text=W",
    category: "Wearables",
    variants: 5,
    syncedAt: "30 min ago",
    shopifyId: "gid://shopify/Product/8002",
    aiGenerated: true,
  },
  {
    id: "p5",
    title: "Phone Holder Car Mount Magnetic",
    source: "kalodata.com",
    price: 12.99,
    status: "error",
    image: "https://placehold.co/80x80/1e1e2a/ef4444?text=P",
    category: "Auto Accessories",
    variants: 1,
    aiGenerated: false,
  },
  {
    id: "p6",
    title: "Mini Projector HD 1080P",
    source: "kalodata.com",
    price: 89.99,
    compareAtPrice: 149.99,
    status: "ready",
    image: "https://placehold.co/80x80/1e1e2a/eab308?text=M",
    category: "Electronics",
    variants: 2,
    aiGenerated: true,
  },
  {
    id: "p7",
    title: "Electric Milk Frother Handheld",
    source: "kalodata.com",
    price: 9.99,
    status: "draft",
    image: "https://placehold.co/80x80/1e1e2a/3b82f6?text=F",
    category: "Kitchen",
    variants: 1,
    aiGenerated: false,
  },
  {
    id: "p8",
    title: "Gaming Mouse Pad XXL RGB",
    source: "kalodata.com",
    price: 15.99,
    compareAtPrice: 24.99,
    status: "published",
    image: "https://placehold.co/80x80/1e1e2a/d946ef?text=G",
    category: "Gaming",
    variants: 3,
    syncedAt: "1 hour ago",
    shopifyId: "gid://shopify/Product/8003",
    aiGenerated: true,
  },
];

export const mockJobs: ImportJob[] = [
  {
    id: "j1",
    source: "Kalo Data",
    url: "https://kalodata.com/product/trending?region=US",
    status: "completed",
    productsFound: 24,
    productsImported: 22,
    errors: 2,
    startedAt: "Today, 10:32 AM",
    finishedAt: "Today, 10:34 AM",
  },
  {
    id: "j2",
    source: "Kalo Data",
    url: "https://kalodata.com/product/electronics?sort=revenue",
    status: "running",
    productsFound: 18,
    productsImported: 11,
    errors: 0,
    startedAt: "Today, 11:15 AM",
  },
  {
    id: "j3",
    source: "Kalo Data",
    url: "https://kalodata.com/product/kitchen?min_rating=4",
    status: "queued",
    productsFound: 0,
    productsImported: 0,
    errors: 0,
    startedAt: "Queued",
  },
];

export const mockActivity: ActivityItem[] = [
  {
    id: "a1",
    type: "publish",
    message: 'Published "Wireless Bluetooth Earbuds Pro" to Shopify',
    timestamp: "2 min ago",
  },
  {
    id: "a2",
    type: "ai",
    message: "Generated SEO content for 6 products",
    timestamp: "15 min ago",
  },
  {
    id: "a3",
    type: "import",
    message: "Imported 22 products from Kalo Data trending feed",
    timestamp: "28 min ago",
  },
  {
    id: "a4",
    type: "error",
    message: 'Failed to upload images for "Phone Holder Car Mount"',
    timestamp: "45 min ago",
  },
  {
    id: "a5",
    type: "sync",
    message: "Synced inventory for 3 products with Shopify",
    timestamp: "1 hour ago",
  },
  {
    id: "a6",
    type: "publish",
    message: 'Published "Smart Watch Fitness Tracker" to Shopify',
    timestamp: "1 hour ago",
  },
  {
    id: "a7",
    type: "ai",
    message: "Generated product descriptions for batch #14",
    timestamp: "2 hours ago",
  },
  {
    id: "a8",
    type: "import",
    message: "Imported 15 products from Kalo Data electronics feed",
    timestamp: "3 hours ago",
  },
];

export const dashboardStats = {
  totalProducts: 142,
  publishedProducts: 87,
  pendingReview: 34,
  errorCount: 5,
  importedToday: 22,
  aiGeneratedToday: 18,
  shopifySynced: 87,
  revenue: "$12,847",
};
