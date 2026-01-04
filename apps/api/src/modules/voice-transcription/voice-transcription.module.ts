import { Module } from '@nestjs/common';
import { VoiceTranscriptionController } from './voice-transcription.controller';
import { VoiceTranscriptionService } from './services/voice-transcription.service';

@Module({
  controllers: [VoiceTranscriptionController],
  providers: [VoiceTranscriptionService],
  exports: [VoiceTranscriptionService],
})
export class VoiceTranscriptionModule {}

