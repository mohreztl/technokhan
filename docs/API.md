# AutoLounge API contract (v1)

Base URL: `${API_HOST}/api/v1` (default `http://localhost:5000/api/v1`).
All money values are **Toman** (Zarinpal `currency: "IRT"`). Dates are ISO-8601 strings.
Ids for catalog items are **slugs** (`ceramic-coating`, `carnauba-wax`) so demo mode and the DB agree.

## Envelope

```jsonc
// success
{ "success": true, "data": <T>, "pagination": { "total", "page", "limit", "totalPages", "hasNext", "hasPrev" } }
// error
{ "success": false, "error": "پیام فارسی", "code": "VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN" | "RATE_LIMITED" | "CONFLICT" | "PAYMENT_ERROR" | "INTERNAL" , "details"?: [...] }
```

Auth: `Authorization: Bearer <jwt>`. JWT payload `{ id, phoneNumber, role }`, 7d. `role` is the user's real role.

## Catalog (public)

| Method | Path | Query / body | data |
|---|---|---|---|
| GET | `/products` | `category, brand, featured, search, minPrice, maxPrice, inStock, page=1, limit=12, sortBy=createdAt|price|rating|name, sortOrder` | `Product[]` + pagination |
| GET | `/products/:id` | | `Product` (with approved `reviews`) |
| GET | `/products/featured/list` | `limit=8` | `Product[]` |
| GET | `/products/categories/list` | | `string[]` |
| GET | `/products/:id/related` | `limit=4` | `Product[]` |
| POST | `/products/:id/reviews` 🔒 | `{ rating, comment }` | `Review` (pending approval) |
| GET | `/services` | `type, featured, search, page, limit, sortBy, sortOrder` | `Service[]` + pagination |
| GET | `/services/:id` | | `Service` (with approved `reviews`) |
| GET | `/services/featured/list` | `limit=6` | `Service[]` |
| GET | `/services/categories/list` | | `string[]` (types) |
| GET | `/services/:id/related` | `limit=3` | `Service[]` |
| POST | `/services/:id/reviews` 🔒 | `{ rating, comment }` | `Review` |

## Auth

| Method | Path | Body | data |
|---|---|---|---|
| POST | `/auth/send-otp` | `{ phoneNumber }` | `{ message, expiresIn: 120, demoCode?: "123456" }` (`demoCode` only when `OTP_DEV_BYPASS_CODE` is set and `NODE_ENV !== "production"`) |
| POST | `/auth/verify-otp` | `{ phoneNumber, code }` | `{ token, user }` |
| GET | `/auth/me` 🔒 | | `User` |
| PUT | `/auth/profile` 🔒 | `{ name?, email? }` | `User` |
| POST | `/auth/logout` 🔒 | | `{ message }` |
| POST | `/auth/refresh` 🔒 | | `{ token }` |

## Bookings 🔒

| Method | Path | Body / query | data |
|---|---|---|---|
| GET | `/bookings/available-slots` (public) | `serviceId, date=yyyy-MM-dd` | `{ date, serviceId, availableSlots: string[], bookedSlots: string[] }` — slots come from `SiteSettings.timeSlots`; past slots for today, `closedWeekdays` and one-off `closedDates` are excluded |
| POST | `/bookings` | `CreateBookingInput` (`totalPrice` must be within 1% of `computeQuote`) | `Booking` (with `service`, `trackingCode = "BK-XXXXXX"`) |
| GET | `/bookings/my-bookings` | `status?` | `Booking[]` |
| GET | `/bookings/:id` | | `Booking` |
| DELETE | `/bookings/:id` | | `Booking` (status `cancelled`; only `pending`/`confirmed`) |

## Orders 🔒

| Method | Path | Body / query | data |
|---|---|---|---|
| POST | `/orders/validate-coupon` (public) | `{ code, subtotal }` | `CouponResult` — on success also carries `coupon: CouponTerms` so the cart can re-price itself as items change. Coupons live in the database; the bundled `COUPONS` list is only seed data |
| POST | `/orders` | `CreateOrderInput` | `Order` (server computes `subtotal`, `discount`, `shippingCost`, `totalPrice` with `computeOrderTotals`; `paymentMethod: "cod"` → status `processing`) |
| GET | `/orders/my-orders` | `status?` | `Order[]` (items with `product`) |
| GET | `/orders/:id` | | `Order` (with `transactions`) |
| DELETE | `/orders/:id` | | `Order` (cancel; only `pending`) |
| PUT | `/orders/:id/address` | `Address` | `Order` |

## Tracking

| Method | Path | Body | data |
|---|---|---|---|
| POST | `/track` (public, OTP rate limit) | `{ code, phoneNumber }` | `TrackResult` — an order (`OR-…`) or booking (`BK-…`), its status timeline and `destination` (province، city) |

