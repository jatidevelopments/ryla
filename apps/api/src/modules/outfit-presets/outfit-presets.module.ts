import { Module, forwardRef } from '@nestjs/common';
import { OutfitPresetsController } from './outfit-presets.controller';
import { OutfitPresetsService } from './outfit-presets.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DrizzleModule, forwardRef(() => AuthModule)],
  controllers: [OutfitPresetsController],
  providers: [OutfitPresetsService],
  exports: [OutfitPresetsService],
})
export class OutfitPresetsModule {}

