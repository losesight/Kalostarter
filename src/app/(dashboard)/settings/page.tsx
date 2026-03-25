"use client";

import {
  Save,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export default function SettingsPage() {
  const [showShopifyKey, setShowShopifyKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);

  const inputClass =
    "h-10 w-full rounded-lg border border-border-primary bg-bg-elevated px-3 text-[0.8rem] font-light text-text-primary focus:border-accent-primary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary/30";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.75rem] font-extralight tracking-tight text-text-primary">
            <span className="gradient-text font-light">Settings</span>
          </h2>
          <p className="mt-1 text-[0.85rem] font-light text-text-muted">
            Manage connections, API keys, and preferences
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2.5 text-[0.8rem] font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-[1.02]">
          <Save className="h-4 w-4" />
          Save Changes
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
                <input type="text" defaultValue="mystore.myshopify.com" className={inputClass} />
                <a href="#" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-primary bg-bg-elevated text-text-muted hover:text-accent-primary transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <label className="micro-label">Admin API Access Token</label>
              <div className="relative mt-1.5">
                <input type={showShopifyKey ? "text" : "password"} defaultValue="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className={`${inputClass} pr-10 font-mono`} />
                <button onClick={() => setShowShopifyKey(!showShopifyKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  {showShopifyKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="micro-label">API Version</label>
              <select className={`${inputClass} mt-1.5`}>
                <option>2025-01</option>
                <option>2024-10</option>
                <option>2024-07</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <div className="feed-dot green" style={{ marginTop: 0 }} />
              <span className="text-[0.7rem] font-light text-success">Connected — last verified 5 min ago</span>
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
              <select className={`${inputClass} mt-1.5`}>
                <option>OpenAI (GPT-4o)</option>
                <option>Anthropic (Claude)</option>
                <option>Custom / Self-hosted</option>
              </select>
            </div>
            <div>
              <label className="micro-label">API Key</label>
              <div className="relative mt-1.5">
                <input type={showOpenAIKey ? "text" : "password"} defaultValue="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className={`${inputClass} pr-10 font-mono`} />
                <button onClick={() => setShowOpenAIKey(!showOpenAIKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="micro-label">Default Brand Tone</label>
              <select className={`${inputClass} mt-1.5`}>
                <option>Professional</option>
                <option>Casual</option>
                <option>Luxury</option>
                <option>Playful</option>
                <option>Technical</option>
              </select>
            </div>
            <div>
              <label className="micro-label">Temperature</label>
              <input type="range" min="0" max="100" defaultValue="70" className="mt-1.5 w-full accent-accent-primary" />
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
              <select className={`${inputClass} mt-1.5`}>
                <option>United States (US)</option>
                <option>United Kingdom (UK)</option>
                <option>Canada (CA)</option>
                <option>Australia (AU)</option>
                <option>Germany (DE)</option>
              </select>
            </div>
            <div>
              <label className="micro-label">Auto-import Schedule</label>
              <select className={`${inputClass} mt-1.5`}>
                <option>Disabled</option>
                <option>Every 6 hours</option>
                <option>Every 12 hours</option>
                <option>Daily</option>
                <option>Weekly</option>
              </select>
            </div>
            <div>
              <label className="micro-label">Duplicate Handling</label>
              <select className={`${inputClass} mt-1.5`}>
                <option>Skip duplicates</option>
                <option>Update existing</option>
                <option>Create new entry</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded accent-accent-primary" />
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
              { label: "Import completed", desc: "When a data import finishes", on: true },
              { label: "Publish success", desc: "When products are published to Shopify", on: true },
              { label: "Sync errors", desc: "When a product fails to sync", on: true },
              { label: "AI content ready", desc: "When AI finishes generating copy", on: false },
              { label: "Weekly digest", desc: "Summary of pipeline activity", on: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-[0.8rem] font-light text-text-primary">{item.label}</p>
                  <p className="text-[0.65rem] font-light text-text-muted">{item.desc}</p>
                </div>
                <button
                  className={clsx(
                    "relative h-5 w-9 rounded-full transition-colors",
                    item.on ? "bg-accent-primary" : "bg-bg-elevated border border-border-primary"
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                      item.on ? "left-[18px]" : "left-0.5"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
