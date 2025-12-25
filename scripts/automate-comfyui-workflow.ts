#!/usr/bin/env npx tsx
/**
 * Automatisiertes ComfyUI Workflow Tool
 *
 * Dieses Tool automatisiert:
 * 1. Workflow-Einfügen über die ComfyUI API
 * 2. Model-Prüfung und Installation (wenn möglich)
 * 3. Workflow-Ausführung
 * 4. Automatisches Extrahieren und Speichern der Bilder
 *
 * Usage:
 *   pnpm automate:workflow --workflow z-image-simple --prompt "A beautiful portrait"
 *   pnpm automate:workflow --workflow z-image-danrisi --prompt "..." --output ./output
 *   pnpm automate:workflow --workflow z-image-pulid --prompt "..." --reference ./face.png
 *   pnpm automate:workflow --list                    # Liste verfügbarer Workflows
 *   pnpm automate:workflow --check-models            # Prüfe verfügbare Models
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
  checkWorkflowCompatibility,
  WorkflowId,
  REFERENCE_IMAGE_WORKFLOWS,
} from '../libs/business/src/workflows';

// Import ComfyUI client
import { ComfyUIPodClient } from '../libs/business/src/services/comfyui-pod-client';

const COMFYUI_URL = process.env.COMFYUI_POD_URL;

// Parse CLI args
const args = process.argv.slice(2);
const listFlag = args.includes('--list');
const checkModelsFlag = args.includes('--check-models');
const workflowArg = args.find((a, i) => args[i - 1] === '--workflow');
const promptArg = args.find((a, i) => args[i - 1] === '--prompt');
const outputArg = args.find((a, i) => args[i - 1] === '--output');
const referenceArg = args.find((a, i) => args[i - 1] === '--reference');
const widthArg = args.find((a, i) => args[i - 1] === '--width');
const heightArg = args.find((a, i) => args[i - 1] === '--height');
const seedArg = args.find((a, i) => args[i - 1] === '--seed');
const timeoutArg = args.find((a, i) => args[i - 1] === '--timeout');

if (listFlag) {
  console.log('📋 Verfügbare Workflows:\n');
  for (const wf of listWorkflows()) {
    console.log(`  ${wf.id}`);
    console.log(`    Name: ${wf.name}`);
    console.log(`    Beschreibung: ${wf.description}`);
    console.log(`    Erforderliche Models:`);
    if (wf.requiredModels.diffusion) {
      console.log(`      - Diffusion: ${wf.requiredModels.diffusion}`);
    }
    if (wf.requiredModels.textEncoder) {
      console.log(`      - Text Encoder: ${wf.requiredModels.textEncoder}`);
    }
    if (wf.requiredModels.vae) {
      console.log(`      - VAE: ${wf.requiredModels.vae}`);
    }
    if (wf.requiredModels.lora?.length) {
      console.log(`      - LoRAs: ${wf.requiredModels.lora.join(', ')}`);
    }
    console.log(
      `    Erforderliche Nodes: ${wf.requiredNodes.length > 0 ? wf.requiredNodes.join(', ') : 'Keine (nur Built-in)'}`
    );
    console.log('');
  }
  process.exit(0);
}

if (!COMFYUI_URL) {
  console.error('❌ COMFYUI_POD_URL nicht in .env.local gesetzt');
  process.exit(1);
}

const client = new ComfyUIPodClient({
  baseUrl: COMFYUI_URL,
  timeout: timeoutArg ? parseInt(timeoutArg, 10) : 300000, // 5 Minuten Standard
});

/**
 * Prüft verfügbare Models auf dem Pod
 */
async function checkAvailableModels() {
  console.log('🔍 Prüfe verfügbare Models auf dem Pod...\n');

  try {
    const models = await client.getModels();

    console.log('📦 Verfügbare Models:\n');
    console.log(`  Diffusion Models (${models.diffusion.length}):`);
    models.diffusion.slice(0, 10).forEach((m) => console.log(`    - ${m}`));
    if (models.diffusion.length > 10) {
      console.log(`    ... und ${models.diffusion.length - 10} weitere`);
    }

    console.log(`\n  Text Encoders (${models.textEncoders.length}):`);
    models.textEncoders.slice(0, 10).forEach((m) => console.log(`    - ${m}`));
    if (models.textEncoders.length > 10) {
      console.log(`    ... und ${models.textEncoders.length - 10} weitere`);
    }

    console.log(`\n  VAEs (${models.vaes.length}):`);
    models.vaes.slice(0, 10).forEach((m) => console.log(`    - ${m}`));
    if (models.vaes.length > 10) {
      console.log(`    ... und ${models.vaes.length - 10} weitere`);
    }

    console.log(`\n  LoRAs (${models.loras.length}):`);
    if (models.loras.length > 0) {
      models.loras.slice(0, 10).forEach((m) => console.log(`    - ${m}`));
      if (models.loras.length > 10) {
        console.log(`    ... und ${models.loras.length - 10} weitere`);
      }
    } else {
      console.log('    (keine)');
    }

    return models;
  } catch (error) {
    console.error(`❌ Fehler beim Abrufen der Models: ${error}`);
    process.exit(1);
  }
}

