import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('.');
const iconDir = path.join(root, 'public/icons');
fs.mkdirSync(iconDir, { recursive: true });

const mark = (size = 512) => Buffer.from(`<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" rx="128" fill="#111516"/><path d="M112 132h190M207 132v246" fill="none" stroke="#C8F45A" stroke-width="38" stroke-linecap="square"/><path d="M215 257h77l46-58M250 257l62 96" fill="none" stroke="#F3F5EE" stroke-width="28" stroke-linecap="square" stroke-linejoin="miter"/><circle cx="342" cy="352" r="15" fill="#C8F45A"/></svg>`);

/** Generates the TechnoKhan app icons and the social Open Graph card from local assets. */
async function generate() {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  await Promise.all(sizes.map((size) => sharp(mark(size)).png().toFile(path.join(iconDir, `icon-${size}.png`))));
  await Promise.all([192, 512].map((size) => sharp(mark(size)).png().toFile(path.join(iconDir, `icon-maskable-${size}.png`))));
  await sharp(mark(512)).png().toFile(path.join(root, 'src/app/icon.png'));
  await sharp(mark(180)).png().toFile(path.join(root, 'src/app/apple-icon.png'));
  for (const name of ['products', 'services', 'cart', 'booking']) {
    await sharp(mark(96)).png().toFile(path.join(iconDir, `shortcut-${name}.png`));
  }

  const hero = await sharp(path.join(root, 'public/images/hero/hero-headphones.webp')).resize(1200, 630, { fit: 'cover' }).modulate({ brightness: 0.62 }).png().toBuffer();
  const overlay = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#090B0C" stop-opacity="0.98"/><stop offset="0.72" stop-color="#090B0C" stop-opacity="0.2"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><g transform="translate(72 86) scale(.36)">${mark(512).toString('utf8')}</g><text x="72" y="440" fill="#F3F5EE" font-family="Arial" font-size="66" font-weight="700" letter-spacing="2">TECHNO KHAN</text><text x="74" y="502" fill="#C8F45A" font-family="Arial" font-size="24" letter-spacing="7">PRECISION TECH</text><text x="74" y="570" fill="#AEB6B8" font-family="Arial" font-size="26">technokhan.com</text></svg>`);
  await sharp(hero).composite([{ input: overlay }]).png().toFile(path.join(root, 'src/app/opengraph-image.png'));
  console.log('TechnoKhan icons and Open Graph image generated.');
}

await generate();
