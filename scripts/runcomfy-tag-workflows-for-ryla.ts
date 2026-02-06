/**
 * Tag RunComfy catalog workflows by RYLA use case and priority (IN-038 Phase 2).
 *
 * Reads runcomfy-workflow-catalog.json, assigns primary category from title/description
 * keywords, and writes a shortlist JSON + markdown summary.
 *
 * Usage: npx tsx scripts/runcomfy-tag-workflows-for-ryla.ts
 * Output: docs/research/infrastructure/runcomfy-workflow-shortlist.json and .md
 */

const CATALOG_PATH = 'docs/research/infrastructure/runcomfy-workflow-catalog.json';
const SHORTLIST_JSON = 'docs/research/infrastructure/runcomfy-workflow-shortlist.json';
const SHORTLIST_MD = 'docs/research/infrastructure/runcomfy-workflow-shortlist.md';

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

type Category =
  | 't2i'
  | 'face_consistency'
  | 'image_edit'
  | 'video_t2v'
  | 'video_i2v'
  | 'video_r2v'
  | 'upscale'
  | 'lora'
  | 'face_swap'
  | 'other';

const CATEGORY_KEYWORDS: { category: Category; keywords: RegExp[]; priority: 'P0' | 'P1' | 'P2' }[] = [
  { category: 't2i', priority: 'P0', keywords: [/text-to-image|text to image|t2i|sdxl turbo|flux.*image|portrait master|stable cascade|qwen.*image|hunyuan.*image/i] },
  { category: 'face_consistency', priority: 'P0', keywords: [/instantid|pulid|ipadapter.*face|faceid|consistent character|face consistency/i] },
  { category: 'image_edit', priority: 'P0', keywords: [/inpaint|inpainting|outpaint|outpainting|image edit|instruction.*edit|flux klein.*edit/i] },
  { category: 'video_t2v', priority: 'P0', keywords: [/text-to-video|text to video|t2v|animatediff|stable video diffusion|svd.*text|wan.*2|wan2|hunyuan.*video|video generation/i] },
  { category: 'video_i2v', priority: 'P0', keywords: [/image-to-video|image to video|i2v|svd.*image|img2vid/i] },
  { category: 'video_r2v', priority: 'P1', keywords: [/reference.*video|r2v|reference-to-video/i] },
  { category: 'upscale', priority: 'P1', keywords: [/upscal|4x|ultrasharp|super-resolution|seedvr|real-esrgan|flux upscaler/i] },
  { category: 'lora', priority: 'P0', keywords: [/lora training|lora inference|flux.*lora|qwen.*lora|wan.*lora/i] },
  { category: 'face_swap', priority: 'P1', keywords: [/face swap|reactor|swap face/i] },
];

function tagWorkflow(entry: WorkflowEntry): { category: Category; priority: 'P0' | 'P1' | 'P2' } {
  const text = `${entry.title} ${entry.description} ${entry.slug}`.toLowerCase();
  for (const { category, keywords, priority } of CATEGORY_KEYWORDS) {
    if (keywords.some((re) => re.test(text))) return { category, priority };
  }
  return { category: 'other', priority: 'P2' };
}

async function main() {
  const fs = await import('fs/promises');

  const raw = await fs.readFile(CATALOG_PATH, 'utf-8');
  const catalog = JSON.parse(raw) as Catalog;

  const tagged = catalog.workflows.map((w) => {
    const { category, priority } = tagWorkflow(w);
    return { ...w, category, priority };
  });

  const byCategory = new Map<Category, typeof tagged>();
  for (const t of tagged) {
    if (!byCategory.has(t.category)) byCategory.set(t.category, []);
    byCategory.get(t.category)!.push(t);
  }

  const shortlist = {
    _meta: {
      source: CATALOG_PATH,
      generatedAt: new Date().toISOString(),
      initiative: 'IN-038',
      totalWorkflows: catalog.workflows.length,
      byCategory: Object.fromEntries([...byCategory.entries()].map(([k, v]) => [k, v.length])),
    },
    byCategory: Object.fromEntries(
      [...byCategory.entries()].map(([cat, list]) => [
        cat,
        list.map(({ slug, url, title, category, priority }) => ({ slug, url, title, category, priority })),
      ])
    ),
    tagged,
  };

  await fs.writeFile(SHORTLIST_JSON, JSON.stringify(shortlist, null, 2), 'utf-8');

  const md: string[] = [
    '# RunComfy Workflow Shortlist for RYLA (IN-038)',
    '',
    'Auto-generated from catalog by `scripts/runcomfy-tag-workflows-for-ryla.ts`.',
    '',
    '## Summary by category',
    '',
    '| Category | Count | RYLA priority |',
    '|----------|-------|----------------|',
  ];
  for (const [cat, list] of [...byCategory.entries()].sort((a, b) => b[1].length - a[1].length)) {
    const p = list[0]?.priority ?? 'P2';
    md.push(`| ${cat} | ${list.length} | ${p} |`);
  }
  md.push('', '## P0 / P1 workflows (candidates for RYLA)', '');
  const p0p1 = tagged.filter((t) => t.priority !== 'P2' && t.category !== 'other');
  for (const t of p0p1.slice(0, 80)) {
    md.push(`- **${t.title}** — \`${t.slug}\` [${t.category}] ${t.priority}`);
  }
  if (p0p1.length > 80) md.push(`- ... and ${p0p1.length - 80} more (see JSON).`);
  md.push('', '## Full data', '', 'See `runcomfy-workflow-shortlist.json`.');
  await fs.writeFile(SHORTLIST_MD, md.join('\n'), 'utf-8');

  console.log('Tagged', catalog.workflows.length, 'workflows.');
  console.log('By category:', Object.fromEntries([...byCategory.entries()].map(([k, v]) => [k, v.length])));
  console.log('P0/P1 (excl. other):', p0p1.length);
  console.log('Wrote', SHORTLIST_JSON, 'and', SHORTLIST_MD);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
