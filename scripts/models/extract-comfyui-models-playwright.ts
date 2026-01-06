#!/usr/bin/env tsx
/**
 * ComfyUI Model List Extractor (Playwright)
 * 
 * Extracts the complete list of all available models from ComfyUI Manager
 * on the RunPod server and saves them to JSON and CSV files.
 * 
 * Usage:
 *   pnpm tsx scripts/extract-comfyui-models-playwright.ts [--url URL] [--output-dir DIR] [--headless]
 * 
 * Requirements:
 *   pnpm add -D playwright @types/node tsx
 *   npx playwright install chromium
 * 
 * Note: If you get import errors, you may need to install playwright separately:
 *   pnpm add -D playwright
 * 
 * Author: RYLA Team
 * Date: 2025-12-19
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ComfyUIModel {
  id: number;
  name: string;
  size: string;
  type: string;
  base: string;
  installed: boolean;
}

interface ExtractedModels {
  url: string;
  extractedAt: string;
  totalModels: number;
  models: ComfyUIModel[];
}

// Default RunPod ComfyUI URL
const DEFAULT_URL = 'https://5qj51a8nptsc4h-8188.proxy.runpod.net/';

/**
 * Wait for the model table to load and return the total count
 */
async function waitForTableLoad(page: Page, timeout: number = 30000): Promise<number> {
  try {
    // Wait for the model count text to appear (e.g., "509 external models")
    const countText = await page.waitForSelector('text=/\\d+ external models/i', { timeout });
    const text = await countText.textContent();
    const match = text?.match(/(\d+)\s+external\s+models/i);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0;
  } catch (error) {
    console.warn('Warning: Could not find model count indicator:', error);
    return 0;
  }
}

/**
 * Scroll to load all models in the table
 */
async function scrollToLoadAllModels(page: Page, expectedCount: number): Promise<void> {
  console.log(`Scrolling to load all ${expectedCount} models...`);

  let previousCount = 0;
  let currentCount = 0;
  let scrollAttempts = 0;
  const maxScrollAttempts = 50;

  // Find the scrollable container (likely the table body or a div containing the table)
  const scrollableContainer = await page.locator('table tbody, [role="table"] tbody, .model-list, [class*="scroll"]').first();

  while (scrollAttempts < maxScrollAttempts) {
    // Get current number of visible rows
    const rows = await page.locator('table tbody tr, [role="row"]').count();
    currentCount = rows;

    if (currentCount >= expectedCount) {
      console.log(`✓ Loaded ${currentCount} models (expected ${expectedCount})`);
      break;
    }

    if (currentCount === previousCount && scrollAttempts > 5) {
      console.log(`⚠ No new models loaded after ${scrollAttempts} scrolls. Current: ${currentCount}, Expected: ${expectedCount}`);
      // Try scrolling the page itself
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1000);
    }

    // Scroll the container
    await scrollableContainer.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    // Also try scrolling the window
    await page.evaluate(() => {
      window.scrollBy(0, 1000);
    });

    await page.waitForTimeout(500); // Wait for lazy loading

    previousCount = currentCount;
    scrollAttempts++;

    if (scrollAttempts % 10 === 0) {
      console.log(`  Scrolled ${scrollAttempts} times, found ${currentCount} models so far...`);
    }
  }

  // Final scroll to ensure everything is loaded
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(2000);
}

/**
 * Extract all models from the table
 */
