 
/**
 * Generates every static asset the app references but that is not a real
 * photograph yet: branded placeholder images for the catalog (products,
 * services, gallery, team, avatars, certifications), PWA icons, favicons,
 * the Open Graph image, PWA screenshots, the logo and the background pattern.
 *
 * The list of required catalog images is derived from `@autolounge/shared`
 * so it can never drift from the data. Existing files are kept unless
 * `--force` is passed. Run: `pnpm --filter web assets [--force]`.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  APP_NAME_EN,
  CERTIFICATIONS,
  GALLERY,
  PRODUCTS,
  SERVICES,
  TEAM,
  TESTIMONIALS,
} from '@autolounge/shared';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');
const APP_DIR = path.join(ROOT, 'src', 'app');
const FORCE = process.argv.includes('--force');

const NAVY = '#001F3F';
const NAVY_LIGHT = '#0B3560';
const INK = '#0A0A0A';
const GOLD = '#C2B280';
const GOLD_LIGHT = '#E4D9B8';
const IVORY = '#F9F7F2';
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

type Kind = 'product' | 'service' | 'before' | 'after' | 'team' | 'avatar' | 'cert' | 'placeholder';

interface Spec {
  /** public path, e.g. /images/products/carnauba-wax-1.webp */
  url: string;
  kind: Kind;
  title: string;
  subtitle?: string;
  variant?: number;
}

const SIZES: Record<Kind, [number, number]> = {
  product: [1200, 1200],
  service: [1600, 900],
  before: [1600, 1200],
  after: [1600, 1200],
  team: [800, 1000],
  avatar: [256, 256],
  cert: [600, 600],
  placeholder: [1200, 900],
};

// ---------------------------------------------------------------------------
// SVG building blocks
// ---------------------------------------------------------------------------

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Gold "A" mark with a swoosh — the brand glyph used everywhere. */
function mark(x: number, y: number, size: number, color = GOLD, opacity = 1): string {
  const s = size / 100;
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${opacity}">
    <path d="M50 8 L90 86 H74 L50 40 L26 86 H10 Z" fill="${color}"/>
    <path d="M14 76 C 38 60, 62 60, 86 76" stroke="${color}" stroke-width="7" fill="none" stroke-linecap="round"/>
  </g>`;
}

function defs(id: string, kind: Kind, variant = 0): string {
  const hue = kind === 'before' ? ['#3A3F47', '#1A1D22'] : kind === 'after' ? [NAVY_LIGHT, INK] : [NAVY, INK];
  const angle = [0, 25, 45, 65][variant % 4];
  return `<defs>
    <linearGradient id="${id}-bg" gradientTransform="rotate(${angle})">
      <stop offset="0" stop-color="${hue[0]}"/><stop offset="1" stop-color="${hue[1]}"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx="0.85" cy="0.1" r="0.8">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="${kind === 'before' ? 0.12 : 0.42}"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-shine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0.35" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="${kind === 'after' ? 0.16 : 0.06}"/>
      <stop offset="0.65" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <pattern id="${id}-grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="${GOLD}" stroke-opacity="0.08" stroke-width="1"/>
    </pattern>
  </defs>`;
}

function label(text: string, x: number, y: number, size: number, opts: { color?: string; weight?: number; spacing?: number; anchor?: string } = {}) {
  const { color = IVORY, weight = 600, spacing = 0, anchor = 'start' } = opts;
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${color}" letter-spacing="${spacing}" text-anchor="${anchor}">${esc(text)}</text>`;
}

function silhouette(cx: number, cy: number, r: number, color: string): string {
  return `<g fill="${color}">
    <circle cx="${cx}" cy="${cy - r * 0.35}" r="${r * 0.42}"/>
    <path d="M${cx - r} ${cy + r} C ${cx - r} ${cy + r * 0.1}, ${cx + r} ${cy + r * 0.1}, ${cx + r} ${cy + r} Z"/>
  </g>`;
}

