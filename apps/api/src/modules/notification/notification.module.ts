import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
  ],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
  controllers: [NotificationController],
})
export class NotificationModule {}

