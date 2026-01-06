# MDC Backend Architecture

> Source: `/Users/admin/Documents/Projects/MDC/mdc-backend`
> Last analyzed: 2025-12-04

## Overview

The MDC backend is a NestJS application providing REST APIs, WebSocket connections, background job processing, and multiple payment integrations.

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | NestJS | 10.x |
| Language | TypeScript | 5.x |
| ORM | TypeORM | 0.3 |
| Database | PostgreSQL | - |
| Cache | Redis (ioredis) | 5.4 |
| Queue | Bull | 4.16 |
| Auth | Passport + JWT | 0.7 / 10.2 |
| Validation | class-validator | 0.14 |
| API Docs | Swagger | 8.1 |
| Real-time | Socket.io | - |
| Storage | AWS S3 | 3.x |
| Monitoring | Sentry | 9.x |

---

## Directory Structure

```
mdc-backend/
├── src/
│   ├── main.ts                  # Entry point
│   ├── modules/
│   │   ├── app.module.ts        # Root module
│   │   ├── auth/                # Authentication
│   │   ├── user/                # User management
│   │   ├── character/           # AI characters
│   │   ├── conversation/        # Chat conversations
│   │   ├── message/             # Chat messages
│   │   ├── image/               # Image generation
│   │   ├── video-generation/    # Video generation
│   │   ├── stripe/              # Stripe payments
│   │   ├── shift4/              # Shift4 payments
│   │   ├── paypal/              # PayPal payments
│   │   ├── trustpay/            # TrustPay payments
│   │   ├── notification/        # Push notifications
│   │   ├── realtime/            # WebSocket gateway
│   │   ├── admin/               # Admin panel
│   │   ├── dashboard/           # Analytics dashboard
│   │   ├── analytics/           # Event tracking
│   │   ├── mail/                # Email service
│   │   ├── aws-s3/              # File storage
│   │   ├── redis/               # Cache layer
│   │   ├── postgress/           # DB connection
│   │   ├── repository/          # Data access
│   │   └── throttler/           # Rate limiting
│   ├── database/
│   │   ├── entities/            # TypeORM entities
│   │   └── migrations/          # DB migrations
│   ├── common/
│   │   ├── dto/                 # Shared DTOs
│   │   ├── helpers/             # Utilities
│   │   └── http/                # Filters, interceptors
│   ├── guards/                  # Auth guards
│   ├── decorators/              # Custom decorators
│   └── config/                  # Configuration
├── docs/                        # API documentation
├── load-tests/                  # Artillery tests
└── scripts/                     # Build scripts
```

---

## Module Architecture

### Root Module

```typescript
// modules/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    BullModule.forRootAsync({...}),  // Job queues
    SentryModule.forRoot(),
    ThrottlerConfigModule,
    // Feature modules
    AuthModule,
    UserModule,
    CharacterModule,
    ConversationModule,
    MessageModule,
    ImageModule,
    StripeModule,
    // ...
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
```

---

## Authentication System

### Module Structure

```typescript
// modules/auth/auth.module.ts
@Module({
  imports: [
    JwtModule,
    RedisModule,
    PassportModule.register({ defaultStrategy: 'google' }),
    MailModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    AuthCacheService,
    GoogleStrategy,
    DiscordStrategy,
    TwitterStrategy,
    // OAuth services
  ],
  exports: [AuthService, TokenService, AuthCacheService, PassportModule],
})
```

### JWT Guards

```typescript
// guards/jwt-access.guard.ts
@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// Usage in controller
@UseGuards(JwtAccessGuard)
@Get('profile')
getProfile(@CurrentUser() user: UserEntity) {
  return user;
}
```

### Custom Decorators

```typescript
// decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// decorators/skip-auth.decorator.ts
export const SkipAuth = () => SetMetadata('skipAuth', true);

// decorators/role.decorator.ts
export const Roles = (...roles: RoleEnum[]) => SetMetadata('roles', roles);
```

---

## Entity Patterns

### Base Model

```typescript
// database/entities/models/base.model.ts
export abstract class BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### User Entity (Example)

```typescript
// database/entities/user.entity.ts
@Entity(TableNameEnum.USERS)
export class UserEntity extends BaseModel {
  @Index()
  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })  // Exclude from queries
  password: string;

  @Column('enum', { enum: RoleEnum, default: RoleEnum.DEFAULT_USER })
  role: RoleEnum;

  @Column('boolean', { default: false })
  isPremium: boolean;

  @Column('int', { default: 10 })
  freeMessages: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tokensAmount: number;

  @Column('simple-json', { nullable: true })
  utmOnRegistration: Record<string, any>;

  @DeleteDateColumn()  // Soft delete
  deletedAt?: Date;

  // Relations
  @OneToMany(() => CharacterEntity, (character) => character.user)
  characters: CharacterEntity[];

  @OneToMany(() => ConversationEntity, (conversation) => conversation.user)
  conversations: ConversationEntity[];
}
```

### Character Entity (Complex)

```typescript
// database/entities/character.entity.ts
@Entity(TableNameEnum.CHARACTERS)
export class CharacterEntity extends BaseModel {
  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  systemPrompt: string;

  @Column('int', { default: 0 })
  systemPromptTokens: number;

  // Appearance attributes
  @Column('text')
  age: string;

  @Column('text')
  gender: string;

  @Column('text', { nullable: true })
  ethnicity: string;

  @Column('text', { nullable: true })
  bodyType: string;

  // Stats
  @Column('int', { default: 0 })
  likesAmount: number;

  @Column('int', { default: 0 })
  messagesAmount: number;

  // Full-text search
  @Column({
    type: 'tsvector',
    select: false,
    generatedType: 'STORED',
    asExpression: `
      setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B')
    `,
  })
  fts: string;

