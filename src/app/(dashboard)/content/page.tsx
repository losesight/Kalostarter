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
  Loader2,
} from "lucide-react";
import { Card } from "@/components/card";
import { api, type Product, type GeneratedContent } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { clsx } from "clsx";

const toneOptions = ["Professional", "Casual", "Luxury", "Playful", "Technical"];

export default function ContentPage() {
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: productData } = useFetch(() => api.products.list({ status: "draft" }), []);
  const { data: allProducts } = useFetch(() => api.products.list(), []);
  const products = allProducts?.products ?? productData?.products ?? [];

  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? products[0];

  // Load existing AI content if available
  const existingContent = selectedProduct?.aiGenerated && selectedProduct.aiTitle
    ? {
        title: selectedProduct.aiTitle,
        description: selectedProduct.aiDescription || "",
        bullets: selectedProduct.aiBullets ? JSON.parse(selectedProduct.aiBullets) : [],
        seoTitle: selectedProduct.seoTitle || "",
        seoDescription: selectedProduct.seoDescription || "",
      }
    : null;

  const content = generated || existingContent;

  const handleGenerate = async () => {
    if (!selectedProduct) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await api.ai.generate(selectedProduct.id, selectedTone);
      setGenerated(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
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
          disabled={isGenerating || !selectedProduct}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-5 py-2.5 text-[0.8rem] font-medium text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-[1.02] disabled:opacity-60"
        >
          {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {isGenerating ? "Generating..." : content ? "Regenerate" : "Generate Content"}
        </button>
      </div>

      {/* Config bar */}
      <div className="flex items-center gap-4 rounded-xl border border-border-primary bg-bg-card p-4">
        <div className="flex items-center gap-2 text-[0.8rem] font-light text-text-secondary">
          <Target className="h-4 w-4 text-accent-primary" /> Brand Tone:
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
          <Lightbulb className="h-3.5 w-3.5" /> Powered by OpenAI — always review before publishing
        </div>
      </div>

      {/* Product selector */}
      <div className="relative rounded-xl border border-border-primary bg-bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border-primary bg-bg-elevated">
            <span className="text-2xl">📦</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-extralight text-text-primary">
              {selectedProduct?.title || "Select a product"}
            </h3>
            <p className="text-[0.75rem] font-light text-text-muted">
              {selectedProduct
                ? `Source: ${selectedProduct.source} — $${selectedProduct.price.toFixed(2)}`
                : "Choose a product to generate content for"}
            </p>
          </div>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 rounded-lg border border-border-primary bg-bg-elevated px-4 py-2 text-[0.8rem] font-light text-text-secondary hover:bg-bg-card-hover transition-colors"
          >
            Change Product <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        {showPicker && (
          <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-border-primary bg-bg-elevated">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedProductId(p.id); setShowPicker(false); setGenerated(null); }}
                className={clsx(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[0.8rem] transition-colors hover:bg-bg-card",
                  p.id === selectedProduct?.id && "bg-accent-primary/10"
                )}
              >
                <span className="font-light text-text-primary">{p.title}</span>
                <span className="ml-auto text-[0.65rem] text-text-muted">${p.price.toFixed(2)}</span>
                {p.aiGenerated && <Sparkles className="h-3 w-3 text-accent-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-[0.8rem] font-light text-error">
          {error}
        </div>
      )}

      {isGenerating && (
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent-primary" />
          <span className="text-sm font-light text-text-muted">Generating content with AI...</span>
        </div>
      )}

      {content && !isGenerating && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card
            title="Product Title"
            action={
              <button onClick={() => handleCopy("title", content.title)} className="flex items-center gap-1 text-[0.65rem] text-text-muted hover:text-accent-primary transition-colors">
                {copied === "title" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                {copied === "title" ? "Copied" : "Copy"}
              </button>
            }
          >
            <div className="rounded-lg border border-border-primary bg-bg-elevated p-4">
              <p className="text-[0.85rem] font-light text-text-primary leading-relaxed">{content.title}</p>
            </div>
            <p className="mt-2 micro-label">{content.title.length}/150 characters</p>
          </Card>

          <Card
            title="SEO Title & Meta Description"
            action={<span className="dash-badge blue"><SearchIcon className="h-3 w-3" /> SEO Optimized</span>}
          >
            <div className="space-y-3">
              <div>
                <label className="micro-label">SEO Title</label>
                <div className="mt-1 rounded-lg border border-border-primary bg-bg-elevated p-3">
                  <p className="text-[0.8rem] font-light text-info">{content.seoTitle}</p>
                </div>
                <p className="mt-1 micro-label">{content.seoTitle.length}/60 characters</p>
              </div>
              <div>
                <label className="micro-label">Meta Description</label>
                <div className="mt-1 rounded-lg border border-border-primary bg-bg-elevated p-3">
                  <p className="text-[0.8rem] font-light text-text-secondary">{content.seoDescription}</p>
                </div>
                <p className="mt-1 micro-label">{content.seoDescription.length}/160 characters</p>
              </div>
            </div>
          </Card>

          <Card
            title="Product Description"
            action={<span className="dash-badge purple"><Sparkles className="h-3 w-3" /> AI Generated</span>}
          >
            <div className="rounded-lg border border-border-primary bg-bg-elevated p-4">
              <div className="text-[0.8rem] font-light text-text-secondary leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: content.description }} />
            </div>
          </Card>

          <Card
            title="Key Features & Benefits"
            action={<span className="dash-badge purple"><FileText className="h-3 w-3" /> {content.bullets.length} bullet points</span>}
          >
            <ul className="space-y-2.5">
              {content.bullets.map((bullet: string, i: number) => (
                <li key={i} className="flex items-start gap-3 rounded-lg border border-border-primary/50 bg-bg-elevated p-3 text-[0.8rem] font-light text-text-secondary">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-primary/20 text-[0.55rem] font-semibold text-accent-primary">{i + 1}</span>
                  {bullet}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {!content && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Sparkles className="h-10 w-10 text-text-muted/30 mb-4" />
          <p className="text-sm font-light text-text-muted">Select a product and click Generate to create AI-powered content</p>
        </div>
      )}
    </div>
  );
}
