/**
 * Civitai public API fetcher – gets all models for a query with pagination (IN-037).
 * @see https://developer.civitai.com/docs/api/public-rest
 */

import type { CivitaiCrawlItem } from './types';
import { applyLabel } from './label';

const API_BASE = 'https://civitai.com/api/v1';
const PAGE_SIZE = 100; // API max
const THROTTLE_MS = 500;

function throttle(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface CivitaiApiModel {
  id: number;
  name: string;
  description?: string;
  type: string;
  creator?: { username?: string };
  stats?: {
    downloadCount?: number;
    favoriteCount?: number;
    commentCount?: number;
    ratingCount?: number;
    rating?: number;
  };
  tags?: string[];
}

interface CivitaiApiResponse {
  items: CivitaiApiModel[];
  metadata?: {
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    totalPages?: number;
    nextPage?: string | null;
  };
}

/**
 * Fetch one page of models from Civitai API.
 */
async function fetchPage(query: string, page: number): Promise<CivitaiApiResponse> {
  const params = new URLSearchParams({
    query,
    limit: String(PAGE_SIZE),
    page: String(page),
  });
  const url = `${API_BASE}/models?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Civitai API error: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as CivitaiApiResponse;
}

/**
 * Map API model to crawl item (no rylaLabel yet – applyLabel after).
 */
function mapToItem(api: CivitaiApiModel, scrapedAt: string): Omit<CivitaiCrawlItem, 'rylaLabel'> & { rylaLabel: string } {
  const url = `https://civitai.com/models/${api.id}`;
  const typeBadge = api.type || '';
  const type: CivitaiCrawlItem['type'] =
    /workflow/i.test(typeBadge) || /workflow/i.test(api.name) ? 'workflow' : typeBadge ? 'model' : 'unknown';

  let stats = '';
  if (api.stats) {
    const parts: string[] = [];
    if (api.stats.downloadCount != null) parts.push(`${formatCount(api.stats.downloadCount)} downloads`);
    if (api.stats.favoriteCount != null) parts.push(`${formatCount(api.stats.favoriteCount)} favorites`);
    if (api.stats.rating != null) parts.push(`${api.stats.rating} rating`);
    stats = parts.join(', ');
  }

  return {
    name: api.name?.trim().slice(0, 200) || `Model ${api.id}`,
    url,
    type,
    rylaLabel: '',
    typeBadge,
    stats,
    creator: api.creator?.username ?? '',
    scrapedAt,
    notes: '',
  };
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/**
 * Fetch all models matching the query via API (all pages).
 * Returns items with rylaLabel applied.
 */
export async function fetchAllViaApi(query: string): Promise<CivitaiCrawlItem[]> {
  const scrapedAt = new Date().toISOString();
  const allItems: CivitaiCrawlItem[] = [];
  let page = 1;
  let totalPages = 1;

  console.log('  Fetching via Civitai API (all pages)...');

  while (page <= totalPages) {
    const data = await fetchPage(query, page);
    const items = data.items ?? [];
    const meta = data.metadata ?? {};

    for (const apiModel of items) {
      const item = mapToItem(apiModel, scrapedAt);
      applyLabel(item);
      allItems.push(item as CivitaiCrawlItem);
    }

    if (meta.totalPages != null) totalPages = meta.totalPages;
    const nextPage = meta.nextPage;
    console.log(`    Page ${page}/${totalPages} – ${items.length} items (total: ${allItems.length})`);

    if (items.length < PAGE_SIZE && !nextPage) break;
    page++;
    await throttle(THROTTLE_MS);
  }

  return allItems;
}
