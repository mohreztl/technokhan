# TechnoKhan frontend guide

Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, Zustand, TanStack Query and Vazirmatn. Persian, RTL, mobile-first.

## Non-negotiable conventions

- Design at 375px first; use `min-h-dvh`, safe-area helpers and a bottom nav on mobile. Touch targets are at least 44px.
- Use logical properties (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`, `text-start`). Directional icons use `rtl:rotate-180`.
- All displayed numbers pass through `toPersianDigits`; money uses `formatToman` and `tabular-nums`.
- Links wrap `<Button asChild><Link ... /></Button>`, never `<Link><Button /></Link>`.
- `MotionConfig reducedMotion="user"` is global. Do not introduce perpetual heavy animation.
- No `any` for bypassing types, no `console.log`, no module-scope `window`, no nested interactive elements and no `min-h-screen`.
- New/rewritten components, hooks and Fastify routes have concise TSDoc/JSDoc.

## Data access

| Need | Use |
|---|---|
| Server catalog reads | `getProducts`, `getProduct`, `getRelatedProducts`, `getCategories`, `getBrands`, `getArticles`, `getArticle` from `@/lib/data/repository` |
| Client catalog reads | `useProducts` and `useProduct` from `@/lib/hooks/use-products` with server data as `initialData` |
| Pure local filtering | `filterProducts` and `queryLocalProducts` from `@/lib/data/local-query` |
| Editorial content | `ARTICLES`, `FAQ`, `LEGAL_DOCS`, `CATEGORIES`, `BRANDS`, `COUPONS` from `@technokhan/shared` |
| Transactional APIs | Typed clients in `@/lib/api/endpoints`; demo fallback activates when API is down or `NEXT_PUBLIC_DEMO_MODE=true` |

## Product model and pricing

`Product` includes gallery, colors, warranties, specifications, reviews, sales count and editor choice. `OrderItemSelection` preserves color and warranty. The detail page passes effective unit price to the demo transport; Fastify independently validates and computes warranty deltas from the catalog.

`computeOrderTotals`, `effectivePrice`, `discountPercent`, `applyCoupon` and `computeShipping` are shared. Demo codes include `TECH10` and `TECH300`.

## Stores

- `useCart()` exposes items, stock-capped quantity changes, totals, coupon and drawer controls. `CartItem.selection` contains color/warranty.
- `useWishlist()` toggles saved ids.
- `useCompare()` caps ids at four and preserves selection order.
- `useRecentlyViewed()` keeps eight unique recent product ids.
- `useHydrated()` gates pages that depend on persisted values.

## Components

- `components/ui`: native Dialog, BottomSheet, Button, Badge, Input, Select, RangeSlider, Switch, Checkbox, Tabs, Accordion, Skeleton, RatingStars and PriceTag.
- `components/storefront`: ProductCard/Grid, ShopClient, ProductGallery, ProductDetailsClient, CompareClient and SectionHeader.
- `components/home`: HeroShowcase, BentoCategories, FlashDeals and GadgetFinder.
- `components/organisms`: Navbar with visual mega menu, MobileTabBar, SearchModal, CartDrawer and Footer.

## Images

Use manifest entries in `src/content/media-assets.ts` for alt text and dimensions. Product images are square WebP, category 4:3, articles 3:2 and hero 16:10. Always pass `sizes`; only the primary LCP image gets high priority.

## Verification

Run `pnpm --filter @technokhan/shared build`, then `pnpm --filter web type-check` and `pnpm --filter web lint`. Browser verification should cover search → variant → persistent cart → checkout → mock payment, plus a 375–430px filter drawer check.
