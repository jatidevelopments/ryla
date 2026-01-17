# Redis Access Architecture

**Last Updated**: 2026-01-27

---

## Overview

RYLA uses Fly.io's managed Redis (Upstash Redis) for:
- Caching (API app)
- Job queues (API app)
- **Job persistence** (EP-040 - ComfyUI workflows)

---

## Redis Service Setup

### Fly.io Managed Redis

**Production Redis**: `ryla-redis-prod` (region: `fra`)

```bash
# Create Redis instance
flyctl redis create --name ryla-redis-prod --region fra --plan free

# Attach to API app (automatically sets REDIS_URL)
flyctl redis attach ryla-redis-prod --app ryla-api-prod
```

**Note**: Attaching Redis to an app automatically sets the `REDIS_URL` environment variable as a secret.

---

## Redis Access by App

### API App (`apps/api`) ✅

**Redis Access**: ✅ **Full Access**

- Redis is **attached** to the API app
- `REDIS_URL` is automatically set when attaching
- Uses `RedisModule` (NestJS) for dependency injection
- All Redis services available:
  - `RedisService` (general operations)
  - `RedisLockService` (distributed locks)
  - `RedisLeaderElectionService` (leader election)
  - **`ComfyUIJobPersistenceService`** (EP-040 - job state)

**Usage**:
- ComfyUI job persistence (EP-040)
- Caching
- Job queues
- Distributed locks

### Web App (`apps/web`) ❌

**Redis Access**: ❌ **No Access**

- Next.js frontend app
- Runs in browser + server-side rendering
- **Does NOT have Redis access**
- Does NOT use `ComfyUIJobRunner` directly
- Communicates with API via tRPC/HTTP

**Note**: Web app doesn't need Redis - it calls API endpoints that use Redis.

### Landing App (`apps/landing`) ❌

**Redis Access**: ❌ **No Access**

- Static/SSG Next.js app
- No backend services
- Does NOT need Redis

### Funnel App (`apps/funnel`) ❌

**Redis Access**: ❌ **No Access**

- Next.js app for payment funnel
- No backend services
- Does NOT need Redis

---

## ComfyUI Job Persistence (EP-040)

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              API App (apps/api)                         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ComfyUIJobRunnerAdapter                        │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │  Injects REDIS_CLIENT from RedisModule    │  │  │
│  │  │  Creates ComfyUIJobPersistenceService     │  │  │
│  │  │  Passes to ComfyUIJobRunner               │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  RedisModule (NestJS)                           │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │  REDIS_CLIENT (injected)                 │  │  │
│  │  │  - Created from REDIS_URL                │  │  │
│  │  │  - Configured for Fly.io/Upstash         │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         Fly.io Managed Redis (ryla-redis-prod)          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Upstash Redis (TLS)                            │  │
│  │  - Key: comfyui:job:{promptId}                  │  │
│  │  - TTL: 7200 seconds (2 hours)                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Implementation Details

**ComfyUIJobRunnerAdapter** (API app):
- Injects `REDIS_CLIENT` from `RedisModule`
- Creates `ComfyUIJobPersistenceService` with injected Redis client
- Passes persistence service to `ComfyUIJobRunner`

**Benefits**:
- ✅ Reuses existing Redis connection from API's RedisModule
- ✅ No duplicate Redis clients
- ✅ Proper dependency injection
- ✅ Works with Fly.io managed Redis

---

## Environment Variables

### API App (Production)

```bash
# Automatically set when attaching Redis
REDIS_URL=rediss://default:password@ryla-redis-prod.upstash.io:6379

# OR manually set (if not using attachment)
REDIS_HOST=ryla-redis-prod.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=password
REDIS_ENVIRONMENT=production
```

### Local Development

```bash
# Docker Compose Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_ENVIRONMENT=local

# OR use REDIS_URL
REDIS_URL=redis://localhost:6379
```

---

## Verification

### Check Redis Access in API App

```bash
# SSH into API app
flyctl ssh console -a ryla-api-prod

# Check Redis connection
echo $REDIS_URL

# Test Redis (if redis-cli available)
redis-cli -u $REDIS_URL ping
```

### Check Redis Status

```bash
# View Redis instance status
flyctl redis status ryla-redis-prod

# List attached apps
flyctl redis list
```

---

## Important Notes

1. **Only API App Has Redis Access**
   - Redis is only attached to `ryla-api-prod`
   - Other apps (web, landing, funnel) don't need Redis
   - They communicate with API via HTTP/tRPC

2. **Shared Redis Instance**
   - All services in API app share the same Redis instance
   - Uses same `REDIS_URL` environment variable
   - No separate Redis instances needed

3. **Graceful Degradation**
   - `ComfyUIJobPersistenceService` checks Redis availability
   - If Redis unavailable, job persistence is disabled
   - Jobs still work, just without persistence/recovery

4. **Fly.io Managed Redis**
   - Uses Upstash Redis (TLS required)
   - Free tier suitable for MVP
   - Automatically handles connection pooling

---

## Troubleshooting

### Redis Not Available

**Symptoms**:
- `Redis not available, job persistence disabled` in logs
- Jobs work but don't persist/recover

**Solutions**:
1. Verify Redis is attached: `flyctl redis list`
2. Check `REDIS_URL` is set: `flyctl secrets list --app ryla-api-prod | grep REDIS`
3. Re-attach Redis: `flyctl redis attach ryla-redis-prod --app ryla-api-prod`

### Connection Errors

**Symptoms**:
- Redis connection timeout
- TLS errors

**Solutions**:
1. Verify Redis URL format: `rediss://` (TLS) or `redis://` (no TLS)
2. Check Upstash requires TLS: `rediss://default:password@host:6379`
3. Verify password is correct

---

**Status**: ✅ Redis architecture verified and documented
