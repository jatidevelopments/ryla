#!/usr/bin/env npx tsx
/**
 * Test script for ComfyUI Pod connection
 *
 * Tests workflows from the workflow factory against the ComfyUI pod.
 *
 * Usage:
 *   pnpm test:comfyui                    # Test with recommended workflow
 *   pnpm test:comfyui -- --workflow z-image-danrisi
 *   pnpm test:comfyui -- --workflow z-image-simple
 *   pnpm test:comfyui -- --list          # List available workflows
 *   pnpm test:comfyui -- --prompts       # List available prompt templates
 *   pnpm test:comfyui -- --prompt lifestyle-coffee-shop  # Use specific prompt template
 *   pnpm test:comfyui -- --character latinaModel  # Use specific character DNA
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Import from workflow factory
import {
  listWorkflows,
  buildWorkflow,
  getWorkflowDefinition,
  getRecommendedWorkflow,
  checkWorkflowCompatibility,
  WorkflowId,
} from '../libs/business/src/workflows';

// Import from prompt library
import {
  PromptBuilder,
  promptTemplates,
  characterDNATemplates,
  getTemplateById,
  buildPrompt,
} from '../libs/business/src/prompts';

const COMFYUI_URL = process.env.COMFYUI_POD_URL;

// Parse CLI args
const args = process.argv.slice(2);
const listFlag = args.includes('--list');
const listPromptsFlag = args.includes('--prompts');
const workflowArg = args.find((a, i) => args[i - 1] === '--workflow');
const promptArg = args.find((a, i) => args[i - 1] === '--prompt');
const characterArg = args.find((a, i) => args[i - 1] === '--character');

if (listFlag) {
  console.log('📋 Available Workflows:\n');
  for (const wf of listWorkflows()) {
    console.log(`  ${wf.id}`);
    console.log(`    Name: ${wf.name}`);
    console.log(`    Description: ${wf.description}`);
    console.log(`    Required nodes: ${wf.requiredNodes.length > 0 ? wf.requiredNodes.join(', ') : 'None (built-in only)'}`);
    console.log('');
  }
  process.exit(0);
}

if (listPromptsFlag) {
  console.log('📋 Available Prompt Templates:\n');
  const byCategory = promptTemplates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, typeof promptTemplates>);

  for (const [category, templates] of Object.entries(byCategory)) {
    console.log(`  📁 ${category.toUpperCase()}`);
    for (const t of templates) {
      console.log(`     ${t.id} - ${t.name} [${t.rating}]`);
    }
    console.log('');
  }

  console.log('📋 Available Character DNA Templates:\n');
  for (const [id, dna] of Object.entries(characterDNATemplates)) {
    console.log(`  ${id}: ${dna.age} ${dna.ethnicity || ''} - ${dna.style || 'No style defined'}`);
  }
  console.log('');
  process.exit(0);
}

if (!COMFYUI_URL) {
  console.error('❌ COMFYUI_POD_URL not set in .env.local');
  process.exit(1);
}

console.log('🔧 ComfyUI Pod Test Script\n');
console.log(`📡 URL: ${COMFYUI_URL}\n`);

// Build prompt from library or use default
function buildTestPrompt(): { prompt: string; negativePrompt: string } {
  if (promptArg) {
    const template = getTemplateById(promptArg);
    if (!template) {
      console.error(`❌ Unknown prompt template: ${promptArg}`);
      console.log('   Run with --prompts to see available templates');
      process.exit(1);
    }

    const characterKey = characterArg || 'classicInfluencer';
    const character = characterDNATemplates[characterKey as keyof typeof characterDNATemplates];
    if (!character) {
      console.error(`❌ Unknown character DNA: ${characterArg}`);
      console.log('   Run with --prompts to see available characters');
      process.exit(1);
    }

    console.log(`🎨 Using prompt template: ${promptArg}`);
    console.log(`👤 Using character: ${characterKey}\n`);

    const built = new PromptBuilder()
      .withCharacter(character)
      .withTemplate(promptArg)
      .withLighting('natural.goldenHour')
      .withExpression('positive.smile')
      .withStylePreset('quality')
      .build();

    return { prompt: built.prompt, negativePrompt: built.negativePrompt };
  }

  // Default prompt
  return {
    prompt: `A beautiful woman with long flowing auburn hair, professional portrait photography, 
soft studio lighting, shallow depth of field, high quality, 8k resolution, 
wearing an elegant dark blue dress, neutral background`,
    negativePrompt: 'blurry, deformed, ugly, bad anatomy, bad hands, watermark',
  };
}

const { prompt: TEST_PROMPT, negativePrompt: TEST_NEGATIVE } = buildTestPrompt();

async function getAvailableNodes(): Promise<string[]> {
  try {
    const response = await fetch(`${COMFYUI_URL}/object_info`);
    if (!response.ok) return [];
    const data = (await response.json()) as Record<string, unknown>;
    return Object.keys(data);
  } catch {
    return [];
  }
}

async function testHealthCheck(): Promise<boolean> {
  console.log('1️⃣  Testing health check...');
  try {
    const response = await fetch(`${COMFYUI_URL}/system_stats`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = (await response.json()) as {
      system: {
        comfyui_version: string;
        python_version: string;
        pytorch_version: string;
      };
      devices?: Array<{
        name: string;
        vram_total: number;
        vram_free: number;
      }>;
    };
    console.log(`   ✅ Pod is alive`);
    console.log(`   📊 ComfyUI: v${data.system.comfyui_version}`);
    console.log(`   🐍 Python: ${data.system.python_version.split(' ')[0]}`);
    console.log(`   🔥 PyTorch: ${data.system.pytorch_version}`);

    if (data.devices?.[0]) {
      const gpu = data.devices[0];
      const vramGB = (gpu.vram_total / 1024 / 1024 / 1024).toFixed(1);
      const freeGB = (gpu.vram_free / 1024 / 1024 / 1024).toFixed(1);
      console.log(`   🎮 GPU: ${gpu.name.split(':')[0].replace('cuda:0 ', '')}`);
      console.log(`   💾 VRAM: ${freeGB}GB free / ${vramGB}GB total`);
    }
    return true;
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error}`);
    return false;
  }
}

async function testModels(workflowId: WorkflowId): Promise<boolean> {
  console.log('\n2️⃣  Checking available models...');
  try {
    const definition = getWorkflowDefinition(workflowId);
    const required = definition.requiredModels;

    // Check diffusion models
    const unetResp = await fetch(`${COMFYUI_URL}/object_info/UNETLoader`);
    const unetData = (await unetResp.json()) as {
      UNETLoader?: { input?: { required?: { unet_name?: [string[]] } } };
    };
    const unets = unetData.UNETLoader?.input?.required?.unet_name?.[0] || [];

    // Check text encoders
    const clipResp = await fetch(`${COMFYUI_URL}/object_info/CLIPLoader`);
    const clipData = (await clipResp.json()) as {
      CLIPLoader?: { input?: { required?: { clip_name?: [string[]] } } };
    };
    const clips = clipData.CLIPLoader?.input?.required?.clip_name?.[0] || [];

    // Check VAEs
    const vaeResp = await fetch(`${COMFYUI_URL}/object_info/VAELoader`);
    const vaeData = (await vaeResp.json()) as {
      VAELoader?: { input?: { required?: { vae_name?: [string[]] } } };
    };
    const vaes = vaeData.VAELoader?.input?.required?.vae_name?.[0] || [];

    console.log(`   📦 Diffusion: ${unets.slice(0, 3).join(', ')}${unets.length > 3 ? '...' : ''}`);
    console.log(`   📝 Encoders: ${clips.slice(0, 3).join(', ')}${clips.length > 3 ? '...' : ''}`);
    console.log(`   🎨 VAEs: ${vaes.slice(0, 3).join(', ')}${vaes.length > 3 ? '...' : ''}`);

    // Check for required models
    const hasDiffusion = !required.diffusion || unets.includes(required.diffusion);
    const hasEncoder = !required.textEncoder || clips.includes(required.textEncoder);
    const hasVae = !required.vae || vaes.includes(required.vae);

    if (hasDiffusion && hasEncoder && hasVae) {
      console.log(`   ✅ All required models for '${workflowId}' present`);
      return true;
    } else {
      console.log(`   ⚠️  Missing models for '${workflowId}':`);
      if (!hasDiffusion) console.log(`      - ${required.diffusion}`);
      if (!hasEncoder) console.log(`      - ${required.textEncoder}`);
      if (!hasVae) console.log(`      - ${required.vae}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Model check failed: ${error}`);
    return false;
  }
}

async function testNodeCompatibility(workflowId: WorkflowId): Promise<boolean> {
  console.log('\n3️⃣  Checking node compatibility...');
  try {
    const availableNodes = await getAvailableNodes();
    const { compatible, missingNodes } = checkWorkflowCompatibility(
      workflowId,
      availableNodes
    );

    if (compatible) {
      console.log(`   ✅ All required nodes for '${workflowId}' available`);
      return true;
    } else {
      console.log(`   ⚠️  Missing nodes for '${workflowId}':`);
      for (const node of missingNodes) {
        console.log(`      - ${node}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Node check failed: ${error}`);
    return false;
  }
}

async function testGeneration(workflowId: WorkflowId): Promise<boolean> {
  console.log(`\n4️⃣  Testing image generation with '${workflowId}'...`);
  console.log('   📤 Submitting workflow...');

  try {
    const startTime = Date.now();

    // Build workflow from factory
    const workflow = buildWorkflow(workflowId, {
      prompt: TEST_PROMPT,
      width: 1024,
      height: 1024,
      seed: 42,
      filenamePrefix: `test_${workflowId.replace(/-/g, '_')}`,
    });

    // Queue the workflow
    const queueResp = await fetch(`${COMFYUI_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!queueResp.ok) {
      const error = await queueResp.text();
      throw new Error(`Queue failed: ${error}`);
    }

    const queueData = (await queueResp.json()) as { prompt_id: string };
    const promptId = queueData.prompt_id;
    console.log(`   ✅ Queued: ${promptId}`);

    // Poll for completion
    console.log('   ⏳ Waiting for completion...');
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;

      const historyResp = await fetch(`${COMFYUI_URL}/history/${promptId}`);
      if (!historyResp.ok) continue;

      const history = (await historyResp.json()) as Record<
        string,
        {
          status?: { completed: boolean; status_str: string };
          outputs?: Record<string, { images?: Array<{ filename: string; subfolder: string; type: string }> }>;
        }
      >;
      const item = history[promptId];

      if (!item) continue;

      if (item.status?.completed) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        if (item.status.status_str === 'success') {
          // Find output images
          let imageCount = 0;
          for (const output of Object.values(item.outputs || {})) {
            const images = output.images || [];
            imageCount += images.length;

            // Download first image
            if (images.length > 0 && imageCount === 1) {
              const img = images[0];
              const imgResp = await fetch(
                `${COMFYUI_URL}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`
              );

              if (imgResp.ok) {
                const buffer = await imgResp.arrayBuffer();
                const outputPath = path.join(
                  process.cwd(),
                  'tmp',
                  `test-${workflowId}.png`
                );
                fs.mkdirSync(path.dirname(outputPath), { recursive: true });
                fs.writeFileSync(outputPath, Buffer.from(buffer));
                console.log(`   💾 Saved: ${outputPath}`);
              }
            }
          }

          console.log(`   ✅ Generated ${imageCount} image(s) in ${duration}s`);
          return true;
        } else {
          console.log(`   ❌ Generation failed: ${item.status.status_str}`);
          return false;
        }
      }

      if (attempts % 5 === 0) {
        console.log(`   ⏳ Still processing... (${attempts * 2}s)`);
      }
    }

    console.log('   ❌ Timeout waiting for generation');
    return false;
  } catch (error) {
    console.log(`   ❌ Generation test failed: ${error}`);
    return false;
  }
}

async function main() {
  // Get available nodes to determine best workflow
  const availableNodes = await getAvailableNodes();

  // Determine workflow to test
  let workflowId: WorkflowId;
  if (workflowArg && (workflowArg === 'z-image-danrisi' || workflowArg === 'z-image-simple')) {
    workflowId = workflowArg;
    console.log(`📦 Using specified workflow: ${workflowId}`);
  } else {
    workflowId = getRecommendedWorkflow(availableNodes);
    console.log(`📦 Auto-selected workflow: ${workflowId}`);
  }

  const definition = getWorkflowDefinition(workflowId);
  console.log(`   ${definition.description}\n`);

  const results = {
    health: false,
    models: false,
    nodes: false,
    generation: false,
  };

  // Run tests
  results.health = await testHealthCheck();

  if (results.health) {
    results.models = await testModels(workflowId);
    results.nodes = await testNodeCompatibility(workflowId);
  }

  if (results.models && results.nodes) {
    results.generation = await testGeneration(workflowId);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 Test Results\n');
  console.log(`   Health Check:  ${results.health ? '✅ Pass' : '❌ Fail'}`);
  console.log(`   Models Check:  ${results.models ? '✅ Pass' : '❌ Fail'}`);
  console.log(`   Nodes Check:   ${results.nodes ? '✅ Pass' : '❌ Fail'}`);
  console.log(`   Generation:    ${results.generation ? '✅ Pass' : '❌ Fail'}`);
  console.log('\n' + '='.repeat(50));

  const allPassed =
    results.health && results.models && results.nodes && results.generation;

  if (allPassed) {
    console.log(
      `\n🎉 All tests passed! Workflow '${workflowId}' is ready for production.\n`
    );
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.\n');
  }

  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
