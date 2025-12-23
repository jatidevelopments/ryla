import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { ImageModule } from '../image/image.module';
import { CharacterController } from './character.controller';
import { CharacterService } from './services/character.service';
import { CharacterCacheService } from './services/character-cache.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    RedisModule,
    forwardRef(() => ImageModule), // Import ImageModule for generation services
  ],
  controllers: [CharacterController],
  providers: [
    CharacterService,
    CharacterCacheService,
  ],
  exports: [
    CharacterService,
    CharacterCacheService,
  ],
})
export class CharacterModule {}

