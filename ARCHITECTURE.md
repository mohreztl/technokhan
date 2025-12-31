# AutoLounge (اتولانژ) - Project Architecture

## 📐 Architecture Overview

AutoLounge is a monorepo-based full-stack application built with modern technologies for high performance and scalability.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Next.js 15 (PWA) - React 19 - TypeScript         │ │
│  │  • Server Components (RSC)                         │ │
│  │  • Client Components (Framer Motion, Zustand)     │ │
│  │  • Dark Luxury UI (Tailwind + shadcn/ui)          │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                    API Layer (Fastify)                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Routes: Auth, Products, Services, Bookings        │ │
│  │  Middleware: JWT, Rate Limit, CORS, Helmet        │ │
│  │  Services: MeliPayamak SMS, File Upload           │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↕ Prisma ORM
┌─────────────────────────────────────────────────────────┐
│                   Database Layer                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                               │ │
│  │  • Users, OTPs, Products, Services                │ │
│  │  • Bookings, Orders, OrderItems                   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ Monorepo Structure

```
autolounge/
├── apps/
│   ├── web/                    # Next.js Frontend Application
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router
│   │   │   │   ├── layout.tsx # Root layout with metadata
│   │   │   │   ├── page.tsx   # Homepage
│   │   │   │   └── globals.css
│   │   │   ├── components/    # React Components (Atomic Design)
│   │   │   │   ├── ui/        # Atoms (Button, Input, Card)
│   │   │   │   ├── molecules/ # ProductCard, ServiceCard
│   │   │   │   ├── organisms/ # Navbar, Footer
│   │   │   │   ├── pages/     # Page components
│   │   │   │   └── providers.tsx
│   │   │   ├── lib/           # Utilities
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   └── store/         # Zustand stores
│   │   ├── public/            # Static assets
│   │   │   ├── manifest.json  # PWA manifest
│   │   │   ├── robots.txt
│   │   │   └── icons/
│   │   ├── tailwind.config.ts # Tailwind configuration
│   │   ├── next.config.js     # Next.js + PWA config
│   │   └── package.json
│   │
│   └── api/                   # Fastify Backend API
│       ├── src/
│       │   ├── server.ts      # Main server file
│       │   ├── routes/        # API routes
│       │   │   ├── auth.ts    # Authentication routes
│       │   │   ├── products.ts
│       │   │   ├── services.ts
│       │   │   ├── bookings.ts
│       │   │   └── orders.ts
│       │   ├── services/      # Business logic
│       │   │   └── sms.service.ts # MeliPayamak integration
│       │   ├── lib/           # Libraries
│       │   │   └── prisma.ts  # Prisma client
│       │   └── middleware/    # Custom middleware
│       ├── prisma/
│       │   └── schema.prisma  # Database schema
│       ├── .env.example
│       └── package.json
│
├── packages/
│   └── shared/                # Shared code across apps
│       ├── src/
│       │   ├── types/         # TypeScript types
│       │   ├── utils/         # Utility functions
│       │   ├── constants/     # App constants
│       │   └── index.ts
│       └── package.json
│
├── pnpm-workspace.yaml        # pnpm monorepo config
├── turbo.json                 # Turborepo config
├── package.json               # Root package.json
└── README.md
```

## 🎨 Frontend Architecture (Next.js)

### Component Architecture (Atomic Design)

#### 1. **Atoms** (`/components/ui/`)

Smallest building blocks, highly reusable:

- `Button` - All button variants (primary, secondary, accent, outline, ghost)
- `Input` - Text input with label and error states
- `Textarea` - Multi-line text input
- `Card` - Base card container with glass effect

#### 2. **Molecules** (`/components/molecules/`)

Combinations of atoms:

- `ProductCard` - Product display with image, price, discount badge, add-to-cart
- `ServiceCard` - Service display with image, duration, price, booking CTA

