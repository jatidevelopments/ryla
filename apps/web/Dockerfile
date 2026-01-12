FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat docker-cli
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY nx.json tsconfig.base.json ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/nx.json ./nx.json
COPY --from=deps /app/tsconfig.base.json ./tsconfig.base.json
COPY . .

# Build arguments for NEXT_PUBLIC_* variables (required at build time for Next.js)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set as environment variables for Next.js build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY}
ENV NEXT_PUBLIC_POSTHOG_HOST=${NEXT_PUBLIC_POSTHOG_HOST}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Set environment for build
ENV NODE_ENV=production
ENV NX_DAEMON=false
ENV NEXT_TELEMETRY_DISABLED=1

# Build dependencies first (required for TypeScript resolution)
# Build order: shared -> data -> analytics -> email -> business -> payments -> ui -> trpc
RUN npx nx build shared --skip-nx-cache && \
    npx nx build data --skip-nx-cache && \
    npx nx build analytics --skip-nx-cache && \
    npx nx build email --skip-nx-cache && \
    npx nx build business --skip-nx-cache && \
    npx nx build payments --skip-nx-cache && \
    npx nx build ui --skip-nx-cache && \
    npx nx build trpc --skip-nx-cache

# Build the project
RUN npx nx build web --configuration=production --skip-nx-cache

# Extract and copy images from ghcr Docker image if available
# Create a stage that references the ghcr image (only if GHCR_IMAGE is set)
# This stage will fail if GHCR_IMAGE is empty, so we need to handle that
ARG GHCR_IMAGE
# Create an intermediate stage from the ghcr image
# This will only work if GHCR_IMAGE is set and the image exists
# If GHCR_IMAGE is empty, this FROM will fail, so we make it conditional
FROM ${GHCR_IMAGE} AS ghcr-assets
FROM scratch
COPY --from=ghcr-assets /public /public

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
# With outputFileTracingRoot, the standalone structure is:
#   standalone/
#     apps/web/server.js
#     apps/web/.next/server/...
#     node_modules/...
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# Copy static files to the expected location
# Static files must be at apps/web/.next/static (relative to server.js location)
# The standalone build does NOT include static files, they must be copied separately
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Copy public files
# Public files should be at apps/web/public (relative to server.js location)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Extract and copy images from ghcr Docker image if available
# This uses COPY --from to extract assets from a Docker image in GitHub Container Registry
# The image should contain assets in a /public directory
# CI/CD will pull the image before building and pass it as GHCR_IMAGE build arg
ARG GHCR_IMAGE
# Copy assets from ghcr image if provided (overwrites existing files)
# The image should have assets at /public directory
# Note: COPY --from requires the image/stage to exist
# CI/CD ensures GHCR_IMAGE is set and image is pulled for web app builds
# If GHCR_IMAGE is not set, this COPY will fail, so we make it conditional
# Solution: Use a multi-stage build with a conditional stage name
# We'll create an intermediate stage that conditionally references the ghcr image
FROM ${GHCR_IMAGE} AS ghcr-assets
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
# With outputFileTracingRoot, the standalone structure is:
#   standalone/
#     apps/web/server.js
#     apps/web/.next/server/...
#     node_modules/...
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# Copy static files to the expected location
# Static files must be at apps/web/.next/static (relative to server.js location)
# The standalone build does NOT include static files, they must be copied separately
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Copy public files
# Public files should be at apps/web/public (relative to server.js location)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Extract and copy images from ghcr Docker image if available
# Copy from the ghcr-assets stage (which references the ghcr image)
# This will only work if GHCR_IMAGE is set and the image exists
COPY --from=ghcr-assets /public ./apps/web/public/ || echo "Note: ghcr assets not available, using default public folder"

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]
