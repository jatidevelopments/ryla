# MDC → RYLA Backend Copy Guide

## Overview

This document outlines what backend components, patterns, and code can be copied from the MDC backend to accelerate RYLA MVP development.

**Source**: `/Users/admin/Documents/Projects/MDC/mdc-backend`
**Target**: `/Users/admin/Documents/Projects/RYLA/apps/api` + `/Users/admin/Documents/Projects/RYLA/libs/`

**Decision**: See [ADR-001: Database Architecture](../decisions/ADR-001-database-architecture.md)

**Estimated Time Savings**: 3-4 weeks → ~1 week

---

## Architecture Comparison

| Aspect | MDC | RYLA |
|--------|-----|------|
| Framework | NestJS | NestJS (same) |
| ORM | TypeORM | TypeORM (same) |
| Database | PostgreSQL | PostgreSQL (same) |
| Auth | JWT + OAuth (Google, Discord, Twitter) | JWT only (email/password) |
| Storage | AWS S3 | AWS S3 or Supabase Storage |
| Payments | Stripe, PayPal, TrustPay, Shift4 | Finby only |
| Queues | Bull + Redis | Optional (simplify) |
| Entities | ~40+ | ~10-15 (simplified) |

---

## Copy Priority

| Priority | Category | Files | Time Saved |
|----------|----------|-------|------------|
| P0 | NestJS Project Structure | Config, setup | 1-2 days |
| P0 | Core Entities | User, Character, Image | 2-3 days |
| P0 | Auth Module | JWT auth, guards | 2-3 days |
| P0 | Character Module | CRUD, validation | 2-3 days |
| P1 | Image Module | Storage, metadata | 1-2 days |
| P1 | User Module | Profile management | 1 day |
| P2 | Repository Pattern | Base repository | 1 day |

---

## P0: Project Structure

### Source Files

```
MDC/mdc-backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── modules/app.module.ts      # Root module
│   ├── config/configuration.ts    # Config loading
│   └── common/
│       ├── http/global-exception.filter.ts
│       └── interceptors/logger.interceptor.ts
├── ormconfig.ts                   # TypeORM config
├── docker-compose.local.yaml      # Local dev
├── Dockerfile                     # Production build
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### Copy Steps

```bash
# 1. Copy config structure
mkdir -p RYLA/apps/api/src/config
cp MDC/mdc-backend/src/config/configuration.ts \
   RYLA/apps/api/src/config/

# 2. Copy common utilities
mkdir -p RYLA/apps/api/src/common
cp -r MDC/mdc-backend/src/common/http \
      RYLA/apps/api/src/common/
cp -r MDC/mdc-backend/src/common/interceptors \
      RYLA/apps/api/src/common/

# 3. Copy TypeORM config
cp MDC/mdc-backend/ormconfig.ts \
   RYLA/apps/api/

# 4. Copy Docker setup
cp MDC/mdc-backend/docker-compose.local.yaml \
   RYLA/apps/api/
cp MDC/mdc-backend/Dockerfile \
   RYLA/apps/api/
