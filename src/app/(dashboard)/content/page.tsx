"use client";

import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  Wand2,
  Target,
  Search as SearchIcon,
  FileText,
  Lightbulb,
} from "lucide-react";
import { Card } from "@/components/card";
import { clsx } from "clsx";

const toneOptions = ["Professional", "Casual", "Luxury", "Playful", "Technical"];

const mockGenerated = {
  title: "Premium Wireless Bluetooth Earbuds Pro — Crystal Clear Sound & 36H Battery",
  description: `<p>Experience premium audio without the premium price tag. These Wireless Bluetooth Earbuds Pro deliver rich, immersive sound with advanced noise cancellation technology — perfect for commutes, workouts, and everything in between.</p>
<p>Featuring Bluetooth 5.3 for seamless connectivity and a compact charging case that extends your listening to a remarkable 36 hours, these earbuds are engineered for your non-stop lifestyle.</p>`,
  bullets: [
    "Advanced Active Noise Cancellation (ANC) blocks out distractions",
    "36-hour total battery life with quick-charge case (10 min = 2 hours)",
    "IPX5 waterproof rating — sweatproof for intense workouts",
    "Bluetooth 5.3 with ultra-low latency for calls and gaming",
    "Ergonomic design with 3 ear tip sizes for a perfect, secure fit",
  ],
  seoTitle: "Wireless Bluetooth Earbuds Pro | Premium ANC Earbuds with 36H Battery",
  seoDescription:
    "Shop the Wireless Bluetooth Earbuds Pro with advanced noise cancellation, 36-hour battery life, IPX5 waterproof rating, and Bluetooth 5.3. Free shipping available.",
};

export default function ContentPage() {
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.75rem] font-extralight tracking-tight text-text-primary">
            Content <span className="gradient-text font-light">AI</span>
          </h2>
          <p className="mt-1 text-[0.85rem] font-light text-text-muted">
            AI-powered product copy, SEO, and description generation
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-5 py-2.5 text-[0.8rem] font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-[1.02] disabled:opacity-60"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          {isGenerating ? "Generating..." : "Regenerate All"}
        </button>
      </div>

      {/* Config bar */}
      <div className="flex items-center gap-4 rounded-xl border border-border-primary bg-bg-card p-4">
        <div className="flex items-center gap-2 text-[0.8rem] font-light text-text-secondary">
          <Target className="h-4 w-4 text-accent-primary" />
          Brand Tone:
        </div>
        <div className="flex items-center gap-2">
          {toneOptions.map((tone) => (
            <button
              key={tone}
              onClick={() => setSelectedTone(tone)}
              className={clsx(
                "rounded-full border px-3.5 py-1.5 text-[0.7rem] font-light transition-all",
                selectedTone === tone
                  ? "border-accent-primary/40 bg-accent-primary/15 text-accent-primary font-medium"
                  : "border-border-primary bg-bg-elevated text-text-muted hover:text-text-secondary"
              )}
            >
              {tone}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-[0.65rem] text-text-muted font-light">
          <Lightbulb className="h-3.5 w-3.5" />
          Powered by AI — always review before publishing
        </div>
      </div>

      {/* Product selector */}
      <div className="rounded-xl border border-border-primary bg-bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border-primary bg-bg-elevated">
            <span className="text-2xl">🎧</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-extralight text-text-primary">
              Wireless Bluetooth Earbuds Pro
            </h3>
            <p className="text-[0.75rem] font-light text-text-muted">
              Source: kalodata.com — Imported today at 10:34 AM
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-border-primary bg-bg-elevated px-4 py-2 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors">
            Change Product
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Generated content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Product Title */}
        <Card
          title="Product Title"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy("title", mockGenerated.title)}
                className="flex items-center gap-1 text-[0.65rem] text-text-muted hover:text-accent-primary transition-colors"
              >
                {copied === "title" ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied === "title" ? "Copied" : "Copy"}
              </button>
              <button className="flex items-center gap-1 text-[0.65rem] text-text-muted hover:text-accent-primary transition-colors">
                <RefreshCw className="h-3 w-3" />
                Regen
              </button>
            </div>
          }
        >
          <div className="rounded-lg border border-border-primary bg-bg-elevated p-4">
            <p className="text-[0.85rem] font-light text-text-primary leading-relaxed">
              {mockGenerated.title}
            </p>
          </div>
          <p className="mt-2 micro-label">
            {mockGenerated.title.length}/150 characters
          </p>
        </Card>

        {/* SEO */}
        <Card
          title="SEO Title & Meta Description"
          action={
            <span className="dash-badge blue">
              <SearchIcon className="h-3 w-3" />
              SEO Optimized
            </span>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="micro-label">SEO Title</label>
              <div className="mt-1 rounded-lg border border-border-primary bg-bg-elevated p-3">
                <p className="text-[0.8rem] font-light text-info">{mockGenerated.seoTitle}</p>
              </div>
              <p className="mt-1 micro-label">
                {mockGenerated.seoTitle.length}/60 characters
              </p>
            </div>
            <div>
              <label className="micro-label">Meta Description</label>
              <div className="mt-1 rounded-lg border border-border-primary bg-bg-elevated p-3">
                <p className="text-[0.8rem] font-light text-text-secondary">
                  {mockGenerated.seoDescription}
                </p>
              </div>
              <p className="mt-1 micro-label">
                {mockGenerated.seoDescription.length}/160 characters
              </p>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card
          title="Product Description"
          action={
            <span className="dash-badge purple">
              <Sparkles className="h-3 w-3" />
              AI Generated
            </span>
          }
        >
          <div className="rounded-lg border border-border-primary bg-bg-elevated p-4">
            <div
              className="text-[0.8rem] font-light text-text-secondary leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: mockGenerated.description }}
            />
          </div>
        </Card>

        {/* Key Features */}
        <Card
          title="Key Features & Benefits"
          action={
            <span className="dash-badge purple">
              <FileText className="h-3 w-3" />
              5 bullet points
            </span>
          }
        >
          <ul className="space-y-2.5">
            {mockGenerated.bullets.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border-primary/50 bg-bg-elevated p-3 text-[0.8rem] font-light text-text-secondary"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-primary/20 text-[0.55rem] font-semibold text-accent-primary">
                  {i + 1}
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
