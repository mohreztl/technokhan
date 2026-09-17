# AutoLounge web — frontend guide (for humans and agents)

Next.js 15 App Router · React 19 · TypeScript strict · Tailwind 3.4 · framer-motion 11 · @tanstack/react-query · zustand · sonner · lucide-react · embla-carousel-react · date-fns-jalali · react-hook-form + zod.
Persian (fa-IR), RTL, mobile-first. Brand: navy `#001F3F` (`bg-primary`), gold `#C2B280` (`bg-secondary`), ivory light / near-black dark (`bg-background`).

## Conventions (non-negotiable)

- **Mobile first**: every screen is designed at 375×812 first. Touch targets ≥ 44px (`IconButton`, `Button size="icon"`). Use `min-h-dvh`, `pb-safe`, `pt-safe`, `pb-tabbar` (bottom tab bar is 4rem + safe area on `< lg`). No hover-only affordances: controls are visible below `lg` and hover-revealed at `lg+` (`lg:opacity-0 lg:group-hover:opacity-100`).
- **RTL**: logical classes only (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`, `text-start`). Icons that imply direction get `rtl:rotate-180`.
- **Numbers**: everything displayed goes through `toPersianDigits()`; prices through `formatToman()` / `formatTomanCompact()` (all money is Toman). Dates: `formatJalali`, `formatJalaliNumeric`, `formatJalaliDateTime`, `relativeJalaliLabel` from `@/lib/jalali`; API dates are ISO, booking dates are Gregorian `yyyy-MM-dd` (`toIsoDate` / `fromIsoDate`).
- **Buttons/links**: `<Button asChild><Link href="…">…</Link></Button>` — never `<Link><Button/></Link>`. `Button` has `loading`, `loadingText`, variants `primary|secondary|accent|outline|ghost|link|glass`, sizes `sm|md|lg|xl|icon|icon-sm`.
- **Motion**: `MotionConfig reducedMotion="user"` is global; still gate perpetual animations with `useInView` and `useReducedMotion()` (`@/lib/hooks/use-reduced-motion`). No `blur-3xl` animating on touch devices (`useIsCoarsePointer()`). Ambient backgrounds: `AmbientOrbs`, `GoldLines`, `MorphingBlobs` from `@/components/ui/ambient`. Page enter transition is already in `app/template.tsx`. Springs: `SHEET_SPRING` / `springSheet`, `springTab` in `@/lib/animation-variants`.
- **Toasts**: `import { toast } from 'sonner'` or `showToast.*` from `@/components/ui/toaster` (`addedToCart`, `addedToWishlist`, `orderSuccess`, `paymentFailed`, …).
- **Text**: natural Persian with ZWNJ; `text-balance` for headings. English only in `nameEn`/brand names.
- **No** `console.log`, no `window` access at module scope, no `<a><button>` nesting, no `min-h-screen`.

## Data access

| Need | Use |
|---|---|
| Catalog reads in **server components** (SEO pages, `generateMetadata`, `generateStaticParams`, sitemap) | `@/lib/data/repository` (`server-only`): `getProducts(q)`, `getProduct(id)`, `getRelatedProducts(id)`, `getServices(q)`, `getService(id)`, `getRelatedServices(id)`, `getFeatured()`, `getGallery(type?)` → `{ data, source: 'api' \| 'local' }`; ISR 5 min; falls back to the bundled catalog. Static ids come from `PRODUCTS`/`SERVICES` in `@autolounge/shared`. |
| Catalog reads in **client components** | hooks in `@/lib/hooks`: `useProducts(q, { initialData })`, `useProduct(id, initial)`, `useFeaturedProducts`, `useRelatedProducts`, `useServices`, `useService`, `useFeaturedServices`, `useRelatedServices`. Pass server data as `initialData` when available. |
| Editorial content (no API) | `TESTIMONIALS`, `TEAM`, `CERTIFICATIONS`, `FAQ`, `GALLERY`, `LEGAL_DOCS`, `COUPONS`, `WRAP_COLORS`, `VEHICLE_CATALOG`, `PRODUCT_BRANDS` + helpers (`findProduct`, `findService`, `getFeaturedProducts`, `findGalleryByService`, `findCoupon`, `findWrapColor`) from `@autolounge/shared`. |
| User-scoped data | `useMyOrders`, `useOrder`, `useCreateOrder`, `useCancelOrder`, `useValidateCoupon`, `useRequestPayment`, `useRequestBookingPayment`, `useVerifyPayment`, `usePaymentStatus` (`use-orders.ts`); `useMyBookings`, `useBooking`, `useAvailableSlots(serviceId, isoDate)`, `useCreateBooking`, `useCancelBooking` (`use-bookings.ts`); `useAddresses`, `useAddressMutations()` → `{ create, update, remove, setDefault }`; `useMe`, `useUpdateProfile`, `useSendOtp`, `useVerifyOtp`, `useLogout`; admin: `useAdminDashboard`, `useAdminProducts/Services/Orders/Bookings/Users/Messages/Reviews(q)` → `{ items, pagination }`, `useAdminOrder(id)`, `useAdminBooking(id)`, `useAdminMutations()`. |
| Raw calls | `productsApi`, `servicesApi`, `authApi`, `bookingsApi`, `ordersApi`, `paymentApi`, `addressesApi`, `contactApi`, `adminApi` in `@/lib/api/endpoints` — each returns `ApiResult<T>` (`{ ok, data, pagination }` or `{ ok:false, error, status, code, offline }`); `unwrap()` throws for React Query. Every call falls back to the localStorage demo transport (`@/lib/api/demo.ts`) when `NEXT_PUBLIC_DEMO_MODE=true` or the API is unreachable; the `DemoBanner` then shows. Demo OTP `123456`; phone `09120000000` becomes admin. Demo payments redirect through `/payment/demo` (mock gateway) back to `/checkout/callback?Authority=DEMO-…&Status=OK|NOK`. |
| Pricing | `computeQuote(service, size, addonIds)`, `computeOrderTotals(lines, couponCode, COUPONS)`, `applyCoupon`, `computeShipping`, `effectivePrice`, `discountPercent` from `@autolounge/shared`. |
| Validation | zod schemas from `@autolounge/shared/schemas` re-exported by the package root: `createBookingSchema`, `createOrderSchema`, `shippingAddressSchema`, `contactSchema`, `updateProfileSchema`, `reviewSchema`, `sendOTPSchema`, `verifyOTPSchema`, `adminProductSchema`, `adminServiceSchema`, … (use with `zodResolver`). |

## State (`@/lib/store`)

- `useCart()` → `{ items, isOpen, addItem(product, qty?), removeItem, updateQuantity, clearCart, toggleCart, openCart, closeCart, setCoupon, totals: { count, listTotal, subtotal, productDiscount, couponDiscount, shipping, total, coupon }, totalItems, isInCart, quantityOf }`; `useCartCount()`.
- `useAuth()` → `{ user, token, status: 'idle'|'anonymous'|'authenticated', isAuthenticated, isLoading, isAdmin, login, logout, updateUser }`. While `status === 'idle'` (before hydration) render a skeleton, never redirect.
- `useWishlist()` → `{ ids, has(id), toggle(id) (returns new state), count }`.
- `useGarageStore` → saved vehicles for booking prefill (see `garage-store.ts`).
- `useUIStore` → `searchOpen/setSearchOpen`, `moreOpen/setMoreOpen`, `loginSheetOpen/openLoginSheet(redirect?)/closeLoginSheet`, `demoActive`, `fly({ src, from })`, `flyDone`.
- `useHydrated()` for pages that depend on persisted state.

## App shell (already mounted in `Providers` → `AppShell`)

`MobileTabBar` (hidden on `/login`, `/checkout*`, `/admin*`, detail routes — see `isTabBarHidden` in `@/lib/routes`; `Navbar` and `Footer` return null where `isChromeHidden(pathname)` is true, i.e. `/admin*`), `MobileCartPill`, `CartDrawer` (sheet on mobile / drawer on desktop), `SearchModal` (Ctrl/⌘K), `MoreSheet`, `LoginSheet`, `FlyToCartLayer`, `DemoBanner`, `Toaster`. Layout offsets `<main>` by the 80px navbar + safe-area and by the tab bar on mobile.

## UI primitives

- `BottomSheet` `{ open, onOpenChange, title?, description?, snapPoints?=[0.5,0.9], initialSnap?, dismissible?, footer?, className?, contentClassName?, hideHeader?, children }` (+ `useSheetState()`).
- `ResponsiveDialog` = BottomSheet below `lg`, `Dialog` above (`desktopClassName`). Use it for quick view, filters, address picker, confirmations.
- `IconButton` `{ label!, icon, size?, variant?, badge?, active?, asChild? }` (44px, aria-label required).
- `StickyCtaBar` `{ price, oldPrice?, priceLabel?, primaryLabel, primaryIcon?, onPrimary?|primaryHref?, primaryDisabled?, primaryLoading?, secondary?: {icon,label,onClick,active?}[], visible }` + `useStickyCta(ref)`; detail pages show it when the in-page CTA scrolls out.
- `JalaliCalendar` `{ value, onChange, minDate?, maxDate?, disabledWeekdays?, isDateDisabled?, markDay?, className? }` (`@/components/ui/jalali-calendar`) — Saturday-first, swipe, keyboard.
- Auth: `OtpForm` `{ onSuccess?, compact?, initialPhone? }`, `LoginSheet` (mounted), `useRequireAuth()` → `ensureAuth(redirect?)`: returns `true` when signed in, otherwise opens the inline login sheet and returns `false` (use before booking/checkout submits instead of redirecting to `/login`).
- Existing: `Dialog*`, `Accordion`, `Tabs`, `Breadcrumb`, `Pagination`, `Badge`, `Card`, `Avatar`, `Input` (`label`, `error`), `Textarea`, `Select`, `Radio`, `Checkbox`, `Skeleton`, `loading-skeletons.tsx`, `premium-components.tsx` (`SectionHeading`, `LuxuryCard`, `StatsCard`, `LuxuryDivider`, `PremiumButton`), `text-effects.tsx` (`SplitText splitBy="word"`, `AnimatedCounter`, `RotatingText`), `card-3d.tsx` (`RevealOnScroll`, `ParallaxSection`), `interactive-effects.tsx` (`RippleButton`).
- `LegalPage` renders `LEGAL_DOCS.*` (used by `/privacy`, `/terms`).

## Creative components (`@/components/creative`)

`BeforeAfterSlider { before, after, alt, aspect?, initial?, beforeSide? }` · `WrapVisualizer { colors: WRAP_COLORS, basePrice?, serviceId?, initialColorId?, initialFinish?, onSelect? }` · `QuoteConfigurator { services, initialServiceId?, initialSize?, initialAddonIds?, compact?, onChange? }` + `buildBookingHref(input)` → `/booking?service=&size=&addons=` · `RollingNumber { value }` · `GalleryGrid { items, filters?, lightbox?, initialFilter? }` (+ `Lightbox`) · `ProcessTimeline { steps, title?, orientation? }` · `PlateInput { value, onChange, error? }` + `parsePlate/formatPlate/isPlateComplete` · `ConfettiBurst { fire, fixed? }` · `useFlyToCart()` → `(imgEl, src) => void` · `CarSilhouette`. Heavy ones should be loaded with `next/dynamic({ ssr: false })` where they are below the fold.

## Booking deep links

`/booking?service=<id>&size=small|medium|large&addons=a,b&color=<wrapColorId>&finish=gloss|satin|matte|chrome&date=yyyy-MM-dd` — the wizard prefills from these. Product cards link `/booking?service=<id>`.

## Images

All catalog image paths exist under `apps/web/public/images/**` (generated placeholders; regenerate with `pnpm --filter web assets`). Always pass `sizes` to `next/image`; use `/images/placeholder-product.webp` / `/images/placeholder-service.webp` as fallbacks. Hero images: `/hero1.webp`–`/hero3.webp`. Logo: `/images/logo.svg`.

## Verification before reporting

`pnpm --filter @autolounge/shared build` → `pnpm --filter web type-check` (must be clean for your files) → `pnpm --filter web lint`. Do not run the dev server or browser tools from a sub-agent; the coordinator does visual QA.
