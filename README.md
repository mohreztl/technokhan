# AutoLounge (اتولانژ) - Premium Automotive Care Platform

A luxury web application for AutoLounge, specializing in paint restoration (detailing), car wraps, and detailing supplies.

## 🚀 Tech Stack

### Frontend

- **Next.js 15** (App Router) - React framework with SSR
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **PWA** - Progressive Web App support

### Backend

- **Fastify** - High-performance Node.js API
- **Prisma** - Modern ORM for PostgreSQL
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **MeliPayamak** - Iranian SMS gateway for OTP

## 📁 Project Structure

```
autolounge/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Fastify backend API
├── packages/
│   └── shared/       # Shared types, utilities, and constants
├── pnpm-workspace.yaml
└── package.json
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and pnpm 8+
- PostgreSQL database
- MeliPayamak account (for SMS)

**OR use Docker (Recommended):**

- Docker & Docker Compose
- See [DOCKER.md](./DOCKER.md) for Docker setup

### Local Development Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Setup Backend

```bash
cd apps/api
cp .env.example .env
# Edit .env with your configuration

# Setup database
pnpm prisma:generate
pnpm prisma:migrate
```

### 3. Setup Frontend

```bash
cd apps/web
# Create .env.local if needed
```

### 4. Run Development Servers

```bash
# From root directory - run both apps
pnpm dev

# Or run individually
pnpm dev:web   # Frontend on port 3000
pnpm dev:api   # Backend on port 5000
```

## 🐳 Docker Deployment

For Docker-based deployment, see the comprehensive guide: [DOCKER.md](./DOCKER.md)

### Quick Start with Docker

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Then start all services
docker-compose up -d
```

**Using PowerShell (Windows):**

```powershell
.\docker.ps1 up
```

Access the application:
- Web: http://localhost:3000
- API: http://localhost:5000

For more Docker commands and troubleshooting, see [DOCKER.md](./DOCKER.md).

## 🎨 Design System

### Colors

- **Background**: Deep blacks (#0a0a0a, #121212)
- **Primary**: Metallic Blue (#00aaff)
- **Accent**: Racing Red (#ff2d55)
- **Text**: White/Gray scale

### Typography

- **Font**: Shabnam-FD (Persian/Farsi font)
- **Direction**: RTL (Right-to-Left)

## 📱 Features

- ✅ **E-commerce**: Sell professional detailing products
- ✅ **Service Booking**: Advanced booking system
- ✅ **OTP Authentication**: SMS-based login
- ✅ **PWA**: Progressive Web App
- ✅ **SEO Optimized**: Server-side rendering
- ✅ **Responsive**: Mobile-first design
- ✅ **Dark Theme**: Luxury automotive aesthetics

## 🔐 Authentication

Using OTP-based authentication with MeliPayamak:

1. User enters phone number
2. Receives 6-digit OTP via SMS
3. Verifies OTP and gets JWT token
4. Token valid for 30 days

## 📦 Available Scripts

```bash
# Development
pnpm dev              # Run all apps
pnpm dev:web          # Run frontend only
pnpm dev:api          # Run backend only

# Build
pnpm build            # Build all apps
pnpm build:web        # Build frontend
pnpm build:api        # Build backend

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio

# Code Quality
pnpm lint             # Lint all apps
pnpm type-check       # Type check all apps
```

## 🌐 Environment Variables

### Backend (.env)

```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
MELIPAYAMAK_USERNAME="..."
MELIPAYAMAK_PASSWORD="..."
MELIPAYAMAK_FROM="..."
PORT=5000
ALLOWED_ORIGINS="http://localhost:3000"
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

mohreztl

---

Made with ❤️ for AutoLounge (اتولانژ)
