# RunComfy Workflow Discovery (IN-038)

**Purpose**: Document how the RunComfy ComfyUI Workflows catalog was collected and how to refresh it.

## Catalog

- **File**: [runcomfy-workflow-catalog.json](./runcomfy-workflow-catalog.json)
- **Source**: https://www.runcomfy.com/comfyui-workflows
- **Count**: ~290+ workflows (full list embedded in initial page HTML; no login required for catalog)

## How the UI loads workflows (API findings)

RunComfy does **not** expose a dedicated REST API for the workflow gallery.

1. **Initial page load**: The workflows page is a Next.js app. The **full workflow list** is embedded in the **initial HTML** inside React Server Components (RSC) payloads: `<script>self.__next_f.push([1,"..."])</script>`. Each push contains escaped JSON with `\"slug\":\"...\", \"url\":\"/comfyui-workflows/...\", \"page_title\":\"...\", \"page_short_description\":\"...\", \"workflow_id\":\"...\", \"order\":...`.
2. **“Load more”**: Does not call a separate API. The client already has the full list in the RSC stream; “Load more” only reveals more cards and may trigger per-workflow RSC fetches (`GET /comfyui-workflows/{slug}?_rsc=...`) for detail.
3. **RunComfy public API** (`https://api.runcomfy.net`): Exposes **deployments** (your own deployed workflows), not the **gallery** of curated workflows. See [Deployment Endpoints](https://docs.runcomfy.com/serverless/deployment-endpoints).

So the only way to get the full gallery list programmatically is to **parse the initial page HTML** (or use Playwright to scrape the DOM after load).

## Preferred method: Parse page HTML (no browser)

Use the script that fetches the workflows page and parses the RSC payload:

```bash
# From repo root
npx tsx scripts/runcomfy-fetch-workflow-catalog.ts
```

- **Input**: `GET https://www.runcomfy.com/comfyui-workflows` (no auth required for the list).
- **Output**: Writes `docs/research/infrastructure/runcomfy-workflow-catalog.json` with `_meta` and `workflows` (slug, url, title, description, workflow_id, workflow_name, order).
- **Optional**: Pass a path to a saved HTML file to parse offline:  
  `npx tsx scripts/runcomfy-fetch-workflow-catalog.ts /path/to/runcomfy.html`
- **Optional**: If the site starts requiring login, set `RUNCOMFY_COOKIE` with your session cookie.

This gives **~290+ workflows** in one run, with no “Load more” or browser.

## Alternative: Playwright MCP (DOM scrape)

If the script fails (e.g. HTML structure changes):

1. Log in to RunComfy in the browser (if required).
2. Navigate to `https://www.runcomfy.com/comfyui-workflows`.
3. Click “Load more” until all cards are visible.
4. Use `browser_evaluate` to collect all `a[href^="/comfyui-workflows/"]` (exclude `my-workflows`, `my-machines`, `my-assets`), reading slug, `h3`, `p`, and building `url`.
5. Save the result into the same JSON file and update `_meta`.

## Re-running discovery

- **Recommended**: Run `npx tsx scripts/runcomfy-fetch-workflow-catalog.ts` periodically; update `_meta.collectedAt` in the generated file if you change the script.
- **Alternative**: Use Playwright as above and replace the `workflows` array.

## Downloading workflow JSON (workflow.json)

### Script: fetch-only by default (no Playwright)

The script runs **without a browser** by default: it tries candidate URL patterns and parses each workflow detail page HTML for any workflow JSON download link. RunComfy does not currently expose public URLs for gallery workflows, so this usually yields **0 downloads** but needs no dependencies beyond Node/fetch.

```bash
# From repo root (no Playwright required)
npx tsx scripts/runcomfy-download-workflow-files.ts
npx tsx scripts/runcomfy-download-workflow-files.ts --limit 10
RUNCOMFY_COOKIE="session=..." npx tsx scripts/runcomfy-download-workflow-files.ts
```

- **Input**: Reads `docs/research/infrastructure/runcomfy-workflow-catalog.json`.
- **Behavior**: For each workflow, tries known URL patterns (CDN, API, slug-based), then fetches the workflow detail page and parses it for any `href` or URL pointing to a workflow JSON file. Saves when a URL returns valid JSON that looks like a workflow (nodes/links/prompt).
- **Output**: `docs/research/infrastructure/runcomfy-workflows/<slug>/workflow.json` when a URL works.

### Browser mode (Playwright)

To actually download files, use the **“Download Workflow.json”** button on each page via Playwright:

```bash
# Requires: pnpm add -D -w playwright && npx playwright install chromium
npx tsx scripts/runcomfy-download-workflow-files.ts --browser
npx tsx scripts/runcomfy-download-workflow-files.ts --browser --limit 10
npx tsx scripts/runcomfy-download-workflow-files.ts --browser --headed
```

- **Behavior**: Opens each workflow URL in Chromium, finds and clicks “Download Workflow.json”, and saves the downloaded file. This is the only reliable way to get gallery workflow JSON today.

### workflow_api.json and object_info.json

- **workflow.json** (what the button gives): Full UI export; good for sharing and editing in ComfyUI. For API execution you may need to convert to API format or export **workflow_api.json** from ComfyUI (Workflow → Export (API)) after opening the workflow on RunComfy.
- **object_info.json**: Fetched from a **running** ComfyUI instance at `https://<server_id>-comfyui.runcomfy.com/object_info`. Not provided per workflow on the gallery; optional for validation/tooling.

## Related

- **Initiative**: [IN-038: RunComfy Workflow Catalog & RYLA Integration](../../initiatives/IN-038-runcomfy-workflow-catalog-integration.md)
- **RunComfy API**: https://docs.runcomfy.com/serverless/deployment-endpoints
