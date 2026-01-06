#!/usr/bin/env npx tsx
/**
 * Benchmark Image Generation (Wizard-like flow)
 *
 * Speed tests across:
 * - base images (3 options)
 * - profile picture set generation (fast vs consistent)
 *
 * This script targets the ComfyUI pod directly (COMFYUI_POD_URL) to measure raw generation latency.
 *
 * Usage:
 *   pnpm benchmark:images
 *   pnpm benchmark:images -- --vertical classicInfluencer
 *   pnpm benchmark:images -- --mode fast
 *
 * Env:
 *   COMFYUI_POD_URL=<pod url>
 *
 * Output:
 *   tmp/benchmarks/benchmark-<timestamp>.json
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

import {
  PromptBuilder,
  characterDNATemplates,
} from '../libs/business/src/prompts';
import {
  buildWorkflow,
  checkWorkflowCompatibility,
  getRecommendedWorkflow,
  WorkflowId,
} from '../libs/business/src/workflows';
import { getProfilePictureSet, buildProfilePicturePrompt } from '../libs/business/src/prompts/profile-picture-sets';
import { buildZImagePuLIDWorkflow } from '../libs/business/src/workflows/z-image-pulid';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const COMFYUI_URL = process.env['COMFYUI_POD_URL'];
if (!COMFYUI_URL) {
  console.error('❌ COMFYUI_POD_URL not set');
  process.exit(1);
}

type BenchmarkMode = 'fast' | 'consistent' | 'both';

type VerticalConfig = {
  id: string;
  name: string;
  characterDnaTemplate: string;
  promptTemplate: string;
  profileSetId: 'classic-influencer' | 'professional-model' | 'natural-beauty';
};

type BenchmarkConfig = {
  defaults: {
    baseImages: { count: number; width: number; height: number; steps: number; cfg: number };
    profilePictures: {
      setId: 'classic-influencer' | 'professional-model' | 'natural-beauty';
      nsfwEnabled: boolean;
      fast: { width: number; steps: number; cfg: number };
      consistent: { width: number; steps: number; cfg: number };
    };
  };
  verticals: VerticalConfig[];
};

type ComfyUIHistoryItem = {
  outputs: Record<
    string,
    {
      images?: Array<{
        filename: string;
        subfolder: string;
        type: string;
      }>;
    }
  >;
  status: {
    status_str: 'success' | 'error';
    completed: boolean;
    messages: Array<[string, unknown]>;
  };
};

function parseArgs() {
  const args = process.argv.slice(2);
  const vertical = args.find((a, i) => args[i - 1] === '--vertical');
  const modeArg = args.find((a, i) => args[i - 1] === '--mode') as BenchmarkMode | undefined;
  const mode: BenchmarkMode = modeArg && ['fast', 'consistent', 'both'].includes(modeArg) ? modeArg : 'both';
  const limitPositionsRaw = args.find((a, i) => args[i - 1] === '--limitPositions');
  const limitPositions = limitPositionsRaw ? Number(limitPositionsRaw) : undefined;
  if (limitPositionsRaw && (!Number.isFinite(limitPositions) || limitPositions <= 0)) {
    console.error(`❌ Invalid --limitPositions value: ${limitPositionsRaw} (must be a positive number)`);
    process.exit(1);
  }
  return { vertical, mode, limitPositions };
}

async function getAvailableNodes(): Promise<string[]> {
  try {
    const response = await fetch(`${COMFYUI_URL}/object_info`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return [];
    const data = (await response.json()) as Record<string, unknown>;
    return Object.keys(data);
  } catch {
    return [];
  }
}

async function queueWorkflow(workflow: unknown): Promise<string> {
  const response = await fetch(`${COMFYUI_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow }),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Failed to queue workflow: HTTP ${response.status} ${errorText}`);
  }
  const data = (await response.json()) as { prompt_id: string; node_errors?: Record<string, unknown> };
  if (data.node_errors && Object.keys(data.node_errors).length > 0) {
    throw new Error(`ComfyUI node_errors: ${JSON.stringify(data.node_errors)}`);
  }
  return data.prompt_id;
}

async function getHistory(promptId: string): Promise<ComfyUIHistoryItem | null> {
  const response = await fetch(`${COMFYUI_URL}/history/${promptId}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`history/${promptId} failed: ${response.statusText}`);
  const history = (await response.json()) as Record<string, ComfyUIHistoryItem>;
  return history[promptId] ?? null;
}

async function waitForCompletion(promptId: string, timeoutMs: number): Promise<{ ok: boolean; history?: ComfyUIHistoryItem; error?: string; durationMs: number; }> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const item = await getHistory(promptId);
    if (!item) {
      await new Promise((r) => setTimeout(r, 750));
      continue;
    }
    if (!item.status.completed) {
      await new Promise((r) => setTimeout(r, 750));
      continue;
    }

    if (item.status.status_str === 'error') {
      const msg = item.status.messages.map(([t, d]) => `${t}: ${JSON.stringify(d)}`).join('; ');
      return { ok: false, error: msg, durationMs: Date.now() - start };
    }
    return { ok: true, history: item, durationMs: Date.now() - start };
  }
  return { ok: false, error: `timeout after ${timeoutMs}ms`, durationMs: Date.now() - start };
}

function firstOutputImageRef(history: ComfyUIHistoryItem): { filename: string; subfolder: string; type: string } | null {
  for (const nodeOutput of Object.values(history.outputs)) {
    const img = nodeOutput.images?.[0];
    if (img) return img;
  }
  return null;
}

async function downloadImage(ref: { filename: string; subfolder: string; type: string }): Promise<Buffer> {
  const params = new URLSearchParams({
    filename: ref.filename,
    subfolder: ref.subfolder,
    type: ref.type,
  });
  const response = await fetch(`${COMFYUI_URL}/view?${params.toString()}`);
  if (!response.ok) throw new Error(`download image failed: ${response.statusText}`);
  const buf = Buffer.from(await response.arrayBuffer());
  return buf;
}

async function uploadImageToComfyUI(imageBuffer: Buffer, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append('image', new Blob([imageBuffer], { type: 'image/png' }), filename);
  formData.append('subfolder', '');
  formData.append('type', 'input');

  const response = await fetch(`${COMFYUI_URL}/upload/image`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`upload image failed: HTTP ${response.status} ${errorText}`);
  }
  const result = (await response.json()) as { name: string };
  return result.name;
}

function dimsForAspectRatio(aspectRatio: '1:1' | '4:5' | '9:16' | undefined, baseWidth: number) {
  const ratio = aspectRatio ?? '1:1';
  switch (ratio) {
    case '4:5':
      return { width: baseWidth, height: Math.round(baseWidth * 5 / 4) };
    case '9:16':
      return { width: baseWidth, height: Math.round(baseWidth * 16 / 9) };
    case '1:1':
    default:
      return { width: baseWidth, height: baseWidth };
  }
}

async function main() {
  const { vertical: verticalArg, mode, limitPositions } = parseArgs();
  const cfgPath = path.resolve(process.cwd(), 'scripts/docs/benchmarks/verticals.json');
  const config = JSON.parse(fs.readFileSync(cfgPath, 'utf-8')) as BenchmarkConfig;

  const availableNodes = await getAvailableNodes();
  const recommended = getRecommendedWorkflow(availableNodes);

  const canDanrisi = checkWorkflowCompatibility('z-image-danrisi', availableNodes).compatible;
  const canPulid = checkWorkflowCompatibility('z-image-pulid', availableNodes).compatible;

  const baseWorkflows: WorkflowId[] = canDanrisi ? ['z-image-danrisi', 'z-image-simple'] : ['z-image-simple'];
  const fastWorkflow: WorkflowId = recommended;

  const verticals = verticalArg
    ? config.verticals.filter((v) => v.id === verticalArg)
    : config.verticals;

  if (verticals.length === 0) {
    console.error(`❌ Unknown vertical: ${verticalArg}`);
    process.exit(1);
  }

  const runId = `benchmark-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const startedAt = new Date().toISOString();

  console.log(`🏁 Image Generation Benchmark`);
  console.log(`📡 ComfyUI: ${COMFYUI_URL}`);
  console.log(`🧩 Nodes: ${availableNodes.length} (danrisi=${canDanrisi ? 'yes' : 'no'}, pulid=${canPulid ? 'yes' : 'no'})`);
  console.log(`⭐ Recommended workflow: ${recommended}`);
  console.log(`🎯 Mode: ${mode}`);
  if (limitPositions) console.log(`🔢 limitPositions: ${limitPositions}`);
  console.log(`🧪 Verticals: ${verticals.map((v) => v.id).join(', ')}`);
  console.log('');

  const results: any = {
    runId,
    startedAt,
    comfyuiUrl: COMFYUI_URL,
    availableNodesCount: availableNodes.length,
    compatible: { danrisi: canDanrisi, pulid: canPulid },
    recommendedWorkflow: recommended,
    mode,
    verticals: [],
  };

  for (const v of verticals) {
    const dna = (characterDNATemplates as Record<string, any>)[v.characterDnaTemplate];
    if (!dna) {
      console.warn(`⚠️  Skipping vertical ${v.id}: unknown characterDnaTemplate=${v.characterDnaTemplate}`);
      continue;
    }

    console.log(`\n🧑‍🎤 Vertical: ${v.name} (${v.id})`);

    const built = new PromptBuilder()
      .withCharacter(dna)
      .withTemplate(v.promptTemplate)
      .withLighting('natural.soft')
      .withExpression('positive.confident')
      .withStylePreset('quality')
      .build();

    const verticalResult: any = {
      id: v.id,
      name: v.name,
      basePromptTemplate: v.promptTemplate,
      profileSetId: v.profileSetId,
      baseImages: [],
      profilePictures: [],
    };

    // -----------------------------------------------------------------------
    // Base Images
    // -----------------------------------------------------------------------
    for (const wf of baseWorkflows) {
      console.log(`  🖼️  Base images: workflow=${wf}`);
      const jobs: string[] = [];
      const seeds: number[] = [];
      const baseCount = config.defaults.baseImages.count;

      const tQueueStart = Date.now();
      for (let i = 0; i < baseCount; i++) {
        const seed = Math.floor(Math.random() * 2 ** 32);
        seeds.push(seed);
        const workflow = buildWorkflow(wf, {
          prompt: built.prompt,
          negativePrompt: built.negativePrompt,
          width: config.defaults.baseImages.width,
          height: config.defaults.baseImages.height,
          steps: config.defaults.baseImages.steps,
          cfg: config.defaults.baseImages.cfg,
          seed,
          filenamePrefix: `bench_base_${v.id}_${wf}`,
        });
        jobs.push(await queueWorkflow(workflow));
      }
      const queueMs = Date.now() - tQueueStart;

      const completions = await Promise.all(
        jobs.map((id) => waitForCompletion(id, 10 * 60 * 1000)),
      );

      const okCount = completions.filter((c) => c.ok).length;
      const firstDoneMs = completions.reduce((min, c) => Math.min(min, c.durationMs), Number.POSITIVE_INFINITY);
      const allDoneMs = completions.reduce((max, c) => Math.max(max, c.durationMs), 0);

      console.log(`     ⏱️  queued=${queueMs}ms | first=${Math.round(firstDoneMs)}ms | all=${Math.round(allDoneMs)}ms | ok=${okCount}/${jobs.length}`);

      verticalResult.baseImages.push({
        workflowId: wf,
        steps: config.defaults.baseImages.steps,
        width: config.defaults.baseImages.width,
        height: config.defaults.baseImages.height,
        queuedMs: queueMs,
        firstCompletedMs: firstDoneMs,
        allCompletedMs: allDoneMs,
        jobs: jobs.map((id, idx) => ({
          jobId: id,
          seed: seeds[idx],
          ok: completions[idx].ok,
          durationMs: completions[idx].durationMs,
          error: completions[idx].error,
        })),
      });
    }

    // Pick a reference image (first successful base image from the first workflow)
    let referenceImageFilename: string | null = null;
    if (mode !== 'fast' && canPulid) {
      const baseBlock = verticalResult.baseImages?.[0];
      const firstOk = baseBlock?.jobs?.find((j: any) => j.ok);
      if (firstOk) {
        const completion = await waitForCompletion(firstOk.jobId, 2 * 60 * 1000);
        if (completion.ok && completion.history) {
          const imgRef = firstOutputImageRef(completion.history);
          if (imgRef) {
            const buffer = await downloadImage(imgRef);
            referenceImageFilename = await uploadImageToComfyUI(
              buffer,
              `bench_ref_${v.id}_${Date.now()}.png`,
            );
          }
        }
      }
    }

    // -----------------------------------------------------------------------
    // Profile Pictures
    // -----------------------------------------------------------------------
    const set = getProfilePictureSet(v.profileSetId);
    if (!set) {
      console.warn(`⚠️  Skipping profile pictures for ${v.id}: unknown setId=${v.profileSetId}`);
      results.verticals.push(verticalResult);
      continue;
    }

    const positions = limitPositions ? set.positions.slice(0, limitPositions) : set.positions.slice(0); // full set by default
    if (mode === 'fast' || mode === 'both') {
      console.log(`  👤 Profile pics: mode=fast workflow=${fastWorkflow}`);
      const tQueueStart = Date.now();
      const jobPositions: Array<{ jobId: string; positionId: string; positionName: string }> = [];

      await Promise.all(
        positions.map(async (pos) => {
          const { prompt, negativePrompt } = buildProfilePicturePrompt(set, pos as any);
          const dims = dimsForAspectRatio(pos.aspectRatio as any, config.defaults.profilePictures.fast.width);
          const workflow = buildWorkflow(fastWorkflow, {
            prompt,
            negativePrompt,
            width: dims.width,
            height: dims.height,
            steps: config.defaults.profilePictures.fast.steps,
            cfg: config.defaults.profilePictures.fast.cfg,
            seed: Math.floor(Math.random() * 2 ** 32),
            filenamePrefix: `bench_profile_fast_${v.id}`,
          });
          const jobId = await queueWorkflow(workflow);
          jobPositions.push({ jobId, positionId: pos.id, positionName: pos.name });
        }),
      );

      const queueMs = Date.now() - tQueueStart;
      const completions = await Promise.all(jobPositions.map((jp) => waitForCompletion(jp.jobId, 15 * 60 * 1000)));
      const okCount = completions.filter((c) => c.ok).length;
      const firstDoneMs = completions.reduce((min, c) => Math.min(min, c.durationMs), Number.POSITIVE_INFINITY);
      const allDoneMs = completions.reduce((max, c) => Math.max(max, c.durationMs), 0);

      console.log(`     ⏱️  queued=${queueMs}ms | first=${Math.round(firstDoneMs)}ms | all=${Math.round(allDoneMs)}ms | ok=${okCount}/${jobPositions.length}`);

      verticalResult.profilePictures.push({
        mode: 'fast',
        workflowId: fastWorkflow,
        steps: config.defaults.profilePictures.fast.steps,
        baseWidth: config.defaults.profilePictures.fast.width,
        queuedMs: queueMs,
        firstCompletedMs: firstDoneMs,
        allCompletedMs: allDoneMs,
        jobs: jobPositions.map((jp, idx) => ({
          ...jp,
          ok: completions[idx].ok,
          durationMs: completions[idx].durationMs,
          error: completions[idx].error,
        })),
      });
    }

    if ((mode === 'consistent' || mode === 'both') && canPulid) {
      if (!referenceImageFilename) {
        console.warn(`  ⚠️  Skipping consistent mode: no reference image available`);
      } else {
        console.log(`  👤 Profile pics: mode=consistent workflow=z-image-pulid`);

        const tQueueStart = Date.now();
        const jobPositions: Array<{ jobId: string; positionId: string; positionName: string }> = [];

        await Promise.all(
          positions.map(async (pos) => {
            const { prompt, negativePrompt } = buildProfilePicturePrompt(set, pos as any);
            const dims = dimsForAspectRatio(pos.aspectRatio as any, config.defaults.profilePictures.consistent.width);
            const workflow = buildZImagePuLIDWorkflow({
              prompt,
              negativePrompt,
              referenceImage: referenceImageFilename,
              width: dims.width,
              height: dims.height,
              steps: config.defaults.profilePictures.consistent.steps,
              cfg: config.defaults.profilePictures.consistent.cfg,
              seed: Math.floor(Math.random() * 2 ** 32),
              filenamePrefix: `bench_profile_consistent_${v.id}`,
              pulidStrength: 0.8,
              pulidStart: 0.0,
              pulidEnd: 0.8,
            } as any);

            const jobId = await queueWorkflow(workflow);
            jobPositions.push({ jobId, positionId: pos.id, positionName: pos.name });
          }),
        );

        const queueMs = Date.now() - tQueueStart;
        const completions = await Promise.all(jobPositions.map((jp) => waitForCompletion(jp.jobId, 20 * 60 * 1000)));
        const okCount = completions.filter((c) => c.ok).length;
        const firstDoneMs = completions.reduce((min, c) => Math.min(min, c.durationMs), Number.POSITIVE_INFINITY);
        const allDoneMs = completions.reduce((max, c) => Math.max(max, c.durationMs), 0);

        console.log(`     ⏱️  queued=${queueMs}ms | first=${Math.round(firstDoneMs)}ms | all=${Math.round(allDoneMs)}ms | ok=${okCount}/${jobPositions.length}`);

        verticalResult.profilePictures.push({
          mode: 'consistent',
          workflowId: 'z-image-pulid',
          steps: config.defaults.profilePictures.consistent.steps,
          baseWidth: config.defaults.profilePictures.consistent.width,
          queuedMs: queueMs,
          firstCompletedMs: firstDoneMs,
          allCompletedMs: allDoneMs,
          jobs: jobPositions.map((jp, idx) => ({
            ...jp,
            ok: completions[idx].ok,
            durationMs: completions[idx].durationMs,
            error: completions[idx].error,
          })),
        });
      }
    }

    results.verticals.push(verticalResult);
  }

  const outDir = path.resolve(process.cwd(), 'tmp/benchmarks');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${runId}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`\n✅ Benchmark complete`);
  console.log(`📄 Results: ${outPath}`);
}

main().catch((err) => {
  console.error('❌ Benchmark failed:', err);
  process.exit(1);
});