```

### Adaptation Required

```typescript
// configuration.ts - Update env var names
export default () => ({
  postgres: {
    host: process.env.RYLA_DB_HOST || 'localhost',
    port: parseInt(process.env.RYLA_DB_PORT || '5432'),
    user: process.env.RYLA_DB_USER || 'ryla',
    password: process.env.RYLA_DB_PASSWORD || '',
    dbName: process.env.RYLA_DB_NAME || 'ryla',
  },
  jwt: {
    secret: process.env.RYLA_JWT_SECRET,
    accessExpiresIn: process.env.RYLA_JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresIn: process.env.RYLA_JWT_REFRESH_EXPIRES || '7d',
  },
  // Remove: stripe, paypal, trustpay, shift4
  // Add: finby
  finby: {
    apiKey: process.env.FINBY_API_KEY,
    merchantId: process.env.FINBY_MERCHANT_ID,
    webhookSecret: process.env.FINBY_WEBHOOK_SECRET,
  },
});
```

---

## P0: Core Entities

### Source Files

```
MDC/mdc-backend/src/database/entities/
├── user.entity.ts           # ✅ Copy & simplify
├── character.entity.ts      # ✅ Copy & adapt
├── image.entity.ts          # ✅ Copy
├── session.entity.ts        # ✅ Copy
├── refresh-token.entity.ts  # ✅ Copy
├── models/base.model.ts     # ✅ Copy
└── enums/                   # ✅ Copy relevant enums
```

### User Entity

```typescript
// MDC: user.entity.ts (simplified for RYLA)
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Character } from './character.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  nsfwEnabled: boolean;

  @Column({ nullable: true })
  ageVerifiedAt: Date;

  // Subscription status
  @Column({ default: 'free' })
  subscriptionTier: string; // 'free' | 'creator' | 'pro'

  @Column({ nullable: true })
  subscriptionExpiresAt: Date;

  @OneToMany(() => Character, (character) => character.user)
  characters: Character[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // REMOVED from MDC:
  // - googleId, discordId, twitterId (no social auth)
  // - premiumUntil (replaced by subscriptionExpiresAt)
  // - coins, dreamCoins (different monetization)
}
```

### Character Entity

```typescript
// RYLA: character.entity.ts (adapted from MDC)
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Image } from './image.entity';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.characters)
  user: User;

  @Column({ nullable: true })
  name: string;

  // Step 1: Style
  @Column()
  gender: string; // 'male' | 'female'

  @Column()
  style: string; // 'realistic' | 'anime'

  // Step 2: General
  @Column()
  ethnicity: string;

  @Column()
  age: number;

  // Step 3: Face
  @Column()
  hairStyle: string;

  @Column()
  hairColor: string;

  @Column()
  eyeColor: string;

  // Step 4: Body
  @Column()
  bodyType: string;

  @Column({ nullable: true })
  breastSize: string; // Only for female

  // Step 5: Identity (NEW for RYLA)
  @Column({ nullable: true })
  outfit: string;

  @Column({ nullable: true })
  archetype: string; // 'girl_next_door' | 'fitness' | 'luxury' | etc.

  @Column('simple-array', { nullable: true })
  personalityTraits: string[]; // Pick 3 from 16

  @Column({ nullable: true, length: 200 })
  bio: string;

  // Generation config
  @Column({ default: false })
  nsfwEnabled: boolean;

  @Column({ nullable: true })
  seed: number; // For face consistency

  @Column({ nullable: true })
  thumbnailUrl: string;

  @OneToMany(() => Image, (image) => image.character)
  images: Image[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Image Entity

```typescript
// RYLA: image.entity.ts (from MDC)
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Character } from './character.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  characterId: string;

  @ManyToOne(() => Character, (character) => character.images)
  character: Character;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column()
  aspectRatio: string; // '1:1' | '9:16' | '2:3'

  @Column()
  qualityMode: string; // 'draft' | 'hq'

  @Column({ default: false })
  isNsfw: boolean;

  @Column({ nullable: true })
  prompt: string;

  @Column({ nullable: true })
  negativePrompt: string;

  @Column({ nullable: true })
  seed: number;

  @Column({ nullable: true })
  model: string;

  @Column({ default: 'completed' })
  status: string; // 'pending' | 'generating' | 'completed' | 'failed'

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Copy Steps

```bash
# 1. Copy base model
mkdir -p RYLA/libs/data/src/entities
cp MDC/mdc-backend/src/database/entities/models/base.model.ts \
   RYLA/libs/data/src/entities/

# 2. Copy and adapt entities
# (Manual adaptation required - see examples above)

# 3. Copy relevant enums
mkdir -p RYLA/libs/shared/src/enums
cp MDC/mdc-backend/src/database/entities/enums/role.enum.ts \
   RYLA/libs/shared/src/enums/
```

---

## P0: Auth Module

### Source Files

```
MDC/mdc-backend/src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── services/
│   ├── token.service.ts         # ✅ Copy
│   └── auth-cache.service.ts    # ⚠️ Optional
├── guards/
│   ├── jwt-access.guard.ts      # ✅ Copy
│   ├── jwt-refresh.guard.ts     # ✅ Copy
│   └── optional-jwt-auth.guard.ts # ✅ Copy
├── strategies/
│   └── jwt.strategy.ts          # ✅ Copy
├── dto/
│   ├── req/login-user.dto.ts    # ✅ Copy
│   ├── req/register-user-by-email.dto.ts # ✅ Copy
│   └── res/auth-token-response.dto.ts    # ✅ Copy
├── decorators/
│   ├── current-user.decorator.ts # ✅ Copy
│   └── skip-auth.decorator.ts    # ✅ Copy
└── interfaces/
    └── jwt-payload.interface.ts  # ✅ Copy
```

### What to Remove

| MDC File | Action | Reason |
|----------|--------|--------|
| `strategies/google.strategy.ts` | ❌ Remove | No OAuth in MVP |
| `strategies/discord.strategy.ts` | ❌ Remove | No OAuth in MVP |
| `strategies/twitter.strategy.ts` | ❌ Remove | No OAuth in MVP |
| `guards/google-oauth.guard.ts` | ❌ Remove | No OAuth in MVP |
| `guards/discord-oauth.guard.ts` | ❌ Remove | No OAuth in MVP |
| `guards/twitter-oauth.guard.ts` | ❌ Remove | No OAuth in MVP |
| `services/google.service.ts` | ❌ Remove | No OAuth in MVP |
| `services/discord.service.ts` | ❌ Remove | No OAuth in MVP |
| `services/twitter.service.ts` | ❌ Remove | No OAuth in MVP |

### Simplified Auth Service

```typescript
// RYLA: auth.service.ts (simplified from MDC)
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@ryla/data/entities';
import { TokenService } from './token.service';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      isActive: true,
    });

    await this.userRepository.save(user);

    return this.tokenService.generateTokenPair(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.tokenService.generateTokenPair(user);
  }

  async refreshToken(refreshToken: string) {
    return this.tokenService.refreshTokens(refreshToken);
  }

  async logout(userId: string) {
    return this.tokenService.revokeTokens(userId);
  }
}
```

### Copy Steps

```bash
# 1. Copy auth module structure
mkdir -p RYLA/apps/api/src/modules/auth
cp MDC/mdc-backend/src/modules/auth/auth.module.ts \
   RYLA/apps/api/src/modules/auth/
