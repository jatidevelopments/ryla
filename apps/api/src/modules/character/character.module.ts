import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { ImageModule } from '../image/image.module';
import { CreditsModule } from '../credits/credits.module';
import { CharacterController } from './character.controller';
import { CharacterService } from './services/character.service';
import { CharacterCacheService } from './services/character-cache.service';
import { CharacterRepository } from '@ryla/data';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    RedisModule,
    forwardRef(() => ImageModule), // Import ImageModule for generation services
    CreditsModule, // Import for credit management
    DrizzleModule,
  ],
  controllers: [CharacterController],
  providers: [
    CharacterService,
    CharacterCacheService,
    CharacterRepository,
  ],
  exports: [
    CharacterService,
    CharacterCacheService,
    CharacterRepository,
  ],
})
export class CharacterModule {}

