# AutoLounge (اتولانژ) — Architecture

## Overview

AutoLounge is a pnpm monorepo with three packages:

```
┌──────────────────────────────────────────────────────────────┐
│  apps/web — Next.js 15 (App Router, React 19, PWA)           │
│  • Server components for SEO reads (catalog via repository)  │
│  • Client components for user-scoped data (React Query)      │
│  • zustand persisted stores (cart, auth, wishlist, garage)   │
│  • Demo transport: localStorage fallback when API is down    │
└──────────────────────────────┬───────────────────────────────┘
                               │ REST /api/v1 (JSON envelope)
┌──────────────────────────────▼───────────────────────────────┐
│  apps/api — Fastify 4                                         │
│  • JWT auth (role in token), rate limit, CORS, Helmet         │
│  • Zarinpal v4 (IRT) with demo gateway fallback               │
│  • MeliPayamak SMS with dev bypass code                       │
└──────────────────────────────┬───────────────────────────────┘
                               │ Prisma 5
┌──────────────────────────────▼───────────────────────────────┐
│  PostgreSQL                                                   │
└──────────────────────────────────────────────────────────────┘

packages/shared — @autolounge/shared (built to dist)
  types · constants · zod schemas · pricing rules · bundled catalog content
```

Both apps import the same catalog content, validation schemas and pricing
rules from the shared package, so demo mode, seeding and server validation
never drift from each other.

## Monorepo layout

```
autolounge/
├── apps/
│   ├── web/
│   │   ├── src/app/                 # routes (see "Routes")
│   │   ├── src/components/
│   │   │   ├── ui/                  # primitives: button, input, dialog, bottom-sheet, responsive-dialog,
│   │   │   │                        #   icon-button, jalali-calendar, ambient, text-effects, …
│   │   │   ├── molecules/           # product/service cards, sticky CTA bar, filters, skeletons
│   │   │   ├── organisms/           # navbar, footer, mobile tab bar, cart drawer, search modal, sheets
│   │   │   ├── creative/            # signature interactions (see below)
│   │   │   ├── auth/                # OTP form, inline login sheet
│   │   │   ├── booking/             # booking wizard steps
│   │   │   ├── checkout/            # checkout stepper
│   │   │   ├── admin/               # admin tables, forms, charts
│   │   │   ├── pages/               # page-level compositions and home sections
│   │   │   └── providers.tsx        # theme, MotionConfig, React Query, store hydration, AppShell
│   │   ├── src/lib/
│   │   │   ├── api/                 # client.ts (apiFetch), endpoints.ts, demo.ts, query-keys.ts
│   │   │   ├── data/                # repository.ts (server-only), local-query.ts
│   │   │   ├── hooks/               # React Query hooks + UI hooks
│   │   │   ├── store/               # zustand stores + hydration
│   │   │   ├── booking/             # draft persistence, .ics export
│   │   │   ├── jalali.ts, routes.ts, seo.ts, site.ts, utils.ts, animation-variants.ts
│   │   ├── scripts/generate-assets.ts
│   │   └── public/                  # fonts, hero images, generated images/icons, manifest.json
│   └── api/
│       ├── src/server.ts
│       ├── src/routes/              # auth, products, services, bookings, orders, payment, addresses, contact, admin
│       ├── src/services/            # sms.service.ts, zarinpal.service.ts
│       ├── src/lib/                 # prisma, errors, logger, catalog, booking-time, serialize, validation
│       ├── src/config/              # env parsing
│       └── prisma/                  # schema.prisma, migrations/, seed.ts
├── packages/shared/src/
│   ├── types/ · constants/ · schemas/ · utils/ (pricing, formatting)
│   └── data/                        # products, services, gallery, testimonials, team, certifications,
│                                    #   faq, legal, coupons, wrap-colors, vehicles
├── docs/API.md · docs/FRONTEND-GUIDE.md
└── docker-compose.yml · docker-compose.dev.yml
```

## Frontend

### Data access rules

| Need | Mechanism |
|---|---|
| Catalog reads in server components (list/detail pages, `generateMetadata`, sitemap) | `lib/data/repository.ts` (`server-only`): calls the API with ISR (`revalidate: 300`), falls back to the bundled catalog. Returns `{ data, source: 'api' \| 'local' }`. |
| Catalog reads in client components | React Query hooks (`useProducts`, `useProduct`, `useServices`, …) with server data passed as `initialData`. |
| User-scoped data (orders, bookings, addresses, profile, admin) | React Query hooks over `lib/api/endpoints.ts`. |
| Editorial content (team, testimonials, FAQ, legal, wrap colors, vehicles) | Imported directly from `@autolounge/shared`. |

