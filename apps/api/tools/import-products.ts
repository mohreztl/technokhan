// Import WooCommerce products into the new catalog.
//
//   pnpm --filter api migrate:products
//   pnpm --filter api migrate:products -- --dry-run
//
// Input: data/exports/products.json (WooCommerce REST shape, from migrate:export-wp).
// The WooCommerce `slug` is preserved untouched on Product.slug — old
// /product/<slug> URLs keep resolving, which is the whole SEO strategy.
import { prisma } from '../src/lib/prisma';
import { readExport } from './migration-utils';

interface WcProduct {
  id: number;
  slug: string;
  name: string;
  status: string;
  sku?: string;
  regular_price?: string;
  sale_price?: string;
  price?: string;
  stock_quantity?: number | null;
  stock_status?: string;
  categories?: Array<{ name: string; slug: string }>;
  images?: Array<{ src: string }>;
  short_description?: string;
  description?: string;
  attributes?: Array<{ name: string; options: string[] }>;
  tags?: Array<{ name: string }>;
}

const dryRun = process.argv.includes('--dry-run');

function stripHtml(html: string | undefined): string {
  return (html ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function toNumber(value: string | undefined): number {
  const n = Number((value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

async function run() {
  const products = readExport<WcProduct>('products.json');
  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const wc of products) {
    const slug = wc.slug || `product-${wc.id}`;
    const sku = wc.sku || null;
    const brand = wc.attributes?.find((a) => /^(برند|brand)$/i.test(a.name))?.options[0] ?? null;
    const data = {
      slug,
      name: wc.name,
      nameEn: slug,
      description: wc.description || 'توضیحات محصول به‌زودی تکمیل می‌شود.',
      descriptionEn: wc.description ? stripHtml(wc.description).slice(0, 500) : slug,
      shortDescription: stripHtml(wc.short_description).slice(0, 200) || null,
      price: toNumber(wc.regular_price) || toNumber(wc.price),
      discountPrice: toNumber(wc.sale_price) || null,
      stock: wc.stock_quantity ?? (wc.stock_status === 'instock' ? 1 : 0),
      category: wc.categories?.[0]?.name ?? 'عمومی',
      brand,
      sku,
      images: (wc.images ?? []).map((image) => image.src).filter(Boolean),
      tags: (wc.tags ?? []).map((t) => t.name).filter(Boolean),
      isActive: wc.status === 'publish',
    };

    try {
      const found = await prisma.product.findFirst({
        where: { OR: [{ slug }, ...(sku ? [{ sku }] : [])] },
        select: { id: true },
      });
      if (found) {
        updated++;
        if (!dryRun) await prisma.product.update({ where: { id: found.id }, data });
      } else {
        created++;
        if (!dryRun) await prisma.product.create({ data });
      }
    } catch (error) {
      failed++;
      console.error(`product ${slug}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(JSON.stringify({ total: products.length, created, updated, failed, dryRun }, null, 2));
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
