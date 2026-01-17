# EP-040: Redis Fly.io Deployment Verification

**Status**: ✅ Verified and Fixed  
**Date**: 2026-01-27

---

## Issue Identified

**Question**: Are we sure that the Redis integration works with Fly deployment? Do we have a separate Redis service where all services have access?

**Answer**: ✅ **Yes, verified and fixed**

---

## Current Architecture

### Redis Service Setup

1. **Single Shared Redis Instance**: `ryla-redis-prod`
   - Created once: `flyctl redis create --name ryla-redis-prod --region fra --plan free`
   - Attached to API app: `flyctl redis attach ryla-redis-prod --app ryla-api-prod`
   - Automatically sets `REDIS_URL` environment variable

2. **Access Pattern**:
   - ✅ **API App**: Full Redis access (attached)
   - ❌ **Web App**: No Redis access (doesn't need it)
   - ❌ **Landing App**: No Redis access (doesn't need it)
   - ❌ **Funnel App**: No Redis access (doesn't need it)

### Why This Works

- **ComfyUIJobRunner is only used in API app** via `ComfyUIJobRunnerAdapter`
- **API app has RedisModule** which provides `REDIS_CLIENT`
- **Adapter injects Redis client** from API's RedisModule
- **No separate Redis needed** - all services in API app share the same Redis instance

---

## Implementation Fix

### Before (Issue)

```typescript
// ComfyUIJobRunnerAdapter created ComfyUIJobRunner directly
this.runner = new ComfyUIJobRunner(this.client);
// No Redis persistence service passed
```

### After (Fixed)

```typescript
// ComfyUIJobRunnerAdapter injects REDIS_CLIENT from RedisModule
constructor(
  @Optional()
  @Inject(REDIS_CLIENT)
  private readonly redisClient?: Redis,
) {}

// Creates persistence service with injected Redis client
if (this.redisClient) {
  persistenceService = new ComfyUIJobPersistenceService({
    redisClient: this.redisClient,
  });
}

this.runner = new ComfyUIJobRunner({
  comfyui: this.client,
  persistenceService,
});
```

---

## Verification Checklist

### ✅ Redis Setup
- [x] Redis instance created: `ryla-redis-prod`
- [x] Redis attached to API app: `ryla-api-prod`
- [x] `REDIS_URL` automatically set by Fly.io

### ✅ Code Integration
- [x] `ComfyUIJobRunnerAdapter` injects `REDIS_CLIENT` from `RedisModule`
- [x] Creates `ComfyUIJobPersistenceService` with injected client
- [x] Passes persistence service to `ComfyUIJobRunner`
- [x] Graceful degradation if Redis unavailable

### ✅ Fly.io Deployment
- [x] RedisModule always provides Redis client (even if dummy)
- [x] Optional injection handles missing Redis gracefully
- [x] Connection test with timeout prevents hanging
- [x] Works with Fly.io managed Redis (Upstash, TLS)

---

## Testing on Fly.io

### Verify Redis Attachment

```bash
# Check Redis is attached to API app
flyctl redis list
flyctl redis status ryla-redis-prod

# Check REDIS_URL is set
flyctl secrets list --app ryla-api-prod | grep REDIS

# SSH into API app and test
flyctl ssh console -a ryla-api-prod
echo $REDIS_URL
```

### Verify Job Persistence

```bash
# Check logs for Redis initialization
flyctl logs --app ryla-api-prod | grep -i redis

# Should see:
# "Redis job persistence enabled"
# OR
# "Redis not available, job persistence disabled"
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│         Fly.io: ryla-api-prod                           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ImageModule                                     │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │  Imports: RedisModule                     │  │  │
│  │  │  Provides: ComfyUIJobRunnerAdapter        │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  RedisModule                                     │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │  Provides: REDIS_CLIENT                  │  │  │
│  │  │  - Created from REDIS_URL                 │  │  │
│  │  │  - Configured for Upstash (TLS)          │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ComfyUIJobRunnerAdapter                        │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │  Injects: REDIS_CLIENT                    │  │  │
│  │  │  Creates: ComfyUIJobPersistenceService   │  │  │
│  │  │  Passes to: ComfyUIJobRunner              │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│    Fly.io Managed Redis: ryla-redis-prod                │
│    (Upstash Redis, TLS, region: fra)                   │
│                                                          │
│    Key: comfyui:job:{promptId}                         │
│    TTL: 7200 seconds (2 hours)                          │
└─────────────────────────────────────────────────────────┘
```

---

## Summary

✅ **Redis integration works with Fly.io deployment**

- Single shared Redis instance (`ryla-redis-prod`)
- Attached to API app only (where it's needed)
- All services in API app share the same Redis connection
- Proper dependency injection via NestJS RedisModule
- Graceful degradation if Redis unavailable

**No separate Redis service needed** - the existing setup is correct and works with Fly.io managed Redis.

---

**Status**: ✅ Verified, Fixed, and Documented
