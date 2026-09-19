# AutoLounge (اتولانژ) — Premium Automotive Care Platform

A mobile-first, Persian (fa-IR, RTL) web platform for AutoLounge: paint restoration and detailing, ceramic coating, PPF and car wrap, a detailing-products shop, SMS-OTP login, online booking with Jalali calendar, Zarinpal checkout, customer profile, and an admin dashboard.

## Tech stack

| Layer | Stack |
|---|---|
| Web (`apps/web`) | Next.js 16 App Router (Turbopack), React 19, TypeScript strict, Tailwind CSS 4 (CSS-first theme, dark mode default), framer-motion, embla-carousel, TanStack Query, zustand (persisted stores), react-hook-form + zod 4, date-fns-jalali, sonner, Serwist (PWA) |
| API (`apps/api`) | Fastify 5, Prisma 7 (`@prisma/adapter-pg`), PostgreSQL, JWT auth, Zarinpal v4 (Toman / `IRT`), MeliPayamak SMS, Pino |
| Shared (`packages/shared`) | Types, constants, zod schemas, pricing rules, and the bundled catalog content (products, services, gallery, team, FAQ, legal docs, wrap colors, vehicles) — built to `dist` and consumed by both apps |

## Project structure

```
autolounge/
├── apps/
│   ├── web/                # Next.js app
│   │   ├── src/app/        # routes (home, products, services, gallery, booking, cart, checkout, orders, profile, admin, …)
│   │   ├── src/components/ # ui primitives, organisms (navbar, sheets, tab bar), creative (before/after, wrap visualizer, …)
│   │   ├── src/lib/        # api client + demo transport, React Query hooks, stores, data repository, jalali helpers
│   │   ├── scripts/        # generate-assets.ts (placeholder images, PWA icons, OG image)
│   │   └── public/         # fonts, hero images, generated images/icons, manifest
│   └── api/                # Fastify API (routes, plugins, services, prisma.config.ts + schema + migrations + seed)
├── packages/shared/        # @autolounge/shared
├── docs/
│   ├── API.md              # API contract (/api/v1)
│   └── FRONTEND-GUIDE.md   # frontend conventions and component APIs
└── docker-compose*.yml
```

## Getting started

Prerequisites: Node 20.9+ (CI and the images use 22 LTS — see `.nvmrc`), pnpm 10+, and PostgreSQL (or Docker) for the API.

```bash
pnpm install
```

### Run the web app only (demo mode, no backend)