async function extractModels(page: Page): Promise<ComfyUIModel[]> {
  console.log('Extracting model data from table...');

  const models: ComfyUIModel[] = [];

  // Find all table rows (excluding header)
  const rows = await page.locator('table tbody tr, [role="row"]:not([role="columnheader"])').all();

  console.log(`Found ${rows.length} rows to process...`);

  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i];

      // Extract ID (first column or second if checkbox exists)
      const idText = await row.locator('td').nth(0).textContent().catch(() => '');
      const id = parseInt(idText?.trim() || '0', 10);

      // Skip if ID is invalid (might be header or empty row)
      if (isNaN(id) || id === 0) {
        // Try next column
        const idText2 = await row.locator('td').nth(1).textContent().catch(() => '');
        const id2 = parseInt(idText2?.trim() || '0', 10);
        if (isNaN(id2) || id2 === 0) continue;
      }

      // Extract name (usually second or third column)
      const nameCell = await row.locator('td').nth(1).textContent().catch(() =>
        row.locator('td').nth(2).textContent().catch(() => '')
      );
      const name = nameCell?.trim() || '';

      if (!name) continue;

      // Extract size (look for GB, MB, KB patterns)
      const sizeText = await row.locator('td').textContent().catch(() => '');
      const sizeMatch = sizeText.match(/([\d.]+)\s*(GB|MB|KB|B)/i);
      const size = sizeMatch ? `${sizeMatch[1]}${sizeMatch[2]}` : '';

      // Extract type (look for common types)
      const typeText = await row.locator('td').textContent().catch(() => '');
      const typeMatch = typeText.match(/\b(checkpoint|lora|controlnet|vae|clip|upscale|embedding|animatediff|ip-adapter|photomaker|instantid|sam|ram|t2i-adapter|codeformer|gfpgan|face_restore|depth|zero123|motion|gligen|groundingdino|ic-light|pulid|janus-pro|qwen|flux|sd1\.5|sdxl|sd3|hunyuan|pixart|omni|svd|supir|tooncrafter|dynamiccrafter|motionctrl|ltx-video|frame|lotus|kolor|seecoder|segmind|wan|vit|t5|umt5|llava|llm|chatglm|blip|dino|efficient_sam|facexlib|customnet|deepbump|depth-pro|depthanything|diffusion_model|unclip|ultralytics|taesd|t2i-style|rgt|moge|insightface|instance|frame|gfpgan|gligen)\b/i);
      const type = typeMatch ? typeMatch[1].toLowerCase() : '';

      // Extract base (look for base model names)
      const baseText = await row.locator('td').textContent().catch(() => '');
      const baseMatch = baseText.match(/\b(SD1\.5|SDXL|SD2|SD2\.1|SD3|SD3\.5|FLUX\.1|FLUX\.2|Qwen|Hunyuan|PixArt|OmniGen|SVD|SUPIR|Stable\s+Cascade|SSD-1B|Wan2\.1|Wan2\.2|ViT-[GLH]|t5|t5-base|umt5_xxl|LLaVA|ChatGLM3|blip_model|clip|clip_vision_h|DINO|zero123|depth-pro|depthanything|Depth-FM|DynamicCrafter|FramePackI2V|LTX-Video|ToonCrafter|MotionCtrl|MoGe|Kolor|LBM|lotus|segmind-vega|sigclip|SEECODER|RGT|RAM|SAM|sam2|sam2\.1|efficient_sam|facexlib|face_restore|CodeFormer|GFPGAN|CustomNet|deepbump|diffusion_model|unclip|Ultralytics|upscale|TAESD|T2I-Style|T2I-Adapter|PuLID|photomaker|instantid|IP-Adapter|Janus-Pro|IC-Light|GroundingDINO|gligen|FramePackI2V|GFPGAN|face_restore|facexlib|embedding|efficient_sam|depthanything|depth-pro|deepbump|CustomNet|controlnet|CodeFormer|clip_vision|clip|checkpoint|BLIP_MODEL|animatediff-pia|animatediff)\b/i);
      const base = baseMatch ? baseMatch[1] : '';

      // Check if installed (look for "Installed" text or absence of "Install" button)
      const installButton = await row.locator('button:has-text("Install"), button:has-text("Installed")').first();
      const buttonText = await installButton.textContent().catch(() => '');
      const installed = buttonText?.toLowerCase().includes('installed') || false;

      const model: ComfyUIModel = {
        id: id || i + 1,
        name,
        size,
        type,
        base,
        installed
      };

      models.push(model);

      if ((i + 1) % 50 === 0) {
        console.log(`  Processed ${i + 1} models...`);
      }
    } catch (error) {
      console.warn(`  Error processing row ${i + 1}:`, error);
      continue;
    }
  }

  console.log(`✓ Extracted ${models.length} models`);
  return models;
}

