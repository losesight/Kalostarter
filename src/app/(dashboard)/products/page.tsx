"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Pencil,
  ShoppingBag,
  Trash2,
  Sparkles,
  Package,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/card";
import { StatusBadge } from "@/components/status-badge";
import { api, type Product } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { clsx } from "clsx";

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState(false);

  const statusFilter = activeTab === "all" ? undefined : activeTab === "errors" ? "error" : activeTab;
  const { data, loading, refetch } = useFetch(
    () => api.products.list({ status: statusFilter, search: search || undefined }),
    [activeTab, search]
  );

  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  const filterTabs = [
    { label: "All", key: "all", count: total },
    { label: "Draft", key: "draft" },
    { label: "Ready", key: "ready" },
    { label: "Published", key: "published" },
    { label: "Errors", key: "errors" },
  ];

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedProducts.size === products.length) setSelectedProducts(new Set());
    else setSelectedProducts(new Set(products.map((p) => p.id)));
  };

  const handlePublish = async () => {
    if (selectedProducts.size === 0) return;
    setPublishing(true);
    try {
      await api.shopify.publish(Array.from(selectedProducts));
      setSelectedProducts(new Set());
      refetch();
    } catch {
      // Error handled by the API response
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.products.delete(id);
    setSelectedProducts((prev) => { const next = new Set(prev); next.delete(id); return next; });
    refetch();
  };

  const getVariantCount = (p: Product) => {
    try { return JSON.parse(p.variants).length; } catch { return 0; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.75rem] font-extralight tracking-tight text-text-primary">
            <span className="gradient-text font-light">Products</span>
          </h2>
          <p className="mt-1 text-[0.85rem] font-light text-text-muted">Manage imported products and publish to Shopify</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePublish}
            disabled={publishing || selectedProducts.size === 0}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2.5 text-[0.8rem] font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-[1.02] disabled:opacity-50"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
            Publish Selected ({selectedProducts.size})
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border-primary bg-bg-secondary p-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "flex items-center gap-2 rounded-md px-4 py-2 text-[0.8rem] font-light transition-all",
              activeTab === tab.key
                ? "bg-bg-card text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title or category..."
            className="h-10 w-full rounded-lg border border-border-primary bg-bg-card pl-9 pr-4 text-[0.8rem] font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary/30 transition-colors"
          />
        </div>
        <button className="flex h-10 items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
          <Filter className="h-3.5 w-3.5" /> Filter
        </button>
        <button className="flex h-10 items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
          <ArrowUpDown className="h-3.5 w-3.5" /> Sort
        </button>
      </div>

      {selectedProducts.size > 0 && (
        <div className="flex items-center gap-4 rounded-lg border border-accent-primary/20 bg-accent-primary/5 px-4 py-3">
          <span className="text-[0.8rem] font-light text-accent-primary">{selectedProducts.size} selected</span>
          <div className="flex items-center gap-2">
            <button className="dash-badge green" onClick={handlePublish}>Publish</button>
          </div>
        </div>
      )}

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr className="border-b border-border-primary bg-bg-elevated/30">
                <th className="px-5 py-3 text-left">
                  <input type="checkbox" checked={products.length > 0 && selectedProducts.size === products.length} onChange={toggleAll} className="h-3.5 w-3.5 rounded border-border-primary bg-bg-card accent-accent-primary" />
                </th>
                {["Product", "Category", "Price", "Variants", "Status", "AI", ""].map((col) => (
                  <th key={col} className={clsx("px-5 py-3 micro-label text-[0.6rem]", col === "" ? "text-right" : "text-left")}>
                    {col || "Actions"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary/50">
              {loading && (
                <tr><td colSpan={8} className="py-12 text-center"><Loader2 className="inline h-5 w-5 animate-spin text-text-muted" /></td></tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className={clsx("transition-colors hover:bg-bg-elevated/30", selectedProducts.has(product.id) && "bg-accent-primary/5")}>
                  <td className="px-5 py-4">
                    <input type="checkbox" checked={selectedProducts.has(product.id)} onChange={() => toggleProduct(product.id)} className="h-3.5 w-3.5 rounded border-border-primary bg-bg-card accent-accent-primary" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-primary bg-bg-elevated">
                        <Package className="h-5 w-5 text-text-muted" />
                      </div>
                      <div>
                        <p className="font-light text-text-primary">{product.title}</p>
                        <p className="text-[0.65rem] text-text-muted font-light">{product.source}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-light text-text-secondary">{product.category || "—"}</td>
                  <td className="px-5 py-4">
                    <span className="dash-value text-base text-text-primary">${product.price.toFixed(2)}</span>
                    {product.compareAtPrice && (
                      <span className="ml-2 text-[0.65rem] text-text-muted line-through font-light">${product.compareAtPrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-light text-text-secondary">{getVariantCount(product)}</td>
                  <td className="px-5 py-4"><StatusBadge status={product.status} /></td>
                  <td className="px-5 py-4">
                    {product.aiGenerated ? (
                      <span className="inline-flex items-center gap-1 text-accent-primary">
                        <Sparkles className="h-3 w-3" />
                        <span className="text-[0.65rem] font-medium">Yes</span>
                      </span>
                    ) : (
                      <span className="text-[0.65rem] text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {[
                        { Icon: Eye, danger: false },
                        { Icon: Pencil, danger: false },
                        { Icon: Trash2, danger: true, onClick: () => handleDelete(product.id) },
                      ].map(({ Icon, danger, onClick }, i) => (
                        <button
                          key={i}
                          onClick={onClick}
                          className={clsx("rounded-md p-1.5 text-text-muted transition-colors", danger ? "hover:bg-bg-elevated hover:text-error" : "hover:bg-bg-elevated hover:text-text-primary")}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-[0.8rem] font-light text-text-muted">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
