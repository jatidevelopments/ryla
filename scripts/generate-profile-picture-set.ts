#!/usr/bin/env npx tsx
/**
 * Profile Picture Set Generator
 *
 * Generates a complete set of 7-10 profile pictures with different positions
 * using the automated workflow tool and profile picture sets.
 *
 * Usage:
 *   pnpm generate:profile-set --set classic-influencer --output ./output
 *   pnpm generate:profile-set --set professional-model --character custom
 *   pnpm generate:profile-set --list                    # List available sets
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Import profile picture sets
import {
  listProfilePictureSets,
  getProfilePictureSet,
  buildProfilePicturePrompt,
  ProfilePictureSet,
} from '../libs/business/src/prompts/profile-picture-sets';

// Import ComfyUI client
import { ComfyUIPodClient } from '../libs/business/src/services/comfyui-pod-client';
import { buildWorkflow, WorkflowId } from '../libs/business/src/workflows';

const COMFYUI_URL = process.env.COMFYUI_POD_URL;

// Parse CLI args
const args = process.argv.slice(2);
const listFlag = args.includes('--list');
const setArg = args.find((a, i) => args[i - 1] === '--set');
const outputArg = args.find((a, i) => args[i - 1] === '--output');
const workflowArg = args.find((a, i) => args[i - 1] === '--workflow');
const characterArg = args.find((a, i) => args[i - 1] === '--character');

if (listFlag) {
  console.log('📋 Verfügbare Profile Picture Sets:\n');
  for (const set of listProfilePictureSets()) {
    console.log(`  ${set.id}`);
    console.log(`    Name: ${set.name}`);
    console.log(`    Beschreibung: ${set.description}`);
    console.log(`    Style: ${set.style}`);
    console.log(`    Positionen: ${set.positions.length}`);
    console.log(`    Tags: ${set.tags.join(', ')}`);
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
  timeout: 600000, // 10 Minuten für Batch-Generierung
});

/**
 * Generiert ein komplettes Profilbild-Set
 */
async function generateProfilePictureSet(setId: string): Promise<void> {
  console.log(`\n🎨 Generiere Profile Picture Set: ${setId}\n`);

  const set = getProfilePictureSet(setId);
  if (!set) {
    console.error(`❌ Set nicht gefunden: ${setId}`);
    console.log('\nVerwende --list um verfügbare Sets zu sehen');
    process.exit(1);
  }

  console.log(`📋 Set: ${set.name}`);
  console.log(`   ${set.description}`);
  console.log(`   ${set.positions.length} Positionen\n`);

  // Prüfe Pod-Verbindung
  console.log('1️⃣  Prüfe Pod-Verbindung...');
  const isHealthy = await client.healthCheck();
  if (!isHealthy) {
    console.error('   ❌ Pod ist nicht erreichbar');
    process.exit(1);
  }
  console.log('   ✅ Pod ist erreichbar\n');

  // Bestimme Workflow
  const workflowId: WorkflowId = (workflowArg as WorkflowId) || 'z-image-danrisi';
  console.log(`2️⃣  Verwende Workflow: ${workflowId}\n`);

  // Erstelle Output-Verzeichnis
  const outputDir = outputArg || path.join(process.cwd(), 'tmp', 'profile-sets', setId);
  fs.mkdirSync(outputDir, { recursive: true });

  // Generiere alle Positionen
  const results: Array<{
    position: string;
    success: boolean;
    imagePath?: string;
    error?: string;
  }> = [];

  console.log(`3️⃣  Generiere ${set.positions.length} Bilder...\n`);

  for (let i = 0; i < set.positions.length; i++) {
    const position = set.positions[i];
    console.log(`   [${i + 1}/${set.positions.length}] ${position.name}...`);

    try {
      // Baue Prompt
      const { prompt, negativePrompt } = buildProfilePicturePrompt(set, position);

      // Bestimme Größe basierend auf Aspect Ratio
      let width = 1024;
      let height = 1024;
      if (position.aspectRatio === '4:5') {
        width = 1024;
        height = 1280;
      } else if (position.aspectRatio === '9:16') {
        width = 1024;
        height = 1820;
      }

      // Baue Workflow
      const workflow = buildWorkflow(workflowId, {
        prompt,
        negativePrompt,
        width,
        height,
        seed: Math.floor(Math.random() * 2 ** 32),
        filenamePrefix: `profile_${setId}_${position.id}`,
      });

      // Führe Workflow aus
      const startTime = Date.now();
      const result = await client.executeWorkflow(workflow);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (result.status === 'completed' && result.images && result.images.length > 0) {
        // Speichere Bild
        const imageData = result.images[0];
        const base64Data = imageData.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        const filename = `${setId}_${position.id}_${Date.now()}.png`;
        const imagePath = path.join(outputDir, filename);
        fs.writeFileSync(imagePath, buffer);

        console.log(`      ✅ Fertig in ${duration}s → ${filename}`);
        results.push({
          position: position.name,
          success: true,
          imagePath,
        });
      } else {
        console.log(`      ❌ Fehlgeschlagen: ${result.error || 'Unbekannter Fehler'}`);
        results.push({
          position: position.name,
          success: false,
          error: result.error || 'Unbekannter Fehler',
        });
      }
    } catch (error) {
      console.log(`      ❌ Fehler: ${error}`);
      results.push({
        position: position.name,
        success: false,
        error: String(error),
      });
    }

    // Kurze Pause zwischen Bildern
    if (i < set.positions.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Zusammenfassung
  console.log('\n' + '='.repeat(60));
  console.log('📊 Zusammenfassung\n');
  console.log(`   Set: ${set.name}`);
  console.log(`   Erfolgreich: ${results.filter((r) => r.success).length}/${results.length}`);
  console.log(`   Output-Verzeichnis: ${outputDir}\n`);

  if (results.filter((r) => r.success).length > 0) {
    console.log('✅ Erfolgreich generierte Bilder:');
    results
      .filter((r) => r.success)
      .forEach((r) => {
        console.log(`   ${r.position}: ${r.imagePath}`);
      });
  }

  if (results.filter((r) => !r.success).length > 0) {
    console.log('\n❌ Fehlgeschlagene Bilder:');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   ${r.position}: ${r.error}`);
      });
  }

  console.log('\n' + '='.repeat(60));

  // Exit mit Fehlercode wenn nicht alle erfolgreich
  const allSuccess = results.every((r) => r.success);
  process.exit(allSuccess ? 0 : 1);
}

// Main
async function main() {
  if (!setArg) {
    console.error('❌ Bitte gib ein Set an: --set <set-id>');
    console.log('\nVerwende --list um verfügbare Sets zu sehen');
    process.exit(1);
  }

  await generateProfilePictureSet(setArg);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

