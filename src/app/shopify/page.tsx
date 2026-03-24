"use client";

import {
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Layers,
  Globe,
  Palette,
} from "lucide-react";
import { Card } from "@/components/card";
import { StatCard } from "@/components/stat-card";
import { mockProducts } from "@/lib/mock-data";
import { clsx } from "clsx";

const themes = [
  { name: "Dawn", version: "15.0.0", active: true },
  { name: "Craft", version: "8.2.1", active: false },
  { name: "Sense", version: "6.1.0", active: false },
];

const syncLog = [
  { id: "s1", product: "Wireless Bluetooth Earbuds Pro", action: "Created", status: "success" as const, shopifyId: "gid://shopify/Product/8001", time: "2 min ago" },
  { id: "s2", product: "Smart Watch Fitness Tracker", action: "Updated", status: "success" as const, shopifyId: "gid://shopify/Product/8002", time: "30 min ago" },
  { id: "s3", product: "Gaming Mouse Pad XXL RGB", action: "Created", status: "success" as const, shopifyId: "gid://shopify/Product/8003", time: "1 hour ago" },
  { id: "s4", product: "Phone Holder Car Mount Magnetic", action: "Failed", status: "error" as const, shopifyId: "—", time: "45 min ago" },
  { id: "s5", product: "LED Ring Light 10-inch", action: "Queued", status: "pending" as const, shopifyId: "—", time: "Just now" },
];

