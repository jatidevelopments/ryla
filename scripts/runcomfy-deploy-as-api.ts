/**
 * RunComfy: click "Deploy as API" then "Instant Deploy" on a workflow page and wait until deployment is created (IN-038).
 *
 * Steps: 1) Open workflow page, 2) Click "Deploy as API", 3) Wait for "Instant Deploy" to be enabled, 4) Click "Instant Deploy", 5) Wait for deployment URL/success.
 * Uses Playwright. Requires login (RUNCOMFY_COOKIE) if RunComfy prompts.
 *
 * Usage:
 *   npx tsx scripts/runcomfy-deploy-as-api.ts
 *   npx tsx scripts/runcomfy-deploy-as-api.ts --url "https://www.runcomfy.com/comfyui-workflows/text-to-image-with-sdxl-turbo"
 *   npx tsx scripts/runcomfy-deploy-as-api.ts --slug "comfyui-hi-res-fix-upscaling-workflow-controlnet-tile-4x-ultrasharp"
 *   npx tsx scripts/runcomfy-deploy-as-api.ts --all-minimal
 *   npx tsx scripts/runcomfy-deploy-as-api.ts --slugs "slug1,slug2,slug3"
 *   RUNCOMFY_COOKIE="session=..." npx tsx scripts/runcomfy-deploy-as-api.ts --all-minimal
 *
 * Options:
 *   --url <url>        Single workflow page URL (overrides --slug)
 *   --slug <slug>      Single workflow slug (default: text-to-image-with-sdxl-turbo)
 *   --all-minimal      Deploy all 9 minimal RunComfy-only workflows (RYLA-RUNCOMFY-ONLY-SHORTLIST)
 *   --slugs <list>     Comma-separated slugs to deploy (e.g. slug1,slug2)
 *   --headed           Show browser (default: true)
 *   --headless         Run without opening browser
 */

const BASE_URL = 'https://www.runcomfy.com/comfyui-workflows';
const DEFAULT_SLUG = 'text-to-image-with-sdxl-turbo';
const DEPLOY_WAIT_TIMEOUT_MS = 120_000;

/** Minimal RunComfy-only set (9 workflows) from RYLA-RUNCOMFY-ONLY-SHORTLIST.md */
const MINIMAL_SLUGS = [
  'comfyui-flux-a-new-art-image-generation',
  'text-to-image-with-sdxl-turbo',
  'create-consistent-characters-in-comfyui-with-ipadapter-faceid-plus',
  'flux-klein-unified-image-editing-inpaint-remove-outpaint-in-comfyui-advanced-image-restoration',
  'hunyuan-video-1-5-in-comfyui-efficient-text-to-video-workflow',
  'comfyui-stable-video-diffusion-svd-and-freeu-workflow-image2video',
  'comfyui-hi-res-fix-upscaling-workflow-controlnet-tile-4x-ultrasharp',
  'comfyui-flux-lora-training-detailed-guides',
  'comfyui-reactor-workflow-fast-face-swap',
];

function parseArgs(): { urls: string[]; labels: string[]; headed: boolean } {
  const args = process.argv.slice(2);
  const urls: string[] = [];
  const labels: string[] = [];
  let headed = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      urls.push(args[i + 1]);
      labels.push(args[i + 1].replace(/.*\//, ''));
      i++;
    } else if (args[i] === '--slug' && args[i + 1]) {
      const slug = args[i + 1];
      urls.push(`${BASE_URL}/${slug}`);
      labels.push(slug);
      i++;
    } else if (args[i] === '--all-minimal') {
      MINIMAL_SLUGS.forEach((slug) => {
        urls.push(`${BASE_URL}/${slug}`);
        labels.push(slug);
      });
    } else if (args[i] === '--slugs' && args[i + 1]) {
      args[i + 1].split(',').forEach((s) => {
        const slug = s.trim();
        if (slug) {
          urls.push(`${BASE_URL}/${slug}`);
          labels.push(slug);
        }
      });
      i++;
    } else if (args[i] === '--headed') headed = true;
    else if (args[i] === '--headless') headed = false;
  }

  if (urls.length === 0) {
    urls.push(`${BASE_URL}/${DEFAULT_SLUG}`);
    labels.push(DEFAULT_SLUG);
  }
  return { urls, labels, headed };
}

