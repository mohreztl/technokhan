#!/usr/bin/env node
/**
 * Product image pipeline: one raw photo in, three on-brand images out.
 *
 *   pnpm --filter image-pipeline generate -- --input raw/photo.jpg --slug wireless-mouse
 *
 * Flow (per docs/wordpress-migration.md §فاز ۷):
 *   1. raw photo
 *   2. AI edit per template — main (clean branded background), lifestyle
 *      (real-world scene), banner (wide promo card)
 *   3. sharp → exact template size → WebP → apps/web/public/images/products/<slug>-{main,lifestyle,banner}.webp
 *
 * Config (env): OPENAI_API_KEY, AI_IMAGE_MODEL (default gpt-image-1),
 * IMAGE_BRAND_NAME (default تکنو خان), IMAGE_BRAND_STYLE (palette/mood text).
 * The prompts below are the fixed "قالب مشخص" — change them once per brand here.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
function arg(name, fallback = '') {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
}

const input = arg('input');
const slug = arg('slug');
const outDir = arg('out', path.resolve('../../apps/web/public/images/products'));
if (!input || !slug) {
  console.error('usage: generate --input <raw-photo> --slug <product-slug> [--out <dir>]');
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error(`input not found: ${input}`);
  process.exit(1);
}

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('OPENAI_API_KEY is not set');
  process.exit(1);
}

const MODEL = process.env.AI_IMAGE_MODEL || 'gpt-image-1';
const BRAND = process.env.IMAGE_BRAND_NAME || 'تکنو خان';
const BRAND_STYLE =
  process.env.IMAGE_BRAND_STYLE ||
  'minimal premium tech-store aesthetic, dark graphite background (#1C1F24) with warm bone (#EDEAE2) accents, soft studio lighting, high detail, no text unless asked';

/** The fixed template — three shots, three sizes matching the storefront groups. */
const TEMPLATES = [
  {
    name: 'main',
    size: '1024x1024',
    width: 1200,
    height: 1200,
    prompt: `Professional e-commerce product photo of the exact product in the image, centered, on a seamless ${BRAND_STYLE}. The product must stay identical — shape, color, labels. No watermark.`,
  },
  {
    name: 'lifestyle',
    size: '1024x1024',
    width: 1200,
    height: 1200,
    prompt: `Lifestyle photo of the exact product from the image in a real Persian home/office desk scene, natural light, shallow depth of field, ${BRAND_STYLE}. Product identical to the source image. No text.`,
  },
  {
    name: 'banner',
    size: '1536x1024',
    width: 1600,
    height: 1000,
    prompt: `Wide promotional banner featuring the exact product from the image on the right third of the frame, generous empty space on the left for headline text, ${BRAND_STYLE}, small "${BRAND}" wordmark in the corner. Product identical to the source image.`,
  },
];

async function generateImage(template) {
  const form = new FormData();
  form.append('model', MODEL);
  form.append('prompt', template.prompt);
  form.append('size', template.size);
  form.append('image', new Blob([fs.readFileSync(input)]), path.basename(input));
  form.append('quality', 'high');

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}` },
    body: form,
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${template.name}: OpenAI ${response.status}: ${body.slice(0, 300)}`);
  }
  const json = await response.json();
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error(`${template.name}: no image in response`);
  return Buffer.from(b64, 'base64');
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  const results = [];
  for (const template of TEMPLATES) {
    const png = await generateImage(template);
    const out = path.join(outDir, `${slug}-${template.name}.webp`);
    await sharp(png)
      .resize(template.width, template.height, { fit: 'cover', position: 'center' })
      .webp({ quality: 84, effort: 5 })
      .toFile(out);
    const meta = await sharp(out).metadata();
    if (meta.width !== template.width || meta.height !== template.height) {
      throw new Error(`${out}: unexpected ${meta.width}x${meta.height}`);
    }
    results.push(out);
    console.log(`${template.name}: ${path.relative(process.cwd(), out)} ${template.width}x${template.height}`);
  }
  console.log(JSON.stringify({ slug, images: results.length }));
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
