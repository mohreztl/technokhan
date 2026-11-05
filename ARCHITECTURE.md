# TechnoKhan architecture

## Overview

TechnoKhan is a pnpm monorepo with a Next.js storefront, a Fastify API and a shared Persian catalog. The public shop works entirely in demo mode without PostgreSQL, while the same contracts support a full database-backed deployment.

```
apps/web (Next.js 16, React 19, RSC + client components)
  ├─ SEO repository: API first, bundled fallback, ISR 5 min
  ├─ Zustand persisted stores and React Query
  └─ localStorage demo transport for auth, orders and payment
                    │ REST /api/v1
apps/api (Fastify 5)
  ├─ Products/categories/brands + filtering and sorting
  ├─ Articles, orders, coupons, auth and payment
  └─ Prisma/PostgreSQL with migrations for variants and warranties
packages/shared (@technokhan/shared)
  ├─ Product/category/brand/article types and content
  ├─ Zod validation and Toman pricing
  └─ Tests for catalog, coupons and totals
```

## Data flow

1. Server components call `lib/data/repository` for catalog and editorial reads. Independent reads run in `Promise.all`.
2. The API answers from Prisma when available; the repository falls back to `@technokhan/shared` so builds and demos remain fast and deterministic.
3. Client list changes use React Query with previous results kept while filtering.
4. Cart variants carry `OrderItemSelection { colorName, warrantyId, warrantyTitle }` and the effective demo unit price.
5. Fastify validates order input with Zod and calculates each warranty surcharge from persisted product warranties, never from client-supplied totals.

## Visual system

- Vazirmatn variable local font, logical RTL CSS properties and tabular numerals.
- Tailwind 4 tokens: graphite/bone surfaces, Volt action color, orange deals, semantic inventory states.
- Native dialog, keyboard tabs, accessible checkboxes/radios, reduced-motion support and 44px targets.
- Local WebP assets in `public/images` with `next/image` sizing and LCP priorities.

## State

- `useCartStore`: items, variants, stock caps, coupon totals and drawer state.
- `useWishlistStore`: saved product ids.
- `useCompareStore`: up to four products in selection order.
- `useRecentlyViewedStore`: eight newest unique product ids.
- `useAuthStore`: demo OTP session and role; hydration begins only after the server-compatible first paint.

## Routes removed from the public experience

The inherited automotive routes `/services`, `/gallery`, `/booking` and `/products` were removed. `/products` and `/products/[slug]` redirect to the new canonical shop/product paths. Admin and legacy service data may remain as infrastructure but are not part of the storefront navigation or sitemap.

## SEO and PWA

- Canonical metadata for shop, categories, products, articles and informational pages.
- JSON-LD: OnlineStore, WebSite/SearchAction, Product/Offer, BreadcrumbList, Article, FAQPage.
- Sitemap includes only public TechnoKhan routes; transactional pages are noindex.
- Local manifest, branded icons, OG card, offline page and share target.