`apiFetch` never throws: it returns `ApiResult<T>` (`{ ok, data, pagination }` or `{ ok: false, error, status, code, offline }`), prefixes `/api/v1`, attaches the token from the auth store, and logs out on 401.

### Demo transport

Every transactional endpoint has a localStorage implementation in `lib/api/demo.ts`. `withDemoFallback(live, demo)` uses it when `NEXT_PUBLIC_DEMO_MODE=true` or when the API is unreachable, then stays in demo mode for the session and shows the «حالت نمایشی» banner. Demo OTP is `123456`; the phone `09120000000` becomes admin. Demo payments route through the in-app mock gateway at `/payment/demo` and return to `/checkout/callback` with a `DEMO-*` authority.

### State (zustand, persisted with `skipHydration`)

- `useCart()` — items, coupon, totals (`computeOrderTotals` from shared), open/close.
- `useAuth()` — user, token, `status: idle | anonymous | authenticated`, `isAdmin`.
- `useWishlist()` — product ids.
- `useGarageStore` — saved vehicles for booking prefill.
- `useUIStore` — search/more/login sheet visibility, demo flag, fly-to-cart queue.

`StoreHydrator` rehydrates persisted stores after mount; pages that depend on persisted state use `useHydrated()`.

### Mobile shell

Mounted once in `AppShell`: `MobileTabBar` (five tabs, raised gold booking action, hidden on login/checkout/admin/detail routes), `MobileCartPill`, `CartDrawer` (bottom sheet on mobile, side drawer on desktop), `SearchModal` (Ctrl/⌘K), `MoreSheet`, `LoginSheet`, `FlyToCartLayer`, `DemoBanner`, `Toaster`. The root layout offsets `<main>` for the 80px glass navbar plus safe-area insets, and for the tab bar below `lg`.

### Animation system

- `MotionConfig reducedMotion="user"` globally, plus `useReducedMotion()` gating for perpetual effects.
- Ambient backgrounds (`AmbientOrbs`, `GoldLines`, `MorphingBlobs`) animate only in view, never on coarse pointers.
- Page enter transition is a CSS keyframe in `app/template.tsx`.
- Embla carousel (`direction: 'rtl'`) for hero, testimonials, product galleries and mobile product rows.

### Signature creative components (`components/creative`)

| Component | Where |
|---|---|
| `BeforeAfterSlider` (clip-path bound to a drag motion value, keyboard slider) | home showcase, service detail, lightbox |
| `WrapVisualizer` + `CarSilhouette` (SVG body fill, gloss/satin/matte/chrome) | home teaser, wrap and PPF detail |
| `QuoteConfigurator` (size × add-ons → animated total via `computeQuote`) | services list, service detail, home |
| `GalleryGrid` + `Lightbox` (masonry, filter chips, full-screen embla on mobile) | gallery, about |
| `ProcessTimeline` (SVG path length bound to scroll) | service detail, about, home |
| `useFlyToCart()` (portal image arcs to the cart target) | product cards, quick view, detail |
| `PlateInput` (Iranian plate, RTL-correct) | booking step 3 |
| `ConfettiBurst` | booking and order success |

### Routes

```
/                       home
/products               list (URL-synced filters, sort, pagination, ?search=)
/products/[id]          detail (static params from catalog, JSON-LD, gallery, related, reviews)
/services               list + quote configurator
/services/[id]          detail (pricing tiers, add-ons, steps, FAQ, before/after)
/gallery                portfolio with filters and lightbox
/about · /contact       team, certifications, FAQ, map, contact form
/booking                4-step wizard (deep links: ?service=&size=&addons=&color=&finish=&date=)
/cart · /checkout       cart, checkout stepper, /checkout/callback (payment verify)
/orders · /orders/[id]  order history, status stepper, retry payment, cancel
/profile                tabs: orders, bookings, addresses, garage, wishlist, settings (?tab=)
/wishlist · /share      saved products, share landing
/login                  OTP login (also available inline via LoginSheet)
/payment/demo           mock gateway used in demo mode
/admin/**               dashboard, orders, bookings, products, services, users, messages, reviews
/privacy · /terms       legal documents from shared content
/~offline               PWA offline fallback
```