#### 3. **Organisms** (`/components/organisms/`)

Complex components:

- `Navbar` - Responsive navigation with mobile menu, cart icon, user profile
- `Footer` - Footer with links, contact info, social media

#### 4. **Pages** (`/components/pages/`)

Full page components:

- `LandingPage` - Complete landing page
  - `HeroSection` - Hero with animated background, CTA buttons, stats
  - `FeaturedServices` - Service showcase grid
  - `FeaturedProducts` - Product showcase grid
  - `WhyChooseUs` - Features grid with icons
  - `Testimonials` - Customer reviews carousel
  - `CTASection` - Call-to-action section

### State Management (Zustand)

```typescript
// Example store structure
interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}
```

### Routing Structure

```
/                      # Landing page
/products             # Product listing
/products/[id]        # Product detail
/services             # Service listing
/services/[id]        # Service detail
/booking              # Booking form
/cart                 # Shopping cart
/checkout             # Checkout process
/profile              # User profile
/orders               # Order history
/about                # About us
/contact              # Contact page
/login                # Login/OTP page
```

## 🔧 Backend Architecture (Fastify)

### API Routes Structure

```
/api/auth
  POST /send-otp        # Send OTP to phone
  POST /verify-otp      # Verify OTP and login
  GET  /me              # Get current user (protected)

/api/products
  GET  /                # List all products
  GET  /:id             # Get product by ID
  GET  /featured/list   # Get featured products

/api/services
  GET  /                # List all services
  GET  /:id             # Get service by ID
  GET  /featured/list   # Get featured services

/api/bookings
  POST /                # Create booking (protected)
  GET  /my-bookings     # Get user bookings (protected)

/api/orders
  POST /                # Create order (protected)
  GET  /my-orders       # Get user orders (protected)
```

### Authentication Flow

```
1. User enters phone number → POST /api/auth/send-otp
   ↓
2. Generate 6-digit OTP code
   ↓
3. Store OTP in database (expires in 2 minutes)
   ↓
4. Send SMS via MeliPayamak
   ↓
5. User enters OTP code → POST /api/auth/verify-otp
   ↓
6. Verify OTP from database
   ↓
7. Find or create user
   ↓
8. Generate JWT token (expires in 30 days)
   ↓
9. Return { token, user }
   ↓
10. Frontend stores token in localStorage/cookie
    ↓
11. Include token in Authorization header for protected routes
```

### Middleware Stack

1. **CORS** - Cross-origin resource sharing
2. **Helmet** - Security headers
3. **JWT** - JSON Web Token authentication
4. **Rate Limit** - Prevent abuse (100 req/15min)
5. **Multipart** - File upload support (10MB limit)

### Database Schema (Prisma)

```prisma
User
  - id: String (cuid)
  - phoneNumber: String (unique)
  - name: String?
  - email: String?
  - timestamps

OTP
  - id: String
  - phoneNumber: String
  - code: String
  - expiresAt: DateTime
  - used: Boolean

Product
  - id, name, description
  - price, discountPrice
  - category, images[], stock
  - featured: Boolean

Service
  - id, name, description
  - price, duration (minutes)
  - type, images[]
  - featured: Boolean

Booking
  - id, userId, serviceId
  - date, timeSlot, location
  - carModel, carYear, carColor
  - status, totalPrice

Order
  - id, userId
  - totalPrice, shippingAddress
  - status, paymentStatus

OrderItem
  - id, orderId, productId
  - quantity, price
```

## 🎨 Design System

### Color Palette

```css
/* Background */
--background: #0a0a0a;
--background-secondary: #121212;
--background-tertiary: #1a1a1a;

/* Foreground */
--foreground: #ffffff;
--foreground-secondary: #e0e0e0;
--foreground-muted: #a0a0a0;

/* Primary (Metallic Blue) */
--primary: #00aaff;
--primary-50: #e6f7ff;
--primary-900: #002233;

/* Accent (Racing Red) */
--accent: #ff2d55;
--accent-50: #ffe6eb;
--accent-900: #33050d;
```

