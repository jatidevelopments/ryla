import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

const RUNCOMFY_BASE = 'https://api.runcomfy.net';
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 300000; // 5 min

export interface RunComfyDeployment {
  id: string;
  name: string;
  workflow_id: string;
  workflow_version: string;
  hardware: string[];
  status: string;
  is_enabled: boolean;
}

export interface RunComfyCallResult {
  imageBase64?: string;
  contentType?: string;
  executionTimeSec?: number;
  error?: string;
}

@Injectable()
export class RunComfyPlaygroundService implements OnModuleInit {
  private readonly logger = new Logger(RunComfyPlaygroundService.name);

  /** Cached at startup so Infisical-injected token is not lost if .env/ConfigModule overwrites process.env later. */
  private token: string | null = null;

  onModuleInit() {
    this.token = this.readTokenFromEnv();
    if (this.token) {
      this.logger.log('RunComfy: token configured');
    } else {
      this.logger.warn(
        'RunComfy: token missing. Set RUNCOMFY_API_TOKEN (e.g. via Infisical at /apps/api) so the playground can list/call RunComfy deployments.'
      );
    }
  }

  private readTokenFromEnv(): string | null {
    // Prefer token captured in main.ts before Nest bootstrap (survives .env/ConfigModule overwrite)
    const captured = (globalThis as unknown as { __RYLA_RUNCOMFY_TOKEN?: string })
      .__RYLA_RUNCOMFY_TOKEN;
    if (captured) return captured;
    const raw =
      process.env['RUNCOMFY_API_TOKEN'] ?? process.env['RUNCOMFY_API_KEY'] ?? '';
    return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : null;
  }

  private getToken(): string | null {
    return this.token;
  }

  async listDeployments(): Promise<RunComfyDeployment[] | { error: string }> {
    const token = this.getToken();
    if (!token) {
      return { error: 'RunComfy not configured. Set RUNCOMFY_API_TOKEN.' };
    }
    try {
      const res = await fetch(`${RUNCOMFY_BASE}/prod/v2/deployments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        this.logger.warn(`RunComfy list deployments failed: ${res.status} ${text}`);
        return { error: `RunComfy API: ${res.status} ${text.slice(0, 200)}` };
      }
      const data = (await res.json()) as RunComfyDeployment[];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`RunComfy list deployments error: ${message}`);
      return { error: message };
    }
  }

  async callDeployment(
    deploymentId: string,
    options: {
      prompt?: string;
      seed?: number;
      overrides?: Record<string, { inputs: Record<string, unknown> }>;
    }
  ): Promise<RunComfyCallResult> {
    const token = this.getToken();
    if (!token) {
      return { error: 'RunComfy not configured. Set RUNCOMFY_API_TOKEN.' };
    }

    const overrides =
      options.overrides ??
      this.buildDefaultOverrides(options.prompt ?? '', options.seed ?? Math.floor(Math.random() * 1e9));

    const startedAt = Date.now();
    try {
      const submitRes = await fetch(
        `${RUNCOMFY_BASE}/prod/v1/deployments/${deploymentId}/inference`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ overrides }),
        }
      );
      if (!submitRes.ok) {
        const text = await submitRes.text();
        return { error: `Submit: ${submitRes.status} ${text.slice(0, 300)}` };
      }
      const submitData = (await submitRes.json()) as {
        request_id: string;
        status_url: string;
        result_url: string;
      };
      const { request_id, status_url, result_url } = submitData;
      if (!request_id || !result_url) {
        return { error: 'Invalid RunComfy submit response' };
      }

      const completed = await this.pollUntilCompleted(
        token,
        status_url,
        result_url,
        startedAt
      );
      if ('error' in completed && completed.error) return completed;

      const imageUrl = this.extractFirstImageUrl(completed.outputs);
      if (!imageUrl) {
        return {
          error: completed.status === 'succeeded' ? 'No image in outputs' : completed.status,
          executionTimeSec: (Date.now() - startedAt) / 1000,
        };
      }

      const buf = await this.fetchImageAsBuffer(imageUrl);
      if (!buf) {
        return {
          error: 'Failed to download output image',
          executionTimeSec: (Date.now() - startedAt) / 1000,
        };
      }

      return {
        imageBase64: buf.toString('base64'),
        contentType: 'image/png',
        executionTimeSec: (Date.now() - startedAt) / 1000,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`RunComfy call ${deploymentId} failed: ${message}`);
      return {
        error: message,
        executionTimeSec: (Date.now() - startedAt) / 1000,
      };
    }
  }

  private buildDefaultOverrides(
    prompt: string,
    seed: number
  ): Record<string, { inputs: Record<string, unknown> }> {
    return {
      '6': { inputs: { text: prompt } },
      '25': { inputs: { noise_seed: seed } },
    };
  }

  private async pollUntilCompleted(
    token: string,
    statusUrl: string,
    resultUrl: string,
    startedAt: number
  ): Promise<
    | { status: string; outputs?: Record<string, { images?: { url: string }[] }> }
    | { error: string; outputs?: Record<string, { images?: { url: string }[] }>; status?: string }
  > {
    const deadline = startedAt + POLL_TIMEOUT_MS;
    const headers = { Authorization: `Bearer ${token}` };

    while (Date.now() < deadline) {
      const statusRes = await fetch(statusUrl, { headers });
      if (!statusRes.ok) {
        return { error: `Status: ${statusRes.status}` };
      }
      const statusData = (await statusRes.json()) as { status: string };
      const status = statusData.status;

      if (status === 'completed') {
        const resultRes = await fetch(resultUrl, { headers });
        if (!resultRes.ok) {
          return { error: `Result: ${resultRes.status}` };
        }
        const resultData = (await resultRes.json()) as {
          status: string;
          outputs?: Record<string, { images?: { url: string }[] }>;
        };
        return {
          status: resultData.status,
          outputs: resultData.outputs,
        };
      }
      if (status === 'cancelled' || status === 'failed') {
        const resultRes = await fetch(resultUrl, { headers }).catch(() => null);
        let outputs: Record<string, { images?: { url: string }[] }> | undefined;
        if (resultRes?.ok) {
          const resultData = (await resultRes.json()) as { outputs?: Record<string, { images?: { url: string }[] }> };
          outputs = resultData.outputs;
        }
        return { error: status, status, outputs };
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    return { error: 'Poll timeout' };
  }

  private extractFirstImageUrl(
    outputs?: Record<string, { images?: { url: string }[] }>
  ): string | null {
    if (!outputs) return null;
    for (const node of Object.values(outputs)) {
      const url = node?.images?.[0]?.url;
      if (url) return url;
    }
    return null;
  }

  private async fetchImageAsBuffer(url: string): Promise<Buffer | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch {
      return null;
    }
  }
}
