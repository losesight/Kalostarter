import JSZip from "jszip";
import { promises as fs } from "fs";
import path from "path";
import type { ThemePresetDefinition } from "@/lib/theme-presets";
import { generateProductTemplateJSON } from "@/lib/theme-presets";
import type { WebsiteCopy } from "@/lib/copy-generator";

const THEME_BASE_DIR = path.join(process.cwd(), "theme-base");

const THIRD_PARTY_PATTERNS = [
  /<!-- Meta Pixel Code -->[\s\S]*?<!-- End Meta Pixel Code -->/gi,
  /<!-- Facebook Pixel Code -->[\s\S]*?<!-- End Facebook Pixel Code -->/gi,
  /fbq\(['"]init['"],\s*['"][\d]+['"]\);[\s\S]*?fbq\(['"]track['"],\s*['"]PageView['"]\);/gi,
  /<noscript><img[^>]*facebook\.com\/tr[^>]*><\/noscript>/gi,
  /\{%-?\s*render\s*'kiwiSizing'[^%]*%\}/gi,
  /\{%-?\s*render\s*'cjpod'[^%]*%\}/gi,
  /\{%-?\s*render\s*'pagefly-main-js'[^%]*%\}/gi,
  /\{%-?\s*render\s*'foxkit-preorder-badge'[^%]*%\}/gi,
  /\{%-?\s*render\s*'foxkit[^']*'[^%]*%\}/gi,
  /\{%-?\s*render\s*'rev-widget'[^%]*%\}/gi,
  /\{%-?\s*render\s*'gp-head'[^%]*%\}/gi,
  /\{%-?\s*render\s*'gp-variant[^']*'[^%]*%\}/gi,
  /\{%-?\s*render\s*'bucks-cc'[^%]*%\}/gi,
];

const THIRD_PARTY_FILE_PATTERNS = [
  /^cjpod\./,
  /^pagefly/,
  /^foxkit/,
  /^gp-/,
  /^bucks-cc\./,
  /^rev-widget\./,
  /^kiwiSizing\./,
];

const THIRD_PARTY_SECTION_PATTERNS = [
  /^gp-global-section/,
  /^foxkit-/,
];

const THIRD_PARTY_TEMPLATE_PATTERNS = [
  /\.gem-/,
  /\.gp-template/,
  /\.gps\./,
  /\.foxkit\./,
];

interface ThemeBuildOptions {
  preset: ThemePresetDefinition;
  product: {
    title: string;
    price: number;
    description?: string;
    category: string;
  };
  websiteCopy?: WebsiteCopy | null;
  storeName?: string;
}

function stripThirdPartyCode(content: string): string {
  let result = content;
  for (const pattern of THIRD_PARTY_PATTERNS) {
    result = result.replace(pattern, "");
  }
  result = result.replace(/\n{3,}/g, "\n\n");
  return result;
}

const THIRD_PARTY_LAYOUT_PATTERNS = [
  /^theme\.gem/,
  /^test\./,
  /^password\./,
];

function shouldSkipFile(relativePath: string): boolean {
  const filename = path.basename(relativePath);

  for (const pattern of THIRD_PARTY_FILE_PATTERNS) {
    if (pattern.test(filename)) return true;
  }

  if (relativePath.startsWith("sections/") || relativePath.startsWith("sections\\")) {
    for (const pattern of THIRD_PARTY_SECTION_PATTERNS) {
      if (pattern.test(filename)) return true;
    }
  }

  if (relativePath.startsWith("templates/") || relativePath.startsWith("templates\\")) {
    for (const pattern of THIRD_PARTY_TEMPLATE_PATTERNS) {
      if (pattern.test(filename)) return true;
    }
  }

  if (relativePath.startsWith("layout/") || relativePath.startsWith("layout\\")) {
    for (const pattern of THIRD_PARTY_LAYOUT_PATTERNS) {
      if (pattern.test(filename)) return true;
    }
  }

  return false;
}

function buildSettingsData(
  originalSettings: Record<string, unknown>,
  preset: ThemePresetDefinition,
  storeName?: string
): Record<string, unknown> {
  const fontMap: Record<string, string> = {
    Poppins: "poppins_n4",
    Inter: "inter_n4",
    "Playfair Display": "playfair_display_n4",
    Lato: "lato_n4",
    Nunito: "nunito_n4",
    "Cormorant Garamond": "cormorant_garamond_n4",
    Oswald: "oswald_n4",
    Roboto: "roboto_n4",
    Montserrat: "montserrat_n4",
    "Open Sans": "open_sans_n4",
  };

  const current = { ...(originalSettings as Record<string, unknown>) };

  current.colors_accent_1 = preset.colors.accent;
  current.colors_accent_2 = preset.colors.accentLight;
  current.colors_background_1 = preset.colors.background;
  current.colors_background_2 = "#ffffff";
  current.colors_solid_button_labels = preset.colors.buttonText;
  current.colors_text = "#121212";
  current.colors_outline_button_labels = preset.colors.accent;

  current.type_header_font = fontMap[preset.typography.headingFont] || "poppins_n4";
  current.type_body_font = fontMap[preset.typography.bodyFont] || "inter_n4";
  current.heading_scale = preset.typography.headingScale;
  current.body_scale = preset.typography.bodyScale;

  current.buttons_radius = 8;
  current.card_corner_radius = 12;
  current.checkout_accent_color = preset.colors.accent;
  current.checkout_button_color = preset.colors.buttonBg;

  // Strip third-party app blocks from settings
  if (current.blocks && typeof current.blocks === "object") {
    const blocks = current.blocks as Record<string, { type?: string }>;
    const cleanedBlocks: Record<string, unknown> = {};
    for (const [key, block] of Object.entries(blocks)) {
      if (block.type && block.type.includes("shopify://apps/")) continue;
      cleanedBlocks[key] = block;
    }
    current.blocks = cleanedBlocks;
  }

  if (storeName) {
    current.brand_headline = storeName;
  }

  delete current.logo;
  delete current.favicon;

  return current;
}

/**
 * Section types to KEEP from the original product.json.
 * Everything else is hardcoded demo content that must be stripped.
 */
const KEEP_SECTION_TYPES = new Set([
  "main-product",
  "related-products",
  "ss-payment-icons",
]);

/**
 * Augments the original product.json from the theme base.
 * Keeps only the core structural sections (main product, related products,
 * payment icons) and replaces all hardcoded demo content with AI-generated
 * copy sections tailored to the actual product.
 */
function augmentProductTemplate(
  originalContent: string,
  preset: ThemePresetDefinition,
  websiteCopy?: WebsiteCopy | null
): string {
  let template: { sections: Record<string, Record<string, unknown>>; order: string[] };

  try {
    template = JSON.parse(originalContent);
  } catch {
    return generateProductTemplateJSON(preset);
  }

  if (!template.sections || !template.order) {
    return generateProductTemplateJSON(preset);
  }

  // Strip everything except core structural sections
  const sectionsToRemove: string[] = [];
  for (const [key, section] of Object.entries(template.sections)) {
    const sType = section.type as string;
    if (!KEEP_SECTION_TYPES.has(sType)) {
      sectionsToRemove.push(key);
    }
  }

  for (const key of sectionsToRemove) {
    delete template.sections[key];
    template.order = template.order.filter((k) => k !== key);
  }

  // Rebuild the main-product section blocks to remove hardcoded demo content.
  // Keep the Shrine+ settings (media layout, sticky info, etc.) but replace
  // demo-specific blocks with clean generic ones.
  const mainKey = template.order.find(
    (k) => (template.sections[k]?.type as string) === "main-product"
  );
  if (mainKey && template.sections[mainKey]) {
    const mainSection = template.sections[mainKey];
    // Preserve original section-level settings (media layout, sticky info, etc.)
    const originalSettings = (mainSection.settings || {}) as Record<string, unknown>;
    const cleanBlocks: Record<string, unknown> = {
      title: { type: "title", settings: { text_size: "h2", title_alignment: "left", uppercase_title: false } },
      price: { type: "price", settings: { layout: "price_first" } },
      variant_picker: { type: "variant_picker", settings: { picker_type: "button", enable_color_swatches: true } },
      quantity_selector: { type: "quantity_selector", settings: {} },
      buy_buttons: { type: "buy_buttons", settings: { show_dynamic_checkout: true, skip_cart: false, uppercase_text: true } },
      description: { type: "description", settings: {} },
      shipping_tab: { type: "collapsible_tab", settings: { heading: "Shipping Information", icon: "truck", content: "<p>Fast shipping on all orders. Estimated delivery: 3-7 business days.</p>" } },
      returns_tab: { type: "collapsible_tab", settings: { heading: "Returns & Guarantee", icon: "heart", content: "<p>30-day hassle-free returns. Full refund if you're not satisfied.</p>" } },
    };
    const cleanBlockOrder = ["title", "price", "variant_picker", "quantity_selector", "buy_buttons", "description", "shipping_tab", "returns_tab"];

    mainSection.blocks = cleanBlocks;
    mainSection.block_order = cleanBlockOrder;
    mainSection.settings = {
      ...originalSettings,
      padding_top: originalSettings.padding_top ?? 36,
      padding_bottom: originalSettings.padding_bottom ?? 36,
    };
  }

  // Build trust badges HTML from preset
  const badgeHtml = preset.badges
    .map(
      (b) =>
        `<span style="display:inline-flex;align-items:center;gap:4px;background:${b.color}15;color:${b.color};padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;">✓ ${b.text}</span>`
    )
    .join(" ");

  // Insert trust badges after main product section
  if (badgeHtml) {
    const mainIdx = template.order.indexOf("main");
    const badgeInsertIdx = mainIdx >= 0 ? mainIdx + 1 : 1;
    template.order.splice(badgeInsertIdx, 0, "fflame_trust_badges");
    template.sections.fflame_trust_badges = {
      type: "custom-liquid",
      settings: {
        custom_liquid: `<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:16px 0;">${badgeHtml}</div>`,
        color_scheme: "background-1",
        padding_top: 0,
        padding_bottom: 16,
      },
    } as unknown as Record<string, unknown>;
  }

  // Inject generated copy sections
  if (websiteCopy) {
    // Urgency banner at the very top
    if (websiteCopy.hero?.urgencyBanner) {
      template.order.unshift("fflame_banner");
      template.sections.fflame_banner = {
        type: "rich-text",
        settings: {
          color_scheme: "accent-1",
          padding_top: 20,
          padding_bottom: 20,
        },
        blocks: {
          banner_text: {
            type: "text",
            settings: {
              text: `<p style="text-align:center;font-weight:600;">${websiteCopy.hero.urgencyBanner}</p>`,
            },
          },
        },
        block_order: ["banner_text"],
      } as unknown as Record<string, unknown>;
    }

    // Hero headline + subheadline after the banner
    if (websiteCopy.hero?.headline) {
      const heroIdx = template.order.indexOf("fflame_banner");
      template.order.splice((heroIdx >= 0 ? heroIdx : 0) + 1, 0, "fflame_hero");
      template.sections.fflame_hero = {
        type: "rich-text",
        settings: {
          color_scheme: "background-1",
          padding_top: 28,
          padding_bottom: 12,
        },
        blocks: {
          hero_heading: {
            type: "heading",
            settings: { heading: websiteCopy.hero.headline },
          },
          hero_sub: {
            type: "text",
            settings: {
              text: `<p style="text-align:center;font-size:1.1em;max-width:700px;margin:0 auto;">${websiteCopy.hero.subheadline}</p>`,
            },
          },
        },
        block_order: ["hero_heading", "hero_sub"],
      } as unknown as Record<string, unknown>;
    }

    // Benefits / product highlights section before related products
    if (websiteCopy.productSection?.bullets?.length) {
      const relatedIdx = template.order.indexOf("related-products");
      const insertIdx = relatedIdx >= 0 ? relatedIdx : template.order.length;
      template.order.splice(insertIdx, 0, "fflame_benefits");

      const benefitBlocks: Record<string, unknown> = {};
      const benefitOrder: string[] = [];
      benefitBlocks.benefits_heading = {
        type: "heading",
        settings: { heading: websiteCopy.productSection.title || "Why You'll Love This" },
      };
      benefitOrder.push("benefits_heading");

      websiteCopy.productSection.bullets.forEach((bullet: string, idx: number) => {
        const key = `benefit_${idx}`;
        benefitBlocks[key] = {
          type: "text",
          settings: {
            text: `<p>✓ ${bullet}</p>`,
          },
        };
        benefitOrder.push(key);
      });

      if (websiteCopy.productSection.guaranteeText) {
        benefitBlocks.guarantee = {
          type: "text",
          settings: {
            text: `<p style="font-weight:600;margin-top:16px;">🛡️ ${websiteCopy.productSection.guaranteeText}</p>`,
          },
        };
        benefitOrder.push("guarantee");
      }

      template.sections.fflame_benefits = {
        type: "rich-text",
        settings: {
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
        blocks: benefitBlocks,
        block_order: benefitOrder,
      } as unknown as Record<string, unknown>;
    }

    // Social proof section
    if (websiteCopy.socialProof) {
      const relatedIdx = template.order.indexOf("related-products");
      const insertIdx = relatedIdx >= 0 ? relatedIdx : template.order.length;
      template.order.splice(insertIdx, 0, "fflame_social_proof");
      template.sections.fflame_social_proof = {
        type: "rich-text",
        settings: {
          color_scheme: "accent-1",
          padding_top: 36,
          padding_bottom: 36,
        },
        blocks: {
          sp_heading: {
            type: "heading",
            settings: { heading: websiteCopy.socialProof.headline },
          },
          sp_stats: {
            type: "text",
            settings: {
              text: `<p style="text-align:center;font-size:1.15em;">${websiteCopy.socialProof.statsLine}</p>`,
            },
          },
        },
        block_order: ["sp_heading", "sp_stats"],
      } as unknown as Record<string, unknown>;
    }

    // FAQ section at the end (before related products)
    if (websiteCopy.faq?.length > 0) {
      const relatedIdx = template.order.indexOf("related-products");
      const insertIdx = relatedIdx >= 0 ? relatedIdx : template.order.length;
      template.order.splice(insertIdx, 0, "fflame_faq");

      const faqBlocks: Record<string, unknown> = {};
      const faqOrder: string[] = [];
      faqBlocks.faq_heading = {
        type: "heading",
        settings: { heading: "Frequently Asked Questions" },
      };
      faqOrder.push("faq_heading");

      websiteCopy.faq.forEach((item: { question: string; answer: string }, idx: number) => {
        const key = `faq_${idx}`;
        faqBlocks[key] = {
          type: "collapsible_row",
          settings: {
            heading: item.question,
            row_content: `<p>${item.answer}</p>`,
            icon: "question_mark",
          },
        };
        faqOrder.push(key);
      });

      template.sections.fflame_faq = {
        type: "collapsible-content",
        settings: {
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
        blocks: faqBlocks,
        block_order: faqOrder,
      } as unknown as Record<string, unknown>;
    }
  }

  return JSON.stringify(template, null, 2);
}

/**
 * Section types that are safe to keep in non-product templates.
 * Removes all hardcoded demo sections (custom-liquid with specific content,
 * featured-product with specific handles, demo testimonials, etc.)
 */
const SAFE_GENERIC_SECTION_TYPES = new Set([
  "header",
  "footer",
  "announcement-bar",
  "newsletter",
  "contact-form",
  "collection-list",
  "main-collection-product-grid",
  "main-collection-banner",
  "main-page",
  "main-blog",
  "main-article",
  "main-cart-items",
  "main-cart-footer",
  "main-search",
  "main-list-collections",
  "main-404",
  "main-login",
  "main-register",
  "main-account",
  "main-order",
  "main-addresses",
  "main-activate-account",
  "main-reset-password",
  "main-password-header",
  "main-password-footer",
  "page",
  "apps",
]);

/**
 * Cleans non-product JSON templates by removing hardcoded demo content.
 * Keeps only generic/structural sections.
 */
function cleanJsonTemplate(content: string): string {
  try {
    const data = JSON.parse(content);
    if (!data.sections || !data.order) return content;

    const toRemove: string[] = [];
    for (const [key, section] of Object.entries(data.sections)) {
      const s = section as Record<string, unknown>;
      const sType = s.type as string;

      // Keep the core layout/page sections
      if (SAFE_GENERIC_SECTION_TYPES.has(sType)) continue;

      // Remove all custom-liquid (hardcoded demo copy)
      if (sType === "custom-liquid") { toRemove.push(key); continue; }

      // Remove featured-product (references specific demo product handles)
      if (sType === "featured-product") { toRemove.push(key); continue; }

      // Remove testimonials (demo reviews)
      if (sType === "testimonials") { toRemove.push(key); continue; }

      // Remove image sections with demo images
      if (["image-banner", "image-with-text", "image-slider", "collage"].includes(sType)) {
        toRemove.push(key); continue;
      }

      // Remove tickers (demo copy)
      if (["horizontal-ticker", "vertical-ticker"].includes(sType)) {
        toRemove.push(key); continue;
      }
    }

    for (const key of toRemove) {
      delete data.sections[key];
      data.order = data.order.filter((k: string) => k !== key);
    }

    return JSON.stringify(data, null, 2);
  } catch {
    return content;
  }
}

async function readDirectoryRecursive(
  dirPath: string,
  basePath: string
): Promise<{ relativePath: string; content: Buffer }[]> {
  const entries: { relativePath: string; content: Buffer }[] = [];

  const items = await fs.readdir(dirPath, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    const relativePath = path.relative(basePath, fullPath).replace(/\\/g, "/");

    if (item.isDirectory()) {
      const subEntries = await readDirectoryRecursive(fullPath, basePath);
      entries.push(...subEntries);
    } else {
      if (shouldSkipFile(relativePath)) continue;
      const content = await fs.readFile(fullPath);
      entries.push({ relativePath, content });
    }
  }

  return entries;
}

export async function buildThemeZip(
  options: ThemeBuildOptions
): Promise<Buffer> {
  const { preset, websiteCopy, storeName } = options;
  const zip = new JSZip();

  const themeExists = await fs
    .access(THEME_BASE_DIR)
    .then(() => true)
    .catch(() => false);

  if (!themeExists) {
    throw new Error(
      `Theme base directory not found at ${THEME_BASE_DIR}. ` +
        "Copy the Shrine+ theme export into the 'theme-base' folder at the project root."
    );
  }

  const files = await readDirectoryRecursive(THEME_BASE_DIR, THEME_BASE_DIR);

  let originalSettingsData: Record<string, unknown> = {};
  let originalProductTemplate = "";

  for (const file of files) {
    if (file.relativePath === "config/settings_data.json") {
      try {
        originalSettingsData = JSON.parse(file.content.toString("utf-8"));
      } catch {
        // fallback to empty
      }
      continue;
    }

    // Capture original product.json to augment later instead of replacing
    if (file.relativePath === "templates/product.json") {
      originalProductTemplate = file.content.toString("utf-8");
      continue;
    }

    const ext = path.extname(file.relativePath).toLowerCase();
    const isText = [".liquid", ".json", ".css", ".js", ".svg"].includes(ext);

    if (isText) {
      let content = file.content.toString("utf-8");
      content = stripThirdPartyCode(content);

      // Clean demo content from JSON templates (index, collection, page, etc.)
      const isJsonTemplate =
        ext === ".json" &&
        (file.relativePath.startsWith("templates/") || file.relativePath.startsWith("templates\\"));
      if (isJsonTemplate) {
        content = cleanJsonTemplate(content);
      }

      zip.file(file.relativePath, content);
    } else {
      zip.file(file.relativePath, file.content);
    }
  }

  const currentSettings =
    (originalSettingsData as { current?: Record<string, unknown> }).current || {};
  const customizedSettings = buildSettingsData(currentSettings, preset, storeName);
  zip.file(
    "config/settings_data.json",
    JSON.stringify({ current: customizedSettings }, null, 2)
  );

  // Augment the original product.json (preserve Shrine structure, inject copy)
  const productTemplate = originalProductTemplate
    ? augmentProductTemplate(originalProductTemplate, preset, websiteCopy)
    : generateProductTemplateJSON(preset);
  zip.file("templates/product.json", productTemplate);

  const buf = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return buf;
}

export async function buildAndSaveThemeZip(
  options: ThemeBuildOptions
): Promise<string> {
  const buffer = await buildThemeZip(options);

  const outputDir = path.join(process.cwd(), "public", "themes");
  await fs.mkdir(outputDir, { recursive: true });

  const slug = options.preset.slug;
  const timestamp = Date.now();
  const filename = `fflame-${slug}-${timestamp}.zip`;
  const outputPath = path.join(outputDir, filename);

  await fs.writeFile(outputPath, buffer);

  return `/themes/${filename}`;
}
