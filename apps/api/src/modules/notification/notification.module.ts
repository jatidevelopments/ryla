import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './services/notification.service';
import { GenerationEventsService } from './services/generation-events.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
  ],
  providers: [NotificationService, NotificationGateway, GenerationEventsService],
  exports: [NotificationService, NotificationGateway, GenerationEventsService],
  controllers: [NotificationController],
})
export class NotificationModule {}

