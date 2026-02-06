/**
 * Types for Civit.ai crawler (IN-037).
 */

export interface CivitaiCrawlItem {
  /** Display name / title */
  name: string;
  /** Full URL to model or resource page */
  url: string;
  /** Type: workflow (ComfyUI etc.) or model (checkpoint, lora, etc.) */
  type: 'workflow' | 'model' | 'unknown';
  /** RYLA relevance label from keyword rules */
  rylaLabel: string;
  /** Raw type badge from site if any (e.g. Checkpoint, LoRA, Workflow) */
  typeBadge: string;
  /** Stats string if scraped (e.g. "1.2k downloads") */
  stats: string;
  /** Creator/author if visible */
  creator: string;
  /** Scrape timestamp */
  scrapedAt: string;
  /** Optional notes for manual review */
  notes: string;
}

export interface CivitaiCrawlOptions {
  /** Search query (e.g. "workflow"). Empty = browse without search. */
  query?: string;
  /** Max pages to scrape (each page ~20–50 items). Default 5. */
  maxPages?: number;
  /** Output directory for CSV/JSON. Default scripts/civitai-crawler/output */
  outputDir?: string;
  /** Run browser headless. Default true */
  headless?: boolean;
  /** Delay between page loads (ms) to be polite. Default 1500 */
  throttleMs?: number;
  /** Use Civitai API to fetch all pages (recommended when query is set). Default true when query is set. */
  useApi?: boolean;
  /** Force Playwright only (no API). Use when API fails or for browsing without query. */
  playwrightOnly?: boolean;
}
