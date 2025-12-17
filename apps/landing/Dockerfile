# syntax=docker/dockerfile:1

# ============================================
# RYLA Landing Page - Production Dockerfile
# Build from project root: fly deploy --config apps/landing/fly.toml --dockerfile apps/landing/Dockerfile
# ============================================

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS base

# Install pnpm via npm (more reliable than corepack in Docker)
RUN npm install -g pnpm@latest
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
RUN pnpm install --frozen-lockfile --ignore-scripts

# ============================================
# Builder Stage
# ============================================
FROM base AS builder

WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

# Copy all source code
COPY . .

# Build arguments for NEXT_PUBLIC_* variables (required at build time)
ARG NEXT_PUBLIC_CDN_URL
ARG NEXT_PUBLIC_DEBUG_CDN
ARG NEXT_PUBLIC_SITE_URL

# Set as environment variables for Next.js build
ENV NEXT_PUBLIC_CDN_URL=${NEXT_PUBLIC_CDN_URL}
ENV NEXT_PUBLIC_DEBUG_CDN=${NEXT_PUBLIC_DEBUG_CDN}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

# Set environment for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NX_DAEMON=false

# Build the landing app with Nx
RUN npx nx build landing --configuration=production --skip-nx-cache

# ============================================
# Runner Stage
# ============================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application from standalone output
# The standalone structure with outputFileTracingRoot:
#   standalone/
#     apps/landing/server.js
#     dist/apps/landing/.next/server/...
#     node_modules/...
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/landing/.next/standalone ./

# Static files need to be at dist/apps/landing/.next/static (matching the server's expectation)
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/landing/.next/static ./dist/apps/landing/.next/static

# Public files need to be at apps/landing/public (relative to where server.js looks for them)
COPY --from=builder --chown=nextjs:nodejs /app/apps/landing/public ./apps/landing/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/landing/server.js"]
