import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ImageGalleryController } from './image-gallery.controller';
import { ImageGalleryService } from './services/image-gallery.service';
import { ImageGalleryCacheService } from './services/image-gallery-cache.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    RedisModule,
    DrizzleModule,
  ],
  controllers: [ImageGalleryController],
  providers: [ImageGalleryService, ImageGalleryCacheService],
  exports: [ImageGalleryCacheService],
})
export class ImageGalleryModule {}

