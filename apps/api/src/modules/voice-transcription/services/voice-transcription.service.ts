import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface TranscriptionResult {
  text: string;
  language?: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

/**
 * Service for transcribing voice audio using Fal.ai's Whisper model
 * Supports streaming transcription for real-time updates
 */
@Injectable()
export class VoiceTranscriptionService {
  private readonly logger = new Logger(VoiceTranscriptionService.name);

  isConfigured(): boolean {
    return Boolean(this.getFalKey());
  }

  /**
   * Transcribe audio using Fal.ai's Whisper model
   * Model: fal-ai/whisper or fal-ai/wispr (if available)
   */
  async transcribeAudio(
    audioFile: Buffer,
    audioFormat: string = 'audio/webm',
  ): Promise<TranscriptionResult> {
    const falKey = this.getFalKey();
    if (!falKey) {
      throw new Error('FAL_KEY is not configured');
    }

    // Convert audio buffer to base64
    const base64Audio = audioFile.toString('base64');
    const mimeType = this.getMimeType(audioFormat);

    // Use Fal.ai's Whisper model
    // Try wispr first, fallback to whisper
    const modelId = 'fal-ai/whisper';
    const url = `https://fal.run/${modelId}`;
    const requestId = randomUUID();

    const body = {
      audio_url: `data:${mimeType};base64,${base64Audio}`,
      // Optional: specify language for better accuracy
      // language: 'en',
    };

    this.logger.log(`Transcribing audio with ${modelId} (requestId: ${requestId})`);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Key ${falKey}`,
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      this.logger.warn(
        `Fal transcription failed (${modelId}) status=${res.status} body=${text.slice(0, 500)}`,
      );
      throw new Error(`Fal transcription failed (${modelId}) status=${res.status}`);
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Fal returned non-JSON response for (${modelId})`);
    }

    return this.extractTranscription(json);
  }

  /**
   * Stream transcription from Fal.ai
   * Returns an async generator that yields transcription chunks
   * Note: Fal.ai Whisper doesn't support true streaming, so we simulate it
   * by sending the full result in chunks for better UX
   */
  async *streamTranscription(
    audioFile: Buffer,
    audioFormat: string = 'audio/webm',
  ): AsyncGenerator<string, void, unknown> {
    const falKey = this.getFalKey();
    if (!falKey) {
      throw new Error('FAL_KEY is not configured');
    }

    const base64Audio = audioFile.toString('base64');
    const mimeType = this.getMimeType(audioFormat);
    const modelId = 'fal-ai/whisper';
    const url = `https://fal.run/${modelId}`;
    const requestId = randomUUID();

    const body = {
      audio_url: `data:${mimeType};base64,${base64Audio}`,
    };

    this.logger.log(`Transcribing audio with ${modelId} (requestId: ${requestId})`);

    // Send initial "processing" signal
    yield '';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Key ${falKey}`,
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      this.logger.warn(
        `Fal transcription failed (${modelId}) status=${res.status} body=${text.slice(0, 500)}`,
      );
      throw new Error(`Fal transcription failed (${modelId}) status=${res.status}`);
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Fal returned non-JSON response for (${modelId})`);
    }

    const result = this.extractTranscription(json);

    // Simulate streaming by sending text in word chunks for better UX
    if (result.text) {
      const words = result.text.split(' ');
      let currentText = '';

      for (const word of words) {
        currentText += (currentText ? ' ' : '') + word;
        yield currentText;
        // Small delay to simulate streaming
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
  }

  private getFalKey(): string | undefined {
    return process.env['FAL_KEY'];
  }

  private getMimeType(audioFormat: string): string {
    // Map common audio formats to MIME types
    const mimeMap: Record<string, string> = {
      'audio/webm': 'audio/webm',
      'audio/mp4': 'audio/mp4',
      'audio/mpeg': 'audio/mpeg',
      'audio/wav': 'audio/wav',
      'audio/ogg': 'audio/ogg',
      'audio/ogg; codecs=opus': 'audio/ogg',
    };

    return mimeMap[audioFormat] || 'audio/webm';
  }

  private extractTranscription(payload: unknown): TranscriptionResult {
    const p = payload as any;

    // Fal Whisper typically returns:
    // { text: "...", language: "en", segments: [...] }
    const text = typeof p?.text === 'string' ? p.text : '';
    const language = typeof p?.language === 'string' ? p.language : undefined;
    const segments = Array.isArray(p?.segments) ? p.segments : undefined;

    return {
      text,
      language,
      segments,
    };
  }
}

