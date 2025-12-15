# syntax=docker/dockerfile:1

# ============================================
# RYLA Landing Page - Production Dockerfile
# Build from project root: fly deploy -c fly.landing.toml
# ============================================

FROM node:20-alpine AS base

# Install pnpm and required dependencies
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app

# ============================================
# Dependencies Stage
# ============================================
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# Builder Stage
# ============================================
FROM base AS builder

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

# Copy all source code
COPY . .

# Set environment for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NX_DAEMON=false

# Build the landing app with Nx
RUN npx nx build landing --configuration=production --skip-nx-cache || \
    (echo "Build failed, showing error details:" && cat /app/dist/apps/landing/.next/build-error.log 2>/dev/null; exit 1)

# ============================================
# Runner Stage
# ============================================
FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application from standalone output
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/landing/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/landing/.next/static ./apps/landing/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/landing/public ./apps/landing/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/landing/server.js"]

