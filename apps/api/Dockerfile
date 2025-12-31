# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy packages
COPY packages ./packages

# Copy API application
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
WORKDIR /app/apps/api
RUN pnpm prisma:generate

# Build the API
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy packages
COPY packages ./packages

# Copy API application
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Generate Prisma Client in production
WORKDIR /app/apps/api
RUN pnpm prisma:generate

# Copy built application from builder
COPY --from=builder /app/apps/api/dist ./dist

# Expose API port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Run migrations and start the server
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/server.js"]
