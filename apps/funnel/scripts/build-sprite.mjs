/* eslint-disable no-undef, no-useless-escape */
import { writeFile, mkdir, rm, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import Spritesmith from 'spritesmith';
import sharp from 'sharp';

const ROOT = process.cwd();
const IMAGES_ROOT = path.join(ROOT, 'public', 'images');

const OUT_DIR = path.join(ROOT, 'public', 'images', 'company-logos');
const OUT_PNG = path.join(OUT_DIR, 'sprite.png');
const OUT_WEBP = path.join(OUT_DIR, 'sprite.webp');
const OUT_TS = path.join(ROOT, 'constants', 'sprite.ts');

const SPRITE_URL = '/images/company-logos/sprite.webp';

const TMP_DIR = path.join(ROOT, '.tmp', 'sprite-src');

const toPosix = (p) => p.replace(/\\/g, '/');
const relFromImages = (abs) => toPosix(path.relative(IMAGES_ROOT, abs));
const makeId = (abs) =>
  relFromImages(abs)
    .replace(/\.[^.]+$/, '')
    .replace(/[\/\\]/g, '-');
const makeTitle = (abs) =>
  path
    .basename(abs)
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
const sortFiles = (arr) =>
  arr.sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );

const IGNORE = ['**/video/**', '**/videos/**', '**/*.gif'];

const MAX_DIM = 1024;
const MAX_BYTES = 800 * 1024;

const WHITELIST = new Set(['brands/zerohedge-logo.webp']);

async function ensureTmpDir() {
  await rm(TMP_DIR, { recursive: true, force: true });
  await mkdir(TMP_DIR, { recursive: true });
}

async function shouldInclude(abs) {
  try {
    const rel = relFromImages(abs);
    if (WHITELIST.has(rel)) return true;
    const st = await stat(abs);
    if (st.size > MAX_BYTES) return false;
    const meta = await sharp(abs).metadata();
    if (!meta.width || !meta.height) return false;
    if (meta.width > MAX_DIM || meta.height > MAX_DIM) return false;
    return true;
  } catch {
    return false;
  }
}

(async () => {
  const pattern = toPosix(
    path.join(
      IMAGES_ROOT,
      '**/*.{png,PNG,webp,WEBP,jpg,JPG,jpeg,JPEG,svg,SVG,avif,AVIF}'
    )
  );
  let files = await glob(pattern, { nodir: true, ignore: IGNORE });

  if (!files.length) {
    console.error('No images found under public/images/**');
    process.exit(1);
  }

  files = sortFiles(files);

  const filtered = [];
  for (const f of files) {
    if (await shouldInclude(f)) filtered.push(f);
  }
  if (!filtered.length) {
    console.error('All images were filtered out.');
    process.exit(1);
  }

  await ensureTmpDir();
  const normalizedPngs = [];
  for (const src of filtered) {
    const ext = path.extname(src).toLowerCase();
    const id = makeId(src);
    const outPng = path.join(TMP_DIR, `${id}.png`);
    if (ext === '.png') {
      await copyFile(src, outPng);
    } else {
      const buf = await sharp(src).png({ compressionLevel: 9 }).toBuffer();
      await writeFile(outPng, buf);
    }
    normalizedPngs.push(outPng);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const result = await new Promise((resolve, reject) =>
    Spritesmith.run(
      { src: normalizedPngs, algorithm: 'binary-tree', padding: 4 },
      (err, res) => (err ? reject(err) : resolve(res))
    )
  );

  await writeFile(OUT_PNG, result.image);
  const webpBuf = await sharp(result.image).webp({ quality: 85 }).toBuffer();
  await writeFile(OUT_WEBP, webpBuf);

  const coords = result.coordinates;
  const tmpId = (tmpPath) => path.basename(tmpPath, '.png');

  const items = Object.entries(coords).map(([tmpPath, rect]) => {
    const id = tmpId(tmpPath);
    const matchAbs = filtered.find((abs) => makeId(abs) === id);
    const rel = matchAbs ? relFromImages(matchAbs) : id;
    const group = rel.includes('/') ? rel.split('/')[0] : '';
    const title = matchAbs ? makeTitle(matchAbs) : id;

    return {
      id,
      group,
      title,
      w: rect.width,
      h: rect.height,
      x: rect.x,
      y: rect.y,
    };
  });

  const meta = await sharp(webpBuf).metadata();
  const SPRITE_W = meta.width ?? result.properties.width;
  const SPRITE_H = meta.height ?? result.properties.height;

  const ts = `/* AUTO-GENERATED — DO NOT EDIT */
export type SpriteItem = { id: string; title: string; group?: string; w: number; h: number; x: number; y: number; };

export const SPRITE_URL = "${SPRITE_URL}";
export const SPRITE_W = ${SPRITE_W};
export const SPRITE_H = ${SPRITE_H};

export const SPRITE_ITEMS: SpriteItem[] = ${JSON.stringify(items, null, 2)};
`;

  await writeFile(OUT_TS, ts, 'utf8');

  console.log(
    `Sprite built: ${OUT_WEBP} (${SPRITE_W}x${SPRITE_H}) with ${items.length} items → ${OUT_TS}`
  );

  await rm(TMP_DIR, { recursive: true, force: true });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
