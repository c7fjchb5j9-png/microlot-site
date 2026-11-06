// Конвертирует фото из images/ в WebP нескольких размеров (public/img/)
// и пишет размеры в src/data/images.json. Запускается автоматически перед dev и build.
import sharp from 'sharp';
import { readdir, mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'images');
const OUT = path.join(root, 'public', 'img');
const META = path.join(root, 'src', 'data', 'images.json');
const WIDTHS = [480, 960, 1440];

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const meta = {};

for (const file of files) {
  const name = file.replace(/\.[^.]+$/, '');
  const input = path.join(SRC, file);
  const { width, height } = await sharp(input).rotate().metadata();
  const widths = WIDTHS.filter((w) => w < width);
  widths.push(Math.min(width, 1440));
  const uniq = [...new Set(widths)].sort((a, b) => a - b);
  const srcMtime = (await stat(input)).mtimeMs;

  for (const w of uniq) {
    const out = path.join(OUT, `${name}-${w}.webp`);
    if (existsSync(out) && (await stat(out)).mtimeMs > srcMtime) continue;
    await sharp(input).rotate().resize({ width: w }).webp({ quality: 74, effort: 5 }).toFile(out);
  }
  meta[name] = { width, height, widths: uniq };
}

// Иконки из SVG-знака
const svg = await readFile(path.join(root, 'public', 'favicon.svg'));
await sharp(svg, { density: 400 }).resize(180, 180).flatten({ background: '#023A35' }).png().toFile(path.join(root, 'public', 'apple-touch-icon.png'));
await sharp(svg, { density: 300 }).resize(32, 32).png().toFile(path.join(root, 'public', 'favicon-32.png'));

// Текстура «бумажного зерна» — готовым тайлом, без дорогого SVG-фильтра
for (const [file, rgb, max] of [['noise-dark.png', [0, 38, 37], 20], ['noise-light.png', [255, 245, 232], 16]]) {
  const S = 128, buf = Buffer.alloc(S * S * 4);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < S * S; i++) {
    buf[i * 4] = rgb[0]; buf[i * 4 + 1] = rgb[1]; buf[i * 4 + 2] = rgb[2];
    buf[i * 4 + 3] = Math.round(rnd() ** 2 * max);
  }
  await sharp(buf, { raw: { width: S, height: S, channels: 4 } }).png({ palette: true, colors: 32 }).toFile(path.join(root, 'public', file));
}

await writeFile(META, JSON.stringify(meta, null, 2));
console.log(`images: ${files.length} файлов → public/img`);
