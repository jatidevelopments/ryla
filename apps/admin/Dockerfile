# syntax=docker/dockerfile:1

# ============================================
# RYLA Admin Dashboard - Production Dockerfile
# Build from project root: fly deploy --config apps/admin/fly.toml --dockerfile apps/admin/Dockerfile
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

# Skip husky during Docker build
ENV CI=true
ENV HUSKY=0

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
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set as environment variables for Next.js build
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_POSTHOG_HOST=${NEXT_PUBLIC_POSTHOG_HOST}
ENV NEXT_PUBLIC_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Set environment for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NX_DAEMON=false

# Build the admin app with Nx
RUN npx nx build admin --configuration=production --skip-nx-cache

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
# Nx builds Next.js in the source directory (apps/admin/.next), not dist
# The standalone structure:
#   standalone/
#     apps/admin/server.js
#     apps/admin/.next/server/...
#     node_modules/...
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./

# Static files need to be at apps/admin/.next/static (relative to server.js location)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static

# Public files need to be at apps/admin/public (relative to where server.js looks for them)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/public ./apps/admin/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/admin/server.js"]