function card(spec: Spec): string {
  const [w, h] = SIZES[spec.kind];
  const id = 'g';
  const pad = Math.round(Math.min(w, h) * 0.06);
  const tag =
    spec.kind === 'before' ? 'BEFORE' : spec.kind === 'after' ? 'AFTER' : spec.kind === 'product' ? 'PRODUCT' : spec.kind === 'service' ? 'SERVICE' : '';

  let body = '';
  if (spec.kind === 'team' || spec.kind === 'avatar') {
    body = silhouette(w / 2, h * 0.52, Math.min(w, h) * 0.3, spec.kind === 'avatar' ? GOLD : GOLD_LIGHT);
  } else if (spec.kind === 'cert') {
    body = `<circle cx="${w / 2}" cy="${h / 2}" r="${w * 0.36}" fill="none" stroke="${GOLD}" stroke-width="${w * 0.02}" stroke-opacity="0.9"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${w * 0.3}" fill="none" stroke="${GOLD}" stroke-width="2" stroke-opacity="0.5" stroke-dasharray="6 10"/>
      ${mark(w / 2 - w * 0.13, h / 2 - w * 0.15, w * 0.26)}`;
  } else {
    const ms = Math.min(w, h) * (spec.kind === 'product' ? 0.34 : 0.3);
    body = mark(w / 2 - ms / 2, h / 2 - ms / 2 - h * 0.04, ms, GOLD, spec.kind === 'before' ? 0.45 : 0.95);
  }

  const showText = spec.kind !== 'avatar';
  const titleSize = Math.round(Math.min(w, h) * (spec.kind === 'cert' ? 0.07 : 0.055));
  const text = showText
    ? `${tag ? label(tag, pad, pad + titleSize * 0.7, Math.round(titleSize * 0.55), { color: GOLD, spacing: 6, weight: 700 }) : ''}
       ${label(spec.title, pad, h - pad - (spec.subtitle ? titleSize * 1.1 : 0), titleSize, { color: IVORY, weight: 700 })}
       ${spec.subtitle ? label(spec.subtitle, pad, h - pad, Math.round(titleSize * 0.6), { color: GOLD_LIGHT, weight: 500, spacing: 2 }) : ''}`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${defs(id, spec.kind, spec.variant)}
    <rect width="${w}" height="${h}" fill="url(#${id}-bg)"/>
    <rect width="${w}" height="${h}" fill="url(#${id}-grid)"/>
    <rect width="${w}" height="${h}" fill="url(#${id}-glow)"/>
    <rect width="${w}" height="${h}" fill="url(#${id}-shine)"/>
    ${body}
    ${text}
    <rect x="${pad / 2}" y="${pad / 2}" width="${w - pad}" height="${h - pad}" fill="none" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="2" rx="${pad / 2}"/>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Brand assets: icons, OG image, screenshots, logo, pattern
// ---------------------------------------------------------------------------

function appIcon(size: number, maskable = false): string {
  const r = maskable ? 0 : Math.round(size * 0.22);
  const ms = maskable ? size * 0.5 : size * 0.62;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${NAVY_LIGHT}"/><stop offset="1" stop-color="${INK}"/></linearGradient></defs>
    <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
    ${mark((size - ms) / 2, (size - ms) / 2 + size * 0.02, ms)}
  </svg>`;
}

const SHORTCUT_GLYPHS: Record<string, string> = {
  booking: '<rect x="22" y="28" width="56" height="50" rx="8" fill="none" stroke="G" stroke-width="7"/><path d="M22 44H78M36 20v14M64 20v14" stroke="G" stroke-width="7" stroke-linecap="round"/>',
  products: '<path d="M30 38h40l4 40H26Z" fill="none" stroke="G" stroke-width="7" stroke-linejoin="round"/><path d="M40 38v-6a10 10 0 0 1 20 0v6" fill="none" stroke="G" stroke-width="7"/>',
  services: '<path d="M50 18l7 20 20 7-20 7-7 20-7-20-20-7 20-7Z" fill="G"/><circle cx="76" cy="26" r="5" fill="G"/><circle cx="26" cy="74" r="4" fill="G"/>',
  cart: '<path d="M20 28h10l8 34h32l6-24H36" fill="none" stroke="G" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="42" cy="74" r="5" fill="G"/><circle cx="66" cy="74" r="5" fill="G"/>',
};

function shortcutIcon(name: string, size = 96): string {
  const glyph = (SHORTCUT_GLYPHS[name] ?? SHORTCUT_GLYPHS.services).replace(/"G"/g, `"${GOLD}"`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="24" fill="${NAVY}"/>${glyph}
  </svg>`;
}

function ogImage(): string {
  const w = 1200;
  const h = 630;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${defs('og', 'after', 1)}
    <rect width="${w}" height="${h}" fill="url(#og-bg)"/>
    <rect width="${w}" height="${h}" fill="url(#og-grid)"/>
    <rect width="${w}" height="${h}" fill="url(#og-glow)"/>
    ${mark(90, 165, 300)}
    ${label(APP_NAME_EN.toUpperCase(), 450, 300, 88, { color: IVORY, weight: 800, spacing: 8 })}
    ${label('PREMIUM CAR CARE · DETAILING · CERAMIC · PPF', 452, 358, 24, { color: GOLD, weight: 600, spacing: 2 })}
    <rect x="452" y="392" width="420" height="4" fill="${GOLD}"/>
    ${label('autolounge.ir', 452, 460, 32, { color: GOLD_LIGHT, weight: 500, spacing: 2 })}
  </svg>`;
}

function screenshot(w: number, h: number, mobile: boolean): string {
  const cardW = mobile ? (w - 48) / 2 : (w - 120) / 4;
  const cards = Array.from({ length: mobile ? 4 : 8 }, (_, i) => {
    const col = i % (mobile ? 2 : 4);
    const row = Math.floor(i / (mobile ? 2 : 4));
    const x = (mobile ? 16 : 40) + col * (cardW + 16);
    const y = (mobile ? h * 0.5 : h * 0.55) + row * (cardW * 0.9 + 16);
    return `<rect x="${x}" y="${y}" width="${cardW}" height="${cardW * 0.8}" rx="18" fill="${NAVY_LIGHT}" stroke="${GOLD}" stroke-opacity="0.3"/>
      ${mark(x + cardW / 2 - cardW * 0.15, y + cardW * 0.2, cardW * 0.3, GOLD, 0.8)}`;
  }).join('');
  const heroH = mobile ? h * 0.42 : h * 0.48;
  const titleSize = mobile ? 34 : 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${defs('ss', 'after', 2)}
    <rect width="${w}" height="${h}" fill="${INK}"/>
    <rect width="${w}" height="${heroH}" fill="url(#ss-bg)"/>
    <rect width="${w}" height="${heroH}" fill="url(#ss-glow)"/>
    ${mark(w / 2 - (mobile ? 50 : 70), heroH * 0.18, mobile ? 100 : 140)}
    ${label(APP_NAME_EN.toUpperCase(), w / 2, heroH * 0.66, titleSize, { color: IVORY, weight: 800, spacing: 6, anchor: 'middle' })}
    ${label('PREMIUM CAR CARE', w / 2, heroH * 0.66 + titleSize * 0.9, titleSize * 0.42, { color: GOLD, weight: 600, spacing: 4, anchor: 'middle' })}
    <rect x="${w / 2 - (mobile ? 90 : 120)}" y="${heroH * 0.8}" width="${mobile ? 180 : 240}" height="${mobile ? 44 : 56}" rx="${mobile ? 22 : 28}" fill="${GOLD}"/>
    ${cards}
    ${mobile ? `<rect x="0" y="${h - 84}" width="${w}" height="84" fill="${NAVY}" fill-opacity="0.96"/>
      ${[0.1, 0.3, 0.5, 0.7, 0.9].map((f, i) => (i === 2 ? `<circle cx="${w * f}" cy="${h - 62}" r="28" fill="${GOLD}"/>` : `<circle cx="${w * f}" cy="${h - 46}" r="10" fill="${GOLD_LIGHT}" fill-opacity="${i === 0 ? 1 : 0.5}"/>`)).join('')}` : ''}
  </svg>`;
}

function logoSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="100" viewBox="0 0 320 100">
  ${mark(0, 0, 100)}
  <text x="112" y="58" font-family="${FONT}" font-size="34" font-weight="800" fill="${NAVY}" letter-spacing="4">AUTO</text>
  <text x="200" y="58" font-family="${FONT}" font-size="34" font-weight="300" fill="${GOLD}" letter-spacing="4">LOUNGE</text>
  <rect x="112" y="68" width="196" height="3" fill="${GOLD}"/>
  <text x="112" y="90" font-family="${FONT}" font-size="12" font-weight="600" fill="${NAVY}" letter-spacing="6">PREMIUM CAR CARE</text>
</svg>`;
}

function patternSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <path d="M32 4 L60 32 L32 60 L4 32 Z" fill="none" stroke="${GOLD}" stroke-opacity="0.18" stroke-width="1"/>
  <circle cx="32" cy="32" r="2" fill="${GOLD}" fill-opacity="0.25"/>
</svg>`;
}

