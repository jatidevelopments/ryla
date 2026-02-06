/**
 * RunComfy workflow catalog from page HTML (IN-038).
 *
 * RunComfy does NOT expose a public "list workflows" API. The gallery list is
 * embedded in the initial page load as Next.js RSC payload (self.__next_f.push(...))
 * in script tags. This script fetches the workflows page and parses that payload
 * to extract slug, title, description, workflow_id, etc.
 *
 * Usage:
 *   npx tsx scripts/runcomfy-fetch-workflow-catalog.ts
 *   RUNCOMFY_COOKIE="session=..." npx tsx scripts/runcomfy-fetch-workflow-catalog.ts  # if login required
 *
 * Output: writes docs/research/infrastructure/runcomfy-workflow-catalog.json
 */

const WORKFLOWS_URL = 'https://www.runcomfy.com/comfyui-workflows';

interface WorkflowEntry {
  slug: string;
  url: string;
  title: string;
  description: string;
  workflow_id?: string;
  workflow_name?: string;
  order?: number;
}

function extractWorkflowsFromHtml(html: string): WorkflowEntry[] {
  const seen = new Set<string>();
  const entries: WorkflowEntry[] = [];

  // RSC payload in HTML: \"slug\":\"value\" (backslash before each " in the JSON string)
  const slugRe = /\\"slug\\":\\"([^\\]+)\\"/g;
  const urlRe = /\\"url\\":\\"(\/comfyui-workflows\/[^\\]+)\\"/g;
  const titleRe = /\\"page_title\\":\\"((?:[^\\]|\\.)*?)\\"/g;
  const descRe = /\\"page_short_description\\":\\"((?:[^\\]|\\.)*?)\\"/g;
  const idRe = /\\"workflow_id\\":\\"([^\\]+)\\"/g;
  const nameRe = /\\"workflow_name\\":\\"((?:[^\\]|\\.)*?)\\"/g;
  const orderRe = /\\"order\\":(\d+)/g;

  const slugMatches: { slug: string; index: number }[] = [];
  let m: RegExpExecArray | null;

  slugRe.lastIndex = 0;
  while ((m = slugRe.exec(html)) !== null) {
    const slug = m[1];
    if (slug && !['my-workflows', 'my-machines', 'my-assets'].includes(slug))
      slugMatches.push({ slug, index: m.index });
  }

  // Each slug's metadata is in the same RSC chunk; derive url from slug
  for (const { slug, index } of slugMatches) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    const url = `https://www.runcomfy.com/comfyui-workflows/${slug}`;
    const chunk = html.slice(index, index + 2500);

    let title = '';
    const t = titleRe.exec(chunk);
    if (t) title = t[1].replace(/\\u0026/g, '&');
    titleRe.lastIndex = 0;

    let description = '';
    const d = descRe.exec(chunk);
    if (d) description = d[1].replace(/\\u0026/g, '&');
    descRe.lastIndex = 0;

    let workflow_id: string | undefined;
    const id = idRe.exec(chunk);
    if (id) workflow_id = id[1];
    idRe.lastIndex = 0;

    let workflow_name: string | undefined;
    const nm = nameRe.exec(chunk);
    if (nm) workflow_name = nm[1];
    nameRe.lastIndex = 0;

    let order: number | undefined;
    const o = orderRe.exec(chunk);
    if (o) order = parseInt(o[1], 10);
    orderRe.lastIndex = 0;

    entries.push({
      slug,
      url,
      title,
      description,
      workflow_id,
      workflow_name,
      order,
    });
  }

  entries.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return entries;
}

async function main() {
  let html: string;
  const inputFile = process.argv[2];
  if (inputFile) {
    const fs = await import('fs/promises');
    html = await fs.readFile(inputFile, 'utf-8');
  } else {
    const cookie = process.env.RUNCOMFY_COOKIE;
    const res = await fetch(WORKFLOWS_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ...(cookie ? { Cookie: cookie } : {}),
      },
    });
    if (!res.ok) {
      console.error('Fetch failed:', res.status, res.statusText);
      process.exit(1);
    }
    html = await res.text();
  }
  const workflows = extractWorkflowsFromHtml(html);

  const path = 'docs/research/infrastructure/runcomfy-workflow-catalog.json';
  const output = {
    _meta: {
      source: WORKFLOWS_URL,
      collectedAt: new Date().toISOString().slice(0, 10),
      method: 'runcomfy-fetch-workflow-catalog.ts (parse RSC payload from page HTML)',
      initiative: 'IN-038',
      count: workflows.length,
    },
    workflows,
  };

  const fs = await import('fs/promises');
  await fs.writeFile(path, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Wrote ${workflows.length} workflows to ${path}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
