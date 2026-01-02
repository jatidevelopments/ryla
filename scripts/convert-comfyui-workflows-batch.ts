#!/usr/bin/env npx tsx
/**
 * Batch convert all workflows in libs/comfyui-workflows/**\/*.json to ComfyUI API prompt JSON.
 *
 * Writes mirrored outputs to: libs/comfyui-workflows-api/<same path>.api.json
 * Also writes a manifest:      libs/comfyui-workflows-api/manifest.json
 *
 * Requirements:
 * - COMFYUI_POD_URL must expose POST /workflow/convert
 *
 * Usage:
 *   pnpm workflow:convert:all
 *   pnpm workflow:convert:all -- --dry
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

type ApiPrompt = Record<string, { class_type: string; inputs: Record<string, unknown> }>;

function isApiPromptJson(value: unknown): value is ApiPrompt {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 0) return false;
  return keys.every((k) => {
    const node = (obj as any)[k];
    return node && typeof node === 'object' && typeof node.class_type === 'string' && node.inputs && typeof node.inputs === 'object';
  });
}

function walkJsonFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJsonFiles(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) out.push(full);
  }
  return out;
}

async function postJson<T>(url: string, body: unknown, timeoutMs = 120000): Promise<T> {
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

function getKindFromRelPath(rel: string): 'image' | 'video' | 'audio' | '3d' | 'unknown' {
  const top = rel.split(path.sep)[0] || '';
  if (top === 'video') return 'video';
  if (top === 'audio') return 'audio';
  if (top === '3d') return '3d';
  if (top === 'flux' || top === 'image-generation') return 'image';
  return 'unknown';
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');

  const baseUrl = process.env.COMFYUI_POD_URL;
  if (!baseUrl) {
    console.error('❌ COMFYUI_POD_URL is required.');
    process.exit(1);
  }
  const convertUrl = `${baseUrl.replace(/\/$/, '')}/workflow/convert`;

  const srcRoot = path.resolve(process.cwd(), 'libs', 'comfyui-workflows');
  const dstRoot = path.resolve(process.cwd(), 'libs', 'comfyui-workflows-api');
  fs.mkdirSync(dstRoot, { recursive: true });

  const files = walkJsonFiles(srcRoot);
  console.log(`📦 Found ${files.length} workflow JSON files under libs/comfyui-workflows`);

  const manifest: Array<{
    source: string;
    output: string;
    kind: 'image' | 'video' | 'audio' | '3d' | 'unknown';
    nodeCount: number;
    convertedAt: string;
    status: 'converted' | 'passthrough' | 'failed';
    error?: string;
  }> = [];

  for (const absIn of files) {
    const rel = path.relative(srcRoot, absIn);
    const kind = getKindFromRelPath(rel);
    const outRel = rel.replace(/\.json$/i, '.api.json');
    const absOut = path.join(dstRoot, outRel);

    let status: 'converted' | 'passthrough' | 'failed' = 'converted';
    let nodeCount = 0;
    let error: string | undefined;

    try {
      const raw = JSON.parse(fs.readFileSync(absIn, 'utf-8')) as unknown;
      let prompt: ApiPrompt;

      if (isApiPromptJson(raw)) {
        status = 'passthrough';
        prompt = raw;
      } else {
        const converted = await postJson<Record<string, unknown>>(convertUrl, raw);
        const maybePrompt = (converted as any).prompt ?? converted;
        if (!isApiPromptJson(maybePrompt)) {
          throw new Error('Converter response was not API prompt JSON');
        }
        prompt = maybePrompt;
      }

      nodeCount = Object.keys(prompt).length;

      if (!dry) {
        fs.mkdirSync(path.dirname(absOut), { recursive: true });
        fs.writeFileSync(absOut, JSON.stringify(prompt, null, 2));
      }
      console.log(`✅ ${rel} → ${path.relative(process.cwd(), absOut)} (${status}, nodes=${nodeCount})`);
    } catch (e) {
      status = 'failed';
      error = e instanceof Error ? e.message : String(e);
      console.log(`❌ ${rel} (${error})`);
    }

    manifest.push({
      source: path.posix.join('libs/comfyui-workflows', rel.split(path.sep).join('/')),
      output: path.posix.join('libs/comfyui-workflows-api', outRel.split(path.sep).join('/')),
      kind,
      nodeCount,
      convertedAt: new Date().toISOString(),
      status,
      error,
    });
  }

  if (!dry) {
    const manifestPath = path.join(dstRoot, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📄 Wrote manifest: ${path.relative(process.cwd(), manifestPath)}`);
  } else {
    console.log('🧪 Dry run: no files written');
  }
}

main().catch((err) => {
  console.error(`❌ Batch conversion failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});