import type { Page } from 'playwright';

async function deployOneWorkflow(page: Page, url: string, label: string): Promise<boolean> {
  console.log('\n---', label, '---');
  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle').catch(() => { });

  const deployButtonSelectors = [
    'button:has-text("Deploy as API")',
    'a:has-text("Deploy as API")',
    '[role="button"]:has-text("Deploy as API")',
  ];

  let deployBtn = page.locator(deployButtonSelectors[0]).first();
  for (const sel of deployButtonSelectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0) {
      deployBtn = loc;
      break;
    }
  }

  if ((await deployBtn.count()) === 0) {
    console.error('  "Deploy as API" button not found. Skip.');
    return false;
  }

  console.log('  Clicking "Deploy as API"...');
  await deployBtn.click();

  await page.waitForURL(/\/comfyui-api\/deployments\/create\?/, { timeout: 20000 }).catch(() => { });
  console.log('  Waiting for "Instant Deploy" to be ready...');
  try {
    await page.waitForSelector('button:has-text("Instant Deploy"):not([disabled])', { timeout: 60000 });
  } catch {
    console.error('  "Instant Deploy" did not become ready. Skip.');
    return false;
  }
  console.log('  Clicking "Instant Deploy"...');
  await page.getByRole('button', { name: 'Instant Deploy' }).click();

  const start = Date.now();
  const successPatterns = [
    { type: 'url' as const, re: /runcomfy\.com.*\/deployments\/[0-9a-f-]+/i },
    { type: 'text' as const, text: 'Standby' },
    { type: 'text' as const, text: 'Deployment created' },
    { type: 'text' as const, text: 'Deployment ID' },
  ];
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  while (Date.now() - start < DEPLOY_WAIT_TIMEOUT_MS) {
    await sleep(2000);
    const currentUrl = page.url();
    if (successPatterns.some((p) => p.type === 'url' && p.re.test(currentUrl))) {
      console.log('  Deployment created:', currentUrl);
      return true;
    }
    const content = await page.content();
    if (successPatterns.some((p) => p.type === 'text' && p.text && content.includes(p.text))) {
      console.log('  Deployment success detected.');
      return true;
    }
    if (Date.now() - start > DEPLOY_WAIT_TIMEOUT_MS - 2000) {
      console.warn('  Timeout waiting for deployment.');
      return false;
    }
  }
  return false;
}

async function main() {
  const { urls, labels, headed } = parseArgs();
  const cookie = process.env.RUNCOMFY_COOKIE;

  const { chromium } = await import('playwright');

  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  if (cookie) {
    const parts = cookie.trim().split(/=(.+)/);
    const name = parts[0] || 'session';
    const value = parts[1] ?? '';
    if (value) {
      await context.addCookies([
        { name, value, domain: '.runcomfy.com', path: '/' },
      ]);
    }
  }

  const page = await context.newPage();
  const results: { label: string; ok: boolean }[] = [];

  for (let i = 0; i < urls.length; i++) {
    try {
      const ok = await deployOneWorkflow(page, urls[i], labels[i]);
      results.push({ label: labels[i], ok });
    } catch (e) {
      console.error('  Error:', e);
      results.push({ label: labels[i], ok: false });
    }
  }

  await browser.close();

  const succeeded = results.filter((r) => r.ok).length;
  console.log('\n--- Summary ---');
  console.log(`Deployed ${succeeded}/${results.length} workflows.`);
  results.forEach((r) => console.log(r.ok ? `  ✓ ${r.label}` : `  ✗ ${r.label}`));
  console.log('Check RunComfy dashboard for deployments.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
