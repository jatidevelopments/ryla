#!/usr/bin/env tsx
/**
 * Civit.ai Crawler – workflows & models (IN-037).
 *
 * Uses Playwright to search Civit.ai for "workflow" (and optional query),
 * extracts model/workflow cards, labels them for RYLA fit, and writes CSV.
 *
 * Usage:
 *   pnpm civitai:crawl
 *   pnpm civitai:crawl -- --query workflow --max-pages 3
 *   pnpm civitai:crawl -- --no-headless
 *
 * Output: scripts/civitai-crawler/output/civitai-{query|models}-{date}.csv
 */

import { chromium, type Browser, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import type { CivitaiCrawlItem, CivitaiCrawlOptions } from './types';
import { applyLabel } from './label';
import { fetchAllViaApi } from './api';

const DEFAULT_OPTIONS = {
  query: '',
  maxPages: 5,
  outputDir: path.join(__dirname, 'output'),
  headless: true,
  throttleMs: 1500,
};

/** Base URL for models listing with optional search and page (1-based). */
function modelsUrl(query?: string, page?: number): string {
  const base = 'https://civitai.com/models';
  const params = new URLSearchParams();
  if (query?.trim()) params.set('query', query.trim());
  if (page != null && page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Wait between actions to be polite to the server */
function throttle(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Raw link data from page.evaluate */
interface LinkRow {
  href: string;
  text: string;
}

/**
 * Extract all model links from the page using in-page JS (sees full DOM, not just viewport).
 */
async function extractAllModelLinksFromPage(page: Page): Promise<LinkRow[]> {
  return page.evaluate(() => {
    const rows: LinkRow[] = [];
    const seen = new Set<string>();
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href*="/models/"]');
    const re = /\/models\/(\d+)(?:\/[^/?]*)?/;
    for (const a of links) {
      const href = a.getAttribute('href');
      if (!href) continue;
      const full = href.startsWith('http') ? href : `https://civitai.com${href.startsWith('/') ? href : '/' + href}`;
      const m = full.match(re);
      if (!m) continue;
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      const text = (a.textContent || '').trim().slice(0, 200);
      rows.push({ href: full, text: text || `Model ${m[1]}` });
    }
    return rows;
  });
}

/**
 * Extract card-like items from current page (all links in DOM via evaluate, then map to items).
 */
async function extractItemsFromPage(page: Page): Promise<(Omit<CivitaiCrawlItem, 'rylaLabel'> & { rylaLabel: string })[]> {
  const scrapedAt = new Date().toISOString();
  const links = await extractAllModelLinksFromPage(page);

  return links.map((row) => {
    const pathMatch = row.href.match(/\/models\/(\d+)(?:\/[^/?]*)?/);
    const urlKey = pathMatch ? pathMatch[1] : '';
    const name = row.text || `Model ${urlKey}`;
    const type: CivitaiCrawlItem['type'] =
      /workflow/i.test(name) ? 'workflow' : 'unknown';

    return {
      name,
      url: row.href,
      type,
      rylaLabel: '',
      typeBadge: '',
      stats: '',
      creator: '',
      scrapedAt,
      notes: '',
    };
  });
}

/**
 * Save items to CSV (and optional JSON).
 */
function saveOutput(
  items: CivitaiCrawlItem[],
  outputDir: string,
  filenameBase: string
): { csvPath: string; jsonPath: string } {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const headers = ['name', 'url', 'type', 'rylaLabel', 'typeBadge', 'stats', 'creator', 'scrapedAt', 'notes'];
  const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const csvRows = [
    headers.join(','),
    ...items.map((r) => headers.map((h) => escape((r as Record<string, string>)[h] ?? '')).join(',')),
  ];
  const csvPath = path.join(outputDir, `${filenameBase}.csv`);
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf-8');

  const jsonPath = path.join(outputDir, `${filenameBase}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify({ scrapedAt: new Date().toISOString(), count: items.length, items }, null, 2), 'utf-8');

  return { csvPath, jsonPath };
}

export async function crawlCivitai(options: CivitaiCrawlOptions = {}): Promise<{ items: CivitaiCrawlItem[]; csvPath: string; jsonPath: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const useApi = options.useApi ?? (!!opts.query && !options.playwrightOnly);
  const url = modelsUrl(opts.query);

  console.log('Civit.ai crawler (IN-037)');
  console.log('  Query:', opts.query || '(none)');
  console.log('  Output:', opts.outputDir);
  console.log('');

  // Prefer API when we have a query – gets all pages reliably
  if (opts.query && useApi) {
    try {
      const items = await fetchAllViaApi(opts.query);
      const filenameBase = `civitai-${opts.query.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}`;
      const { csvPath, jsonPath } = saveOutput(items, opts.outputDir, filenameBase);
      console.log('');
      console.log('Done (API).');
      console.log('  Items:', items.length);
      console.log('  CSV:', csvPath);
      console.log('  JSON:', jsonPath);
      return { items, csvPath, jsonPath };
    } catch (err) {
      console.warn('  API failed, falling back to Playwright:', (err as Error).message);
    }
  }

  console.log('  Using Playwright (max pages:', opts.maxPages, ')');
  const browser: Browser = await chromium.launch({
    headless: opts.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  const allItems: CivitaiCrawlItem[] = [];
  const seenUrls = new Set<string>();

  try {
    for (let pageNum = 0; pageNum < opts.maxPages; pageNum++) {
      const pageOneBased = pageNum + 1;
      const pageUrl = modelsUrl(opts.query, pageOneBased);
      console.log(`  Page ${pageOneBased}/${opts.maxPages} (${pageUrl})...`);
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await throttle(opts.throttleMs);

      await page.waitForSelector('a[href*="/models/"]', { timeout: 15000 }).catch(() => null);
      await throttle(500);

      // Scroll to trigger lazy-loaded cards on this page
      for (let s = 0; s < 3; s++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => null);
        await throttle(800);
      }
      await page.evaluate(() => window.scrollTo(0, 0)).catch(() => null);
      await throttle(300);

      let pageItems: (Omit<CivitaiCrawlItem, 'rylaLabel'> & { rylaLabel: string })[];
      try {
        pageItems = await extractItemsFromPage(page);
      } catch (err) {
        console.warn('    Extract failed (page may have closed):', (err as Error).message);
        pageItems = [];
      }

      let newOnPage = 0;
      for (const raw of pageItems) {
        const key = raw.url;
        if (seenUrls.has(key)) continue;
        seenUrls.add(key);
        newOnPage++;
        const item: CivitaiCrawlItem = { ...raw };
        applyLabel(item);
        allItems.push(item);
      }

      console.log(`    Found ${pageItems.length} on page, ${newOnPage} new (total ${allItems.length} unique)`);

      if (pageItems.length === 0) break;
      await throttle(opts.throttleMs);
    }

  } finally {
    await browser.close();
  }

  const filenameBase = `civitai-${opts.query ? opts.query.replace(/\s+/g, '-') : 'models'}-${new Date().toISOString().slice(0, 10)}`;
  const { csvPath, jsonPath } = saveOutput(allItems, opts.outputDir, filenameBase);

  console.log('');
  console.log('Done.');
  console.log('  Items:', allItems.length);
  console.log('  CSV:', csvPath);
  console.log('  JSON:', jsonPath);

  return { items: allItems, csvPath, jsonPath };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: CivitaiCrawlOptions = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--query' && args[i + 1]) {
      options.query = args[i + 1];
      i++;
    } else if (args[i] === '--max-pages' && args[i + 1]) {
      options.maxPages = parseInt(args[i + 1], 10) || 5;
      i++;
    } else if (args[i] === '--output-dir' && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--no-headless') {
      options.headless = false;
    } else if (args[i] === '--throttle' && args[i + 1]) {
      options.throttleMs = parseInt(args[i + 1], 10) || 1500;
      i++;
    } else if (args[i] === '--playwright') {
      options.playwrightOnly = true;
    }
  }

  // Default query for workflows if not provided
  if (options.query === undefined) {
    options.query = 'workflow';
  }

  crawlCivitai(options).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