// ---------------------------------------------------------------------------
// required image list (derived from the catalog)
// ---------------------------------------------------------------------------

function collectSpecs(): Spec[] {
  const specs = new Map<string, Spec>();
  const add = (s: Spec) => {
    if (s.url && !specs.has(s.url)) specs.set(s.url, s);
  };

  PRODUCTS.forEach((p, i) =>
    p.images.forEach((url, j) => add({ url, kind: 'product', title: p.nameEn, subtitle: p.brand ? `${p.brand} · ${j + 1}` : `${j + 1}`, variant: i + j }))
  );
  SERVICES.forEach((s, i) => {
    s.images.forEach((url, j) => add({ url, kind: 'service', title: s.nameEn, subtitle: `AutoLounge · ${j + 1}`, variant: i + j }));
    (s.gallery ?? []).forEach((url, j) => add({ url, kind: 'after', title: s.nameEn, subtitle: `Gallery ${j + 1}`, variant: i + j + 1 }));
    if (s.beforeAfter) {
      add({ url: s.beforeAfter.before, kind: 'before', title: s.nameEn, subtitle: 'Before', variant: i });
      add({ url: s.beforeAfter.after, kind: 'after', title: s.nameEn, subtitle: 'After', variant: i });
    }
  });
  GALLERY.forEach((g, i) => {
    add({ url: g.before, kind: 'before', title: g.vehicle ?? g.title, subtitle: 'Before', variant: i });
    add({ url: g.after, kind: 'after', title: g.vehicle ?? g.title, subtitle: 'After', variant: i });
    if (g.cover) add({ url: g.cover, kind: 'after', title: g.vehicle ?? g.title, subtitle: 'AutoLounge', variant: i });
  });
  TEAM.forEach((t, i) => add({ url: t.image, kind: 'team', title: t.id.replace(/-/g, ' ').toUpperCase(), subtitle: 'AutoLounge Team', variant: i }));
  TESTIMONIALS.forEach((t, i) => add({ url: t.avatar ?? '', kind: 'avatar', title: '', variant: i }));
  CERTIFICATIONS.forEach((c, i) => add({ url: c.image, kind: 'cert', title: c.nameEn ?? c.name, subtitle: c.year ? String(c.year) : undefined, variant: i }));

  add({ url: '/images/placeholder-product.webp', kind: 'placeholder', title: 'AutoLounge', subtitle: 'Product' });
  add({ url: '/images/placeholder-service.webp', kind: 'placeholder', title: 'AutoLounge', subtitle: 'Service' });
  add({ url: '/images/placeholder.webp', kind: 'placeholder', title: 'AutoLounge' });
  add({ url: '/images/about-story.webp', kind: 'after', title: 'Our Story', subtitle: 'AutoLounge · Tehran', variant: 3 });
  add({ url: '/images/workshop.webp', kind: 'service', title: 'Workshop', subtitle: 'AutoLounge · Tehran', variant: 2 });
  return [...specs.values()];
}

