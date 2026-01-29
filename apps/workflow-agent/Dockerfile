FROM node:22-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 python3-pip \
    git curl \
    jq \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Install Modal CLI (use --break-system-packages for Debian compatibility)
RUN pip3 install --break-system-packages modal

# Install Clawdbot (Moltbot) CLI globally
RUN npm install -g clawdbot@latest

# Enable pnpm
RUN corepack enable pnpm

# Set working directory
WORKDIR /app

# Copy root package files (for monorepo workspace)
COPY package.json pnpm-lock.yaml* nx.json tsconfig.base.json ./

# Copy workflow-agent app
COPY apps/workflow-agent/package.json apps/workflow-agent/
COPY apps/workflow-agent/tsconfig.json apps/workflow-agent/

# Copy workflow-deployer scripts (needed for orchestration)
COPY scripts/workflow-deployer scripts/workflow-deployer/
COPY scripts/workflow-analyzer scripts/workflow-analyzer/

# Install dependencies using pnpm (monorepo)
RUN pnpm install --frozen-lockfile

# Copy workflow-agent source (before building)
COPY apps/workflow-agent/src apps/workflow-agent/src/

# Install workflow-agent dependencies specifically (ensure Slack packages are installed)
WORKDIR /app/apps/workflow-agent
RUN npm install

# Build TypeScript
RUN npm run build

# Create directory for Modal CLI config (will be configured at runtime)
RUN mkdir -p /root/.modal

# Expose health check port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run agent (from monorepo root so pnpm commands work)
WORKDIR /app
CMD ["node", "apps/workflow-agent/dist/index.js"]
