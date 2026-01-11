FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
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

# Set environment for build
ENV NODE_ENV=production
ENV NX_DAEMON=false

# Build dependencies in order
RUN npx nx build shared --skip-nx-cache && \
    npx nx build data --skip-nx-cache && \
    npx nx build email --skip-nx-cache && \
    npx nx build payments --skip-nx-cache && \
    npx nx build business --skip-nx-cache

# Build the API project
RUN npx nx build api --configuration=production --skip-nx-cache

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy the built application and dependencies
COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/api ./dist/apps/api
COPY --from=builder --chown=nestjs:nodejs /app/dist/libs ./dist/libs
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

# Start the NestJS application
CMD ["node", "dist/apps/api/src/main.js"]

