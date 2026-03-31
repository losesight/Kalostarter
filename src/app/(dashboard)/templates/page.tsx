"use client";

import { useState } from "react";
import {
  Palette,
  Type,
  Shield,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Upload,
  Check,
  Loader2,
  X,
  Plus,
  Minus,
  Layout,
} from "lucide-react";
import { useFetch } from "@/lib/use-fetch";
import { clsx } from "clsx";

interface PresetColors {
  accent: string;
  accentLight: string;
  background: string;
  buttonBg: string;
  buttonText: string;
  badgeBg: string;
  badgeText: string;
}

interface PresetTypography {
  headingFont: string;
  bodyFont: string;
  headingScale: number;
  bodyScale: number;
}

interface PresetBadge {
  text: string;
  color: string;
  icon: string;
}

interface Preset {
  id: string;
  name: string;
  slug: string;
  category: string;
  isDefault: boolean;
  colors: string;
  typography: string;
  sections: string;
  badges: string;
  description: string | null;
  _count: { products: number };
}

const ICON_MAP: Record<string, string> = {
  shield: "🛡️",
  check_circle: "✓",
  verified: "✅",
  truck: "🚚",
  heart: "♥",
  leaf: "🌿",
  star: "⭐",
  ruler: "📏",
  tool: "🔧",
};