## Backend

### API surface (`/api/v1`, see `docs/API.md`)

```
auth       POST /send-otp · POST /verify-otp · POST /refresh · POST /logout · GET /me · PUT /profile
products   GET / · GET /:id · GET /:id/related · GET /featured/list · POST /:id/reviews
services   GET / · GET /:id · GET /:id/related · GET /featured/list
bookings   POST / · GET /my-bookings · GET /:id · DELETE /:id · GET /available-slots
orders     POST / · GET /my-orders · GET /:id · DELETE /:id (cancel) · PUT /:id/address · POST /validate-coupon
payment    POST /request · POST /booking/request · POST /verify · GET /status/:orderId · GET /history
addresses  GET / · POST / · PUT /:id · DELETE /:id · PUT /:id/default
contact    POST /
admin      GET /dashboard · products/services CRUD · orders & bookings status · users · messages · reviews
```

Responses use the envelope `{ success, data, pagination? }` or `{ success: false, error, code }`.

### Authentication

Phone number → OTP (2-minute expiry, one-time use; dev bypass code outside production) → JWT (30 days) carrying the user role. The web client stores the token in the persisted auth store and sends it as a Bearer header. Admin routes require `role === 'admin'`.

### Payments

All money is Toman. Zarinpal v4 is called with `currency: 'IRT'`; transactions are keyed by `authority` and can belong to an order or a booking deposit. Without a merchant id the API issues `DEMO-<id>` authorities and the callback verifies them locally. Cash on delivery moves an order straight to `processing`.

### Database (Prisma)

`User`, `OTP`, `Product` (brand, sku, specifications, features), `Service` (features, steps, faq, pricing tiers, addons, gallery, beforeAfter), `Booking`, `Order` (paymentMethod, couponCode, discount, shippingCost, trackingCode), `OrderItem`, `PaymentTransaction` (order or booking), `Address`, `ContactMessage`, `Review`. The seed upserts the shared catalog by slug id and creates the admin user from `ADMIN_PHONE`.

## Design system

### Palette

```css
--primary:     #001F3F;   /* navy */
--secondary:   #C2B280;   /* gold */
--background:  #F9F7F2;   /* light: warm ivory */
--background:  #0a0a0a;   /* dark (default): near black */
```

Tokens are HSL CSS variables in `apps/web/src/app/globals.css` and mapped in `tailwind.config.ts` (`bg-primary`, `bg-secondary`, `bg-background`, `text-muted-foreground`, …).

### Typography and layout

- Shabnam-FD loaded with `next/font/local` (`--font-Shabnam-FD`), RTL with logical CSS properties.
- Mobile-first at 375×812: 44px touch targets, `min-h-dvh`, safe-area padding utilities (`pt-safe`, `pb-safe`, `pb-tabbar`).
- Persian digits everywhere via `toPersianDigits`; prices via `formatToman`; Jalali dates via `lib/jalali.ts`.

### Motion guidelines

- 200–300ms for interactions, 400–600ms for section reveals, spring physics for sheets and tabs.
- Respect `prefers-reduced-motion`; no perpetual animation off-screen or on touch devices.

## Security

- JWT with role claim, 30-day expiry; OTP one-time use with rate limiting.
- Helmet, CORS allow-list (`ALLOWED_ORIGINS`), global and per-route rate limits.
- All input validated with shared zod schemas on the API; Prisma prevents SQL injection.
- Merchant ids and SMS credentials live only in the API environment.

## PWA

`manifest.json` (RTL, Persian, generated icons including maskable, shortcuts, screenshots), `next-pwa` service worker generated at build time, offline fallback at `/~offline`.

## Deployment

- `docker compose up -d --build` starts PostgreSQL, the API (runs `prisma migrate deploy`, optional seed) and the web app (Next standalone output).
- Web can also be deployed to Vercel with `NEXT_PUBLIC_API_URL` and `INTERNAL_API_URL` pointing at the API.
- CI workflow runs install, shared build, type-check, lint, tests and builds.

## Follow-ups

Real product photography (placeholders are swappable at the same paths), Shabnam Medium/Bold font files, English locale, blog/CMS, push notifications, real-time booking updates, Playwright end-to-end suite.

---

Made with ❤️ for AutoLounge (اتولانژ)
