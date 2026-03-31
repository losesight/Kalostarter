export interface PresetColors {
  accent: string;
  accentLight: string;
  background: string;
  buttonBg: string;
  buttonText: string;
  badgeBg: string;
  badgeText: string;
}

export interface PresetTypography {
  headingFont: string;
  bodyFont: string;
  headingScale: number;
  bodyScale: number;
}

export interface PresetBadge {
  text: string;
  color: string;
  icon: string;
}

export interface PresetSection {
  key: string;
  type: string;
  settings?: Record<string, unknown>;
  blocks?: Record<string, { type: string; settings: Record<string, unknown> }>;
  block_order?: string[];
}

export interface ThemePresetDefinition {
  name: string;
  slug: string;
  category: string;
  description: string;
  colors: PresetColors;
  typography: PresetTypography;
  sections: PresetSection[];
  badges: PresetBadge[];
}

// ─── Category Presets ──────────────────────────────────────────────

export const DEFAULT_PRESETS: ThemePresetDefinition[] = [
  {
    name: "Supplements & Health",
    slug: "supplements",
    category: "Supplements",
    description: "Clean, clinical design with ingredient tables, dosage info, and lab-tested trust badges",
    colors: {
      accent: "#22c55e",
      accentLight: "#bbf7d0",
      background: "#f0fdf4",
      buttonBg: "#16a34a",
      buttonText: "#ffffff",
      badgeBg: "#dcfce7",
      badgeText: "#166534",
    },
    typography: {
      headingFont: "Poppins",
      bodyFont: "Inter",
      headingScale: 110,
      bodyScale: 100,
    },
    badges: [
      { text: "Lab Tested", color: "#22c55e", icon: "shield" },
      { text: "GMP Certified", color: "#16a34a", icon: "check_circle" },
      { text: "Third Party Verified", color: "#15803d", icon: "verified" },
    ],
    sections: [
      { key: "main", type: "main-product" },
      {
        key: "ingredients",
        type: "collapsible-content",
        settings: {
          heading: "Supplement Facts & Ingredients",
          icon: "clipboard",
          open: true,
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
      },
      {
        key: "dosage_info",
        type: "rich-text",
        settings: {
          color_scheme: "background-1",
          padding_top: 20,
          padding_bottom: 20,
        },
        blocks: {
          heading: { type: "heading", settings: { heading: "Recommended Dosage" } },
          text: { type: "text", settings: { text: "<p>Take as directed on the product label. Consult a healthcare professional before use.</p>" } },
        },
        block_order: ["heading", "text"],
      },
      {
        key: "testimonials",
        type: "testimonials",
        settings: {
          heading: "What Our Customers Say",
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
      },
      { key: "related", type: "related-products", settings: { heading: "You May Also Like", products_to_show: 4 } },
    ],
  },
  {
    name: "Electronics & Tech",
    slug: "electronics",
    category: "Electronics",
    description: "Technical layout with specs tables, feature comparisons, and warranty highlights",
    colors: {
      accent: "#3b82f6",
      accentLight: "#bfdbfe",
      background: "#eff6ff",
      buttonBg: "#2563eb",
      buttonText: "#ffffff",
      badgeBg: "#dbeafe",
      badgeText: "#1e40af",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingScale: 105,
      bodyScale: 100,
    },
    badges: [
      { text: "1-Year Warranty", color: "#3b82f6", icon: "shield" },
      { text: "Fast Shipping", color: "#2563eb", icon: "truck" },
      { text: "Tech Certified", color: "#1d4ed8", icon: "check_circle" },
    ],
    sections: [
      { key: "main", type: "main-product" },
      {
        key: "specs",
        type: "comparison-table",
        settings: {
          heading: "Technical Specifications",
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
      },
      {
        key: "features",
        type: "multicolumn",
        settings: {
          heading: "Key Features",
          columns_desktop: 3,
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
      },
      {
        key: "warranty",
        type: "collapsible-content",
        settings: {
          heading: "Warranty & Support",
          icon: "shield",
          open: false,
          color_scheme: "background-1",
          padding_top: 20,
          padding_bottom: 36,
        },
      },
      { key: "related", type: "related-products", settings: { heading: "Compatible Products", products_to_show: 4 } },
    ],
  },
  {
    name: "Beauty & Skincare",
    slug: "beauty",
    category: "Beauty",
    description: "Elegant design with ingredient spotlights, before/after sections, and review carousels",
    colors: {
      accent: "#f43f5e",
      accentLight: "#fecdd3",
      background: "#fff1f2",
      buttonBg: "#e11d48",
      buttonText: "#ffffff",
      badgeBg: "#ffe4e6",
      badgeText: "#9f1239",
    },
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "Lato",
      headingScale: 115,
      bodyScale: 100,
    },
    badges: [
      { text: "Cruelty Free", color: "#f43f5e", icon: "heart" },
      { text: "Dermatologist Tested", color: "#e11d48", icon: "check_circle" },
      { text: "Clean Beauty", color: "#be123c", icon: "leaf" },
    ],
    sections: [
      { key: "main", type: "main-product" },
      {
        key: "ingredient_spotlight",
        type: "multirow",
        settings: {
          heading: "Key Ingredients",
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
      },
      {
        key: "before_after",
        type: "comparison-slider",
        settings: {
          heading: "Real Results",
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
      },
      {
        key: "reviews",
        type: "testimonials",
        settings: {
          heading: "Beauty Reviews",
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
      },
      { key: "related", type: "related-products", settings: { heading: "Complete Your Routine", products_to_show: 4 } },
    ],
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    category: "Home",
    description: "Warm layout with room galleries, dimensions tables, and care instructions",
    colors: {
      accent: "#f59e0b",
      accentLight: "#fde68a",
      background: "#fffbeb",
      buttonBg: "#d97706",
      buttonText: "#ffffff",
      badgeBg: "#fef3c7",
      badgeText: "#92400e",
    },
    typography: {
      headingFont: "Nunito",
      bodyFont: "Inter",
      headingScale: 110,
      bodyScale: 100,
    },
    badges: [
      { text: "Eco-Friendly", color: "#f59e0b", icon: "leaf" },
      { text: "Easy Assembly", color: "#d97706", icon: "tool" },
      { text: "Satisfaction Guaranteed", color: "#b45309", icon: "heart" },
    ],
    sections: [
      { key: "main", type: "main-product" },
      {
        key: "room_gallery",
        type: "collage",
        settings: {
          heading: "See It In Your Space",
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
      },
      {
        key: "dimensions",
        type: "collapsible-content",
        settings: {
          heading: "Dimensions & Materials",
          icon: "ruler",
          open: true,
          color_scheme: "background-1",
          padding_top: 20,
          padding_bottom: 20,
        },
      },
      {
        key: "care",
        type: "collapsible-content",
        settings: {
          heading: "Care Instructions",
          icon: "heart",
          open: false,
          color_scheme: "background-1",
          padding_top: 0,
          padding_bottom: 36,
        },
      },
      { key: "related", type: "related-products", settings: { heading: "Complete the Room", products_to_show: 4 } },
    ],
  },
  {
    name: "Fashion & Apparel",
    slug: "fashion",
    category: "Fashion",
    description: "Stylish layout with size guides, fabric details, outfit suggestions, and lookbook galleries",
    colors: {
      accent: "#a855f7",
      accentLight: "#e9d5ff",
      background: "#faf5ff",
      buttonBg: "#9333ea",
      buttonText: "#ffffff",
      badgeBg: "#f3e8ff",
      badgeText: "#6b21a8",
    },
    typography: {
      headingFont: "Cormorant Garamond",
      bodyFont: "Inter",
      headingScale: 120,
      bodyScale: 100,
    },
    badges: [
      { text: "Sustainably Sourced", color: "#a855f7", icon: "leaf" },
      { text: "True to Size", color: "#9333ea", icon: "ruler" },
      { text: "Premium Fabric", color: "#7e22ce", icon: "star" },
    ],
    sections: [
      { key: "main", type: "main-product" },
      {
        key: "size_guide",
        type: "collapsible-content",
        settings: {
          heading: "Size Guide",
          icon: "ruler",
          open: false,
          color_scheme: "background-1",
          padding_top: 20,
          padding_bottom: 20,
        },
      },
      {
        key: "fabric_details",
        type: "rich-text",
        settings: {
          color_scheme: "background-1",
          padding_top: 20,
          padding_bottom: 20,
        },
        blocks: {
          heading: { type: "heading", settings: { heading: "Fabric & Materials" } },
          text: { type: "text", settings: { text: "<p>Premium materials selected for comfort, durability, and style.</p>" } },
        },
        block_order: ["heading", "text"],
      },
      {
        key: "lookbook",
        type: "image-slider",
        settings: {
          heading: "Style It Your Way",
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
      },
      { key: "related", type: "related-products", settings: { heading: "Complete the Look", products_to_show: 4 } },
    ],
  },
  {
    name: "Fitness & Sports",
    slug: "fitness",
    category: "Fitness",
    description: "Bold, energetic layout with workout use cases, athlete reviews, and durability highlights",
    colors: {
      accent: "#f97316",
      accentLight: "#fed7aa",
      background: "#fff7ed",
      buttonBg: "#ea580c",
      buttonText: "#ffffff",
      badgeBg: "#ffedd5",
      badgeText: "#9a3412",
    },
    typography: {
      headingFont: "Oswald",
      bodyFont: "Inter",
      headingScale: 115,
      bodyScale: 100,
    },
    badges: [
      { text: "Pro Approved", color: "#f97316", icon: "star" },
      { text: "Heavy Duty", color: "#ea580c", icon: "shield" },
      { text: "30-Day Guarantee", color: "#c2410c", icon: "heart" },
    ],
    sections: [
      { key: "main", type: "main-product" },
      {
        key: "workouts",
        type: "multicolumn",
        settings: {
          heading: "Built For These Workouts",
          columns_desktop: 3,
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
      },
      {
        key: "durability",
        type: "image-with-text",
        settings: {
          heading: "Engineered to Last",
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
      },
      {
        key: "athlete_reviews",
        type: "testimonials",
        settings: {
          heading: "Athlete Reviews",
          color_scheme: "background-1",
          padding_top: 36,
          padding_bottom: 36,
        },
      },
      { key: "related", type: "related-products", settings: { heading: "Train Harder With", products_to_show: 4 } },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────

const CATEGORY_ALIASES: Record<string, string> = {
  supplements: "Supplements",
  health: "Supplements",
  vitamins: "Supplements",
  nutrition: "Supplements",
  electronics: "Electronics",
  tech: "Electronics",
  gadgets: "Electronics",
  beauty: "Beauty",
  skincare: "Beauty",
  cosmetics: "Beauty",
  home: "Home",
  kitchen: "Home",
  "home & kitchen": "Home",
  household: "Home",
  fashion: "Fashion",
  apparel: "Fashion",
  clothing: "Fashion",
  fitness: "Fitness",
  sports: "Fitness",
  gym: "Fitness",
  exercise: "Fitness",
  wearables: "Electronics",
  auto: "Electronics",
  "auto accessories": "Electronics",
  gaming: "Electronics",
  photography: "Electronics",
};

export function resolveCategory(rawCategory: string): string {
  const lower = rawCategory.toLowerCase().trim();
  return CATEGORY_ALIASES[lower] || "Electronics";
}

export function getPresetForCategory(rawCategory: string): ThemePresetDefinition {
  const resolved = resolveCategory(rawCategory);
  return DEFAULT_PRESETS.find((p) => p.category === resolved) || DEFAULT_PRESETS[1]; // fallback to Electronics
}

// ─── Shopify Template JSON Generator ──────────────────────────────

/**
 * Generates a Shopify OS 2.0 product template JSON for a given preset.
 * This follows the Shrine+ theme structure:
 *   { sections: { ... }, order: [...] }
 */
export function generateProductTemplateJSON(preset: ThemePresetDefinition): string {
  const sections: Record<string, unknown> = {};
  const order: string[] = [];

  for (const section of preset.sections) {
    const sectionData: Record<string, unknown> = {
      type: section.type,
      settings: section.settings || {},
    };

    if (section.type === "main-product") {
      sectionData.blocks = buildMainProductBlocks(preset);
      sectionData.block_order = [
        "title",
        "rating_stars",
        "price",
        "trust_badges",
        "variant_picker",
        "quantity_selector",
        "buy_buttons",
        "payment_badges",
        "description",
        "shipping_tab",
        "returns_tab",
        "faq_tab",
      ];
      sectionData.settings = {
        enable_sticky_info: true,
        color_scheme: "background-1",
        media_size: "medium",
        media_position: "left",
        gallery_layout: "thumbnail_slider",
        enable_video_looping: false,
        padding_top: 36,
        padding_bottom: 36,
      };
    }

    if (section.blocks) {
      sectionData.blocks = section.blocks;
      sectionData.block_order = section.block_order;
    }

    sections[section.key] = sectionData;
    order.push(section.key);
  }

  return JSON.stringify({ sections, order }, null, 2);
}

function buildMainProductBlocks(preset: ThemePresetDefinition) {
  const badgeHtml = preset.badges
    .map(
      (b) =>
        `<span style="display:inline-flex;align-items:center;gap:4px;background:${b.color}15;color:${b.color};padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;">✓ ${b.text}</span>`
    )
    .join(" ");

  return {
    title: {
      type: "title",
      settings: { text_size: "h2", title_alignment: "left", uppercase_title: false },
    },
    rating_stars: {
      type: "rating_stars",
      settings: { rating: 4.8, size: "medium", label: "4.8/5 <strong>Verified Reviews</strong>" },
    },
    price: {
      type: "price",
      settings: { layout: "price_first" },
    },
    trust_badges: {
      type: "custom_liquid",
      settings: {
        custom_liquid: `<div style="display:flex;flex-wrap:wrap;gap:8px;margin:8px 0;">${badgeHtml}</div>`,
      },
    },
    variant_picker: {
      type: "variant_picker",
      settings: { picker_type: "button", enable_color_swatches: true },
    },
    quantity_selector: {
      type: "quantity_selector",
      settings: {},
    },
    buy_buttons: {
      type: "buy_buttons",
      settings: { show_dynamic_checkout: true, skip_cart: false, uppercase_text: true },
    },
    payment_badges: {
      type: "payment_badges",
      settings: {},
    },
    description: {
      type: "description",
      settings: {},
    },
    shipping_tab: {
      type: "collapsible_tab",
      settings: { heading: "Shipping Information", icon: "truck", content: "<p>Fast, free shipping on all orders. Estimated delivery: 3-7 business days.</p>" },
    },
    returns_tab: {
      type: "collapsible_tab",
      settings: { heading: "Returns & Guarantee", icon: "heart", content: "<p>30-day hassle-free returns. Full refund if you're not satisfied.</p>" },
    },
    faq_tab: {
      type: "collapsible_tab",
      settings: { heading: "Frequently Asked Questions", icon: "question_mark", content: "<p>Have questions? Contact our support team for quick answers.</p>" },
    },
  };
}
