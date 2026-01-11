import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { VoiceTranscriptionService } from './services/voice-transcription.service';

@ApiTags('Voice Transcription')
@Controller('voice-transcription')
export class VoiceTranscriptionController {
  constructor(
    private readonly voiceTranscriptionService: VoiceTranscriptionService,
  ) { }

  @Post('transcribe')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('audio'))
  @ApiOperation({ summary: 'Transcribe audio to text' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary',
          description: 'Audio file to transcribe',
        },
        format: {
          type: 'string',
          description: 'Audio format (e.g., audio/webm)',
          default: 'audio/webm',
        },
      },
    },
  })
  async transcribe(
    @UploadedFile() audio: Express.Multer.File,
    @Body('format') format?: string,
  ) {
    if (!audio) {
      throw new Error('Audio file is required');
    }

    const result = await this.voiceTranscriptionService.transcribeAudio(
      audio.buffer,
      format || audio.mimetype || 'audio/webm',
    );

    return {
      text: result.text,
      language: result.language,
      segments: result.segments,
    };
  }

  @Post('transcribe-stream')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('audio'))
  @ApiOperation({ summary: 'Stream transcription results in real-time' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary',
          description: 'Audio file to transcribe',
        },
        format: {
          type: 'string',
          description: 'Audio format (e.g., audio/webm)',
          default: 'audio/webm',
        },
      },
    },
  })
  async transcribeStream(
    @UploadedFile() audio: Express.Multer.File,
    @Body('format') format: string | undefined,
    @Res() res: Response,
  ) {
    if (!audio) {
      throw new Error('Audio file is required');
    }

    // Set up Server-Sent Events (SSE) headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    try {
      // Stream transcription chunks
      for await (const text of this.voiceTranscriptionService.streamTranscription(
        audio.buffer,
        format || audio.mimetype || 'audio/webm',
      )) {
        // Send SSE event with transcription chunk
        res.write(`data: ${JSON.stringify({ text, type: 'chunk' })}\n\n`);
      }

      // Send completion event
      res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
      res.end();
    } catch (error) {
      // Send error event
      res.write(
        `data: ${JSON.stringify({ type: 'error', message: (error as any).message })}\n\n`,
      );
      res.end();
    }
  }
}

