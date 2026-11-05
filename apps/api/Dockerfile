# syntax=docker/dockerfile:1
# AutoLounge API — build context is the repository root (pnpm workspace)

FROM node:22-alpine AS base
# Node 22 resolves AAAA first; on hosts with no IPv6 route every request stalls.
ENV NODE_OPTIONS=--dns-result-order=ipv4first
RUN apk add --no-cache libc6-compat openssl \
  && corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app

# ---------------------------------------------------------------------------
# Builder: install all deps, build shared, generate the Prisma client, compile
# ---------------------------------------------------------------------------
FROM base AS builder

# Workspace manifests first so the install layer is cached; every workspace
# package.json must be present for --frozen-lockfile to match pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile --filter api... --filter @technokhan/shared

# Sources
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN pnpm --filter @technokhan/shared build
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

# ---------------------------------------------------------------------------
# Runner: production deps only (prisma + tsx are runtime deps for migrate/seed)
# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile --prod --filter api... --filter @technokhan/shared

# Built shared package (consumed from dist by the API and the seed script)
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
# Prisma schema, migrations and seed, plus the config file that now carries the
# connection string — `prisma migrate deploy` refuses to run without it
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/prisma.config.ts ./apps/api/prisma.config.ts
# Compiled API
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
RUN pnpm exec prisma generate

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1))"

# Apply migrations, seed when SEED_ON_START=true, then start
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && if [ \"$SEED_ON_START\" = \"true\" ]; then pnpm exec prisma db seed; fi && node dist/server.js"]
