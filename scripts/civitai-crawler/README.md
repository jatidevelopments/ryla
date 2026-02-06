# Civit.ai Crawler (IN-037)

Automated crawler that searches [Civit.ai](https://civitai.com/models) for workflows and models, labels them for RYLA fit, and exports CSV/JSON.

## Usage

```bash
# Default: search "workflow", 5 pages, headless, output to scripts/civitai-crawler/output/
pnpm civitai:crawl

# Custom query and pages (grabs all visible items per page via DOM)
pnpm civitai:crawl -- --query "comfyui flux" --max-pages 10

# Visible browser (debug)
pnpm civitai:crawl -- --no-headless

# Custom output directory
pnpm civitai:crawl -- --output-dir ./my-output --query workflow

# Force Playwright only (skip API attempt)
pnpm civitai:crawl -- --playwright --query workflow
```

The crawler tries the Civitai public API first when a query is set; if the API returns an error (e.g. 400 for some queries), it falls back to Playwright and collects **all model links on each page** via in-page JS so every card is included.

## Options

| Flag | Description | Default |
|------|-------------|--------|
| `--query <string>` | Search query (e.g. `workflow`, `comfyui`) | `workflow` |
| `--max-pages <n>` | Max listing pages to scrape (Playwright) | `5` |
| `--output-dir <path>` | Directory for CSV/JSON | `scripts/civitai-crawler/output` |
| `--no-headless` | Run browser visible | headless |
| `--throttle <ms>` | Delay between page loads | `1500` |
| `--playwright` | Skip API, use browser only | false |

## Output

- **CSV**: `civitai-{query}-{date}.csv` — columns: name, url, type, rylaLabel, typeBadge, stats, creator, scrapedAt, notes
- **JSON**: `civitai-{query}-{date}.json` — same data plus metadata

## RYLA labels

Items are auto-labeled from title/type/URL keywords:

- `workflow_comfyui` — workflow / ComfyUI
- `model_checkpoint` / `model_lora` / `model_controlnet` / `model_workflow`
- `face_consistency` — InstantID, IP-Adapter, etc.
- `image_edit` — inpaint, outpaint
- `video` — video gen / AnimateDiff / SVD / Wan
- `upscale` — upscaling
- `other`

## Automation

Run on a schedule (e.g. cron):

```bash
0 6 * * 0 cd /path/to/RYLA && pnpm civitai:crawl -- --query workflow --max-pages 5
```

Or from CI: add a job that runs `pnpm civitai:crawl` and optionally uploads the CSV artifact.

## Requirements

- Node 18+
- Playwright: `npx playwright install chromium` (if not already installed)
- Respect Civit.ai ToS and rate limits (throttle, no aggressive concurrency)

## Related

- Initiative: [IN-037](../../docs/initiatives/IN-037-civitai-crawler-scraper.md)
- IN-019 (workflow analyzer), IN-028 (workflow-to-serverless) can consume this CSV for candidate workflows.
