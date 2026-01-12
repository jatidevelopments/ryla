FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
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
# Note: Assets from ghcr image are extracted in CI/CD before build
# The extracted assets are included in the build context via apps/web/public/
# This ensures assets are available even in remote build contexts (like Depot)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]
