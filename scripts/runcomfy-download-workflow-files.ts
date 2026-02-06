/**
 * RunComfy: download workflow JSON per workflow (IN-038).
 *
 * Default: fetch-only (no browser). Tries candidate URL patterns and parses each
 * workflow detail page HTML for any workflow JSON download link; saves any found.
 * Use --browser to use Playwright and click "Download Workflow.json" on each page.
 *
 * Usage:
 *   npx tsx scripts/runcomfy-download-workflow-files.ts              # fetch only (no Playwright)
 *   npx tsx scripts/runcomfy-download-workflow-files.ts --limit 5
 *   npx tsx scripts/runcomfy-download-workflow-files.ts --browser    # use Playwright
 *   npx tsx scripts/runcomfy-download-workflow-files.ts --browser --headed
 *   RUNCOMFY_COOKIE="session=..." npx tsx scripts/runcomfy-download-workflow-files.ts
 *
 * Output: docs/research/infrastructure/runcomfy-workflows/<slug>/workflow.json
 */

const CATALOG_PATH = 'docs/research/infrastructure/runcomfy-workflow-catalog.json';
const OUT_DIR = 'docs/research/infrastructure/runcomfy-workflows';

interface WorkflowEntry {
  slug: string;
  url: string;
  title: string;
  description: string;
  workflow_id?: string;
  workflow_name?: string;
  order?: number;
}

interface Catalog {
  _meta: { count: number };
  workflows: WorkflowEntry[];
}

function parseArgs(): {
  limit: number | null;
  headed: boolean;
  browser: boolean;
} {
  const args = process.argv.slice(2);
  let limit: number | null = null;
  let headed = false;
  let browser = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1] != null) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--headed') headed = true;
    else if (args[i] === '--browser') browser = true;
  }
  return { limit, headed, browser };
}

function safeSlug(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || slug;
}

function candidateUrls(entry: WorkflowEntry): string[] {
  const base = 'https://www.runcomfy.com/comfyui-workflows';
  const cdn = 'https://cdn.runcomfy.net';
  const api = 'https://api.runcomfy.net';
  const urls: string[] = [];
  if (entry.workflow_id) {
    urls.push(
      `${cdn}/workflows/${entry.workflow_id}/workflow.json`,
      `${cdn}/workflows/${entry.workflow_id}/workflow_api.json`,
      `${api}/prod/v1/workflows/${entry.workflow_id}/workflow.json`
    );
  }
  urls.push(
    `${base}/${entry.slug}/workflow.json`,
    `${base}/${entry.slug}/workflow_api.json`,
    `${base}/api/workflows/${entry.slug}/workflow.json`
  );
  if (entry.workflow_name) {
    urls.push(`${cdn}/workflows/${entry.workflow_name}/workflow.json`);
  }
  return urls;
}

function isWorkflowShape(data: unknown): boolean {
  if (data === null || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  return Array.isArray(o.nodes) || Array.isArray(o.links) || (typeof o.prompt === 'object' && o.prompt !== null);
}

function extractWorkflowJsonUrlsFromHtml(html: string, baseUrl: string): string[] {
  const out: string[] = [];
  const resolve = (href: string) => {
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return 'https:' + href;
    if (href.startsWith('/')) return new URL(href, baseUrl).href;
    return new URL(href, baseUrl).href;
  };
  const hrefRe = /href\s*=\s*["']([^"']+\.json[^"']*)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = hrefRe.exec(html)) !== null) {
    const url = resolve(m[1].replace(/&amp;/g, '&'));
    if (/workflow|download|export/i.test(url)) out.push(url);
  }
  const quotedUrlRe = /"(https?:\/\/[^"]+\.json)"/g;
  while ((m = quotedUrlRe.exec(html)) !== null) {
    const url = m[1].replace(/\\\//g, '/');
    if (/workflow|download|export/i.test(url)) out.push(url);
  }
  return [...new Set(out)];
}