export default function ShopifyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.75rem] font-extralight tracking-tight text-text-primary">
            Shopify <span className="gradient-text font-light">Sync</span>
          </h2>
          <p className="mt-1 text-[0.85rem] font-light text-text-muted">
            Manage product publishing and sync status with your Shopify store
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 py-2.5 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
            <RefreshCw className="h-4 w-4" />
            Sync All
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2.5 text-[0.8rem] font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-[1.02]">
            <ShoppingBag className="h-4 w-4" />
            Publish Ready
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total Synced" value={87} change="3 today" changeType="positive" icon={CheckCircle2} accentColor="green" />
        <StatCard label="Pending Publish" value={34} change="Ready to go" changeType="neutral" icon={Clock} accentColor="blue" />
        <StatCard label="Failed Syncs" value={5} change="Needs attention" changeType="negative" icon={XCircle} accentColor="red" />
        <StatCard label="API Calls Today" value={247} change="of 1,000 limit" changeType="neutral" icon={Globe} accentColor="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Store + Theme info */}
        <div className="space-y-4">
          {/* Store connection */}
          <div className="rounded-xl border border-border-primary bg-bg-card p-5">
            <span className="micro-label text-[0.7rem]">Store Connection</span>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <ShoppingBag className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-[0.85rem] font-light text-text-primary">
                  mystore.myshopify.com
                </p>
                <p className="text-[0.65rem] text-success font-light">Connected & active</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-[0.7rem]">
              {[
                ["Plan", "Shopify Plus"],
                ["Products", "87 / unlimited"],
                ["Last Sync", "2 min ago"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-text-muted font-light">{k}</span>
                  <span className="text-text-secondary font-light">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Theme selector */}
          <div className="rounded-xl border border-border-primary bg-bg-card p-5">
            <span className="micro-label text-[0.7rem]">Theme / Template</span>
            <p className="mt-0.5 text-[0.65rem] font-light text-text-muted">Select active theme for product layout</p>
            <div className="mt-3 space-y-2">
              {themes.map((theme) => (
                <div
                  key={theme.name}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg border p-3 transition-all cursor-pointer",
                    theme.active
                      ? "border-accent-primary/40 bg-accent-primary/5"
                      : "border-border-primary hover:bg-bg-elevated/50"
                  )}
                >
                  <div className={clsx("flex h-9 w-9 items-center justify-center rounded-lg", theme.active ? "bg-accent-primary/20" : "bg-bg-elevated")}>
                    <Palette className={clsx("h-4 w-4", theme.active ? "text-accent-primary" : "text-text-muted")} />
                  </div>
                  <div className="flex-1">
                    <p className={clsx("text-[0.8rem] font-light", theme.active ? "text-text-primary" : "text-text-secondary")}>
                      {theme.name}
                    </p>
                    <p className="micro-label">v{theme.version}</p>
                  </div>
                  {theme.active && <span className="dash-badge purple">Active</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Field mapping */}
          <div className="rounded-xl border border-border-primary bg-bg-card p-5">
            <span className="micro-label text-[0.7rem]">Field Mapping</span>
            <p className="mt-0.5 text-[0.65rem] font-light text-text-muted">Kalo → Shopify mapping</p>
            <div className="mt-3 space-y-1.5 text-[0.7rem]">
              {[
                ["title", "Product Title"],
                ["price", "Price"],
                ["description", "Body HTML"],
                ["category", "Product Type"],
                ["images[]", "Media"],
                ["variants[]", "Variants"],
                ["seo_title", "SEO Title (metafield)"],
                ["seo_desc", "SEO Description (metafield)"],
              ].map(([from, to]) => (
                <div key={from} className="flex items-center gap-2 rounded-md bg-bg-elevated p-2">
                  <span className="flex-1 font-mono text-accent-primary font-light">{from}</span>
                  <span className="text-text-muted">→</span>
                  <span className="flex-1 text-right text-text-secondary font-light">{to}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sync log */}
        <div className="lg:col-span-2">
          <Card
            title="Sync Log"
            subtitle="Recent product sync activity with Shopify"
            action={
              <a href="#" className="text-[0.65rem] font-medium text-accent-primary hover:text-accent-secondary transition-colors">
                View all →
              </a>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-[0.8rem]">
                <thead>
                  <tr className="border-b border-border-primary">
                    {["Product", "Action", "Shopify ID", "Status", "Time"].map((col) => (
                      <th key={col} className="pb-3 text-left micro-label text-[0.6rem]">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary/50">
                  {syncLog.map((entry) => (
                    <tr key={entry.id} className="hover:bg-bg-elevated/30 transition-colors">
                      <td className="py-3 font-light text-text-primary">{entry.product}</td>
                      <td className="py-3">
                        <span className={clsx(
                          "text-[0.7rem] font-medium",
                          entry.action === "Created" && "text-success",
                          entry.action === "Updated" && "text-info",
                          entry.action === "Failed" && "text-error",
                          entry.action === "Queued" && "text-warning"
                        )}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[0.65rem] text-text-muted">{entry.shopifyId}</td>
                      <td className="py-3">
                        {entry.status === "success" ? <CheckCircle2 className="h-4 w-4 text-success" /> : entry.status === "error" ? <XCircle className="h-4 w-4 text-error" /> : <Clock className="h-4 w-4 text-warning" />}
                      </td>
                      <td className="py-3 text-[0.7rem] text-text-muted font-light">{entry.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Ready to publish */}
          <div className="mt-4">
            <Card
              title="Ready to Publish"
              subtitle="Products with complete content awaiting Shopify sync"
              action={
                <button className="rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-3 py-1.5 text-[0.65rem] font-medium text-white shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all hover:shadow-[0_0_20px_rgba(217,70,239,0.5)]">
                  Publish All (2)
                </button>
              }
            >
              <div className="space-y-2">
                {mockProducts
                  .filter((p) => p.status === "ready")
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 rounded-lg border border-border-primary bg-bg-elevated/50 p-4 transition-colors hover:bg-bg-elevated"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-card border border-border-primary">
                        <Layers className="h-5 w-5 text-text-muted" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[0.85rem] font-light text-text-primary">{product.title}</p>
                        <p className="text-[0.7rem] font-light text-text-muted">
                          ${product.price.toFixed(2)} — {product.variants} variants — AI copy ready
                        </p>
                      </div>
                      <button className="flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-3 py-1.5 text-[0.7rem] font-medium text-success hover:bg-success/20 transition-colors">
                        <ShoppingBag className="h-3 w-3" />
                        Publish
                      </button>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
