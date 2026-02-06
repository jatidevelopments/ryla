import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ModalClient } from '@ryla/business';

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
    const g = globalThis as unknown as {
      __RYLA_MODAL_ENDPOINT_URL?: string;
      __RYLA_MODAL_WORKSPACE?: string;
    };
    const endpointUrl =
      (g.__RYLA_MODAL_ENDPOINT_URL ?? process.env['MODAL_ENDPOINT_URL'] ?? '').trim() ||
      undefined;
    const workspace =
      (g.__RYLA_MODAL_WORKSPACE ?? process.env['MODAL_WORKSPACE'] ?? 'ryla').trim() || 'ryla';

    if (!endpointUrl && !workspace) {
      this.logger.warn(
        'Playground Modal: MODAL_ENDPOINT_URL and MODAL_WORKSPACE not set (check Infisical /apps/api).'
      );
      return;
    }

    try {
      this.client = new ModalClient({
        workspace,
        endpointUrl,
        timeout: 300000,
      });
      this.logger.log(`Playground Modal client initialized (workspace: ${workspace})`);
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
          'Modal not configured. Set MODAL_WORKSPACE or MODAL_ENDPOINT_URL.',
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
