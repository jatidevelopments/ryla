# Declare build args at the top level for use across stages
# GHCR_IMAGE is used to extract assets from a Docker image
# If not set or empty, we'll skip the ghcr-assets stage
ARG GHCR_IMAGE

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# Install docker-cli for extracting assets from ghcr image
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

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install docker-cli for extracting assets from ghcr image
RUN apk add --no-cache docker-cli

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
# GHCR_IMAGE build arg must be set and image must be available
# CI/CD pulls the image and passes GHCR_IMAGE before building
# We use a RUN command to conditionally extract assets since FROM can't be conditional
ARG GHCR_IMAGE
RUN if [ -n "$GHCR_IMAGE" ]; then \
      echo "========================================="; \
      echo "Extracting assets from $GHCR_IMAGE"; \
      echo "========================================="; \
      # Check if image exists locally first
      if docker image inspect "$GHCR_IMAGE" >/dev/null 2>&1; then \
        echo "Image $GHCR_IMAGE found locally"; \
        # Create a temporary container to extract files
        CONTAINER_ID=$(docker create "$GHCR_IMAGE" 2>/dev/null || echo ""); \
        if [ -n "$CONTAINER_ID" ]; then \
          echo "Created container: $CONTAINER_ID"; \
          # Try /public first, then /assets, then root
          for SOURCE_PATH in "/public" "/assets" "/"; do \
            echo "Trying to extract from $SOURCE_PATH"; \
            docker cp "$CONTAINER_ID:$SOURCE_PATH" ./apps/web/public-temp/ 2>/dev/null && break || true; \
          done; \
          if [ -d "./apps/web/public-temp" ]; then \
            echo "Contents of public-temp:"; \
            ls -la ./apps/web/public-temp/ || true; \
            if [ "$(ls -A ./apps/web/public-temp 2>/dev/null)" ]; then \
              echo "Copying files to apps/web/public/"; \
              cp -r ./apps/web/public-temp/* ./apps/web/public/ 2>/dev/null || true; \
              echo "Files in apps/web/public after copy:"; \
              ls -la ./apps/web/public/ | head -20 || true; \
              echo "Assets extracted successfully from $GHCR_IMAGE"; \
            else \
              echo "Warning: public-temp directory is empty"; \
            fi; \
            rm -rf ./apps/web/public-temp; \
          else \
            echo "Warning: Could not create public-temp directory"; \
          fi; \
          docker rm "$CONTAINER_ID" 2>/dev/null || true; \
        else \
          echo "Warning: Could not create container from $GHCR_IMAGE"; \
        fi; \
      else \
        echo "Warning: Image $GHCR_IMAGE not found locally, trying to pull..."; \
        docker pull "$GHCR_IMAGE" 2>/dev/null || echo "Could not pull image, using default public folder"; \
      fi; \
    else \
      echo "GHCR_IMAGE not set, using default public folder"; \
    fi && \
    echo "========================================="; \
    echo "Final public folder contents:"; \
    echo "========================================="; \
    ls -la ./apps/web/public/ | head -30 || true

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]