if (checkModelsFlag) {
  checkAvailableModels()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

/**
 * Prüft ob alle erforderlichen Models für einen Workflow vorhanden sind
 */
async function checkWorkflowModels(workflowId: WorkflowId): Promise<boolean> {
  const definition = getWorkflowDefinition(workflowId);
  const required = definition.requiredModels;

  try {
    const models = await client.getModels();

    const hasDiffusion = !required.diffusion || models.diffusion.includes(required.diffusion);
    const hasEncoder = !required.textEncoder || models.textEncoders.includes(required.textEncoder);
    const hasVae = !required.vae || models.vaes.includes(required.vae);

    if (hasDiffusion && hasEncoder && hasVae) {
      console.log(`   ✅ Alle erforderlichen Models für '${workflowId}' vorhanden`);
      return true;
    } else {
      console.log(`   ⚠️  Fehlende Models für '${workflowId}':`);
      if (!hasDiffusion) {
        console.log(`      - Diffusion: ${required.diffusion}`);
      }
      if (!hasEncoder) {
        console.log(`      - Text Encoder: ${required.textEncoder}`);
      }
      if (!hasVae) {
        console.log(`      - VAE: ${required.vae}`);
      }
      console.log(`\n   💡 Tipp: Verwende das Model-Download-Skript:`);
      console.log(`      python3 scripts/download-comfyui-models.py`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Model-Prüfung fehlgeschlagen: ${error}`);
    return false;
  }
}

/**
 * Prüft ob alle erforderlichen Nodes für einen Workflow vorhanden sind
 */
async function checkWorkflowNodes(workflowId: WorkflowId): Promise<boolean> {
  try {
    const availableNodes = await client.getAvailableNodes();
    const { compatible, missingNodes } = checkWorkflowCompatibility(workflowId, availableNodes);

    if (compatible) {
      console.log(`   ✅ Alle erforderlichen Nodes für '${workflowId}' verfügbar`);
      return true;
    } else {
      console.log(`   ⚠️  Fehlende Nodes für '${workflowId}':`);
      for (const node of missingNodes) {
        console.log(`      - ${node}`);
      }
      console.log(`\n   💡 Tipp: Installiere fehlende Custom Nodes über ComfyUI Manager`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Node-Prüfung fehlgeschlagen: ${error}`);
    return false;
  }
}

/**
 * Konvertiert ein Referenzbild zu Base64 (für PuLID Workflows)
 * PuLID verwendet ETN_LoadImageBase64, das Base64 erwartet
 */
function convertReferenceImageToBase64(imagePath: string): string {
  console.log(`   📤 Lade Referenzbild: ${imagePath}`);

  if (!fs.existsSync(imagePath)) {
    throw new Error(`Referenzbild nicht gefunden: ${imagePath}`);
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const dataUri = `data:${mimeType};base64,${base64}`;

  console.log(`   ✅ Bild geladen (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
  return dataUri;
}

/**
 * Speichert generierte Bilder
 */
async function saveImages(
  images: string[],
  outputDir: string,
  workflowId: string,
  promptId: string
): Promise<string[]> {
  const outputPath = path.resolve(outputDir);
  fs.mkdirSync(outputPath, { recursive: true });

  const savedPaths: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const imageData = images[i];
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${workflowId}_${promptId}_${i + 1}_${timestamp}.png`;
    const filePath = path.join(outputPath, filename);

    fs.writeFileSync(filePath, buffer);
    savedPaths.push(filePath);
    console.log(`   💾 Gespeichert: ${filePath}`);
  }

  return savedPaths;
}

/**
 * Führt einen Workflow aus
 */
async function executeWorkflow(workflowId: WorkflowId): Promise<void> {
  console.log(`\n🚀 Führe Workflow aus: ${workflowId}\n`);

  // Prüfe Health
  console.log('1️⃣  Prüfe Pod-Verbindung...');
  const isHealthy = await client.healthCheck();
  if (!isHealthy) {
    console.error('   ❌ Pod ist nicht erreichbar');
    process.exit(1);
  }
  console.log('   ✅ Pod ist erreichbar');

  // Prüfe Models
  console.log('\n2️⃣  Prüfe Models...');
  const modelsOk = await checkWorkflowModels(workflowId);
  if (!modelsOk) {
    console.error('\n❌ Fehlende Models. Bitte installiere die erforderlichen Models zuerst.');
    process.exit(1);
  }

  // Prüfe Nodes
  console.log('\n3️⃣  Prüfe Nodes...');
  const nodesOk = await checkWorkflowNodes(workflowId);
  if (!nodesOk) {
    console.error('\n❌ Fehlende Nodes. Bitte installiere die erforderlichen Custom Nodes zuerst.');
    process.exit(1);
  }

  // Baue Workflow
  console.log('\n4️⃣  Baue Workflow...');
  const definition = getWorkflowDefinition(workflowId);
  const prompt = promptArg || 'A beautiful portrait, high quality, detailed';
  const width = widthArg ? parseInt(widthArg, 10) : definition.defaults.width;
  const height = heightArg ? parseInt(heightArg, 10) : definition.defaults.height;
  const seed = seedArg ? parseInt(seedArg, 10) : Math.floor(Math.random() * 2 ** 32);

  let workflowOptions: any = {
    prompt,
    width,
    height,
    seed,
    filenamePrefix: `auto_${workflowId}_${Date.now()}`,
  };

  // Für PuLID Workflows: Referenzbild zu Base64 konvertieren
  if (REFERENCE_IMAGE_WORKFLOWS.includes(workflowId)) {
    if (!referenceArg) {
      console.error(`❌ Workflow '${workflowId}' benötigt ein Referenzbild (--reference)`);
      process.exit(1);
    }
    const referenceImageBase64 = convertReferenceImageToBase64(referenceArg);
    workflowOptions.referenceImage = referenceImageBase64;
  }

  const workflow = buildWorkflow(workflowId, workflowOptions);
  console.log(`   ✅ Workflow gebaut (${Object.keys(workflow).length} Nodes)`);

  // Führe Workflow aus
  console.log('\n5️⃣  Führe Workflow aus...');
  console.log(`   📝 Prompt: ${prompt}`);
  console.log(`   📐 Größe: ${width}x${height}`);
  console.log(`   🎲 Seed: ${seed}`);

  const startTime = Date.now();

  try {
    const result = await client.executeWorkflow(workflow);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (result.status === 'completed' && result.images) {
      console.log(`\n   ✅ Workflow abgeschlossen in ${duration}s`);
      console.log(`   🖼️  ${result.images.length} Bild(er) generiert`);

      // Speichere Bilder
      const outputDir = outputArg || path.join(process.cwd(), 'tmp', 'workflow-output');
      console.log(`\n6️⃣  Speichere Bilder nach: ${outputDir}`);
      const savedPaths = await saveImages(result.images, outputDir, workflowId, result.promptId);

      console.log('\n' + '='.repeat(60));
      console.log('✅ Workflow erfolgreich abgeschlossen!\n');
      console.log('📸 Generierte Bilder:');
      savedPaths.forEach((p) => console.log(`   ${p}`));
      console.log('\n' + '='.repeat(60));
    } else {
      console.error(`\n❌ Workflow fehlgeschlagen: ${result.error || 'Unbekannter Fehler'}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Fehler beim Ausführen des Workflows: ${error}`);
    process.exit(1);
  }
}

// Main
async function main() {
  if (!workflowArg) {
    console.error('❌ Bitte gib einen Workflow an: --workflow <workflow-id>');
    console.log('\nVerwende --list um verfügbare Workflows zu sehen');
    process.exit(1);
  }

  if (!(workflowArg === 'z-image-danrisi' || workflowArg === 'z-image-simple' || workflowArg === 'z-image-pulid')) {
    console.error(`❌ Unbekannter Workflow: ${workflowArg}`);
    console.log('\nVerwende --list um verfügbare Workflows zu sehen');
    process.exit(1);
  }

  await executeWorkflow(workflowArg as WorkflowId);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