cp MDC/mdc-backend/src/modules/auth/auth.controller.ts \
   RYLA/apps/api/src/modules/auth/

# 2. Copy services (only JWT-related)
mkdir -p RYLA/apps/api/src/modules/auth/services
cp MDC/mdc-backend/src/modules/auth/services/token.service.ts \
   RYLA/apps/api/src/modules/auth/services/

# 3. Copy guards
mkdir -p RYLA/apps/api/src/modules/auth/guards
cp MDC/mdc-backend/src/modules/auth/guards/jwt-access.guard.ts \
   RYLA/apps/api/src/modules/auth/guards/
cp MDC/mdc-backend/src/modules/auth/guards/jwt-refresh.guard.ts \
   RYLA/apps/api/src/modules/auth/guards/

# 4. Copy JWT strategy only
mkdir -p RYLA/apps/api/src/modules/auth/strategies
cp MDC/mdc-backend/src/modules/auth/strategies/jwt.strategy.ts \
   RYLA/apps/api/src/modules/auth/strategies/

# 5. Copy decorators
mkdir -p RYLA/apps/api/src/modules/auth/decorators
cp MDC/mdc-backend/src/modules/auth/decorators/*.ts \
   RYLA/apps/api/src/modules/auth/decorators/

# 6. Copy DTOs (adapt as needed)
mkdir -p RYLA/apps/api/src/modules/auth/dto
cp MDC/mdc-backend/src/modules/auth/dto/req/login-user.dto.ts \
   RYLA/apps/api/src/modules/auth/dto/
cp MDC/mdc-backend/src/modules/auth/dto/req/register-user-by-email.dto.ts \
   RYLA/apps/api/src/modules/auth/dto/
```

---

## P0: Character Module

### Source Files

```
MDC/mdc-backend/src/modules/character/
├── character.module.ts
├── character.controller.ts
├── character.service.ts
├── dto/
│   ├── create-character.dto.ts
│   ├── update-character.dto.ts
│   └── character-response.dto.ts
└── interfaces/
```

### Key Adaptations

1. **DTO changes** - Match RYLA's 6-step wizard attributes
2. **Validation** - Add age verification check
3. **NSFW handling** - Check user's nsfwEnabled flag

### Copy Steps

```bash
# 1. Copy character module
mkdir -p RYLA/apps/api/src/modules/character
cp MDC/mdc-backend/src/modules/character/*.ts \
   RYLA/apps/api/src/modules/character/

# 2. Copy DTOs
mkdir -p RYLA/apps/api/src/modules/character/dto
cp MDC/mdc-backend/src/modules/character/dto/*.ts \
   RYLA/apps/api/src/modules/character/dto/

# 3. Adapt DTOs for RYLA wizard
```

### Create Character DTO (RYLA)

```typescript
// RYLA: create-character.dto.ts
import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max, IsArray, ArrayMaxSize } from 'class-validator';

export class CreateCharacterDto {
  @IsOptional()
  @IsString()
  name?: string;

  // Step 1: Style
  @IsString()
  gender: 'male' | 'female';

  @IsString()
  style: 'realistic' | 'anime';

  // Step 2: General
  @IsString()
  ethnicity: string;

  @IsNumber()
  @Min(18)
  @Max(65)
  age: number;

  // Step 3: Face
  @IsString()
  hairStyle: string;

  @IsString()
  hairColor: string;

  @IsString()
  eyeColor: string;

  // Step 4: Body
  @IsString()
  bodyType: string;

  @IsOptional()
  @IsString()
  breastSize?: string;

  // Step 5: Identity
  @IsOptional()
  @IsString()
  outfit?: string;

  @IsOptional()
  @IsString()
  archetype?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  personalityTraits?: string[];

  @IsOptional()
  @IsString()
  bio?: string;

  // Generation options
  @IsBoolean()
  nsfwEnabled: boolean;
}
```

---

## P1: Image Module

### Source Files

```
MDC/mdc-backend/src/modules/image/
├── image.module.ts
├── image.controller.ts
├── image.service.ts
└── dto/
```

### Copy Steps

```bash
mkdir -p RYLA/apps/api/src/modules/image
cp MDC/mdc-backend/src/modules/image/*.ts \
   RYLA/apps/api/src/modules/image/
```

### Key Adaptations

- Update storage provider config (S3 vs Supabase Storage)
- Simplify generation options for MVP
- Add aspect ratio and quality mode handling

---

## P1: AWS S3 Module

### Source Files

```
MDC/mdc-backend/src/modules/aws-s3/
├── aws-s3.module.ts
├── services/aws-s3.service.ts
└── enums/
```

### Copy Steps

```bash
mkdir -p RYLA/apps/api/src/modules/storage
cp MDC/mdc-backend/src/modules/aws-s3/services/aws-s3.service.ts \
   RYLA/apps/api/src/modules/storage/s3.service.ts
```

### Alternative: Supabase Storage

If using Supabase Storage instead:

```typescript
// storage.service.ts (Supabase alternative)
import { createClient } from '@supabase/supabase-js';

export class SupabaseStorageService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  async uploadImage(bucket: string, path: string, file: Buffer, contentType: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, { contentType });

    if (error) throw error;
    return data;
  }

  async getPublicUrl(bucket: string, path: string) {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}
```

---

## Module to Add: Finby Payments

This is new (not from MDC). Create based on Finby API docs.

```
RYLA/apps/api/src/modules/finby/
├── finby.module.ts
├── finby.controller.ts     # Webhook handler
├── finby.service.ts        # API client
├── dto/
│   ├── create-checkout.dto.ts
│   └── webhook-event.dto.ts
└── interfaces/
    └── finby-types.ts
```

---

## Migration Setup

### Copy TypeORM Migration Config

```bash
# Copy migration config
cp MDC/mdc-backend/ormconfig.ts RYLA/apps/api/

# Update package.json scripts
```

### Add to package.json

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs --dataSource ./ormconfig.ts",
    "migration:create": "npm run typeorm -- migration:create ./src/database/migrations/$npm_config_name",
    "migration:generate": "npm run typeorm -- migration:generate ./src/database/migrations/$npm_config_name",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert"
  }
}
```

---

## Environment Variables

### Required for RYLA

```env
# Database
RYLA_DB_HOST=localhost
RYLA_DB_PORT=5432
RYLA_DB_USER=ryla
RYLA_DB_PASSWORD=
RYLA_DB_NAME=ryla

# JWT
RYLA_JWT_SECRET=your-secret-key
RYLA_JWT_ACCESS_EXPIRES=15m
RYLA_JWT_REFRESH_EXPIRES=7d

# Storage (S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=ryla-images

# OR Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Finby Payments
FINBY_API_KEY=
FINBY_MERCHANT_ID=
FINBY_WEBHOOK_SECRET=

# AI Generation
REPLICATE_API_TOKEN=
```

---

## File Copy Checklist

### Phase 1: Foundation (Day 1)

- [ ] Copy NestJS config structure
- [ ] Copy `docker-compose.local.yaml`
- [ ] Copy `ormconfig.ts`
- [ ] Copy common utilities (filters, interceptors)
- [ ] Set up environment variables

### Phase 2: Entities (Day 2)

- [ ] Copy base model
- [ ] Adapt User entity
- [ ] Adapt Character entity
- [ ] Copy Image entity
- [ ] Copy Session/Token entities
- [ ] Create initial migration

### Phase 3: Auth (Day 3)

- [ ] Copy JWT strategy
- [ ] Copy token service
- [ ] Copy auth guards
- [ ] Copy auth decorators
- [ ] Simplify auth service (email only)
- [ ] Copy auth DTOs

### Phase 4: Character (Day 4)

- [ ] Copy character module
- [ ] Adapt DTOs for 6-step wizard
- [ ] Add validation
- [ ] Add NSFW checks

### Phase 5: Image & Storage (Day 5)

- [ ] Copy image module
- [ ] Copy S3 service (or create Supabase service)
- [ ] Configure storage buckets

### Phase 6: Finby (Days 6-7)

- [ ] Create Finby module (new)
- [ ] Implement checkout flow
- [ ] Implement webhook handler
- [ ] Add subscription management

---

## Import Mapping

| MDC Import | RYLA Import |
|------------|-------------|
| `src/database/entities` | `@ryla/data/entities` |
| `src/modules/auth` | `apps/api/src/modules/auth` |
| `src/modules/character` | `apps/api/src/modules/character` |
| `src/config` | `apps/api/src/config` |
| `src/common` | `apps/api/src/common` |

---

## Not Copying (Out of MVP Scope)

| MDC Module | Reason |
|------------|--------|
| `modules/conversation/` | No chat in MVP |
| `modules/message/` | No chat in MVP |
| `modules/video-generation/` | Video is P2 |
| `modules/stripe/` | Using Finby |
| `modules/paypal/` | Using Finby |
| `modules/trustpay/` | Using Finby |
| `modules/shift4/` | Using Finby |
| `modules/realtime/` | Not needed for MVP |
| `modules/comment/` | Not in MVP |
| `modules/notification/` | Basic only |
| `modules/leaderboard/` | Not in MVP |
| Social OAuth strategies | Email only for MVP |

---

## Notes

1. **Test as you copy** - Run migrations after entity changes
2. **Keep MDC patterns** - They're battle-tested
3. **Simplify aggressively** - MVP needs less than MDC
4. **Document changes** - Note what you removed/changed
5. **Don't break MDC** - Work in separate repo

---

## Change Log

| Date | Change |
|------|--------|
| 2025-12-05 | Initial backend copy guide created |

