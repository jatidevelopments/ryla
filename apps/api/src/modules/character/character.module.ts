import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { RunPodModule } from '../runpod/runpod.module';
// TODO: Import when available
// import { AwsS3Module } from '../aws-s3/aws-s3.module';
// import { ImageModule } from '../image/image.module';
import { CharacterController } from './character.controller';
import { CharacterService } from './services/character.service';
import { CharacterCacheService } from './services/character-cache.service';
import { BaseImageGenerationService } from '../image/services/base-image-generation.service';
import { CharacterSheetService } from '../image/services/character-sheet.service';

@Module({
  imports: [
    AuthModule,
    RedisModule,
    RunPodModule,
    // TODO: Uncomment when available
    // AwsS3Module,
    // ImageModule,
  ],
  controllers: [CharacterController],
  providers: [
    CharacterService,
    CharacterCacheService,
    BaseImageGenerationService,
    CharacterSheetService,
  ],
  exports: [
    CharacterService,
    CharacterCacheService,
  ],
})
export class CharacterModule {}