  // Visibility enum
  @Column('enum', {
    enum: CharacterVisibilityEnum,
    default: CharacterVisibilityEnum.PRIVATE,
  })
  visibilityStatus: CharacterVisibilityEnum;

  // Relations
  @ManyToOne(() => UserEntity, (user) => user.characters)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(() => ImageEntity, (image) => image.character)
  images: ImageEntity[];
}
```

---

## Controller Patterns

### Standard CRUD Controller

```typescript
@Controller('characters')
@UseGuards(JwtAccessGuard)
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Get()
  findAll(
    @Query() query: GetCharactersDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.characterService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.characterService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateCharacterDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.characterService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCharacterDto,
  ) {
    return this.characterService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.characterService.remove(id);
  }
}
```

---

## DTO Validation

```typescript
// modules/character/dto/req/create-character.dto.ts
import { IsString, IsInt, IsEnum, IsOptional, Min, Max } from 'class-validator';

export class CreateCharacterDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @IsInt()
  @Min(18)
  @Max(100)
  age: number;

  @IsString()
  @IsOptional()
  ethnicity?: string;
}
```

---

## Service Patterns

```typescript
@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(CharacterEntity)
    private characterRepo: Repository<CharacterEntity>,
    private redisService: RedisService,
    private analyticsService: AnalyticsService,
  ) {}

  async findOne(id: number): Promise<CharacterEntity> {
    const character = await this.characterRepo.findOne({
      where: { id },
      relations: ['user', 'images'],
    });
    
    if (!character) {
      throw new NotFoundException(`Character #${id} not found`);
    }
    
    return character;
  }

  async create(dto: CreateCharacterDto, user: UserEntity): Promise<CharacterEntity> {
    const character = this.characterRepo.create({
      ...dto,
      userId: user.id,
    });
    
    const saved = await this.characterRepo.save(character);
    
    // Track analytics
    this.analyticsService.track('character_created', {
      characterId: saved.id,
      userId: user.id,
    });
    
    return saved;
  }
}
```

---

## Background Jobs (Bull)

```typescript
// modules/image/processors/image.processor.ts
@Processor('image-generation')
export class ImageProcessor {
  constructor(private imageService: ImageService) {}

  @Process('generate')
  async handleGeneration(job: Job<ImageGenerationPayload>) {
    const { characterId, prompt, style } = job.data;
    
    // Update progress
    await job.progress(10);
    
    // Generate image
    const result = await this.imageService.generate(prompt, style);
    
    await job.progress(100);
    return result;
  }

  @OnQueueFailed()
  handleFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed:`, error);
  }
}

// Queue configuration
BullModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    redis: {
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
    },
    defaultJobOptions: {
      removeOnComplete: 1000,
      removeOnFail: 5000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    },
  }),
});
```

---

## WebSocket Gateway

```typescript
// modules/realtime/gateways/chat.gateway.ts
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    // Validate token and attach user
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const response = await this.messageService.create(data);
    this.server.to(data.conversationId).emit('new_message', response);
  }
}
```

---

## Payment Integrations

### Multiple Providers
1. **Stripe** - Primary payment processor
2. **Shift4** - Alternative processor
3. **PayPal** - PayPal payments
4. **TrustPay** - European payments

### Webhook Handling

```typescript
@Controller('stripe')
export class StripeController {
  @Post('webhook')
  @SkipAuth()
  async handleWebhook(
    @Body() body: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.stripeService.verifyWebhook(body, signature);
    
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object);
        break;
    }
  }
}
```

---

## Database Migrations

```bash
# Generate migration
npm run migration:generate --name=AddUserTokens

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Migration Example

```typescript
export class AddUserTokens1699999999999 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'tokensAmount',
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'tokensAmount');
  }
}
```

---

## Rate Limiting

```typescript
// modules/throttler/throttler.module.ts
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      useFactory: (config: ConfigService, redis: RedisService) => ({
        throttlers: [
          { name: 'short', ttl: 1000, limit: 3 },
          { name: 'medium', ttl: 10000, limit: 20 },
          { name: 'long', ttl: 60000, limit: 100 },
        ],
        storage: new ThrottlerStorageRedisService(redis.client),
      }),
    }),
  ],
})
```

### Custom Throttler

```typescript
// decorators/custom-throttler-config.decorator.ts
export const CustomThrottler = (ttl: number, limit: number) =>
  SetMetadata('throttler', { ttl, limit });

// Usage
@CustomThrottler(60000, 5)  // 5 requests per minute
@Post('expensive-operation')
async expensiveOperation() {}
```

---

## API Documentation

```bash
# Generate OpenAPI spec
npm run generate:swagger

# Generate markdown docs
npm run generate:api-md

# Generate LLM-friendly docs
npm run generate:llm-md
```

---

## Key Patterns for RYLA

### 1. Module Structure
```
modules/feature/
├── feature.module.ts
├── feature.controller.ts
├── services/
│   ├── feature.service.ts
│   └── feature-helper.service.ts
├── dto/
│   ├── req/
│   └── res/
├── interfaces/
├── enums/
└── processors/  # Bull jobs
```

### 2. Repository Pattern
```typescript
@Injectable()
export class RepositoryService {
  constructor(
    @InjectRepository(Entity)
    private repo: Repository<Entity>,
  ) {}
}
```

### 3. Global Exception Filter
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Log to Sentry
    // Return formatted error response
  }
}
```

### 4. Config Pattern
```typescript
// config/configuration.ts
export default () => ({
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
  },
  redis: {
    host: process.env.REDIS_HOST,
  },
});
```

---

## Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=
DB_NAME=mdc

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SHIFT4_API_KEY=
PAYPAL_CLIENT_ID=
```