/**
 * Alternative extraction method using more flexible selectors
 */
async function extractModelsFlexible(page: Page): Promise<ComfyUIModel[]> {
  console.log('Extracting model data using flexible selectors...');

  const models: ComfyUIModel[] = [];

  // Try to find the table or list container
  const table = page.locator('table, [role="table"], [class*="table"], [class*="model"]').first();

  // Get all rows
  const rows = await table.locator('tr, [role="row"]').all();

  console.log(`Found ${rows.length} rows to process...`);

  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i];
      const cells = await row.locator('td, [role="cell"]').all();

      if (cells.length < 3) continue; // Skip rows with too few cells

      // Try to extract data from cells
      const cellTexts = await Promise.all(
        cells.map(cell => cell.textContent().catch(() => ''))
      );

      const fullText = cellTexts.join(' ').toLowerCase();

      // Skip header rows
      if (fullText.includes('id') && fullText.includes('name') && fullText.includes('install')) {
        continue;
      }

      // Extract ID
      let id = 0;
      for (const text of cellTexts) {
        const idMatch = text.match(/^(\d+)$/);
        if (idMatch) {
          id = parseInt(idMatch[1], 10);
          break;
        }
      }

      if (id === 0) id = i + 1; // Fallback to row index

      // Extract name (usually the longest text or contains model-like patterns)
      let name = '';
      for (const text of cellTexts) {
        if (text.length > name.length && !text.match(/^(install|installed|\d+)$/i)) {
          name = text.trim();
        }
      }

      // Extract size
      const sizeMatch = cellTexts.join(' ').match(/([\d.]+)\s*(GB|MB|KB|B)/i);
      const size = sizeMatch ? `${sizeMatch[1]}${sizeMatch[2]}` : '';

      // Extract type and base from full text
      const typeMatch = cellTexts.join(' ').match(/\b(checkpoint|lora|controlnet|vae|clip|upscale|embedding|animatediff|ip-adapter|photomaker|instantid|sam|ram|t2i-adapter|codeformer|gfpgan|face_restore|depth|zero123|motion|gligen|groundingdino|ic-light|pulid|janus-pro|qwen|flux|sd1\.5|sdxl|sd3)\b/i);
      const type = typeMatch ? typeMatch[1].toLowerCase() : '';

      const baseMatch = cellTexts.join(' ').match(/\b(SD1\.5|SDXL|SD2|SD2\.1|SD3|SD3\.5|FLUX\.1|FLUX\.2|Qwen|Hunyuan|PixArt|OmniGen|SVD|SUPIR|Stable\s+Cascade|SSD-1B|Wan2\.1|Wan2\.2)\b/i);
      const base = baseMatch ? baseMatch[1] : '';

      // Check installed status
      const hasInstallButton = await row.locator('button:has-text("Install")').count() > 0;
      const hasInstalledText = await row.locator('text=/installed/i').count() > 0;
      const installed = hasInstalledText && !hasInstallButton;

      if (name) {
        models.push({
          id,
          name,
          size,
          type,
          base,
          installed
        });
      }
    } catch (error) {
      console.warn(`  Error processing row ${i + 1}:`, error);
      continue;
    }
  }

  console.log(`✓ Extracted ${models.length} models using flexible method`);
  return models;
}

/**
 * Save models to JSON file
 */
function saveToJSON(models: ExtractedModels, outputPath: string): void {
  const jsonContent = JSON.stringify(models, null, 2);
  fs.writeFileSync(outputPath, jsonContent, 'utf-8');
  console.log(`✓ Saved ${models.models.length} models to ${outputPath}`);
}

/**
 * Save models to CSV file
 */
