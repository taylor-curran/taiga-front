import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.resolve(__dirname, '../docs/screenshots');
const OUT = path.resolve(__dirname, '../docs/screenshots/_combined');
await fs.mkdir(OUT, { recursive: true });

const TARGET_WIDTH = 1280;
const LABEL_HEIGHT = 36;
const GAP = 12;

async function labelStrip(text, width, color) {
  const svg = `
    <svg width="${width}" height="${LABEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="14" y="${LABEL_HEIGHT * 0.65}" font-size="18" font-family="Arial, sans-serif" fill="white" font-weight="700">${text}</text>
    </svg>
  `;
  return Buffer.from(svg);
}

const files = (await fs.readdir(SHOTS)).filter((f) => f.endsWith('.angular.png'));
files.sort();

for (const af of files) {
  const base = af.replace('.angular.png', '');
  const rf = `${base}.react.png`;
  const aPath = path.join(SHOTS, af);
  const rPath = path.join(SHOTS, rf);
  try {
    await fs.access(rPath);
  } catch {
    console.warn('skip', base, '(no react counterpart)');
    continue;
  }

  const ang = await sharp(aPath).resize({ width: TARGET_WIDTH, withoutEnlargement: false }).toBuffer();
  const rea = await sharp(rPath).resize({ width: TARGET_WIDTH, withoutEnlargement: false }).toBuffer();
  const angMeta = await sharp(ang).metadata();
  const reaMeta = await sharp(rea).metadata();
  const h = Math.min(angMeta.height ?? 0, reaMeta.height ?? 0, 1400);
  const ang2 = await sharp(ang).extract({ left: 0, top: 0, width: TARGET_WIDTH, height: h }).toBuffer();
  const rea2 = await sharp(rea).extract({ left: 0, top: 0, width: TARGET_WIDTH, height: h }).toBuffer();
  const labelA = await labelStrip('Angular reference (taiga-front, :9000)', TARGET_WIDTH, '#21344b');
  const labelR = await labelStrip('React port (web-react, :5173)', TARGET_WIDTH, '#0e7c75');

  const totalH = (LABEL_HEIGHT + h) * 2 + GAP;
  const out = await sharp({
    create: {
      width: TARGET_WIDTH,
      height: totalH,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      { input: labelA, top: 0, left: 0 },
      { input: ang2, top: LABEL_HEIGHT, left: 0 },
      { input: labelR, top: LABEL_HEIGHT + h + GAP, left: 0 },
      { input: rea2, top: LABEL_HEIGHT + h + GAP + LABEL_HEIGHT, left: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
  const target = path.join(OUT, `${base}.compare.png`);
  await fs.writeFile(target, out);
  console.log('wrote', path.relative(process.cwd(), target));
}
