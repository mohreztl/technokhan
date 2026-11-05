# TechnoKhan (تکنو خان)

فروشگاه فارسی و راست‌چین گجت‌های هوشمند، لوازم جانبی موبایل و تجهیزات دیجیتال. پروژه بر پایه معماری Next.js + Fastify و با تجربه کامل فروشگاه در حالت دمو است؛ هیچ وابستگی به پنل مدیریت یا دیتابیس برای اجرای ویترین نیست.

## Stack

| Layer | Technologies |
|---|---|
| `apps/web` | Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, Zustand, TanStack Query, Framer Motion, Zod, Serwist PWA |
| `apps/api` | Fastify 5, Prisma 7, PostgreSQL, Zod, JWT, Zarinpal (demo fallback) |
| `packages/shared` | Persian product catalog, categories, brands, articles, validation, pricing and order types via `@technokhan/shared` |
| Visual system | Vazirmatn, industrial graphite/bone palette, Volt accent, local WebP imagery generated in Google AI Studio |

## Run

Requirements: Node 20.9+ and pnpm 10+.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
# Set NEXT_PUBLIC_DEMO_MODE=true to run without a backend
pnpm dev:web
```

Open `http://localhost:3000`. Demo OTP is `123456`; `09120000000` signs in as the demo admin. Orders and payments are simulated locally and never represent a real transaction.

### Full stack

```bash
cp apps/api/.env.example apps/api/.env
docker compose -f docker-compose.dev.yml up -d postgres
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Web runs on port 3000 and Fastify on port 5000 (`/api/v1`, health at `/health`).

## Main routes

- `/` Hero, Bento categories, flash deals, featured tabs, brands, gadget finder and magazine
- `/shop` and `/category/[slug]` combined brand/category/price/stock/feature filters
- `/product/[slug]` gallery, color and warranty selection, specifications, reviews and related products
- `/compare`, `/wishlist`, `/cart`, `/checkout`
- `/blog` and `/blog/[slug]` Persian technical magazine
- `/design-system` living UI primitive showcase
- `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/track`

Legacy `/products` and `/products/[slug]` redirect to `/shop` and `/product/[slug]`.

## Data and state

- Fastify serves products, categories, brands and articles; server reads fall back to the bundled catalog.
- Product variants preserve color and warranty on each order item. Fastify computes warranty surcharges from catalog JSON.
- Zustand persists cart, wishlist, four-product comparison, recently viewed items and UI state in localStorage.
- Demo order and payment data remains in the current browser.

## Design and media

- Tokens and reusable primitives live in `apps/web/src/app/globals.css` and `components/ui`.
- `src/content/media-assets.ts` is the typed manifest for 24 locally generated AI Studio images with Persian alt text and dimensions.
- `pnpm --filter web assets:ai` optimizes downloaded AI JPEGs to WebP.
- `node apps/web/scripts/generate-brand-assets.mjs` regenerates the app icons and OG image.

## Verification

```bash
pnpm test
pnpm type-check
pnpm lint
pnpm build
```

The suite covers catalog integrity, combined filtering, Persian search, stock limits, variants, range normalization, Fastify article injection, media uniqueness and demo order warranty pricing.

## Project history

The repository was initialized from the Next.js + Fastify architecture of `mohreztl/autolounge` as an independent TechnoKhan storefront. `origin` points only to `https://github.com/mohreztl/technokhan.git`; `upstream-autolounge` is never a push target.
