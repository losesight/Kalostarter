"use client";

import { Save, Eye, EyeOff, ExternalLink, Loader2, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { clsx } from "clsx";

export default function SettingsPage() {
  const [showShopifyKey, setShowShopifyKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: settings, loading } = useFetch(() => api.settings.get(), []);

  const [form, setForm] = useState({
    shopify_store_domain: "",
    shopify_access_token: "",
    shopify_api_version: "2025-01",
    openai_provider: "openai",
    openai_api_key: "",
    default_tone: "Professional",
    ai_temperature: "70",
    kalo_region: "US",
    kalo_schedule: "disabled",
    kalo_duplicates: "skip",
    kalo_auto_ai: "true",
  });

  useEffect(() => {
    if (settings) {
      setForm((prev) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.settings.save(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-10 w-full rounded-lg border border-border-primary bg-bg-elevated px-3 text-[0.8rem] font-light text-text-primary focus:border-accent-primary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary/30";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.75rem] font-extralight tracking-tight text-text-primary">
            <span className="gradient-text font-light">Settings</span>
          </h2>
          <p className="mt-1 text-[0.85rem] font-light text-text-muted">Manage connections, API keys, and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2.5 text-[0.8rem] font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-[1.02] disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Shopify API */}
        <div className="rounded-xl border border-border-primary bg-bg-card p-5">
          <span className="micro-label text-[0.7rem]">Shopify Connection</span>
          <p className="mt-0.5 text-[0.65rem] font-light text-text-muted">API credentials for your store</p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="micro-label">Store Domain</label>
              <div className="mt-1.5 flex items-center gap-2">
                <input type="text" value={form.shopify_store_domain} onChange={(e) => updateField("shopify_store_domain", e.target.value)} placeholder="mystore.myshopify.com" className={inputClass} />
                <a href={form.shopify_store_domain ? `https://${form.shopify_store_domain}/admin` : "#"} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-primary bg-bg-elevated text-text-muted hover:text-accent-primary transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <label className="micro-label">Admin API Access Token</label>
              <div className="relative mt-1.5">
                <input type={showShopifyKey ? "text" : "password"} value={form.shopify_access_token} onChange={(e) => updateField("shopify_access_token", e.target.value)} placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className={`${inputClass} pr-10 font-mono`} />
                <button onClick={() => setShowShopifyKey(!showShopifyKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  {showShopifyKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="micro-label">API Version</label>
              <select value={form.shopify_api_version} onChange={(e) => updateField("shopify_api_version", e.target.value)} className={`${inputClass} mt-1.5`}>
                <option>2025-01</option>
                <option>2024-10</option>
                <option>2024-07</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI / OpenAI */}
        <div className="rounded-xl border border-border-primary bg-bg-card p-5">
          <span className="micro-label text-[0.7rem]">AI Content Engine</span>
          <p className="mt-0.5 text-[0.65rem] font-light text-text-muted">Configure content generation</p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="micro-label">Provider</label>
              <select value={form.openai_provider} onChange={(e) => updateField("openai_provider", e.target.value)} className={`${inputClass} mt-1.5`}>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="anthropic">Anthropic (Claude)</option>
              </select>
            </div>
            <div>
              <label className="micro-label">API Key</label>
              <div className="relative mt-1.5">
                <input type={showOpenAIKey ? "text" : "password"} value={form.openai_api_key} onChange={(e) => updateField("openai_api_key", e.target.value)} placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx" className={`${inputClass} pr-10 font-mono`} />
                <button onClick={() => setShowOpenAIKey(!showOpenAIKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="micro-label">Default Brand Tone</label>
              <select value={form.default_tone} onChange={(e) => updateField("default_tone", e.target.value)} className={`${inputClass} mt-1.5`}>
                {["Professional", "Casual", "Luxury", "Playful", "Technical"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="micro-label">Temperature</label>
              <input type="range" min="0" max="100" value={form.ai_temperature} onChange={(e) => updateField("ai_temperature", e.target.value)} className="mt-1.5 w-full accent-accent-primary" />
              <div className="flex justify-between micro-label">
                <span>Precise (0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kalo Data config */}
        <div className="rounded-xl border border-border-primary bg-bg-card p-5">
          <span className="micro-label text-[0.7rem]">Kalo Data Source</span>
          <p className="mt-0.5 text-[0.65rem] font-light text-text-muted">Default import configuration</p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="micro-label">Default Region</label>
              <select value={form.kalo_region} onChange={(e) => updateField("kalo_region", e.target.value)} className={`${inputClass} mt-1.5`}>
                <option value="US">United States (US)</option>
                <option value="UK">United Kingdom (UK)</option>
                <option value="CA">Canada (CA)</option>
                <option value="AU">Australia (AU)</option>
                <option value="DE">Germany (DE)</option>
              </select>
            </div>
            <div>
              <label className="micro-label">Auto-import Schedule</label>
              <select value={form.kalo_schedule} onChange={(e) => updateField("kalo_schedule", e.target.value)} className={`${inputClass} mt-1.5`}>
                <option value="disabled">Disabled</option>
                <option value="6h">Every 6 hours</option>
                <option value="12h">Every 12 hours</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="micro-label">Duplicate Handling</label>
              <select value={form.kalo_duplicates} onChange={(e) => updateField("kalo_duplicates", e.target.value)} className={`${inputClass} mt-1.5`}>
                <option value="skip">Skip duplicates</option>
                <option value="update">Update existing</option>
                <option value="create">Create new entry</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={form.kalo_auto_ai === "true"} onChange={(e) => updateField("kalo_auto_ai", e.target.checked ? "true" : "false")} className="h-3.5 w-3.5 rounded accent-accent-primary" />
              <span className="text-[0.8rem] font-light text-text-secondary">Auto-generate AI content on import</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border-primary bg-bg-card p-5">
          <span className="micro-label text-[0.7rem]">Notifications</span>
          <p className="mt-0.5 text-[0.65rem] font-light text-text-muted">Alert preferences</p>
          <div className="mt-4 space-y-4">
            {[
              { label: "Import completed", desc: "When a data import finishes", key: "notif_import" },
              { label: "Publish success", desc: "When products are published to Shopify", key: "notif_publish" },
              { label: "Sync errors", desc: "When a product fails to sync", key: "notif_errors" },
              { label: "AI content ready", desc: "When AI finishes generating copy", key: "notif_ai" },
              { label: "Weekly digest", desc: "Summary of pipeline activity", key: "notif_digest" },
            ].map((item) => {
              const on = form[item.key as keyof typeof form] !== "false";
              return (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.8rem] font-light text-text-primary">{item.label}</p>
                    <p className="text-[0.65rem] font-light text-text-muted">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => updateField(item.key, on ? "false" : "true")}
                    className={clsx("relative h-5 w-9 rounded-full transition-colors", on ? "bg-accent-primary" : "bg-bg-elevated border border-border-primary")}
                  >
                    <span className={clsx("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform", on ? "left-[18px]" : "left-0.5")} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
