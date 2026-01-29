import { Module } from '@nestjs/common';
import { FunnelController } from './funnel.controller';

@Module({
  controllers: [FunnelController],
})
export class FunnelModule {}
