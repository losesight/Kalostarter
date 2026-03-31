"use client";

import { useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import {
  Rocket,
  Link as LinkIcon,
  Search,
  Brain,
  DollarSign,
  FileText,
  Palette,
  Download,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Target,
  TrendingUp,
  Users,
  Megaphone,
  ArrowUpRight,
  Copy,
  Zap,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  ShoppingBag,
  ExternalLink,
  Store,
  KeyRound,
} from "lucide-react";
import { api } from "@/lib/api";
import type {
  LaunchProject,
  AdAnalysisInput,
  AdAnalysisResponse,
  PricingResponse,
  CopyResponse,
  ShopifyPublishResponse,
  ThemeBuildResponse,
} from "@/lib/api";

const STEPS = [
  { num: 1, label: "Import", icon: LinkIcon, desc: "Paste KaloData link" },
  { num: 2, label: "Ad Intel", icon: Brain, desc: "Analyze ad creative" },
  { num: 3, label: "Pricing", icon: DollarSign, desc: "Competitor pricing" },
  { num: 4, label: "Copy", icon: FileText, desc: "Website & ad copy" },
  { num: 5, label: "Shopify", icon: ShoppingBag, desc: "Publish product" },
  { num: 6, label: "Theme", icon: Palette, desc: "Build & download" },
];

export default function LaunchPage() {
  const [project, setProject] = useState<LaunchProject | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 state
  const [kaloUrl, setKaloUrl] = useState("");
  const [projectName, setProjectName] = useState("");

  // Step 2 state
  const [adContent, setAdContent] = useState("");
  const [adPlatform, setAdPlatform] = useState("Facebook");
  const [adViews, setAdViews] = useState("");
  const [adLikes, setAdLikes] = useState("");
  const [adComments, setAdComments] = useState("");
  const [adShares, setAdShares] = useState("");
  const [adAnalysis, setAdAnalysis] = useState<AdAnalysisResponse | null>(null);

  // Step 3 state
  const [pricingResult, setPricingResult] = useState<PricingResponse | null>(null);

  // Step 4 state
  const [copyResult, setCopyResult] = useState<CopyResponse | null>(null);

  // Step 5 state (Shopify publish)
  const [publishResult, setPublishResult] = useState<ShopifyPublishResponse | null>(null);

  // Step 6 state (Theme)
  const [themeResult, setThemeResult] = useState<ThemeBuildResponse | null>(null);

  const pollProject = useCallback(async (id: string) => {
    try {
      const p = await api.launch.get(id);
      setProject(p);
      if (p.currentStep > step) setStep(p.currentStep);
      if (p.adAnalysis && !adAnalysis) {
        try { setAdAnalysis(JSON.parse(p.adAnalysis)); } catch { /* ignore */ }
      }
      if (p.pricingResult && !pricingResult) {
        try { setPricingResult(JSON.parse(p.pricingResult)); } catch { /* ignore */ }
      }
      if (p.websiteCopy && !copyResult) {
        try {
          setCopyResult({
            websiteCopy: JSON.parse(p.websiteCopy),
            adCopy: p.adCopy ? JSON.parse(p.adCopy) : { angles: [], emailSubjectLines: [], smsMessages: [] },
          });
        } catch { /* ignore */ }
      }
      return p;
    } catch {
      return null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (!project?.id) return;
    if (project.status === "importing") {
      const interval = setInterval(async () => {
        const p = await pollProject(project.id);
        if (p && p.status !== "importing") clearInterval(interval);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [project?.id, project?.status, pollProject]);

  async function handleImport() {
    if (!kaloUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const p = await api.launch.create(kaloUrl.trim(), projectName.trim() || undefined);
      setProject(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleManualImport(data: {
    title: string;
    price: number;
    category?: string;
    description?: string;
    images?: string[];
  }) {
    setLoading(true);
    setError(null);
    try {
      const p = await api.launch.createManual({
        ...data,
        name: projectName.trim() || undefined,
        kaloUrl: kaloUrl.trim() || undefined,
      });
      setProject(p);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Manual import failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdAnalysis() {
    if (!project?.id) return;
    setLoading(true);
    setError(null);
    try {
      const input: AdAnalysisInput = {
        adContent: adContent.trim() || undefined,
        adPlatform,
        adMetrics: {
          views: adViews ? parseInt(adViews) : undefined,
          likes: adLikes ? parseInt(adLikes) : undefined,
          comments: adComments ? parseInt(adComments) : undefined,
          shares: adShares ? parseInt(adShares) : undefined,
        },
      };
      const result = await api.launch.adAnalysis(project.id, input);
      setAdAnalysis(result);
      setStep(3);
      await pollProject(project.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ad analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePricing() {
    if (!project?.id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.launch.pricing(project.id);
      setPricingResult(result);
      setStep(4);
      await pollProject(project.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pricing analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!project?.id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.launch.copy(project.id);
      setCopyResult(result);
      setStep(5);
      await pollProject(project.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Copy generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(opts?: {
    storeDomain?: string;
    accessToken?: string;
    pricingTier?: number;
  }) {
    if (!project?.id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.launch.publish(project.id, opts);
      if (result.needsCredentials) {
        setError(result.error || "Shopify credentials required");
        return;
      }
      setPublishResult(result);
      setStep(6);
      await pollProject(project.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleThemeBuild() {
    if (!project?.id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.launch.theme(project.id);
      setThemeResult(result);
      await pollProject(project.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Theme build failed");
    } finally {
      setLoading(false);
    }
  }

  function canGoToStep(s: number): boolean {
    if (!project) return s === 1;
    return s <= (project.currentStep || 1) + 1;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[1.75rem] font-extralight tracking-tight text-text-primary">
          Product <span className="gradient-text font-light">Launch</span>
        </h2>
        <p className="mt-1 text-[0.85rem] font-light text-text-muted">
          Paste a KaloData link and let fflame build your entire store in minutes
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => canGoToStep(s.num) && setStep(s.num)}
              className={clsx(
                "flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all duration-300 flex-1 min-w-0",
                step === s.num
                  ? "bg-gradient-to-r from-accent-primary/20 to-accent-secondary/15 border border-accent-primary/30 shadow-[0_0_20px_rgba(217,70,239,0.1)]"
                  : s.num < step || (project && s.num <= (project.currentStep || 0))
                    ? "bg-bg-card border border-success/20 cursor-pointer hover:border-success/40"
                    : "bg-bg-card/50 border border-border-primary cursor-default opacity-50"
              )}
            >
              <div
                className={clsx(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  step === s.num
                    ? "bg-accent-primary/20 text-accent-primary"
                    : s.num < step || (project && s.num <= (project.currentStep || 0))
                      ? "bg-success/20 text-success"
                      : "bg-bg-elevated text-text-muted"
                )}
              >
                {s.num < step || (project && s.num < (project.currentStep || 0)) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <s.icon className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="min-w-0 hidden lg:block">
                <p
                  className={clsx(
                    "text-[0.7rem] font-medium truncate",
                    step === s.num ? "text-accent-primary" : "text-text-secondary"
                  )}
                >
                  {s.label}
                </p>
                <p className="text-[0.55rem] text-text-muted truncate">{s.desc}</p>
              </div>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-error/30 bg-error/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
          <div>
            <p className="text-[0.8rem] font-medium text-error">Error</p>
            <p className="mt-1 text-[0.7rem] font-light text-text-secondary">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-text-muted hover:text-text-primary text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step Content */}
      <div className="rounded-2xl border border-border-primary bg-bg-card/60 backdrop-blur-sm p-6">
        {step === 1 && <Step1Import
          kaloUrl={kaloUrl}
          setKaloUrl={setKaloUrl}
          projectName={projectName}
          setProjectName={setProjectName}
          loading={loading || project?.status === "importing"}
          project={project}
          onImport={handleImport}
          onManualImport={handleManualImport}
          onNext={() => setStep(2)}
        />}
        {step === 2 && <Step2AdIntel
          project={project}
          loading={loading}
          adContent={adContent}
          setAdContent={setAdContent}
          adPlatform={adPlatform}
          setAdPlatform={setAdPlatform}
          adViews={adViews}
          setAdViews={setAdViews}
          adLikes={adLikes}
          setAdLikes={setAdLikes}
          adComments={adComments}
          setAdComments={setAdComments}
          adShares={adShares}
          setAdShares={setAdShares}
          adAnalysis={adAnalysis}
          onAnalyze={handleAdAnalysis}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />}
        {step === 3 && <Step3Pricing
          project={project}
          loading={loading}
          pricingResult={pricingResult}
          onAnalyze={handlePricing}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />}
        {step === 4 && <Step4Copy
          project={project}
          loading={loading}
          copyResult={copyResult}
          onGenerate={handleCopy}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />}
        {step === 5 && <Step5Shopify
          project={project}
          loading={loading}
          pricingResult={pricingResult}
          publishResult={publishResult}
          onPublish={handlePublish}
          onNext={() => setStep(6)}
          onBack={() => setStep(4)}
        />}
        {step === 6 && <Step6Theme
          project={project}
          loading={loading}
          themeResult={themeResult}
          onBuild={handleThemeBuild}
          onBack={() => setStep(5)}
        />}
      </div>
    </div>
  );
}

// ─── Step 1: Import ────────────────────────────────────────────────

function Step1Import({
  kaloUrl, setKaloUrl, projectName, setProjectName, loading, project, onImport, onManualImport, onNext,
}: {
  kaloUrl: string;
  setKaloUrl: (v: string) => void;
  projectName: string;
  setProjectName: (v: string) => void;
  loading: boolean | undefined;
  project: LaunchProject | null;
  onImport: () => void;
  onManualImport: (data: { title: string; price: number; category?: string; description?: string; images?: string[] }) => void;
  onNext: () => void;
}) {
  const imported = project?.product;
  const [mode, setMode] = useState<"url" | "manual">(
    project?.status === "error" ? "manual" : "url"
  );
  const [manualTitle, setManualTitle] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualCategory, setManualCategory] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualImages, setManualImages] = useState("");

  useEffect(() => {
    if (project?.status === "error") setMode("manual");
  }, [project?.status]);

  function handleManualSubmit() {
    if (!manualTitle.trim() || !manualPrice.trim()) return;
    onManualImport({
      title: manualTitle.trim(),
      price: parseFloat(manualPrice) || 0,
      category: manualCategory.trim() || undefined,
      description: manualDescription.trim() || undefined,
      images: manualImages.trim()
        ? manualImages.split("\n").map((u) => u.trim()).filter(Boolean)
        : undefined,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/15">
          <LinkIcon className="h-5 w-5 text-accent-primary" />
        </div>
        <div>
          <h3 className="text-lg font-light text-text-primary">Import Product</h3>
          <p className="text-[0.75rem] text-text-muted">
            {mode === "url"
              ? "Paste a KaloData product link, or enter details manually"
              : "Enter product details manually"}
          </p>
        </div>
      </div>

      {!imported && (
        <>
          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("url")}
              className={clsx(
                "rounded-lg px-4 py-2 text-[0.75rem] font-medium transition-all",
                mode === "url"
                  ? "bg-accent-primary/15 text-accent-primary border border-accent-primary/30"
                  : "bg-bg-elevated text-text-muted border border-border-primary hover:text-text-secondary"
              )}
            >
              Auto Import (URL)
            </button>
            <button
              onClick={() => setMode("manual")}
              className={clsx(
                "rounded-lg px-4 py-2 text-[0.75rem] font-medium transition-all",
                mode === "manual"
                  ? "bg-accent-primary/15 text-accent-primary border border-accent-primary/30"
                  : "bg-bg-elevated text-text-muted border border-border-primary hover:text-text-secondary"
              )}
            >
              Manual Entry
            </button>
          </div>

          {mode === "url" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
                  KaloData Product URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={kaloUrl}
                    onChange={(e) => setKaloUrl(e.target.value)}
                    placeholder="https://www.kalodata.com/product/..."
                    className="flex-1 rounded-lg border border-border-primary bg-bg-elevated px-4 py-2.5 text-sm font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                  />
                  <button
                    onClick={onImport}
                    disabled={!kaloUrl.trim() || !!loading}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {loading ? "Importing..." : "Import"}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
                  Project Name (optional)
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Product Launch"
                  className="w-full rounded-lg border border-border-primary bg-bg-elevated px-4 py-2.5 text-sm font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {mode === "manual" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Wireless Bluetooth Earbuds Pro"
                    className="w-full rounded-lg border border-border-primary bg-bg-elevated px-4 py-2.5 text-sm font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                      placeholder="29.99"
                      step="0.01"
                      className="w-full rounded-lg border border-border-primary bg-bg-elevated px-4 py-2.5 text-sm font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
                      Category
                    </label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="w-full rounded-lg border border-border-primary bg-bg-elevated px-3 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                    >
                      <option value="">Select...</option>
                      <option>Electronics</option>
                      <option>Supplements</option>
                      <option>Beauty</option>
                      <option>Home & Kitchen</option>
                      <option>Fashion</option>
                      <option>Fitness</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
                  Description (optional)
                </label>
                <textarea
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief product description — helps AI generate better copy"
                  className="w-full rounded-lg border border-border-primary bg-bg-elevated px-4 py-2.5 text-sm font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
                  Image URLs (one per line, optional)
                </label>
                <textarea
                  value={manualImages}
                  onChange={(e) => setManualImages(e.target.value)}
                  rows={2}
                  placeholder={"https://example.com/product-image-1.jpg\nhttps://example.com/product-image-2.jpg"}
                  className="w-full rounded-lg border border-border-primary bg-bg-elevated px-4 py-2.5 text-sm font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none resize-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
                  Project Name (optional)
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Product Launch"
                  className="w-full rounded-lg border border-border-primary bg-bg-elevated px-4 py-2.5 text-sm font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualTitle.trim() || !manualPrice.trim() || !!loading}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                  {loading ? "Creating..." : "Create Launch Project"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {project?.status === "importing" && (
        <div className="flex items-center gap-3 rounded-xl border border-accent-primary/20 bg-accent-primary/5 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-accent-primary" />
          <p className="text-[0.8rem] text-text-secondary">Importing product data from KaloData...</p>
        </div>
      )}

      {project?.status === "error" && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />
            <div>
              <p className="text-[0.8rem] font-medium text-warning">Auto-import blocked</p>
              <p className="mt-1 text-[0.7rem] text-text-secondary">
                {project.errorLog ? JSON.parse(project.errorLog).join(". ") : "Unknown error"}
              </p>
              <p className="mt-2 text-[0.7rem] text-text-muted">
                KaloData uses Cloudflare protection. Use the <strong className="text-text-secondary">Manual Entry</strong> tab above
                to enter the product details from the KaloData page.
              </p>
            </div>
          </div>
        </div>
      )}

      {imported && (
        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-xl border border-success/20 bg-success/5 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
            <div className="flex-1 min-w-0">
              <p className="text-[0.8rem] font-medium text-success">Product Imported</p>
              <p className="mt-1 text-[0.85rem] font-light text-text-primary truncate">{imported.title}</p>
              <div className="mt-2 flex items-center gap-4 text-[0.7rem] text-text-muted">
                <span>${imported.price.toFixed(2)}</span>
                {imported.category && <span>{imported.category}</span>}
                {imported.images && (
                  <span>{JSON.parse(imported.images).length} images</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onNext}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Continue to Ad Intelligence <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Ad Intelligence ───────────────────────────────────────

function Step2AdIntel({
  project, loading, adContent, setAdContent, adPlatform, setAdPlatform,
  adViews, setAdViews, adLikes, setAdLikes, adComments, setAdComments,
  adShares, setAdShares, adAnalysis, onAnalyze, onNext, onBack,
}: {
  project: LaunchProject | null;
  loading: boolean;
  adContent: string;
  setAdContent: (v: string) => void;
  adPlatform: string;
  setAdPlatform: (v: string) => void;
  adViews: string;
  setAdViews: (v: string) => void;
  adLikes: string;
  setAdLikes: (v: string) => void;
  adComments: string;
  setAdComments: (v: string) => void;
  adShares: string;
  setAdShares: (v: string) => void;
  adAnalysis: AdAnalysisResponse | null;
  onAnalyze: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-secondary/15">
          <Brain className="h-5 w-5 text-accent-secondary" />
        </div>
        <div>
          <h3 className="text-lg font-light text-text-primary">Ad Intelligence</h3>
          <p className="text-[0.75rem] text-text-muted">
            Paste existing ad content to analyze, or skip to generate from scratch
          </p>
        </div>
      </div>

      {!adAnalysis && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
              Ad Content / Script (optional)
            </label>
            <textarea
              value={adContent}
              onChange={(e) => setAdContent(e.target.value)}
              rows={4}
              placeholder="Paste the ad script, copy, or description here..."
              className="w-full rounded-lg border border-border-primary bg-bg-elevated px-4 py-2.5 text-sm font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
                Platform
              </label>
              <select
                value={adPlatform}
                onChange={(e) => setAdPlatform(e.target.value)}
                className="w-full rounded-lg border border-border-primary bg-bg-elevated px-3 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option>Facebook</option>
                <option>TikTok</option>
                <option>Instagram</option>
                <option>YouTube</option>
                <option>Google</option>
              </select>
            </div>
            {[
              { label: "Views", value: adViews, setter: setAdViews, icon: Eye },
              { label: "Likes", value: adLikes, setter: setAdLikes, icon: Heart },
              { label: "Comments", value: adComments, setter: setAdComments, icon: MessageSquare },
              { label: "Shares", value: adShares, setter: setAdShares, icon: Share2 },
            ].map(({ label, value, setter, icon: Icon }) => (
              <div key={label}>
                <label className="mb-1.5 flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
                  <Icon className="h-3 w-3" /> {label}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-border-primary bg-bg-elevated px-3 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={onBack} className="flex items-center gap-1.5 text-[0.8rem] text-text-muted hover:text-text-primary">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={onAnalyze}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>
      )}

      {adAnalysis && (
        <div className="space-y-4">
          {/* Customer Avatar */}
          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-accent-primary" />
              <h4 className="text-[0.8rem] font-medium text-text-primary">Customer Avatar</h4>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(adAnalysis.customerAvatar.demographics).map(([key, val]) => (
                <div key={key} className="rounded-lg bg-bg-card p-2.5">
                  <p className="text-[0.6rem] uppercase tracking-wider text-text-muted">{key}</p>
                  <p className="text-[0.8rem] font-light text-text-primary mt-0.5">{val}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(["painPoints", "desires", "buyingTriggers", "objections"] as const).map((field) => (
                <div key={field} className="rounded-lg bg-bg-card p-2.5">
                  <p className="text-[0.6rem] uppercase tracking-wider text-text-muted mb-1">{field.replace(/([A-Z])/g, " $1")}</p>
                  <ul className="space-y-0.5">
                    {adAnalysis.customerAvatar.psychographics[field].map((item: string, i: number) => (
                      <li key={i} className="text-[0.7rem] font-light text-text-secondary">• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Facebook Prediction */}
          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-accent-primary" />
              <h4 className="text-[0.8rem] font-medium text-text-primary">Facebook Ads Prediction</h4>
              <span className={clsx(
                "ml-auto text-[0.6rem] px-2 py-0.5 rounded-full",
                adAnalysis.facebookPrediction.confidence === "High" ? "bg-success/15 text-success" :
                adAnalysis.facebookPrediction.confidence === "Medium" ? "bg-warning/15 text-warning" :
                "bg-text-muted/15 text-text-muted"
              )}>
                {adAnalysis.facebookPrediction.confidence} confidence
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-bg-card p-3 text-center">
                <p className="text-[0.6rem] uppercase tracking-wider text-text-muted">Est. CTR</p>
                <p className="text-lg font-extralight text-text-primary mt-1">{adAnalysis.facebookPrediction.estimatedCTR}</p>
              </div>
              <div className="rounded-lg bg-bg-card p-3 text-center">
                <p className="text-[0.6rem] uppercase tracking-wider text-text-muted">Est. CPM</p>
                <p className="text-lg font-extralight text-text-primary mt-1">{adAnalysis.facebookPrediction.estimatedCPM}</p>
              </div>
              <div className="rounded-lg bg-bg-card p-3 text-center">
                <p className="text-[0.6rem] uppercase tracking-wider text-text-muted">Est. ROAS</p>
                <p className="text-lg font-extralight text-text-primary mt-1">{adAnalysis.facebookPrediction.estimatedROAS}</p>
              </div>
            </div>
            <p className="mt-2 text-[0.7rem] font-light text-text-muted">{adAnalysis.facebookPrediction.reasoning}</p>
          </div>

          {/* Ad Copy Angles */}
          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="h-4 w-4 text-accent-primary" />
              <h4 className="text-[0.8rem] font-medium text-text-primary">Ad Copy Angles</h4>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {adAnalysis.adCopyAngles.map((angle, i) => (
                <div key={i} className="rounded-lg bg-bg-card p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-accent-secondary" />
                    <p className="text-[0.75rem] font-medium text-accent-secondary">{angle.angle}</p>
                  </div>
                  <p className="text-[0.75rem] font-medium text-text-primary">{angle.headline}</p>
                  <p className="text-[0.65rem] font-light text-text-secondary line-clamp-4">{angle.primaryText}</p>
                  <p className="text-[0.65rem] text-accent-primary">{angle.cta}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={onBack} className="flex items-center gap-1.5 text-[0.8rem] text-text-muted hover:text-text-primary">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={onNext}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Continue to Pricing <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Pricing ───────────────────────────────────────────────

function Step3Pricing({
  project, loading, pricingResult, onAnalyze, onNext, onBack,
}: {
  project: LaunchProject | null;
  loading: boolean;
  pricingResult: PricingResponse | null;
  onAnalyze: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15">
          <DollarSign className="h-5 w-5 text-success" />
        </div>
        <div>
          <h3 className="text-lg font-light text-text-primary">Pricing & Offer</h3>
          <p className="text-[0.75rem] text-text-muted">
            Competitor analysis and recommended pricing tiers
          </p>
        </div>
      </div>

      {!pricingResult && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <p className="text-[0.8rem] text-text-secondary">
              fflame will search Google Shopping for competitor prices on{" "}
              <strong className="text-text-primary">{project?.product?.title || "your product"}</strong>,
              then recommend optimal pricing tiers and offer structure.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-1.5 text-[0.8rem] text-text-muted hover:text-text-primary">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={onAnalyze}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
              {loading ? "Analyzing Prices..." : "Analyze Pricing"}
            </button>
          </div>
        </div>
      )}

      {pricingResult && (
        <div className="space-y-4">
          {/* Competitors */}
          {pricingResult.competitors.length > 0 && (
            <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
              <h4 className="text-[0.8rem] font-medium text-text-primary mb-3">
                Competitor Prices ({pricingResult.competitors.length} found)
              </h4>
              <div className="space-y-2">
                {pricingResult.competitors.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-bg-card px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.75rem] text-text-primary truncate">{c.title}</p>
                      <p className="text-[0.6rem] text-text-muted">{c.source}</p>
                    </div>
                    <p className="text-[0.85rem] font-light text-text-primary ml-3">${c.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-4 text-[0.7rem] text-text-muted">
                <span>Avg: <strong className="text-text-primary">${pricingResult.averagePrice.toFixed(2)}</strong></span>
                <span>Range: <strong className="text-text-primary">${pricingResult.priceRange.min.toFixed(2)} - ${pricingResult.priceRange.max.toFixed(2)}</strong></span>
              </div>
            </div>
          )}

          {/* Recommended Tiers */}
          <div className="grid gap-3 lg:grid-cols-3">
            {pricingResult.recommendedTiers.map((tier, i) => (
              <div
                key={i}
                className={clsx(
                  "rounded-xl border p-4",
                  i === 1
                    ? "border-accent-primary/30 bg-accent-primary/5"
                    : "border-border-primary bg-bg-elevated/50"
                )}
              >
                {i === 1 && (
                  <span className="mb-2 inline-block rounded-full bg-accent-primary/20 px-2.5 py-0.5 text-[0.6rem] font-medium text-accent-primary">
                    Recommended
                  </span>
                )}
                <p className="text-[0.7rem] uppercase tracking-wider text-text-muted">{tier.name}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-2xl font-extralight text-text-primary">${tier.price.toFixed(2)}</p>
                  {tier.compareAtPrice && (
                    <p className="text-[0.75rem] text-text-muted line-through">${tier.compareAtPrice.toFixed(2)}</p>
                  )}
                </div>
                <p className="mt-1 text-[0.65rem] text-success">Margin: {tier.margin}</p>
                <p className="mt-2 text-[0.7rem] font-light text-text-secondary">{tier.strategy}</p>
              </div>
            ))}
          </div>

          {/* Offer Structure */}
          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <h4 className="text-[0.8rem] font-medium text-text-primary mb-3">Offer Structure</h4>
            <div className="space-y-2">
              <p className="text-[0.85rem] font-medium text-accent-primary">{pricingResult.offerStructure.headline}</p>
              <p className="text-[0.75rem] text-text-secondary">{pricingResult.offerStructure.mainOffer}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {pricingResult.offerStructure.bonuses.map((bonus, i) => (
                  <span key={i} className="rounded-full bg-success/10 px-3 py-1 text-[0.65rem] text-success">
                    + {bonus}
                  </span>
                ))}
              </div>
              <p className="text-[0.7rem] text-text-muted mt-2">{pricingResult.offerStructure.guarantee}</p>
            </div>
          </div>

          <p className="text-[0.7rem] font-light text-text-muted italic">{pricingResult.reasoning}</p>

          <div className="flex items-center justify-between pt-2">
            <button onClick={onBack} className="flex items-center gap-1.5 text-[0.8rem] text-text-muted hover:text-text-primary">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={onNext}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Continue to Copy <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Copy ──────────────────────────────────────────────────

function Step4Copy({
  project, loading, copyResult, onGenerate, onNext, onBack,
}: {
  project: LaunchProject | null;
  loading: boolean;
  copyResult: CopyResponse | null;
  onGenerate: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15">
          <FileText className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h3 className="text-lg font-light text-text-primary">Website & Ad Copy</h3>
          <p className="text-[0.75rem] text-text-muted">
            AI-generated copy aligned with your ad intelligence
          </p>
        </div>
      </div>

      {!copyResult && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <p className="text-[0.8rem] text-text-secondary">
              fflame will generate high-converting website copy and matching ad copy for{" "}
              <strong className="text-text-primary">{project?.product?.title || "your product"}</strong>,
              using insights from your ad analysis and pricing data.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-1.5 text-[0.8rem] text-text-muted hover:text-text-primary">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={onGenerate}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {loading ? "Generating Copy..." : "Generate Copy"}
            </button>
          </div>
        </div>
      )}

      {copyResult && (
        <div className="space-y-4">
          {/* Website Hero */}
          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[0.8rem] font-medium text-text-primary">Website Hero</h4>
              <button
                onClick={() => copyToClipboard(
                  `${copyResult.websiteCopy.hero.headline}\n${copyResult.websiteCopy.hero.subheadline}`,
                  "hero"
                )}
                className="flex items-center gap-1 text-[0.65rem] text-text-muted hover:text-accent-primary"
              >
                <Copy className="h-3 w-3" />
                {copiedField === "hero" ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xl font-light text-text-primary">{copyResult.websiteCopy.hero.headline}</p>
            <p className="mt-1 text-[0.8rem] text-text-secondary">{copyResult.websiteCopy.hero.subheadline}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-lg bg-accent-primary/20 px-3 py-1.5 text-[0.7rem] font-medium text-accent-primary">
                {copyResult.websiteCopy.hero.ctaText}
              </span>
              <span className="text-[0.65rem] text-warning">{copyResult.websiteCopy.hero.urgencyBanner}</span>
            </div>
          </div>

          {/* Product Copy */}
          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[0.8rem] font-medium text-text-primary">Product Section</h4>
              <button
                onClick={() => copyToClipboard(copyResult.websiteCopy.productSection.description, "product")}
                className="flex items-center gap-1 text-[0.65rem] text-text-muted hover:text-accent-primary"
              >
                <Copy className="h-3 w-3" />
                {copiedField === "product" ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-[0.85rem] font-medium text-text-primary">{copyResult.websiteCopy.productSection.title}</p>
            <div
              className="mt-2 text-[0.75rem] font-light text-text-secondary prose prose-sm prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: copyResult.websiteCopy.productSection.description }}
            />
            <div className="mt-3 space-y-1">
              {copyResult.websiteCopy.productSection.bullets.map((b: string, i: number) => (
                <p key={i} className="text-[0.7rem] text-text-secondary">✓ {b}</p>
              ))}
            </div>
          </div>

          {/* Ad Copy Angles */}
          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <h4 className="text-[0.8rem] font-medium text-text-primary mb-3">Ad Copy Angles</h4>
            <div className="grid gap-3 lg:grid-cols-3">
              {copyResult.adCopy.angles.map((angle, i) => (
                <div key={i} className="rounded-lg bg-bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] font-medium text-accent-secondary">{angle.name}</p>
                    <button
                      onClick={() => copyToClipboard(`${angle.headline}\n\n${angle.primaryText}`, `angle-${i}`)}
                      className="text-text-muted hover:text-accent-primary"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-[0.75rem] font-medium text-text-primary">{angle.headline}</p>
                  <p className="text-[0.65rem] font-light text-text-secondary line-clamp-5">{angle.primaryText}</p>
                  <p className="text-[0.65rem] text-accent-primary">{angle.cta}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <h4 className="text-[0.8rem] font-medium text-text-primary mb-3">SEO</h4>
            <div className="space-y-2">
              <div className="rounded-lg bg-bg-card px-3 py-2">
                <p className="text-[0.6rem] uppercase tracking-wider text-text-muted">Title</p>
                <p className="text-[0.75rem] text-text-primary">{copyResult.websiteCopy.seo.title}</p>
              </div>
              <div className="rounded-lg bg-bg-card px-3 py-2">
                <p className="text-[0.6rem] uppercase tracking-wider text-text-muted">Meta Description</p>
                <p className="text-[0.75rem] text-text-primary">{copyResult.websiteCopy.seo.metaDescription}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {copyResult.websiteCopy.seo.keywords.map((kw: string, i: number) => (
                  <span key={i} className="rounded-full bg-accent-primary/10 px-2 py-0.5 text-[0.6rem] text-accent-primary">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={onBack} className="flex items-center gap-1.5 text-[0.8rem] text-text-muted hover:text-text-primary">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={onNext}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Build Theme <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 5: Shopify Publish ──────────────────────────────────────

function Step5Shopify({
  project, loading, pricingResult, publishResult, onPublish, onNext, onBack,
}: {
  project: LaunchProject | null;
  loading: boolean;
  pricingResult: PricingResponse | null;
  publishResult: ShopifyPublishResponse | null;
  onPublish: (opts?: { storeDomain?: string; accessToken?: string; pricingTier?: number }) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [storeDomain, setStoreDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [selectedTier, setSelectedTier] = useState(1);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function checkConnection() {
      try {
        const result = await api.shopify.connect();
        setIsConnected(result.connected);
        if (!result.connected) setShowCredentials(true);
      } catch {
        setShowCredentials(true);
      } finally {
        setCheckingConnection(false);
      }
    }
    checkConnection();
  }, []);

  function handlePublish() {
    if (isConnected) {
      onPublish({ pricingTier: selectedTier });
    } else if (storeDomain.trim() && accessToken.trim()) {
      onPublish({
        storeDomain: storeDomain.trim(),
        accessToken: accessToken.trim(),
        pricingTier: selectedTier,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/15">
          <ShoppingBag className="h-5 w-5 text-accent-primary" />
        </div>
        <div>
          <h3 className="text-lg font-light text-text-primary">Publish to Shopify</h3>
          <p className="text-[0.75rem] text-text-muted">
            Create the product on your Shopify store with the generated copy and pricing
          </p>
        </div>
      </div>

      {!publishResult && (
        <div className="space-y-4">
          {/* Connection Status */}
          {checkingConnection ? (
            <div className="flex items-center gap-3 rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
              <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
              <p className="text-[0.8rem] text-text-secondary">Checking Shopify connection...</p>
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 p-4">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div className="flex-1">
                <p className="text-[0.8rem] font-medium text-success">Shopify Connected</p>
                <p className="text-[0.7rem] text-text-muted">Your store credentials are configured.</p>
              </div>
              <button
                onClick={() => { setShowCredentials(!showCredentials); setIsConnected(false); }}
                className="text-[0.65rem] text-text-muted hover:text-text-primary"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 p-4">
              <Store className="mt-0.5 h-5 w-5 text-warning" />
              <div>
                <p className="text-[0.8rem] font-medium text-warning">Shopify Not Connected</p>
                <p className="text-[0.7rem] text-text-muted">
                  Enter your store domain and access token below to connect.
                </p>
              </div>
            </div>
          )}

          {/* Credentials Form */}
          {showCredentials && !isConnected && (
            <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4 space-y-3">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
                  <Store className="h-3 w-3" /> Store Domain
                </label>
                <input
                  type="text"
                  value={storeDomain}
                  onChange={(e) => setStoreDomain(e.target.value)}
                  placeholder="your-store.myshopify.com"
                  className="w-full rounded-lg border border-border-primary bg-bg-card px-4 py-2.5 text-sm font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-wider text-text-muted">
                  <KeyRound className="h-3 w-3" /> Admin API Access Token
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="shpat_..."
                  className="w-full rounded-lg border border-border-primary bg-bg-card px-4 py-2.5 text-sm font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none font-mono"
                />
              </div>
              <p className="text-[0.6rem] text-text-muted">
                Get your token from Shopify Admin → Settings → Apps → Develop apps → Create an app → Admin API access token
              </p>
            </div>
          )}

          {/* Pricing Tier Selector */}
          {pricingResult && pricingResult.recommendedTiers.length > 0 && (
            <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
              <h4 className="text-[0.8rem] font-medium text-text-primary mb-3">Select Pricing Tier</h4>
              <div className="grid gap-2 lg:grid-cols-3">
                {pricingResult.recommendedTiers.map((tier, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTier(i)}
                    className={clsx(
                      "rounded-lg border p-3 text-left transition-all",
                      selectedTier === i
                        ? "border-accent-primary/40 bg-accent-primary/5"
                        : "border-border-primary bg-bg-card hover:border-border-primary/60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[0.65rem] uppercase tracking-wider text-text-muted">{tier.name}</p>
                      {i === 1 && (
                        <span className="text-[0.55rem] rounded-full bg-accent-primary/15 px-1.5 py-0.5 text-accent-primary">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-extralight text-text-primary mt-1">${tier.price.toFixed(2)}</p>
                    {tier.compareAtPrice && (
                      <p className="text-[0.65rem] text-text-muted line-through">${tier.compareAtPrice.toFixed(2)}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* What will be published */}
          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <h4 className="text-[0.8rem] font-medium text-text-primary mb-2">What gets published</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Product title & AI-generated description",
                "Optimized pricing with compare-at price",
                "Product images uploaded",
                "SEO title & meta description",
                "Category tags applied",
                "Published to Online Store",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[0.7rem] text-text-secondary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={onBack} className="flex items-center gap-1.5 text-[0.8rem] text-text-muted hover:text-text-primary">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={handlePublish}
              disabled={loading || (!isConnected && (!storeDomain.trim() || !accessToken.trim()))}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
              {loading ? "Publishing..." : "Publish to Shopify"}
            </button>
          </div>
        </div>
      )}

      {publishResult && (
        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-xl border border-success/30 bg-success/5 p-5">
            <CheckCircle2 className="mt-0.5 h-6 w-6 text-success" />
            <div className="flex-1">
              <h4 className="text-lg font-light text-text-primary">Product Published!</h4>
              <p className="mt-1 text-[0.8rem] text-text-secondary">
                Your product is live on <strong className="text-text-primary">{publishResult.shopName}</strong> at{" "}
                <strong className="text-text-primary">${publishResult.price.toFixed(2)}</strong>
                {publishResult.compareAtPrice && (
                  <span className="text-text-muted line-through ml-1">${publishResult.compareAtPrice.toFixed(2)}</span>
                )}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[0.7rem] text-text-muted">
                <span>{publishResult.imagesUploaded} images uploaded</span>
              </div>
              <div className="mt-3">
                <a
                  href={publishResult.shopifyAdminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[0.8rem] text-accent-primary hover:text-accent-primary/80"
                >
                  View in Shopify Admin <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={onBack} className="flex items-center gap-1.5 text-[0.8rem] text-text-muted hover:text-text-primary">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={onNext}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Build Theme <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 6: Theme Build ───────────────────────────────────────────

function Step6Theme({
  project, loading, themeResult, onBuild, onBack,
}: {
  project: LaunchProject | null;
  loading: boolean;
  themeResult: ThemeBuildResponse | null;
  onBuild: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-tertiary/15">
          <Palette className="h-5 w-5 text-accent-tertiary" />
        </div>
        <div>
          <h3 className="text-lg font-light text-text-primary">Build Shopify Theme</h3>
          <p className="text-[0.75rem] text-text-muted">
            Generate a ready-to-upload Shopify theme — your product is already on Shopify
          </p>
        </div>
      </div>

      {!themeResult && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <p className="text-[0.8rem] text-text-secondary">
              fflame will build a complete Shopify theme tailored to your{" "}
              <strong className="text-text-primary">{project?.product?.category || "product"}</strong> category,
              with your custom copy embedded, third-party code removed, and colors/typography optimized.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[0.65rem]">
              <span className="rounded-full bg-accent-primary/10 px-2.5 py-1 text-accent-primary">Category-specific preset</span>
              <span className="rounded-full bg-success/10 px-2.5 py-1 text-success">Custom copy embedded</span>
              <span className="rounded-full bg-warning/10 px-2.5 py-1 text-warning">Third-party code stripped</span>
              <span className="rounded-full bg-info/10 px-2.5 py-1 text-info">Ready to upload to Shopify</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-1.5 text-[0.8rem] text-text-muted hover:text-text-primary">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={onBuild}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              {loading ? "Building Theme..." : "Build & Download"}
            </button>
          </div>
        </div>
      )}

      {themeResult && (
        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-xl border border-success/30 bg-success/5 p-6">
            <CheckCircle2 className="mt-0.5 h-8 w-8 text-success" />
            <div className="flex-1">
              <h4 className="text-lg font-light text-text-primary">Theme Ready!</h4>
              <p className="mt-1 text-[0.8rem] text-text-secondary">
                Your Shopify theme has been built with the <strong className="text-text-primary">{themeResult.preset}</strong> preset
                for the <strong className="text-text-primary">{themeResult.category}</strong> category.
              </p>
              <div className="mt-4">
                <a
                  href={themeResult.downloadUrl}
                  download
                  className="inline-flex items-center gap-2 rounded-lg bg-success px-6 py-3 text-sm font-medium text-white hover:bg-success/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Theme ZIP
                </a>
              </div>
              <p className="mt-3 text-[0.7rem] text-text-muted">
                Upload this ZIP to your Shopify store via Online Store → Themes → Add theme → Upload zip file
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border-primary bg-bg-elevated/50 p-4">
            <h4 className="text-[0.8rem] font-medium text-text-primary mb-2">What&apos;s included</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Category-tuned color scheme",
                "Optimized typography",
                "Product template with trust badges",
                "FAQ section with generated Q&A",
                "Social proof section",
                "SEO meta tags ready",
                "Third-party scripts removed",
                "Urgency banner configured",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[0.7rem] text-text-secondary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={onBack} className="flex items-center gap-1.5 text-[0.8rem] text-text-muted hover:text-text-primary">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <a
              href="/launch"
              className="flex items-center gap-2 text-[0.8rem] text-accent-primary hover:text-accent-primary/80"
            >
              Start New Launch <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
