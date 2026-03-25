const BASE = typeof window !== "undefined" ? "" : "http://localhost:3000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  dashboard: {
    get: () => apiFetch<DashboardData>("/api/dashboard"),
  },
  products: {
    list: (params?: { status?: string; search?: string; page?: number }) => {
      const sp = new URLSearchParams();
      if (params?.status) sp.set("status", params.status);
      if (params?.search) sp.set("search", params.search);
      if (params?.page) sp.set("page", String(params.page));
      return apiFetch<ProductListResponse>(`/api/products?${sp}`);
    },
    get: (id: string) => apiFetch<Product>(`/api/products/${id}`),
    update: (id: string, data: Partial<Product>) =>
      apiFetch<Product>(`/api/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/products/${id}`, { method: "DELETE" }),
  },
  import: {
    list: () => apiFetch<ImportJob[]>("/api/import"),
    start: (url: string) =>
      apiFetch<ImportJob>("/api/import", {
        method: "POST",
        body: JSON.stringify({ url }),
      }),
    manualImport: (products: Record<string, unknown>[]) =>
      apiFetch<ImportJob>("/api/import", {
        method: "POST",
        body: JSON.stringify({ products }),
      }),
    get: (id: string) => apiFetch<ImportJob>(`/api/import/${id}`),
  },
  activity: {
    list: (limit?: number) =>
      apiFetch<Activity[]>(`/api/activity${limit ? `?limit=${limit}` : ""}`),
  },
  shopify: {
    connect: () => apiFetch<{ connected: boolean; shop?: ShopInfo; error?: string }>("/api/shopify/connect"),
    themes: () => apiFetch<ShopifyTheme[]>("/api/shopify/themes"),
    publish: (productIds: string[]) =>
      apiFetch<{ results: PublishResult[] }>("/api/shopify/products", {
        method: "POST",
        body: JSON.stringify({ productIds }),
      }),
    syncStatus: () => apiFetch<SyncStatusResponse>("/api/shopify/sync"),
  },
  ai: {
    generate: (productId: string, tone: string) =>
      apiFetch<GeneratedContent>("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify({ productId, tone }),
      }),
  },
  settings: {
    get: () => apiFetch<Record<string, string>>("/api/settings"),
    save: (data: Record<string, string>) =>
      apiFetch<{ success: boolean }>("/api/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
};

// Types
export interface DashboardData {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  readyProducts: number;
  errorCount: number;
  aiGeneratedCount: number;
  importedToday: number;
  recentActivity: Activity[];
  recentJobs: ImportJob[];
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  status: string;
  category: string | null;
  variants: string;
  images: string;
  source: string;
  kaloSourceUrl: string | null;
  shopifyProductId: string | null;
  syncedAt: string | null;
  aiGenerated: boolean;
  aiTitle: string | null;
  aiDescription: string | null;
  aiBullets: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  importJobId: string | null;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ImportJob {
  id: string;
  source: string;
  url: string;
  status: string;
  productsFound: number;
  productsImported: number;
  errors: number;
  errorLog: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface ShopInfo {
  name: string;
  email: string;
  myshopifyDomain: string;
  plan: { displayName: string };
  productCount: { count: number };
}

export interface ShopifyTheme {
  id: string;
  name: string;
  role: string;
}

export interface PublishResult {
  productId: string;
  shopifyId: string | null;
  error?: string;
}

export interface SyncStatusResponse {
  synced: { id: string; title: string; status: string; shopifyProductId: string; syncedAt: string }[];
  stats: { totalSynced: number; pendingPublish: number; failedSyncs: number };
}

export interface GeneratedContent {
  title: string;
  description: string;
  bullets: string[];
  seoTitle: string;
  seoDescription: string;
}
