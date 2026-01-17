# Redis Usage Audit - All Services Use RedisModule

**Date**: 2026-01-27  
**Status**: ✅ Verified - All services use RedisModule

---

## Summary

✅ **All backend services that use Redis go through RedisModule**

There are **NO services creating their own Redis clients**. All services either:
1. Use `RedisService` (which uses `REDIS_CLIENT` from RedisModule)
2. Inject `REDIS_CLIENT` directly from RedisModule

---

## Services Using Redis

### Direct REDIS_CLIENT Injection

These services inject `REDIS_CLIENT` token directly:

1. **RedisService** (`apps/api/src/modules/redis/services/redis.service.ts`)
   ```typescript
   @Inject(REDIS_CLIENT)
   private readonly redisClient: Redis
   ```

2. **RedisLockService** (`apps/api/src/modules/redis/services/redis-lock.service.ts`)
   ```typescript
   @Inject(REDIS_CLIENT)
   private readonly redisClient: Redis
   ```

3. **RedisLeaderElectionService** (`apps/api/src/modules/redis/services/redis-leader-election.service.ts`)
   ```typescript
   @Inject(REDIS_CLIENT)
   private readonly redisClient: Redis
   ```

4. **ThrottlerModule** (`apps/api/src/modules/throttler/throttler.module.ts`)
   ```typescript
   inject: [ConfigService, REDIS_CLIENT],
   useFactory: async (_, redisClient: Redis) => {
     storage = new ThrottlerStorageRedisService(redisClient);
   }
   ```

5. **ComfyUIJobRunnerAdapter** (`apps/api/src/modules/image/services/comfyui-job-runner.adapter.ts`)
   ```typescript
   @Optional()
   @Inject(REDIS_CLIENT)
   private readonly redisClient?: Redis
   ```

### Using RedisService (which uses REDIS_CLIENT)

These services use `RedisService`, which internally uses `REDIS_CLIENT`:

1. **AuthCacheService** (`apps/api/src/modules/auth/services/auth-cache.service.ts`)
   ```typescript
   @Inject(forwardRef(() => RedisService))
   private readonly redisService: RedisService
   ```

2. **ImageGalleryCacheService** (`apps/api/src/modules/image-gallery/services/image-gallery-cache.service.ts`)
   ```typescript
   constructor(private readonly redisService: RedisService) {}
   ```

3. **CharacterCacheService** (`apps/api/src/modules/character/services/character-cache.service.ts`)
   ```typescript
   @Inject(forwardRef(() => RedisService))
   private readonly redisService: RedisService
   ```

4. **HealthService** (`apps/api/src/modules/health/services/health.service.ts`)
   ```typescript
   private readonly redisService: RedisService
   ```

5. **ImageService** (`apps/api/src/modules/image/services/image.service.ts`)
   ```typescript
   @Inject(forwardRef(() => RedisService))
   private readonly redisService: RedisService
   ```

---

## Redis Client Creation

**Only ONE place creates Redis clients:**

✅ **RedisModule** (`apps/api/src/modules/redis/redis.module.ts`)
- Creates `REDIS_CLIENT` provider
- Configures from `REDIS_URL` or individual env vars
- Handles TLS for Upstash/Fly.io
- Exports `REDIS_CLIENT` token for injection

**No other services create Redis clients directly.**

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│              RedisModule                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Creates: REDIS_CLIENT (single instance)         │  │
│  │  - From REDIS_URL or env vars                    │  │
│  │  - Configured for Fly.io/Upstash (TLS)          │  │
│  └──────────────────────────────────────────────────┘  │
│  Exports:                                               │
│  - REDIS_CLIENT (token)                                │
│  - RedisService                                        │
│  - RedisLockService                                    │
│  - RedisLeaderElectionService                          │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                     │
        ▼                                     ▼
┌───────────────────┐              ┌──────────────────────┐
│ Direct Injection  │              │ Via RedisService    │
│                   │              │                      │
│ - RedisService    │              │ - AuthCacheService   │
│ - RedisLockService│              │ - ImageGalleryCache  │
│ - RedisLeader     │              │ - CharacterCache     │
│ - Throttler       │              │ - HealthService      │
│ - ComfyUIAdapter  │              │ - ImageService       │
└───────────────────┘              └──────────────────────┘
```

---

## Verification

### ✅ All Services Verified

- [x] No services create `new Redis()` except RedisModule
- [x] All services inject `REDIS_CLIENT` or use `RedisService`
- [x] RedisService uses `REDIS_CLIENT` from RedisModule
- [x] Single Redis connection shared across all services
- [x] Works with Fly.io managed Redis (Upstash, TLS)

### ✅ Benefits

1. **Single Connection**: All services share one Redis connection
2. **Consistent Configuration**: All services use same Redis URL/config
3. **Proper DI**: NestJS dependency injection ensures correct lifecycle
4. **Fly.io Compatible**: Works with Fly.io managed Redis automatically
5. **Graceful Degradation**: Services handle Redis unavailability

---

## Conclusion

✅ **Yes, all services that use Redis in the backend use RedisModule**

- **Direct injection**: 5 services inject `REDIS_CLIENT` directly
- **Via RedisService**: 5 services use `RedisService` (which uses `REDIS_CLIENT`)
- **Total**: 10 services using Redis, all through RedisModule
- **No exceptions**: No services create their own Redis clients

**Architecture is correct and consistent.**

---

**Status**: ✅ Verified and Documented
