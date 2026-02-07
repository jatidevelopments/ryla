import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// Direct import - ModalClient uses Node.js-only APIs (undici) and cannot be bundled client-side
import { ModalClient } from '@ryla/business/services/modal-client';

export interface PlaygroundCallResult {
  imageBase64: string;
  contentType: string;
  costUsd?: number;
  executionTimeSec?: number;
  gpuType?: string;
}

@Injectable()
export class PlaygroundService implements OnModuleInit {
  private readonly logger = new Logger(PlaygroundService.name);
  private client: ModalClient | null = null;

  onModuleInit() {
    const workspace =
      (process.env['MODAL_WORKSPACE'] ?? 'ryla').trim() || undefined;

    if (!workspace) {
      this.logger.warn(
        'Playground Modal: MODAL_WORKSPACE not set (check Infisical /apps/api).'
      );
      return;
    }

    try {
      this.client = new ModalClient({
        workspace,
        timeout: 300000,
      });
      this.logger.log(
        `Playground Modal client initialized (workspace: ${workspace})`
      );
    } catch (error) {
      this.logger.error('Playground Modal client init failed', error);
    }
  }

  async callEndpoint(
    path: string,
    body: Record<string, unknown>
  ): Promise<PlaygroundCallResult | { error: string }> {
    if (!this.client) {
      return {
        error:
          'Modal not configured. Set MODAL_WORKSPACE (e.g. ryla) in Infisical /apps/api.',
      };
    }

    try {
      const result = await this.client.call(path, body);
      const imageBase64 = result.image.toString('base64');
      return {
        imageBase64,
        contentType: result.contentType,
        costUsd: result.costUsd,
        executionTimeSec: result.executionTimeSec,
        gpuType: result.gpuType,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Playground call ${path} failed: ${message}`);
      return { error: message };
    }
  }
}
