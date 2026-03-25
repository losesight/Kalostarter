"use client";

import {
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Globe,
  Palette,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/card";
import { StatCard } from "@/components/stat-card";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { clsx } from "clsx";
import { useState } from "react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ShopifyPage() {
  const { data: conn } = useFetch(() => api.shopify.connect(), []);
  const { data: sync, loading, refetch } = useFetch(() => api.shopify.syncStatus(), []);
  const { data: readyData } = useFetch(() => api.products.list({ status: "ready" }), []);
  const [publishing, setPublishing] = useState(false);

  const readyProducts = readyData?.products ?? [];
  const synced = sync?.synced ?? [];
  const stats = sync?.stats ?? { totalSynced: 0, pendingPublish: 0, failedSyncs: 0 };

  const handlePublishAll = async () => {
    if (readyProducts.length === 0) return;
    setPublishing(true);
    try {
      await api.shopify.publish(readyProducts.map((p) => p.id));
      refetch();
    } catch {
      // handled
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishOne = async (id: string) => {
    try {
      await api.shopify.publish([id]);
      refetch();
    } catch {
      // handled
    }
  };

  return (
    <div className="space-y-6">
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
          <button onClick={refetch} className="flex items-center gap-2 rounded-lg border border-border-primary bg-bg-card px-4 py-2.5 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={handlePublishAll}
            disabled={publishing || readyProducts.length === 0}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2.5 text-[0.8rem] font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-[1.02] disabled:opacity-50"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
            Publish Ready ({readyProducts.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total Synced" value={stats.totalSynced} change={`${synced.length} products`} changeType="positive" icon={CheckCircle2} accentColor="green" />
        <StatCard label="Pending Publish" value={stats.pendingPublish} change="Ready to go" changeType="neutral" icon={Clock} accentColor="blue" />
        <StatCard label="Failed Syncs" value={stats.failedSyncs} change={stats.failedSyncs > 0 ? "Needs attention" : "All clear"} changeType={stats.failedSyncs > 0 ? "negative" : "neutral"} icon={XCircle} accentColor="red" />
        <StatCard label="Connection" value={conn?.connected ? "Active" : "—"} change={conn?.connected ? conn.shop?.myshopifyDomain || "Connected" : "Not configured"} changeType={conn?.connected ? "positive" : "neutral"} icon={Globe} accentColor="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          {/* Store connection */}
          <div className="rounded-xl border border-border-primary bg-bg-card p-5">
            <span className="micro-label text-[0.7rem]">Store Connection</span>
            <div className="mt-3 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${conn?.connected ? "bg-success/10" : "bg-warning/10"}`}>
                <ShoppingBag className={`h-5 w-5 ${conn?.connected ? "text-success" : "text-warning"}`} />
              </div>
              <div>
                <p className="text-[0.85rem] font-light text-text-primary">
                  {conn?.connected && conn.shop ? conn.shop.myshopifyDomain : "Not connected"}
                </p>
                <p className={`text-[0.65rem] font-light ${conn?.connected ? "text-success" : "text-warning"}`}>
                  {conn?.connected ? "Connected & active" : "Configure in Settings"}
                </p>
              </div>
            </div>
            {conn?.connected && conn.shop && (
              <div className="mt-4 space-y-2 text-[0.7rem]">
                {[
                  ["Store", conn.shop.name],
                  ["Plan", conn.shop.plan.displayName],
                  ["Products", String(conn.shop.productCount?.count ?? 0)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-text-muted font-light">{k}</span>
                    <span className="text-text-secondary font-light">{v}</span>
                  </div>
                ))}
              </div>
            )}
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
                ["seo_title", "SEO Title"],
                ["seo_desc", "SEO Description"],
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

        <div className="lg:col-span-2">
          <Card title="Sync Log" subtitle="Recently synced products">
            <div className="overflow-x-auto">
              <table className="w-full text-[0.8rem]">
                <thead>
                  <tr className="border-b border-border-primary">
                    {["Product", "Shopify ID", "Status", "Synced"].map((col) => (
                      <th key={col} className="pb-3 text-left micro-label text-[0.6rem]">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary/50">
                  {loading && (
                    <tr><td colSpan={4} className="py-8 text-center"><Loader2 className="inline h-5 w-5 animate-spin text-text-muted" /></td></tr>
                  )}
                  {synced.map((entry) => (
                    <tr key={entry.id} className="hover:bg-bg-elevated/30 transition-colors">
                      <td className="py-3 font-light text-text-primary">{entry.title}</td>
                      <td className="py-3 font-mono text-[0.65rem] text-text-muted">{entry.shopifyProductId}</td>
                      <td className="py-3"><CheckCircle2 className="h-4 w-4 text-success" /></td>
                      <td className="py-3 text-[0.7rem] text-text-muted font-light">{entry.syncedAt ? timeAgo(entry.syncedAt) : "—"}</td>
                    </tr>
                  ))}
                  {!loading && synced.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-[0.8rem] font-light text-text-muted">No products synced yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-4">
            <Card
              title="Ready to Publish"
              subtitle="Products with complete content awaiting Shopify sync"
              action={
                readyProducts.length > 0 ? (
                  <button onClick={handlePublishAll} className="rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-3 py-1.5 text-[0.65rem] font-medium text-white shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                    Publish All ({readyProducts.length})
                  </button>
                ) : undefined
              }
            >
              <div className="space-y-2">
                {readyProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 rounded-lg border border-border-primary bg-bg-elevated/50 p-4 transition-colors hover:bg-bg-elevated">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-card border border-border-primary">
                      <Layers className="h-5 w-5 text-text-muted" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[0.85rem] font-light text-text-primary">{product.title}</p>
                      <p className="text-[0.7rem] font-light text-text-muted">
                        ${product.price.toFixed(2)} — {product.aiGenerated ? "AI copy ready" : "No AI copy"}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePublishOne(product.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-3 py-1.5 text-[0.7rem] font-medium text-success hover:bg-success/20 transition-colors"
                    >
                      <ShoppingBag className="h-3 w-3" /> Publish
                    </button>
                  </div>
                ))}
                {readyProducts.length === 0 && (
                  <p className="py-4 text-center text-[0.8rem] font-light text-text-muted">No products ready to publish</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
