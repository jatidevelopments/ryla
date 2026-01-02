#!/usr/bin/env npx tsx
/**
 * Convert a ComfyUI UI-exported workflow JSON (graph editor format) to API prompt JSON format.
 *
 * Why: ComfyUI UI exports use { nodes: [], links: [] } format, while the API /prompt expects a "prompt"
 * graph: { "1": { class_type, inputs }, ... }.
 *
 * This CLI uses a server-side converter endpoint (when installed on the ComfyUI pod):
 *   POST {COMFYUI_POD_URL}/workflow/convert  (body: UI JSON) -> returns API prompt JSON
 *
 * If the input is already API format, the CLI will validate and pass through.
 *
 * Usage:
 *   pnpm workflow:convert -- --in libs/comfyui-workflows/flux/inpaint/inpaint.json --out tmp/workflows/inpaint.api.json
 *   pnpm workflow:convert -- --in path/to/ui-export.json              # writes to tmp/workflows/<name>.api.json
 *
 * Env:
 *   COMFYUI_POD_URL=https://...  (required for converting UI JSON; not required for pass-through)
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

type Json = Record<string, unknown>;

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function isApiPromptJson(value: unknown): value is Record<string, { class_type: string; inputs: Record<string, unknown> }> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 0) return false;
  // Heuristic: prompt JSON is a map of nodeId -> node object containing class_type and inputs.
  return keys.every((k) => {
    const node = obj[k] as any;
    return node && typeof node === 'object' && typeof node.class_type === 'string' && node.inputs && typeof node.inputs === 'object';
  });
}

function isUiWorkflowJson(value: unknown): value is { nodes: unknown[]; links?: unknown[] } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as any;
  return Array.isArray(obj.nodes);
}

function argValue(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

async function postJson<T>(url: string, body: unknown, timeoutMs = 30000): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} ${txt}`.trim());
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const inputPath = argValue(args, '--in');
  const outPathArg = argValue(args, '--out');
  const baseUrlArg = argValue(args, '--baseUrl');
  const endpointArg = argValue(args, '--endpoint') ?? '/workflow/convert';

  if (!inputPath) {
    console.error('❌ Missing --in <path-to-json>');
    process.exit(1);
  }

  const absIn = path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
  const raw = readJson(absIn);

  // Pass-through for API prompt format
  if (isApiPromptJson(raw)) {
    const outPath =
      outPathArg
        ? (path.isAbsolute(outPathArg) ? outPathArg : path.resolve(process.cwd(), outPathArg))
        : path.resolve(process.cwd(), 'tmp', 'workflows', `${path.basename(absIn, path.extname(absIn))}.api.json`);

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(raw, null, 2));
    console.log(`✅ Input already in API prompt format. Wrote: ${outPath}`);
    return;
  }

  if (!isUiWorkflowJson(raw)) {
    console.error('❌ Input JSON is neither a ComfyUI UI-export workflow (nodes[]) nor API prompt JSON.');
    process.exit(1);
  }

  const baseUrl = baseUrlArg ?? process.env.COMFYUI_POD_URL;
  if (!baseUrl) {
    console.error('❌ COMFYUI_POD_URL is required to convert UI workflow JSON via CLI.');
    console.error('   Tip: In ComfyUI UI, enable Dev Mode and use Workflow → Save (API Format) to export directly.');
    process.exit(1);
  }

  const convertUrl = `${baseUrl.replace(/\/$/, '')}${endpointArg}`;
  console.log(`🔁 Converting via ${convertUrl}`);

  let converted: Record<string, unknown>;
  try {
    converted = await postJson<Record<string, unknown>>(convertUrl, raw, 60000);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Common case: converter endpoint isn't installed on the pod.
    if (msg.includes('HTTP 404') || msg.includes('HTTP 405')) {
      console.error(`❌ Converter endpoint not available at: ${convertUrl}`);
      console.error('   This CLI requires a ComfyUI plugin that exposes POST /workflow/convert.');
      console.error('   Alternative: In ComfyUI UI enable Dev mode and use Workflow → Save (API Format) / Export (API).');
      process.exit(1);
    }
    throw err;
  }

  // Some converters return { prompt: {...} } while others return {...} directly.
  const prompt = (converted as any).prompt ?? converted;
  if (!isApiPromptJson(prompt)) {
    console.error('❌ Converter response did not look like API prompt JSON.');
    console.error('   Response keys:', Object.keys(converted || {}));
    process.exit(1);
  }

  const outPath =
    outPathArg
      ? (path.isAbsolute(outPathArg) ? outPathArg : path.resolve(process.cwd(), outPathArg))
      : path.resolve(process.cwd(), 'tmp', 'workflows', `${path.basename(absIn, path.extname(absIn))}.api.json`);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(prompt, null, 2));
  console.log(`✅ Converted. Wrote: ${outPath}`);
}

main().catch((err) => {
  console.error(`❌ Conversion failed: ${(err instanceof Error ? err.message : String(err))}`);
  process.exit(1);
});


