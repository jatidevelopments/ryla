import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RunPodService } from './services/runpod.service';

@Module({
  imports: [ConfigModule],
  providers: [RunPodService],
  exports: [RunPodService],
})
export class RunPodModule {}

