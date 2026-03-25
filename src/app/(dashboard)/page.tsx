"use client";

import {
  ArrowRight,
  ArrowUp,
  Play,
  Shield,
  Clock,
  Server,
  Database,
  ShoppingBag,
  Sparkles,
  XCircle,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";

const activityDots: Record<string, string> = {
  import: "green",
  publish: "green",
  ai: "purple",
  error: "rose",
  sync: "blue",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardPage() {
  const { data: dash, loading } = useFetch(() => api.dashboard.get(), []);

  const total = dash?.totalProducts ?? 0;
  const published = dash?.publishedProducts ?? 0;
  const errors = dash?.errorCount ?? 0;
  const successRate = total > 0 ? (((total - errors) / total) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-8">
      {/* Hero Grid */}
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
        {/* Left: Hero text */}
        <div className="space-y-6 pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-primary/20 bg-accent-primary/5 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(217,70,239,0.6)] animate-pulse" />
            <span className="text-xs font-medium text-accent-primary tracking-wide">
              Now importing {total}+ products
            </span>
          </div>

          <h1 className="text-[2.75rem] leading-[1.08] tracking-tight font-extralight text-text-primary">
            Product<br />
            pipeline that{" "}
            <span className="gradient-text font-light">scales</span>
          </h1>

          <p className="max-w-md text-[0.95rem] leading-relaxed font-light text-text-secondary">
            Import from Kalo Data, generate AI-optimized content, and publish to
            Shopify — from discovery to storefront, in one unified system.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="/sources"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-[1.02]"
            >
              Start Importing <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg border border-border-primary bg-transparent px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
            >
              <Play className="h-3 w-3" /> View Products
            </a>
          </div>

          <div className="flex items-center gap-6 pt-2">
            {[
              { icon: Shield, text: "Shopify Verified" },
              { icon: Clock, text: "2.4s Avg Import" },
              { icon: Server, text: "99.9% Uptime" },
            ].map((m) => (
              <div key={m.text} className="flex items-center gap-1.5 text-text-muted">
                <m.icon className="h-3.5 w-3.5" />
                <span className="text-xs font-medium tracking-wide">{m.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dashboard visual */}
        <div className="grid grid-cols-2 gap-3">
          {/* Import Volume */}
          <div className="rounded-xl border border-border-primary bg-bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="micro-label">Import Volume</span>
              <span className="dash-badge green">Live</span>
            </div>
            <div className="mt-2 text-[1.75rem] dash-value text-text-primary">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : total.toLocaleString()}
            </div>
            <div className="dash-sub">
              <span className="up">
                <ArrowUp className="inline h-2.5 w-2.5" /> {dash?.importedToday ?? 0} today
              </span>
            </div>
            <div className="sparkline mt-3">
              {[30, 45, 35, 60, 50, 72, 65, 85, 78, 95].map((h, i) => (
                <div key={i} className="sparkline-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Success Rate */}
          <div className="rounded-xl border border-border-primary bg-bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="micro-label">Success Rate</span>
              <span className="dash-badge purple">AI v2</span>
            </div>
            <div className="mt-2 text-[1.75rem] dash-value text-text-primary">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${successRate}%`}
            </div>
            <div className="dash-sub">
              <span className="up">
                <ArrowUp className="inline h-2.5 w-2.5" /> {dash?.aiGeneratedCount ?? 0} AI generated
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                { label: "Published", pct: total > 0 ? Math.round((published / total) * 100) : 0, cls: "g1" },
                { label: "Review", pct: total > 0 ? Math.round(((dash?.readyProducts ?? 0) / total) * 100) : 0, cls: "g2" },
                { label: "Failed", pct: total > 0 ? Math.round((errors / total) * 100) : 0, cls: "g3" },
              ].map((r) => (
                <div key={r.label} className="progress-row">
                  <span className="w-14">{r.label}</span>
                  <div className="progress-track">
                    <div className={`progress-fill ${r.cls}`} style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="progress-pct">{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* API snippet (wide) */}
          <div className="col-span-2 rounded-xl border border-border-primary bg-bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="micro-label">API Integration</span>
              <span className="dash-badge green">200 OK</span>
            </div>
            <div className="dash-code mt-2 rounded-lg bg-black/30 p-3">
              <span className="cmt">{"// Import product from Kalo"}</span><br />
              <span className="kw">const</span> product = <span className="kw">await</span> kalo.<span className="fn">importProduct</span>({"{"}<br />
              {"  "}source_url: <span className="str">&quot;kalodata.com/p/8kX2&quot;</span>,<br />
              {"  "}generate_copy: <span className="num">true</span>,<br />
              {"  "}publish_to: <span className="str">&quot;shopify&quot;</span><br />
              {"}"});{" "}<span className="cmt">{"// → 2.4s avg"}</span>
            </div>
          </div>

          {/* Activity feed */}
          <div className="rounded-xl border border-border-primary bg-bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="micro-label">Activity</span>
            </div>
            <div className="mt-2 space-y-2">
              {(dash?.recentActivity ?? []).slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start gap-2 text-[0.7rem] leading-snug">
                  <div className={`feed-dot ${activityDots[item.type] || "blue"}`} />
                  <div className="flex-1">
                    <span className="text-text-secondary">{item.message}</span>
                    <span className="ml-1.5 text-text-muted">{timeAgo(item.createdAt)}</span>
                  </div>
                </div>
              ))}
              {loading && <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-text-muted" /></div>}
            </div>
          </div>

          {/* Pipeline Distribution */}
          <div className="rounded-xl border border-border-primary bg-bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="micro-label">Pipeline Distribution</span>
              <span className="dash-badge amber">Today</span>
            </div>
            <div className="sparkline mt-2" style={{ height: 22 }}>
              {[
                { h: 90, c: "var(--color-success)", o: 0.6 },
                { h: 85, c: "var(--color-success)", o: 0.5 },
                { h: 70, c: "var(--color-success)", o: 0.5 },
                { h: 55, c: "var(--color-accent-secondary)", o: 0.5 },
                { h: 40, c: "var(--color-accent-secondary)", o: 0.5 },
                { h: 25, c: "var(--color-warning)", o: 0.5 },
                { h: 12, c: "var(--color-error)", o: 0.5 },
                { h: 5, c: "var(--color-error)", o: 0.4 },
              ].map((b, i) => (
                <div key={i} className="sparkline-bar" style={{ height: `${b.h}%`, background: b.c, opacity: b.o }} />
              ))}
            </div>
            <div className="dash-sub mt-2 justify-between">
              <span style={{ color: "var(--color-success)" }}>Published</span>
              <span style={{ color: "var(--color-error)" }}>Errors</span>
            </div>
            <div className="mt-2 flex gap-2">
              {[
                { val: String(total), label: "Products" },
                { val: total > 0 ? `${((errors / total) * 100).toFixed(1)}%` : "0%", label: "Error Rate" },
              ].map((s) => (
                <div key={s.label} className="flex-1 rounded-md bg-black/20 py-1.5 text-center">
                  <div className="text-[0.85rem] font-extralight text-text-primary">{s.val}</div>
                  <div className="micro-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Database, val: `${total}`, label: "Products Imported", color: "text-accent-primary" },
          { icon: ShoppingBag, val: String(published), label: "Published to Shopify", color: "text-success" },
          { icon: Sparkles, val: `${successRate}%`, label: "AI Content Quality", color: "text-accent-secondary" },
          { icon: Clock, val: "2.4s", label: "Avg Import Time", color: "text-info" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center rounded-xl border border-border-primary bg-bg-card py-5 transition-colors hover:bg-bg-card-hover">
            <s.icon className={`h-5 w-5 ${s.color} mb-2 opacity-70`} />
            <span className="text-2xl dash-value text-text-primary">{s.val}</span>
            <span className="micro-label mt-1">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom: Activity + Pipeline Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-border-primary bg-bg-card">
          <div className="flex items-center justify-between border-b border-border-primary px-5 py-3.5">
            <span className="micro-label text-[0.7rem]">Recent Activity</span>
            <a href="/products" className="text-[0.65rem] font-medium text-accent-primary hover:text-accent-secondary transition-colors">View all →</a>
          </div>
          <div className="divide-y divide-border-primary/40">
            {(dash?.recentActivity ?? []).map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-bg-elevated/30">
                <div className={`feed-dot ${activityDots[item.type] || "blue"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.8rem] font-light text-text-primary leading-snug">{item.message}</p>
                  <p className="mt-0.5 text-[0.65rem] text-text-muted">{timeAgo(item.createdAt)}</p>
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-text-muted" /></div>}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border-primary bg-bg-card p-5">
            <span className="micro-label text-[0.7rem]">Pipeline Health</span>
            <div className="mt-4 space-y-4">
              {[
                { label: "Import Success", value: total > 0 ? `${successRate}%` : "—", pct: parseFloat(successRate) || 0, cls: "g1" },
                { label: "AI Generated", value: dash ? `${dash.aiGeneratedCount}/${total}` : "—", pct: total > 0 ? Math.round(((dash?.aiGeneratedCount ?? 0) / total) * 100) : 0, cls: "g1" },
                { label: "Shopify Sync", value: `${published}/${total}`, pct: total > 0 ? Math.round((published / total) * 100) : 0, cls: "g1" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-[0.7rem]">
                    <span className="text-text-muted font-light">{item.label}</span>
                    <span className="dash-value text-sm text-text-primary">{item.value}</span>
                  </div>
                  <div className="progress-track mt-1.5">
                    <div className={`progress-fill ${item.cls}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border-primary bg-bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="micro-label text-[0.7rem]">Needs Attention</span>
              {errors > 0 && <span className="dash-badge rose">{errors} errors</span>}
            </div>
            {errors > 0 ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2 text-[0.7rem]">
                  <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-error" />
                  <span className="font-light text-text-secondary">{errors} product(s) have errors — check the Products page</span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[0.7rem] font-light text-text-muted">All clear — no issues detected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
