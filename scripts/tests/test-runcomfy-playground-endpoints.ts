#!/usr/bin/env tsx
/**
 * Test RunComfy playground API endpoints directly (no UI).
 * Requires the API to be running with RUNCOMFY_API_TOKEN set (e.g. pnpm dev:api).
 *
 * Usage:
 *   pnpm tsx scripts/tests/test-runcomfy-playground-endpoints.ts              # list only
 *   pnpm tsx scripts/tests/test-runcomfy-playground-endpoints.ts --call-one <id>  # call one deployment
 *   pnpm tsx scripts/tests/test-runcomfy-playground-endpoints.ts --call-all       # call all (slow)
 *
 * Options:
 *   --api-url <url>   API base URL (default: http://localhost:3001)
 *   --call-one <id>   Run one deployment by id
 *   --call-all        Run all deployments (one by one)
 */

const DEFAULT_API_URL = process.env.API_URL ?? 'http://localhost:3001';
const DEFAULT_PROMPT = 'a cute cat, portrait, high quality';

interface Deployment {
  id: string;
  name: string;
  workflow_id: string;
  status: string;
  is_enabled: boolean;
}

async function listEndpoints(baseUrl: string): Promise<Deployment[] | { error: string }> {
  const res = await fetch(`${baseUrl}/playground/runcomfy/endpoints`, {
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: (data as { error?: string }).error ?? `HTTP ${res.status}` };
  }
  if (Array.isArray(data)) return data as Deployment[];
  if (data && typeof (data as { error?: string }).error === 'string') {
    return data as { error: string };
  }
  return { error: 'Invalid response' };
}

async function callDeployment(
  baseUrl: string,
  deploymentId: string,
  prompt: string,
  seed: number
): Promise<{ ok: boolean; error?: string; timeSec?: number }> {
  const res = await fetch(`${baseUrl}/playground/runcomfy/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deployment_id: deploymentId,
      prompt,
      seed,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: (data as { error?: string }).error ?? `HTTP ${res.status}` };
  }
  const err = (data as { error?: string }).error;
  if (err) return { ok: false, error: err };
  const timeSec = (data as { executionTimeSec?: number }).executionTimeSec;
  const hasImage = !!(data as { imageBase64?: string }).imageBase64;
  return { ok: hasImage, timeSec, error: hasImage ? undefined : 'No image in response' };
}

function parseArgs(): { apiUrl: string; callOne?: string; callAll: boolean } {
  const args = process.argv.slice(2);
  let apiUrl = DEFAULT_API_URL;
  let callOne: string | undefined;
  let callAll = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--api-url' && args[i + 1]) {
      apiUrl = args[++i];
    } else if (args[i] === '--call-one' && args[i + 1]) {
      callOne = args[++i];
    } else if (args[i] === '--call-all') {
      callAll = true;
    }
  }
  return { apiUrl, callOne, callAll };
}

async function main() {
  const { apiUrl, callOne, callAll } = parseArgs();
  const base = apiUrl.replace(/\/$/, '');

  console.log('RunComfy playground endpoint test');
  console.log('API base:', base);
  console.log('');

  // 1. List
  console.log('1. GET /playground/runcomfy/endpoints');
  const list = await listEndpoints(base);
  if (!Array.isArray(list)) {
    console.log('   FAIL:', list.error);
    process.exit(1);
  }
  console.log(`   OK: ${list.length} deployments`);
  list.forEach((d) => {
    console.log(`      - ${d.name} (${d.id})`);
  });
  console.log('');

  if (!callOne && !callAll) {
    console.log('Done (list only). Use --call-one <id> or --call-all to test inference.');
    return;
  }

  const seed = Math.floor(Math.random() * 1e9);
  const prompt = DEFAULT_PROMPT;

  if (callOne) {
    const deployment = list.find((d) => d.id === callOne) ?? list.find((d) => d.name.includes(callOne));
    if (!deployment) {
      console.log('Deployment not found:', callOne);
      process.exit(1);
    }
    console.log(`2. POST /playground/runcomfy/call (one: ${deployment.name})`);
    const result = await callDeployment(base, deployment.id, prompt, seed);
    if (result.ok) {
      console.log(`   OK (${result.timeSec?.toFixed(1) ?? '?'}s)`);
    } else {
      console.log('   FAIL:', result.error);
      process.exit(1);
    }
    return;
  }

  // Call all
  console.log(`2. POST /playground/runcomfy/call (all ${list.length}, prompt: "${prompt.slice(0, 40)}...", seed: ${seed})`);
  let ok = 0;
  let fail = 0;
  for (const d of list) {
    const result = await callDeployment(base, d.id, prompt, seed);
    if (result.ok) {
      ok++;
      console.log(`   OK  ${d.name} (${result.timeSec?.toFixed(1) ?? '?'}s)`);
    } else {
      fail++;
      console.log(`   FAIL ${d.name}: ${result.error}`);
    }
  }
  console.log('');
  console.log(`Result: ${ok} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