export default function TemplatesPage() {
  const { data: presets, loading, refetch } = useFetch(
    () => fetch("/api/presets").then((r) => r.json() as Promise<Preset[]>),
    []
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [editColors, setEditColors] = useState<PresetColors | null>(null);
  const [editTypography, setEditTypography] = useState<PresetTypography | null>(null);
  const [editBadges, setEditBadges] = useState<PresetBadge[] | null>(null);

  const startEditing = (preset: Preset) => {
    setEditingPreset(preset);
    setEditColors(JSON.parse(preset.colors));
    setEditTypography(JSON.parse(preset.typography));
    setEditBadges(JSON.parse(preset.badges));
    setExpandedId(preset.id);
  };

  const cancelEditing = () => {
    setEditingPreset(null);
    setEditColors(null);
    setEditTypography(null);
    setEditBadges(null);
  };

  const savePreset = async () => {
    if (!editingPreset || !editColors || !editTypography || !editBadges) return;
    setSaving(true);
    try {
      await fetch(`/api/presets/${editingPreset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colors: JSON.stringify(editColors),
          typography: JSON.stringify(editTypography),
          badges: JSON.stringify(editBadges),
        }),
      });
      cancelEditing();
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const resetPreset = async (id: string) => {
    await fetch(`/api/presets/${id}`, { method: "POST" });
    cancelEditing();
    refetch();
  };

  const syncToShopify = async (presetId: string) => {
    setSyncing(presetId);
    try {
      // This would call a dedicated sync endpoint in production
      await new Promise((r) => setTimeout(r, 1500));
    } finally {
      setSyncing(null);
    }
  };

  const updateBadge = (index: number, field: keyof PresetBadge, value: string) => {
    if (!editBadges) return;
    const updated = [...editBadges];
    updated[index] = { ...updated[index], [field]: value };
    setEditBadges(updated);
  };

  const addBadge = () => {
    if (!editBadges) return;
    setEditBadges([...editBadges, { text: "New Badge", color: "#6b7280", icon: "shield" }]);
  };

  const removeBadge = (index: number) => {
    if (!editBadges) return;
    setEditBadges(editBadges.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.75rem] font-extralight tracking-tight text-text-primary">
            Theme <span className="gradient-text font-light">Templates</span>
          </h2>
          <p className="mt-1 text-[0.85rem] font-light text-text-muted">
            Product page presets — one per category, fully customizable
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-accent-primary/20 bg-accent-primary/5 p-4">
        <Layout className="mt-0.5 h-5 w-5 shrink-0 text-accent-primary" />
        <div>
          <p className="text-[0.8rem] font-medium text-accent-primary">How it works</p>
          <p className="mt-1 text-[0.7rem] font-light text-text-secondary">
            When you publish a product to Shopify, fflame automatically detects its category and assigns the matching theme template.
            Each preset controls colors, fonts, trust badges, and which sections appear on the product page.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      )}

      {/* Preset grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(presets ?? []).map((preset) => {
          const colors: PresetColors = JSON.parse(preset.colors);
          const typo: PresetTypography = JSON.parse(preset.typography);
          const badges: PresetBadge[] = JSON.parse(preset.badges);
          const isExpanded = expandedId === preset.id;
          const isEditing = editingPreset?.id === preset.id;

          return (
            <div
              key={preset.id}
              className={clsx(
                "rounded-xl border bg-bg-card transition-all",
                isExpanded
                  ? "border-accent-primary/40 shadow-[0_0_20px_rgba(217,70,239,0.1)] md:col-span-2 xl:col-span-3"
                  : "border-border-primary hover:border-border-primary/80"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-4 p-5">
                {/* Color swatch */}
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border"
                  style={{ background: `${colors.accent}15`, borderColor: `${colors.accent}30` }}
                >
                  <div className="h-6 w-6 rounded-full" style={{ background: colors.accent }} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[0.95rem] font-light text-text-primary">{preset.name}</h3>
                    {preset.isDefault && (
                      <span className="rounded-full bg-accent-primary/10 px-2 py-0.5 text-[0.55rem] font-semibold text-accent-primary">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[0.7rem] font-light text-text-muted">
                    {typo.headingFont} / {typo.bodyFont} — {preset._count.products} product{preset._count.products !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => syncToShopify(preset.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-border-primary bg-bg-elevated px-3 py-1.5 text-[0.65rem] font-medium text-text-secondary hover:bg-bg-card-hover transition-colors"
                  >
                    {syncing === preset.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    Sync
                  </button>
                  <button
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedId(null);
                        cancelEditing();
                      } else {
                        startEditing(preset);
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-primary bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Badge preview */}
              <div className="flex flex-wrap gap-1.5 px-5 pb-4">
                {badges.map((badge, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6rem] font-semibold"
                    style={{ background: `${badge.color}15`, color: badge.color }}
                  >
                    {ICON_MAP[badge.icon] || "●"} {badge.text}
                  </span>
                ))}
              </div>

              {/* Color bar */}
              <div className="flex h-2 overflow-hidden rounded-b-xl">
                {[colors.accent, colors.accentLight, colors.buttonBg, colors.badgeBg, colors.background].map((c, i) => (
                  <div key={i} className="flex-1" style={{ background: c }} />
                ))}
              </div>

              {/* Expanded editor */}
              {isExpanded && isEditing && editColors && editTypography && editBadges && (
                <div className="border-t border-border-primary p-5 space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Colors */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-accent-primary" />
                        <span className="micro-label text-[0.7rem]">Colors</span>
                      </div>
                      {(Object.keys(editColors) as (keyof PresetColors)[]).map((key) => (
                        <div key={key} className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editColors[key]}
                            onChange={(e) => setEditColors({ ...editColors, [key]: e.target.value })}
                            className="h-8 w-8 cursor-pointer rounded-lg border border-border-primary bg-transparent"
                          />
                          <div className="flex-1">
                            <p className="text-[0.7rem] font-light text-text-primary capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </p>
                            <p className="text-[0.6rem] font-mono text-text-muted">{editColors[key]}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Typography */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-accent-primary" />
                        <span className="micro-label text-[0.7rem]">Typography</span>
                      </div>
                      <div>
                        <label className="micro-label">Heading Font</label>
                        <select
                          value={editTypography.headingFont}
                          onChange={(e) => setEditTypography({ ...editTypography, headingFont: e.target.value })}
                          className="mt-1 h-9 w-full rounded-lg border border-border-primary bg-bg-elevated px-3 text-[0.8rem] font-light text-text-primary"
                        >
                          {["Poppins", "Inter", "Playfair Display", "Nunito", "Cormorant Garamond", "Oswald", "Lato", "Roboto", "Montserrat", "Open Sans"].map((f) => (
                            <option key={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="micro-label">Body Font</label>
                        <select
                          value={editTypography.bodyFont}
                          onChange={(e) => setEditTypography({ ...editTypography, bodyFont: e.target.value })}
                          className="mt-1 h-9 w-full rounded-lg border border-border-primary bg-bg-elevated px-3 text-[0.8rem] font-light text-text-primary"
                        >
                          {["Inter", "Lato", "Roboto", "Open Sans", "Nunito", "Poppins", "Montserrat"].map((f) => (
                            <option key={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="micro-label">Heading Scale ({editTypography.headingScale}%)</label>
                        <input
                          type="range"
                          min="80"
                          max="140"
                          value={editTypography.headingScale}
                          onChange={(e) => setEditTypography({ ...editTypography, headingScale: parseInt(e.target.value) })}
                          className="mt-1 w-full accent-accent-primary"
                        />
                      </div>
                      <div>
                        <label className="micro-label">Body Scale ({editTypography.bodyScale}%)</label>
                        <input
                          type="range"
                          min="80"
                          max="120"
                          value={editTypography.bodyScale}
                          onChange={(e) => setEditTypography({ ...editTypography, bodyScale: parseInt(e.target.value) })}
                          className="mt-1 w-full accent-accent-primary"
                        />
                      </div>

                      {/* Font Preview */}
                      <div className="rounded-lg border border-border-primary bg-bg-elevated p-4" style={{ background: editColors.background }}>
                        <p className="text-[0.6rem] text-text-muted mb-2">Preview</p>
                        <p style={{ fontFamily: editTypography.headingFont, fontSize: `${editTypography.headingScale * 0.16}px`, color: editColors.accent, fontWeight: 600 }}>
                          {preset.name}
                        </p>
                        <p style={{ fontFamily: editTypography.bodyFont, fontSize: `${editTypography.bodyScale * 0.13}px`, color: "#666", marginTop: 4 }}>
                          Premium quality product with verified reviews
                        </p>
                        <button
                          className="mt-3 rounded-lg px-4 py-1.5 text-[0.7rem] font-semibold"
                          style={{ background: editColors.buttonBg, color: editColors.buttonText }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-accent-primary" />
                          <span className="micro-label text-[0.7rem]">Trust Badges</span>
                        </div>
                        <button
                          onClick={addBadge}
                          className="flex items-center gap-1 rounded-lg border border-border-primary bg-bg-elevated px-2 py-1 text-[0.6rem] font-medium text-text-secondary hover:text-accent-primary transition-colors"
                        >
                          <Plus className="h-3 w-3" /> Add
                        </button>
                      </div>
                      {editBadges.map((badge, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg border border-border-primary bg-bg-elevated p-3">
                          <input
                            type="color"
                            value={badge.color}
                            onChange={(e) => updateBadge(i, "color", e.target.value)}
                            className="mt-0.5 h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                          />
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={badge.text}
                              onChange={(e) => updateBadge(i, "text", e.target.value)}
                              className="h-7 w-full rounded border border-border-primary bg-bg-card px-2 text-[0.75rem] font-light text-text-primary"
                            />
                            <select
                              value={badge.icon}
                              onChange={(e) => updateBadge(i, "icon", e.target.value)}
                              className="h-7 w-full rounded border border-border-primary bg-bg-card px-2 text-[0.7rem] font-light text-text-primary"
                            >
                              {Object.entries(ICON_MAP).map(([k, v]) => (
                                <option key={k} value={k}>{v} {k}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => removeBadge(i)}
                            className="mt-0.5 rounded p-1 text-text-muted hover:text-error transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {/* Badge Preview */}
                      <div className="rounded-lg border border-border-primary bg-bg-elevated p-3">
                        <p className="text-[0.6rem] text-text-muted mb-2">Badge Preview</p>
                        <div className="flex flex-wrap gap-1.5">
                          {editBadges.map((b, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6rem] font-semibold"
                              style={{ background: `${b.color}15`, color: b.color }}
                            >
                              {ICON_MAP[b.icon] || "●"} {b.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-border-primary pt-4">
                    <button
                      onClick={() => resetPreset(preset.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-border-primary bg-bg-elevated px-3 py-2 text-[0.75rem] font-light text-text-secondary hover:text-warning transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset to Default
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={cancelEditing}
                        className="flex items-center gap-1.5 rounded-lg border border-border-primary bg-bg-elevated px-4 py-2 text-[0.75rem] font-light text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                      <button
                        onClick={savePreset}
                        disabled={saving}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-5 py-2 text-[0.75rem] font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all disabled:opacity-60"
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