async function fetchOnly(
  workflows: WorkflowEntry[],
  outDir: string,
  options: { cookie?: string }
): Promise<{ downloaded: number; errors: string[] }> {
  const path = await import('path');
  const fs = await import('fs/promises');
  const errors: string[] = [];
  let downloaded = 0;

  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json, text/html, */*',
    ...(options.cookie ? { Cookie: options.cookie } : {}),
  };

  const trySave = async (url: string, outFile: string): Promise<boolean> => {
    try {
      const res = await fetch(url, { headers, redirect: 'follow' });
      if (!res.ok) return false;
      const text = await res.text();
      const data = JSON.parse(text) as unknown;
      if (!isWorkflowShape(data)) return false;
      await fs.writeFile(outFile, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch {
      return false;
    }
  };

  for (let i = 0; i < workflows.length; i++) {
    const entry = workflows[i];
    const dir = path.join(outDir, safeSlug(entry.slug));
    await fs.mkdir(dir, { recursive: true });
    const outFile = path.join(dir, 'workflow.json');

    let got = false;
    for (const url of candidateUrls(entry)) {
      if (await trySave(url, outFile)) {
        downloaded++;
        got = true;
        break;
      }
    }
    if (got) {
      if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${workflows.length} saved`);
      continue;
    }

    try {
      const res = await fetch(entry.url, { headers, redirect: 'follow' });
      if (!res.ok) {
        errors.push(`${entry.slug}: detail page ${res.status}`);
        continue;
      }
      const html = await res.text();
      const urls = extractWorkflowJsonUrlsFromHtml(html, entry.url);
      for (const url of urls) {
        if (await trySave(url, outFile)) {
          downloaded++;
          got = true;
          break;
        }
      }
    } catch (e) {
      errors.push(`${entry.slug}: ${String(e)}`);
    }
    if ((i + 1) % 50 === 0 && !got) process.stderr.write('.');
  }

  return { downloaded, errors };
}

async function downloadViaBrowser(
  workflows: WorkflowEntry[],
  outDir: string,
  options: { cookie?: string; headed: boolean }
): Promise<{ downloaded: number; errors: string[] }> {
  const { chromium } = await import('playwright');
  const path = await import('path');
  const fs = await import('fs/promises');

  const browser = await chromium.launch({ headless: !options.headed });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  if (options.cookie) {
    const parts = options.cookie.trim().split(/=(.+)/);
    const name = parts[0] || 'session';
    const value = parts[1] ?? '';
    if (value) {
      await context.addCookies([
        { name, value, domain: '.runcomfy.com', path: '/' },
      ]);
    }
  }
  const page = await context.newPage();
  let downloaded = 0;
  const errors: string[] = [];

  const downloadButtonSelector = [
    'a:has-text("Download Workflow.json")',
    'a:has-text("Download workflow.json")',
    'button:has-text("Download Workflow.json")',
    'button:has-text("Download workflow.json")',
    '[role="button"]:has-text("Download Workflow.json")',
    'a[download]:has-text("Workflow")',
  ].join(', ');

  for (let i = 0; i < workflows.length; i++) {
    const entry = workflows[i];
    const dir = path.join(outDir, safeSlug(entry.slug));
    await fs.mkdir(dir, { recursive: true });
    const outFile = path.join(dir, 'workflow.json');

    try {
      await page.goto(entry.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle').catch(() => { });

      const btn = page.locator(downloadButtonSelector).first();
      await btn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
      const count = await btn.count();
      if (count === 0) {
        errors.push(`${entry.slug}: "Download Workflow.json" button not found`);
        continue;
      }

      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 15000 }),
        btn.click(),
      ]);
      await download.saveAs(outFile);
      downloaded++;
      if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${workflows.length} saved`);
    } catch (e) {
      errors.push(`${entry.slug}: ${String(e)}`);
    }
  }

  await browser.close();
  return { downloaded, errors };
}

async function main() {
  const { limit, headed, browser } = parseArgs();
  const fs = await import('fs/promises');
  const path = await import('path');

  let catalog: Catalog;
  try {
    const raw = await fs.readFile(CATALOG_PATH, 'utf-8');
    catalog = JSON.parse(raw) as Catalog;
  } catch (e) {
    console.error('Failed to read catalog:', CATALOG_PATH, e);
    process.exit(1);
  }

  const workflows = limit != null ? catalog.workflows.slice(0, limit) : catalog.workflows;
  const cookie = process.env.RUNCOMFY_COOKIE;
  await fs.mkdir(OUT_DIR, { recursive: true });

  if (browser) {
    console.log(`Using browser to click "Download Workflow.json" on each of ${workflows.length} workflow pages...`);
    const { downloaded, errors } = await downloadViaBrowser(workflows, OUT_DIR, { cookie, headed });
    if (errors.length > 0) {
      console.error('Errors:', errors.slice(0, 15).join('\n'));
      if (errors.length > 15) console.error('... and', errors.length - 15, 'more');
    }
    console.log(`\nDone. workflow.json: ${downloaded}/${workflows.length}. Output: ${OUT_DIR}`);
    return;
  }

  console.log(`Fetch-only mode: trying URL patterns and detail-page links (no browser) for ${workflows.length} workflows...`);
  const { downloaded, errors } = await fetchOnly(workflows, OUT_DIR, { cookie });
  if (errors.length > 0) {
    console.error('Errors:', errors.slice(0, 10).join('\n'));
    if (errors.length > 10) console.error('... and', errors.length - 10, 'more');
  }
  console.log(`\nDone. workflow.json: ${downloaded}/${workflows.length}. Output: ${OUT_DIR}`);
  if (downloaded === 0) {
    console.log(
      '\nRunComfy does not expose public URLs for gallery workflow JSON. Use --browser to download via Playwright (click "Download Workflow.json" on each page).'
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
