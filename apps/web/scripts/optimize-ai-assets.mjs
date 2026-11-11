import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicRoot = path.resolve('public/images');
const groups = {
  hero: [1600, 1000],
  categories: [1200, 900],
  products: [1200, 1200],
  'hero-shelf': [1200, 1200],
  blog: [1200, 800],
};
const clean = process.argv.includes('--clean');

/** Converts downloaded AI Studio JPEGs to consistent, compressed WebP storefront assets. */
async function optimize() {
  for (const [group, [width, height]] of Object.entries(groups)) {
    const directory = path.join(publicRoot, group);
    if (!fs.existsSync(directory)) continue;
    const sources = fs.readdirSync(directory).filter((file) => file.endsWith('.jpg'));
    for (const source of sources) {
      const input = path.join(directory, source);
      const output = input.replace(/\.jpg$/, '.webp');
      await sharp(input).resize(width, height, { fit: 'cover', position: 'center' }).webp({ quality: 84, effort: 5 }).toFile(output);
      const metadata = await sharp(output).metadata();
      if (metadata.width !== width || metadata.height !== height) throw new Error(`Invalid dimensions for ${output}`);
      if (clean) fs.unlinkSync(input);
      console.log(`${path.relative(publicRoot, output)} ${width}x${height}`);
    }
  }
}

await optimize();