### Typography

- **Font Family**: Shabnam-FD (Persian/Farsi)
- **Font Weights**: 400 (Regular), 500 (Medium), 700 (Bold)
- **Direction**: RTL (Right-to-Left)

### Spacing Scale (Tailwind)

```
0.5 → 2px
1   → 4px
2   → 8px
3   → 12px
4   → 16px
6   → 24px
8   → 32px
12  → 48px
16  → 64px
20  → 80px
```

### Animation Guidelines

- **Duration**: 300ms for interactions, 500ms for page elements
- **Easing**: ease-in-out for smooth transitions
- **Hover Effects**: scale(1.05), glow shadows
- **Page Transitions**: fade-in, slide-up with stagger

## 🔒 Security Best Practices

1. **JWT Token**: 30-day expiration, stored in httpOnly cookie
2. **OTP**: 2-minute expiration, one-time use
3. **Rate Limiting**: 100 requests per 15 minutes
4. **CORS**: Whitelist specific origins
5. **Helmet**: Security headers (CSP, XSS protection)
6. **Input Validation**: Zod schemas on backend
7. **SQL Injection**: Prevented by Prisma ORM

## 📱 PWA Configuration

```json
{
  "name": "اتولانژ - AutoLounge",
  "short_name": "اتولانژ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#00aaff",
  "dir": "rtl",
  "lang": "fa"
}
```

### Service Worker Features

- Offline support
- Cache-first strategy for static assets
- Network-first for API calls
- Background sync for bookings/orders

## 🚀 Performance Optimizations

1. **Next.js**: Server-side rendering (SSR) for SEO
2. **Image Optimization**: Next.js Image component with AVIF/WebP
3. **Code Splitting**: Automatic route-based splitting
4. **Lazy Loading**: Dynamic imports for heavy components
5. **Font Optimization**: Variable fonts with font-display: swap
6. **API Caching**: Revalidation strategies (ISR)
7. **Database Indexing**: Prisma indexes on frequently queried fields

## 📊 Monitoring & Logging

- **Frontend**: Console errors, performance metrics
- **Backend**: Pino logger with pretty printing (dev) and JSON (prod)
- **Database**: Prisma query logging in development

## 🔄 CI/CD Pipeline (Recommended)

```yaml
1. Commit → GitHub
2. Run tests (Jest/Vitest)
3. Type check (TypeScript)
4. Lint (ESLint)
5. Build apps (Next.js, Fastify)
6. Run Prisma migrations
7. Deploy to production
```

## 📦 Deployment Strategy

### Frontend (Next.js)

- **Platform**: Vercel, Netlify, or self-hosted
- **Build Command**: `pnpm build:web`
- **Output**: `.next` directory

### Backend (Fastify)

- **Platform**: Railway, Render, or VPS
- **Build Command**: `pnpm build:api`
- **Output**: `dist` directory
- **Process Manager**: PM2 (ecosystem.config.js provided)

### Database

- **Platform**: Railway, Supabase, or managed PostgreSQL
- **Migrations**: `pnpm prisma:migrate`

---

## 🎯 Future Enhancements

1. **Admin Dashboard**: Manage products, services, bookings, orders
2. **Payment Gateway**: Integrate ZarinPal/IDPay for online payments
3. **Real-time Updates**: WebSocket for booking notifications
4. **Analytics**: Track user behavior, conversion rates
5. **Push Notifications**: FCM for booking reminders
6. **Multi-language**: English support alongside Persian
7. **Search & Filters**: Advanced product/service filtering
8. **Wishlist**: Save favorite products
9. **Reviews & Ratings**: Customer feedback system
10. **Loyalty Program**: Points and rewards system

---

Made with ❤️ for AutoLounge (اتولانژ)
