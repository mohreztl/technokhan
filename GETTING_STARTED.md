# Getting Started with AutoLounge

This guide will help you set up and run the AutoLounge application on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm** 8.0.0 or higher ([Install guide](https://pnpm.io/installation))
- **PostgreSQL** 14 or higher ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

### Optional
- **Docker** (for containerized PostgreSQL)
- **VS Code** with recommended extensions

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/mohreztl/autolounge.git
cd autolounge
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for all workspaces (web, api, shared).

### 3. Set Up Database

#### Option A: Local PostgreSQL

Create a new database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE autolounge;

# Exit psql
\q
```

#### Option B: Docker PostgreSQL

```bash
docker run --name autolounge-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=autolounge \
  -p 5432:5432 \
  -d postgres:16
```

### 4. Configure Environment Variables

#### Backend (.env)

```bash
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/autolounge?schema=public"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# MeliPayamak SMS Gateway
# Sign up at https://www.melipayamak.com/ to get credentials
MELIPAYAMAK_USERNAME="your-username"
MELIPAYAMAK_PASSWORD="your-password"
MELIPAYAMAK_FROM="your-sender-number"

# Server
PORT=3001
NODE_ENV=development

# CORS (add your frontend URL)
ALLOWED_ORIGINS="http://localhost:3000"
```

#### Frontend (.env.local)

```bash
cd apps/web
cp .env.local.example .env.local
```

Edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Set Up Prisma

Generate Prisma client and run migrations:

```bash
cd apps/api

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# (Optional) Seed database with sample data
# Create apps/api/prisma/seed.ts first, then:
# pnpm prisma db seed
```

### 6. Run Development Servers

#### Option A: Run Both Apps Simultaneously (Recommended)

From the root directory:

```bash
pnpm dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

#### Option B: Run Apps Separately

Terminal 1 (Frontend):
```bash
pnpm dev:web
```

Terminal 2 (Backend):
```bash
pnpm dev:api
```

### 7. Verify Installation

1. **Frontend**: Open http://localhost:3000 in your browser
   - You should see the AutoLounge landing page
   
2. **Backend**: Open http://localhost:3001/health in your browser
   - You should see: `{"status":"ok","timestamp":"..."}`

3. **Database**: Check Prisma Studio
   ```bash
   cd apps/api
   pnpm prisma:studio
   ```
   - Opens at http://localhost:5555

## 🎨 Development Workflow

### Adding New Components

```bash
# Create a new component in apps/web/src/components/
cd apps/web/src/components/ui

# Example: Create a new Badge component
touch badge.tsx
```

### Adding New API Routes

```bash
# Create a new route in apps/api/src/routes/
cd apps/api/src/routes

# Example: Create a reviews route
touch reviews.ts
```

Then register it in `apps/api/src/server.ts`:

```typescript
import { reviewRoutes } from './routes/reviews';

// In registerRoutes()
await fastify.register(reviewRoutes, { prefix: '/api/reviews' });
```

### Modifying Database Schema

1. Edit `apps/api/prisma/schema.prisma`
2. Create and apply migration:
   ```bash
   cd apps/api
   pnpm prisma migrate dev --name your_migration_name
   ```

### Adding Shared Types

```bash
# Edit packages/shared/src/types/index.ts
cd packages/shared/src/types

# TypeScript types will be available in both web and api
```

## 🔧 Common Tasks

### Check for Type Errors

```bash
# Check all apps
pnpm type-check

# Check specific app
pnpm --filter web type-check
pnpm --filter api type-check
```

### Lint Code

```bash
# Lint all apps
pnpm lint

# Lint specific app
pnpm --filter web lint
```

### Build for Production

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build:web
pnpm build:api
```

### Reset Database

```bash
cd apps/api

# Reset database (⚠️ Deletes all data)
pnpm prisma migrate reset

# Re-generate client and run migrations
pnpm prisma:generate
pnpm prisma:migrate
```

### View Database

```bash
cd apps/api
pnpm prisma:studio
```

Opens Prisma Studio at http://localhost:5555 for visual database management.

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

Or change the port in your environment variables.

### Issue: Database Connection Failed

**Error**: `Can't reach database server at localhost:5432`

**Solution**:
1. Check if PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   
   # Docker
   docker ps
   ```

2. Verify DATABASE_URL in `.env`
3. Test connection:
   ```bash
   psql -U postgres -h localhost -p 5432
   ```

### Issue: Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
cd apps/api
pnpm prisma:generate
```

### Issue: MeliPayamak SMS Not Sending

**Error**: SMS not received during OTP

**Solution**:
1. Check credentials in `.env`
2. In development, OTP codes are logged to console:
   ```
   📱 DEV MODE - OTP for 09123456789: 123456
   ```
3. Use the logged code to test authentication

### Issue: CORS Error

**Error**: `Access to fetch has been blocked by CORS policy`

**Solution**:
1. Check `ALLOWED_ORIGINS` in `apps/api/.env`
2. Ensure frontend URL is included:
   ```env
   ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
   ```

### Issue: Next.js Build Fails

**Error**: Type errors during build

**Solution**:
```bash
cd apps/web

# Check for type errors
pnpm type-check

# Fix errors and rebuild
pnpm build
```

## 📚 Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Fastify Docs](https://www.fastify.io/docs/latest/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)

### Project Documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture overview
- [README.md](./README.md) - Project overview and quick start

### VS Code Extensions (Recommended)

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "streetsidesoftware.code-spell-checker",
    "usernamehw.errorlens"
  ]
}
```

Save this as `.vscode/extensions.json` in the project root.

## 🎯 Next Steps

Once you have the app running:

1. **Explore the Landing Page**: Check out the hero section, services, and products
2. **Test Authentication**: Try the OTP login flow
3. **Browse Code**: Navigate through the component structure
4. **Make Changes**: Try modifying colors, text, or adding new features
5. **Check Database**: Use Prisma Studio to view data

## 💡 Tips

- Use `pnpm dev` to run both apps for the best development experience
- Keep Prisma Studio open to monitor database changes
- Check console logs for OTP codes in development mode
- Use React DevTools to inspect component state
- Enable "Preserve log" in browser DevTools to see all network requests

## 🤝 Need Help?

If you encounter any issues:

1. Check this guide's Troubleshooting section
2. Review the [ARCHITECTURE.md](./ARCHITECTURE.md) file
3. Check existing issues in the repository
4. Create a new issue with detailed information

---

Happy coding! 🚀

Made with ❤️ for AutoLounge (اتولانژ)