// ---------------------------------------------------------------------------
// writers
// ---------------------------------------------------------------------------

async function exists(file: string) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

let written = 0;
let skipped = 0;

async function writeRaster(file: string, svg: string, opts: { quality?: number } = {}) {
  if (!FORCE && (await exists(file))) {
    skipped++;
    return;
  }
  await fs.mkdir(path.dirname(file), { recursive: true });
  const img = sharp(Buffer.from(svg));
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png') await img.png({ compressionLevel: 9 }).toFile(file);
  else if (ext === '.jpg' || ext === '.jpeg') await img.jpeg({ quality: opts.quality ?? 82 }).toFile(file);
  else await img.webp({ quality: opts.quality ?? 78 }).toFile(file);
  written++;
}

async function writeText(file: string, content: string) {
  if (!FORCE && (await exists(file))) {
    skipped++;
    return;
  }
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content, 'utf8');
  written++;
}

async function main() {
  if (!(await exists(PUBLIC))) throw new Error(`Run from apps/web (no public dir at ${PUBLIC})`);

  // 1. catalog placeholders
  const specs = collectSpecs();
  for (const spec of specs) {
    await writeRaster(path.join(PUBLIC, spec.url), card(spec));
  }

  // 2. PWA icons + favicons
  for (const size of [72, 96, 128, 144, 152, 192, 384, 512]) {
    await writeRaster(path.join(PUBLIC, 'icons', `icon-${size}.png`), appIcon(size));
  }
  for (const size of [192, 512]) {
    await writeRaster(path.join(PUBLIC, 'icons', `icon-maskable-${size}.png`), appIcon(size, true));
  }
  for (const name of Object.keys(SHORTCUT_GLYPHS)) {
    await writeRaster(path.join(PUBLIC, 'icons', `shortcut-${name}.png`), shortcutIcon(name));
  }
  await writeRaster(path.join(APP_DIR, 'icon.png'), appIcon(512));
  await writeRaster(path.join(APP_DIR, 'apple-icon.png'), appIcon(180));
  await writeRaster(path.join(APP_DIR, 'opengraph-image.png'), ogImage());
  await writeRaster(path.join(PUBLIC, 'og-image.png'), ogImage());

  // 3. screenshots (manifest)
  await writeRaster(path.join(PUBLIC, 'screenshots', 'mobile-1.png'), screenshot(390, 844, true));
  await writeRaster(path.join(PUBLIC, 'screenshots', 'desktop-1.png'), screenshot(1280, 720, false));

  // 4. vector brand assets
  await writeText(path.join(PUBLIC, 'images', 'logo.svg'), logoSvg());
  await writeText(path.join(PUBLIC, 'images', 'pattern.svg'), patternSvg());

  console.log(`assets: ${written} written, ${skipped} kept (${specs.length} catalog images required)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
