# TechnoKhan API

Base URL: `/api/v1`. Responses use `{ success: true, data, pagination? }` or `{ success: false, error, code, details? }`. Money is Toman.

## Public catalog

| Endpoint | Purpose |
|---|---|
| `GET /products` | Products with `category`, `brand`, `brands`, `features`, `featured`, `search`, `minPrice`, `maxPrice`, `inStock`, `sortBy`, `sortOrder`, `page`, `limit` |
| `GET /products/:id` | Product by canonical slug with approved reviews |
| `GET /products/:id/related` | Same-category products first |
| `GET /products/featured/list` | Featured products, `limit` optional |
| `GET /products/categories/list` | Active category ids |
| `GET /products/categories/details` | Six category objects with images and Persian descriptions |
| `GET /products/brands/list` | Seven original brand objects |
| `GET /articles` | Magazine articles with optional `category`, `search`, `limit` |
| `GET /articles/:slug` | Canonical article with structured blocks |
| `POST /products/:id/reviews` | Authenticated review creation (pending moderation) |

Sort values: `createdAt`, `newest`, `popular`, `price`, `rating`, `name`; directions `asc` and `desc`. `popular` uses `salesCount`.

## Orders and coupons

| Endpoint | Purpose |
|---|---|
| `POST /orders` | Create an authenticated order with items, shipping address, payment method, optional coupon and variant selection |
| `GET /orders/my-orders` | Current user's orders, optional `status` |
| `GET /orders/:id` | Order detail with items and transactions |
| `DELETE /orders/:id` | Cancel an eligible order |
| `PUT /orders/:id/address` | Update shipping address |
| `POST /orders/validate-coupon` | Validate code against current subtotal |

Order items accept `productId`, `quantity`, optional `unitPrice` for demo pricing and `selection { colorName, warrantyId, warrantyTitle }`. Fastify validates warranty surcharges from catalog JSON and merges stock quantities for availability checks.

## Auth and account

- `POST /auth/send-otp`, `/auth/verify-otp`, `/auth/refresh`, `/auth/logout`
- `GET /auth/me`, `PUT /auth/profile`
- Address CRUD under `/addresses` and `/addresses/:id/default`

Demo OTP is `123456`; the demo phone `09120000000` is admin.

## Payment and tracking

- `POST /payment/request`, `/payment/verify`, `/payment/status/:orderId`, `/payment/history`
- `GET /track?code=...&phone=...` returns a deliberately thin public status without full address or name
- `GET /health` checks service and database health

Demo payments redirect to `/payment/demo` and return `DEMO-*` authorities. They are simulations and never create a real charge.
