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
} from "lucide-react";
import { Card } from "@/components/card";
import { StatusBadge } from "@/components/status-badge";
import { mockProducts } from "@/lib/mock-data";
import { clsx } from "clsx";

const filterTabs = [
  { label: "All", count: 142 },
  { label: "Draft", count: 21 },
  { label: "Ready", count: 34 },
  { label: "Published", count: 87 },
  { label: "Errors", count: 5 },
];

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedProducts.size === mockProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(mockProducts.map((p) => p.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.75rem] font-extralight tracking-tight text-text-primary">
            <span className="gradient-text font-light">Products</span>
          </h2>
          <p className="mt-1 text-[0.85rem] font-light text-text-muted">
            Manage imported products and publish to Shopify
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 py-2.5 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover hover:text-text-primary transition-colors">
            <Sparkles className="h-4 w-4" />
            Generate All Copy
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2.5 text-[0.8rem] font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-[1.02]">
            <ShoppingBag className="h-4 w-4" />
            Publish Selected
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border-primary bg-bg-secondary p-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={clsx(
              "flex items-center gap-2 rounded-md px-4 py-2 text-[0.8rem] font-light transition-all",
              activeTab === tab.label
                ? "bg-bg-card text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab.label}
            <span
              className={clsx(
                "rounded-full px-2 py-0.5 text-[0.6rem] font-medium",
                activeTab === tab.label
                  ? "bg-accent-primary/20 text-accent-primary"
                  : "bg-bg-elevated text-text-muted"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search products by title, SKU, or category..."
            className="h-10 w-full rounded-lg border border-border-primary bg-bg-card pl-9 pr-4 text-[0.8rem] font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary/30 transition-colors"
          />
        </div>
        <button className="flex h-10 items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </button>
        <button className="flex h-10 items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
          <ArrowUpDown className="h-3.5 w-3.5" />
          Sort
        </button>
      </div>

      {/* Bulk action bar */}
      {selectedProducts.size > 0 && (
        <div className="flex items-center gap-4 rounded-lg border border-accent-primary/20 bg-accent-primary/5 px-4 py-3">
          <span className="text-[0.8rem] font-light text-accent-primary">
            {selectedProducts.size} selected
          </span>
          <div className="flex items-center gap-2">
            <button className="dash-badge purple">Generate Copy</button>
            <button className="dash-badge green">Publish</button>
            <button className="dash-badge rose">Delete</button>
          </div>
        </div>
      )}

      {/* Product table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr className="border-b border-border-primary bg-bg-elevated/30">
                <th className="px-5 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === mockProducts.length}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 rounded border-border-primary bg-bg-card accent-accent-primary"
                  />
                </th>
                {["Product", "Category", "Price", "Variants", "Status", "AI", ""].map(
                  (col) => (
                    <th
                      key={col}
                      className={clsx(
                        "px-5 py-3 micro-label text-[0.6rem]",
                        col === "" ? "text-right" : "text-left"
                      )}
                    >
                      {col || "Actions"}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary/50">
              {mockProducts.map((product) => (
                <tr
                  key={product.id}
                  className={clsx(
                    "transition-colors hover:bg-bg-elevated/30",
                    selectedProducts.has(product.id) && "bg-accent-primary/5"
                  )}
                >
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="h-3.5 w-3.5 rounded border-border-primary bg-bg-card accent-accent-primary"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-primary bg-bg-elevated">
                        <Package className="h-5 w-5 text-text-muted" />
                      </div>
                      <div>
                        <p className="font-light text-text-primary">
                          {product.title}
                        </p>
                        <p className="text-[0.65rem] text-text-muted font-light">
                          {product.source}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-light text-text-secondary">
                    {product.category}
                  </td>
                  <td className="px-5 py-4">
                    <span className="dash-value text-base text-text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="ml-2 text-[0.65rem] text-text-muted line-through font-light">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-light text-text-secondary">
                    {product.variants}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={product.status} />
                  </td>
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
                      {[Eye, Pencil, Trash2].map((Icon, i) => (
                        <button
                          key={i}
                          className={clsx(
                            "rounded-md p-1.5 text-text-muted transition-colors",
                            i === 2
                              ? "hover:bg-bg-elevated hover:text-error"
                              : "hover:bg-bg-elevated hover:text-text-primary"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