The code alone is not enough: the phone number on the order must match. A wrong
code and a wrong phone return the same 404 message, so the endpoint cannot be
used to discover which codes exist.

## Site settings

| Method | Path | data |
|---|---|---|
| GET | `/settings` (public) | `SiteSettings` — closed days, bookable windows, contact details and social links. `Cache-Control: public, max-age=60, stale-while-revalidate=600` |

Backed by a single row (`id = "default"`) seeded from `DEFAULT_SITE_SETTINGS`;
the API holds it in memory for 30s. A field an admin clears stays cleared — the
bundled defaults only stand in when the row does not exist at all.

## Payment (Zarinpal, server-side only)

| Method | Path | Body | data |
|---|---|---|---|
| POST | `/payment/request` 🔒 | `{ orderId, callbackUrl? }` | `PaymentRequestResult` `{ authority, paymentUrl, amount, demo? }` |
| POST | `/payment/booking/request` 🔒 | `{ bookingId, callbackUrl? }` | `PaymentRequestResult` |
| POST | `/payment/verify` | `{ authority, status: "OK" | "NOK" }` | `PaymentVerifyResult` `{ success, refId?, cardNumber?, amount?, orderId?, bookingId?, message? }` |
| GET | `/payment/status/:orderId` 🔒 | | `{ paymentStatus, transactions }` |
| GET | `/payment/history` 🔒 | | `PaymentTransaction[]` |

Rules: a `PaymentTransaction` row is created on request with the `authority`; verify looks the transaction up **by authority** and updates the order **or** booking. When `ZARINPAL_MERCHANT_ID` is empty and `NODE_ENV !== "production"`, request returns `authority: "DEMO-<txId>"`, `paymentUrl: "<callbackUrl>?Authority=DEMO-<txId>&Status=OK"`, `demo: true`; verify accepts `DEMO-*` authorities without calling Zarinpal. Default callback: `${WEB_URL}/checkout/callback`.

## Addresses 🔒

`GET /addresses` → `Address[]`; `POST /addresses` (`Address`) → `Address`; `PUT /addresses/:id`; `DELETE /addresses/:id`; `PUT /addresses/:id/default`.

## Contact

`POST /contact` (`ContactInput`, rate-limited 5/15min per IP) → `{ id, message }`. Stored in `ContactMessage`.

## Admin 🔒 (role `admin`)

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/dashboard` | `AdminDashboardStats` |
| GET/POST | `/admin/products`, `PUT/DELETE /admin/products/:id` | `adminProductSchema`; GET supports `page, limit, search, category, isActive` |
| GET/POST | `/admin/services`, `PUT/DELETE /admin/services/:id` | `adminServiceSchema` |
| GET | `/admin/orders` (`status, page, limit, search`), `/admin/orders/:id` | |
| PUT | `/admin/orders/:id/status` | `{ status, shipmentCode? }` — the courier's consignment number, not the shop's own `trackingCode` |
| GET | `/admin/bookings` (`status, date, page, limit`), `/admin/bookings/:id` | |
| PUT | `/admin/bookings/:id/status` | `{ status }` |
| GET | `/admin/users` (`page, limit, search`), `/admin/users/:id` | user + counts |
| GET | `/admin/messages` (`unread, page, limit`) | `ContactMessage[]` |
| PUT | `/admin/messages/:id/read` | |
| GET | `/admin/reviews` (`approved, page`) ; `PUT /admin/reviews/:id/approve` ; `DELETE /admin/reviews/:id` | |
| GET/POST | `/admin/coupons`, `PUT/DELETE /admin/coupons/:id` | `couponSchema` / `couponUpdateSchema`; codes are upper-cased, `expiresAt` accepts `yyyy-MM-dd` (stored as end-of-day UTC) |
| GET/PUT | `/admin/settings` | `siteSettingsSchema` — the single `SiteSettings` row |

## Environment

API: `PORT=5000`, `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`, `WEB_URL=http://localhost:3000`, `PAYMENT_CALLBACK_URL=${WEB_URL}/checkout/callback`, `ZARINPAL_MERCHANT_ID` (empty → demo gateway outside production), `ZARINPAL_SANDBOX=true`, `MELIPAYAMAK_USERNAME/PASSWORD/FROM` (empty → OTP logged, not sent), `OTP_DEV_BYPASS_CODE=123456`, `ADMIN_PHONE=09120000000`, `SEED_ON_START=true`.

Web: `NEXT_PUBLIC_API_URL=http://localhost:5000` (browser), `INTERNAL_API_URL=http://api:5000` (server-side in Docker), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_DEMO_MODE=false`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

Demo mode (web): when `NEXT_PUBLIC_DEMO_MODE=true` or the API is unreachable, transactional endpoints are served from `localStorage` (`apps/web/src/lib/api/demo.ts`) and the UI shows the "حالت نمایشی" banner. Demo OTP code is `123456`.
