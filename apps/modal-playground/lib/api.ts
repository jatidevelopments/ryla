/** Use same-origin API route to avoid CORS; route proxies to real API */

export interface PlaygroundCallResponse {
  imageBase64?: string;
  contentType?: string;
  costUsd?: number;
  executionTimeSec?: number;
  gpuType?: string;
  error?: string;
}

export async function callModalEndpoint(
  endpoint: string,
  body: Record<string, unknown>
): Promise<PlaygroundCallResponse> {
  const res = await fetch('/api/playground/modal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: (data as { error?: string }).error ?? `HTTP ${res.status}` };
  }
  return data as PlaygroundCallResponse;
}

export interface RunComfyDeployment {
  id: string;
  name: string;
  workflow_id: string;
  workflow_version: string;
  hardware: string[];
  status: string;
  is_enabled: boolean;
}

export async function fetchRunComfyEndpoints(): Promise<
  RunComfyDeployment[] | { error: string }
> {
  const res = await fetch('/api/playground/runcomfy/endpoints', {
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: (data as { error?: string }).error ?? `HTTP ${res.status}` };
  }
  if (Array.isArray(data)) return data as RunComfyDeployment[];
  if (data && typeof (data as { error?: string }).error === 'string') {
    return data as { error: string };
  }
  return { error: 'Invalid response' };
}

export async function callRunComfyEndpoint(
  deploymentId: string,
  options: { prompt?: string; seed?: number }
): Promise<PlaygroundCallResponse> {
  const res = await fetch('/api/playground/runcomfy/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deployment_id: deploymentId,
      prompt: options.prompt,
      seed: options.seed,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: (data as { error?: string }).error ?? `HTTP ${res.status}` };
  }
  return data as PlaygroundCallResponse;
}
