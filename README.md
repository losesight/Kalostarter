# KaloStarter

Import products from [Kalo Data](https://www.kalodata.com/product) (TikTok Shop analytics), generate AI-optimized content, and publish to [Shopify](https://shopify.dev/docs) — all from one admin panel.

## Quick Start

```bash
npm install
npx prisma migrate dev
npm run db:seed     # creates admin user + sample data
npm run dev         # http://localhost:3000
```

**Default login:** `admin@kalostarter.com` / `admin123`

## Architecture

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Database:** SQLite via Prisma 5 (swap to Postgres by changing `DATABASE_URL`)
- **Auth:** NextAuth.js v5 with credentials provider + JWT sessions
- **Styling:** Tailwind CSS 4 with custom Velox-inspired dark theme
- **Background:** Canvas-based animated gradient orbs

## API Routes (17 endpoints)

| Endpoint | Methods | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handlers |
| `/api/auth/register` | POST | User registration |
| `/api/dashboard` | GET | Aggregated stats |
| `/api/products` | GET, POST | Product list + create |
| `/api/products/[id]` | GET, PATCH, DELETE | Single product CRUD |
| `/api/import` | GET, POST | Import jobs + start scrape |
| `/api/import/[id]` | GET | Import job status |
| `/api/activity` | GET, POST | Activity feed |
| `/api/reviews` | GET | Reviews with stats |
| `/api/settings` | GET, PUT | Per-user settings |
| `/api/ai/generate` | POST | AI content generation |
| `/api/shopify/connect` | GET | Test Shopify connection |
| `/api/shopify/themes` | GET | List store themes |
| `/api/shopify/products` | POST | Publish products to Shopify |
| `/api/shopify/sync` | GET | Sync status |

## Configuration

Add to `.env`:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."          # optional, can set in Settings UI
```

Shopify and OpenAI credentials can be set via the Settings page in the UI.

## Kalo Data Import

The import pipeline supports:
1. **URL scraping** — paste a kalodata.com URL and the scraper extracts products from HTML/JSON
2. **Manual JSON import** — POST an array of product objects to `/api/import`

Kalo Data uses Cloudflare protection, so direct scraping may be limited. The manual import is the reliable fallback.

## Shopify Integration

Uses the [Shopify GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql) (2025-01):
- `productCreate` mutation with SEO fields
- `productCreateMedia` for image uploads
- `publishablePublish` to make products live
- Connection test via `shop` query

## AI Content Generation

Powered by OpenAI GPT-4o-mini:
- Product title optimization
- HTML product descriptions
- 5 key feature bullet points
- SEO title + meta description
- Supports streaming responses
- 5 tone presets: Professional, Casual, Luxury, Playful, Technical
