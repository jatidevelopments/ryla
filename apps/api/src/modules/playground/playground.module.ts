import { Module } from '@nestjs/common';
import { PlaygroundController } from './playground.controller';
import { PlaygroundService } from './playground.service';
import { RunComfyPlaygroundService } from './runcomfy-playground.service';

@Module({
  controllers: [PlaygroundController],
  providers: [PlaygroundService, RunComfyPlaygroundService],
})
export class PlaygroundModule { }
