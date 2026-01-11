# RYLA Backend API

<!-- Last updated: 2025-01-11 - Testing auto-deploy workflow -->

## ✅ Local Services Status

**PostgreSQL**: ✅ Running on port 5432 (PID: 4936)  
**Redis**: ✅ Running on port 6379 (Version: 7.2.6)  
**Database**: ✅ `ryla` database exists

## Quick Start

### 1. Environment Setup

The `.env` file has been created with local defaults. Verify it exists:
```bash
cat apps/api/.env
```

### 2. Run Database Migrations

```bash
# Generate migrations from Drizzle schemas
pnpm db:generate

# Run migrations (or use db:push for dev)
pnpm db:push
```

### 3. Start Backend

```bash
# Development mode (with watch)
nx serve api

# Or build and run
nx build api
node dist/apps/api/main.js
```

### 4. Verify Backend

```bash
# Health check
curl http://localhost:3001/health

# Database check
curl http://localhost:3001/database-check

# Swagger docs (requires auth: admin/admin)
open http://localhost:3001/docs
```

## Local Development Setup Guide

## Environment Setup

### 1. Create Backend Environment File

Copy the example env file:
```bash
cp apps/api/.env.example apps/api/.env
```

### 2. Configure Environment Variables

Edit `apps/api/.env` with your local settings:

```bash
# Database (already configured for local)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=admin  # Your PostgreSQL username
POSTGRES_PASSWORD=   # Your PostgreSQL password (if set)
POSTGRES_DB=ryla
POSTGRES_ENVIRONMENT=local

# Redis (already configured for local)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=      # Usually empty for local
REDIS_ENVIRONMENT=local

# JWT Secrets (generate secure random strings)
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-in-production
```

### 3. Generate JWT Secrets

You can generate secure secrets using:
```bash
# Generate random secrets
openssl rand -base64 32
```

### 4. Create Database (if not exists)

```bash
# Using psql
psql -U $(whoami) -d postgres -c "CREATE DATABASE ryla;"

# Or using createdb
createdb ryla
```

### 5. Run Migrations

Once environment is configured:
```bash
# Generate migrations from schemas
pnpm db:generate

# Run migrations
pnpm db:migrate

# Or use push for development (auto-syncs)
pnpm db:push
```

### 6. Start Backend

```bash
# Build and serve
nx serve api

# Or build first
nx build api
node dist/apps/api/main.js
```

## Verification

### Check Database Connection
```bash
psql -U $(whoami) -d ryla -c "SELECT version();"
```

### Check Redis Connection
```bash
redis-cli ping
# Should return: PONG
```

### Test Backend Health
```bash
curl http://localhost:3001/health
# Should return: ok, application is working fine!!!

curl http://localhost:3001/database-check
# Should return database health status
```

## Troubleshooting

### PostgreSQL Connection Issues
- Check if PostgreSQL is running: `lsof -i :5432`
- Verify user permissions: `psql -U $(whoami) -l`
- Check password: Update `POSTGRES_PASSWORD` in `.env`

### Redis Connection Issues
- Check if Redis is running: `lsof -i :6379`
- Test connection: `redis-cli ping`
- Check password: Update `REDIS_PASSWORD` in `.env` if required

### Database Not Found
- Create database: `createdb ryla`
- Or via psql: `psql -U $(whoami) -d postgres -c "CREATE DATABASE ryla;"`

## Next Steps

1. ✅ Environment configured
2. ⏳ Run migrations: `pnpm db:generate && pnpm db:migrate`
3. ⏳ Start backend: `nx serve api`
4. ⏳ Test endpoints via Swagger: `http://localhost:3001/api`
