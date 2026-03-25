"use client";

import { useState } from "react";
import {
  Database,
  Link2,
  Play,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/card";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";

export default function SourcesPage() {
  const [kaloUrl, setKaloUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: jobs, loading, refetch } = useFetch(() => api.import.list(), []);
  const { data: shopify } = useFetch(() => api.shopify.connect(), []);

  const handleImport = async () => {
    if (!kaloUrl.trim()) return;
    setImporting(true);
    setImportMsg(null);
    try {
      const job = await api.import.start(kaloUrl.trim());
      setImportMsg({
        type: job.status === "failed" ? "error" : "success",
        text: job.status === "failed"
          ? `Import failed — ${JSON.parse(job.errorLog || "[]")[0] || "unknown error"}`
          : `Imported ${job.productsImported} of ${job.productsFound} products`,
      });
      setKaloUrl("");
      refetch();
    } catch (e) {
      setImportMsg({ type: "error", text: e instanceof Error ? e.message : "Import failed" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[1.75rem] font-extralight tracking-tight text-text-primary">
          Data <span className="gradient-text font-light">Sources</span>
        </h2>
        <p className="mt-1 text-[0.85rem] font-light text-text-muted">
          Connect to Kalo Data and manage your product import feeds
        </p>
      </div>

      {/* Kalo Data connection */}
      <div className="rounded-xl border border-border-primary bg-bg-card p-5">
        <div className="flex items-start gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 border border-accent-primary/20">
            <Database className="h-7 w-7 text-accent-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-extralight text-text-primary">Kalo Data</h3>
              <span className="dash-badge green">
                <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                Ready
              </span>
            </div>
            <p className="mt-1 text-[0.8rem] font-light text-text-secondary">
              Import trending products, analytics, and competitor data from{" "}
              <a href="https://www.kalodata.com/product" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:text-accent-secondary transition-colors inline-flex items-center gap-1">
                kalodata.com <ExternalLink className="h-3 w-3" />
              </a>
            </p>

            <div className="mt-5 flex gap-3">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="url"
                  value={kaloUrl}
                  onChange={(e) => setKaloUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleImport()}
                  placeholder="https://kalodata.com/product/trending?region=US&category=electronics"
                  className="h-11 w-full rounded-lg border border-border-primary bg-bg-elevated pl-10 pr-4 text-[0.8rem] font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary/30 transition-colors font-mono"
                />
              </div>
              <button
                onClick={handleImport}
                disabled={importing || !kaloUrl.trim()}
                className="flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-5 text-[0.8rem] font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-[1.02] disabled:opacity-50"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {importing ? "Importing..." : "Import"}
              </button>
            </div>

            {importMsg && (
              <div className={`mt-3 rounded-lg border px-4 py-2.5 text-[0.8rem] font-light ${importMsg.type === "success" ? "border-success/20 bg-success/5 text-success" : "border-error/20 bg-error/5 text-error"}`}>
                {importMsg.text}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {["Trending Products", "Top Sellers", "New Arrivals", "Electronics", "Home & Kitchen"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setKaloUrl(`https://kalodata.com/product/${tag.toLowerCase().replace(/\s+&?\s*/g, "-")}?region=US`)}
                  className="rounded-full border border-border-primary bg-bg-elevated px-3 py-1.5 text-[0.7rem] font-light text-text-secondary hover:border-accent-primary/30 hover:text-accent-primary transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shopify Store connection */}
      <div className="rounded-xl border border-border-primary bg-bg-card p-5">
        <div className="flex items-start gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-success/20 to-success/10 border border-success/20">
            <svg className="h-7 w-7 text-success" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.337 3.415c-.03-.149-.164-.224-.283-.238-.12-.014-2.417-.178-2.417-.178s-1.61-1.593-1.79-1.77c-.18-.178-.534-.126-.67-.082-.003 0-.335.104-.859.268C8.882.477 8.157 0 7.227 0 5.163 0 4.142 2.572 3.818 3.873c-.84.26-1.432.444-1.51.468C1.709 4.52 1.68 4.55 1.636 5.1.6 5.555 0 12.298 0 12.298l11.29 2.102L16 13.175s-.057-.402-.087-.55z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-extralight text-text-primary">Shopify Store</h3>
              <span className={`dash-badge ${shopify?.connected ? "green" : "amber"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${shopify?.connected ? "bg-success shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-warning shadow-[0_0_6px_rgba(245,158,11,0.5)]"}`} />
                {shopify?.connected ? "Connected" : "Not Connected"}
              </span>
            </div>
            {shopify?.connected && shopify.shop ? (
              <>
                <p className="mt-1 text-[0.8rem] font-light text-text-secondary">
                  {shopify.shop.myshopifyDomain} — {shopify.shop.plan.displayName}
                </p>
                <div className="mt-3 flex items-center gap-6 text-[0.7rem] text-text-muted">
                  {["Products: read/write", "Files: read/write", "Themes: read"].map((perm) => (
                    <span key={perm} className="flex items-center gap-1.5 font-light">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      {perm}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-1 text-[0.8rem] font-light text-text-secondary">
                {shopify?.error || "Add your Shopify store domain and access token in Settings to connect."}
              </p>
            )}
          </div>
        </div>
      </div>

      <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-primary py-6 text-[0.8rem] font-light text-text-muted hover:border-accent-primary/30 hover:text-accent-primary transition-colors">
        <Plus className="h-4 w-4" />
        Add Another Data Source
      </button>

      {/* Import history */}
      <Card title="Import History" subtitle="Recent data imports from connected sources">
        <div className="overflow-x-auto">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr className="border-b border-border-primary">
                {["Source", "URL", "Status", "Products", "Started"].map((col) => (
                  <th key={col} className="pb-3 text-left micro-label text-[0.6rem]">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary/50">
              {loading && (
                <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="inline h-5 w-5 animate-spin text-text-muted" /></td></tr>
              )}
              {(jobs ?? []).map((job) => (
                <tr key={job.id} className="hover:bg-bg-elevated/30 transition-colors">
                  <td className="py-3 font-light text-text-primary">{job.source}</td>
                  <td className="py-3 max-w-[250px] truncate font-mono text-[0.7rem] text-text-muted">{job.url}</td>
                  <td className="py-3"><StatusBadge status={job.status} /></td>
                  <td className="py-3 font-light text-text-secondary">
                    {job.productsImported}/{job.productsFound}
                    {job.errors > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-error">
                        <AlertCircle className="h-3 w-3" />{job.errors}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-text-muted font-light">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {new Date(job.startedAt).toLocaleString()}
                    </span>
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