function saveToCSV(models: ExtractedModels, outputPath: string): void {
  const headers = ['ID', 'Name', 'Size', 'Type', 'Base', 'Installed'];
  const rows = models.models.map(model => [
    model.id.toString(),
    model.name,
    model.size,
    model.type,
    model.base,
    model.installed ? 'Yes' : 'No'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  fs.writeFileSync(outputPath, csvContent, 'utf-8');
  console.log(`✓ Saved ${models.models.length} models to ${outputPath}`);
}

/**
 * Main extraction function
 */
async function extractComfyUIModels(options: {
  url?: string;
  outputDir?: string;
  headless?: boolean;
}): Promise<void> {
  const url = options.url || DEFAULT_URL;
  const outputDir = options.outputDir || path.join(process.cwd(), 'docs', 'ops', 'runpod');
  const headless = options.headless !== false; // Default to headless

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🚀 Starting ComfyUI Model Extraction');
  console.log(`   URL: ${url}`);
  console.log(`   Output: ${outputDir}`);
  console.log(`   Headless: ${headless}`);
  console.log('');

  const browser: Browser = await chromium.launch({
    headless,
    slowMo: headless ? 0 : 100 // Slow down in non-headless for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page: Page = await context.newPage();

  try {
    // Navigate to ComfyUI
    console.log('📡 Navigating to ComfyUI...');
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Click settings button
    console.log('⚙️  Opening settings...');
    const settingsButton = page.locator('button:has-text("⚙️"), button[aria-label*="settings" i]').first();
    await settingsButton.click({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Click ComfyUI Manager
    console.log('📦 Opening ComfyUI Manager...');
    const managerButton = page.locator('button:has-text("ComfyUI Manager"), button:has-text("Manager")').first();
    await managerButton.click({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Click Model Manager
    console.log('📋 Opening Model Manager...');
    const modelManagerButton = page.locator('button:has-text("Model Manager")').first();
    await modelManagerButton.click({ timeout: 10000 });
    await page.waitForTimeout(3000);

    // Wait for table to load and get count
    console.log('⏳ Waiting for model table to load...');
    const expectedCount = await waitForTableLoad(page, 30000);
    console.log(`   Found ${expectedCount} models to extract`);

    if (expectedCount === 0) {
      console.warn('⚠️  Could not determine model count. Proceeding anyway...');
    }

    // Scroll to load all models
    if (expectedCount > 0) {
      await scrollToLoadAllModels(page, expectedCount);
    } else {
      // Scroll anyway to try to load content
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(3000);
    }

    // Extract models
    let models: ComfyUIModel[] = [];

    try {
      models = await extractModels(page);
    } catch (error) {
      console.warn('⚠️  Primary extraction method failed, trying flexible method...', error);
      models = await extractModelsFlexible(page);
    }

    if (models.length === 0) {
      console.error('❌ No models extracted. The page structure may have changed.');
      console.log('💡 Try running with --headless=false to see what\'s happening');
      return;
    }

    // Create output object
    const output: ExtractedModels = {
      url,
      extractedAt: new Date().toISOString(),
      totalModels: models.length,
      models
    };

    // Save to files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const jsonPath = path.join(outputDir, `comfyui-models-${timestamp}.json`);
    const csvPath = path.join(outputDir, `comfyui-models-${timestamp}.csv`);

    saveToJSON(output, jsonPath);
    saveToCSV(output, csvPath);

    // Also save as latest
    const latestJsonPath = path.join(outputDir, 'comfyui-models-latest.json');
    const latestCsvPath = path.join(outputDir, 'comfyui-models-latest.csv');
    saveToJSON(output, latestJsonPath);
    saveToCSV(output, latestCsvPath);

    console.log('');
    console.log('✅ Extraction complete!');
    console.log(`   Total models: ${models.length}`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   CSV: ${csvPath}`);

  } catch (error) {
    console.error('❌ Error during extraction:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: {
    url?: string;
    outputDir?: string;
    headless?: boolean;
  } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      options.url = args[i + 1];
      i++;
    } else if (args[i] === '--output-dir' && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--headless') {
      options.headless = true;
    } else if (args[i] === '--no-headless') {
      options.headless = false;
    }
  }

  extractComfyUIModels(options).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { extractComfyUIModels, ComfyUIModel, ExtractedModels };