```bash
cp apps/web/.env.example apps/web/.env.local
```

Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local` (or simply leave the API down — the app detects it), then:

```bash
pnpm dev:web
```

Open http://localhost:3000. In demo mode every transactional flow (login, booking, orders, payment, addresses, contact, admin) runs against `localStorage`, a gold «حالت نمایشی» banner is shown, the OTP code is `123456`, payments go through an in-app mock gateway (`/payment/demo`), and the phone `09120000000` logs in as admin.

### Run the full stack

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Start PostgreSQL (for example `docker compose -f docker-compose.dev.yml up -d postgres`), then:

```bash
pnpm db:migrate
```

```bash
pnpm db:seed
```

```bash
pnpm dev
```

The API listens on http://localhost:5000 (`/api/v1`, health at `/health`), the web app on http://localhost:3000. With `OTP_DEV_BYPASS_CODE=123456` and no SMS credentials, OTP codes are logged instead of sent and the bypass code always works outside production. With an empty `ZARINPAL_MERCHANT_ID` the API simulates the gateway (`DEMO-*` authorities).

### Docker

```bash
docker compose up -d --build
```

The API container runs `prisma migrate deploy`, seeds the catalog when `SEED_ON_START=true`, then starts the server. See `docker-compose.yml` for the environment variables.

## Scripts (repo root)

| Script | What it does |
|---|---|
| `pnpm dev` / `dev:web` / `dev:api` | Build shared, then start the dev servers |
| `pnpm build` | Build every package (`pnpm -r build`) |
| `pnpm type-check` | Build shared, then type-check all packages |
| `pnpm lint` | Lint the apps |
| `pnpm test` | Run the shared pricing/coupon unit tests |
| `pnpm assets` | Regenerate placeholder images, PWA icons, screenshots and the OG image from the catalog (`--force` to overwrite) |
| `pnpm db:migrate` / `db:seed` / `db:studio` | Prisma migrate dev, seed, studio |

## Environment variables

Web (`apps/web/.env.local`): `NEXT_PUBLIC_API_URL`, `INTERNAL_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_DEMO_MODE`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

API (`apps/api/.env`): `PORT`, `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`, `WEB_URL`, `PAYMENT_CALLBACK_URL`, `ZARINPAL_MERCHANT_ID`, `ZARINPAL_SANDBOX`, `MELIPAYAMAK_USERNAME/PASSWORD/FROM`, `OTP_DEV_BYPASS_CODE`, `ADMIN_PHONE`, `SEED_ON_START`, `BOOKING_TIMEZONE`, rate-limit settings. Full list in `apps/api/.env.example` and `docs/API.md`.

## Design system

- **Palette**: navy `#001F3F` (primary, lifted to `#003366` on the dark theme so it still reads against near-black) and gold `#C2B280` (secondary, and the focus ring in dark mode); warm ivory `#F9F7F2` light theme with white card surfaces, near-black `#0a0a0a` dark theme (default). Tokens live in `apps/web/src/app/globals.css`.
- **Without JavaScript**: scroll-reveal animations render as `opacity:0` on the server, so `<html>` ships with `.no-js` and an inline script removes it before the first paint; the `.no-js` rule in `globals.css` keeps every page readable if scripting never arrives.
- **Typography**: Shabnam-FD via `next/font/local`, RTL layout with logical CSS properties.
- **Mobile shell**: bottom tab bar with a raised booking action, bottom sheets with drag-to-dismiss, sticky detail CTAs, safe-area insets, 44px touch targets.
- **Signature interactions**: before/after slider, wrap color visualizer, instant quote configurator, scroll-driven process timeline, gallery lightbox, fly-to-cart, Iranian plate input, confetti on success, cinematic Ken Burns hero.

## Features

- Catalog: products and services with filters, sorting, pagination, search (Ctrl/⌘K), reviews, related items, JSON-LD and sitemap.
- Booking: 4-step wizard (service + vehicle size + add-ons → Jalali date and time slots → vehicle/garage/plate → review), inline OTP login, tracking code, `.ics` export, deposit payment.
- Shop: cart with coupons and free-shipping progress, checkout with saved addresses, Zarinpal or cash-on-delivery, payment callback, order tracking.
- Account: profile tabs (orders, bookings, addresses, garage, wishlist, settings), plus an in-app notification centre that turns the customer's own order and booking status changes into a feed.
- Guest tracking: `/track` looks up an order or a booking by its tracking code and phone number — no account needed.
- Content: `/faq` (searchable, grouped, FAQPage JSON-LD) and `/blog` (a Persian magazine with categories, table of contents, related posts and Article JSON-LD).
- Comparison: `/compare` puts up to four services side by side — price per vehicle size, duration, warranty, rating, add-ons and the union of their features — shareable as `?ids=a,b`.
- Admin: dashboard, orders, bookings, products, services, users, contact inbox, review moderation, coupon management and site settings (opening days, time slots, contact and social links).
- PWA: installable manifest, offline fallback page, generated icons and screenshots.

## Documentation

- `docs/API.md` — endpoints, envelope, payment and demo rules.
- `docs/FRONTEND-GUIDE.md` — conventions, data-access rules, and component APIs.
- `ARCHITECTURE.md` — system overview.
- `docs/CI.md` — the CI pipeline and the local equivalents of its checks.

## License

MIT License - see LICENSE file for details

## Author

mohreztl

---

Made with ❤️ for AutoLounge (اتولانژ)
