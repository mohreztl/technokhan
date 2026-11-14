// Accounting sync job: Sepidar → shop catalog.
//
// Sepidar is the source of truth for product price/stock. Run manually:
//   pnpm --filter api sync:accounting            # apply changes
//   pnpm --filter api sync:accounting -- --dry-run
// Or on a cron every N minutes (see docs/wordpress-migration.md §فاز ۴).
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { SepidarClient } from '../services/accounting/sepidar';

const dryRun = process.argv.includes('--dry-run');

function slugify(code: string): string | null {
  const slug = code
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length >= 2 ? slug : null;
}

async function run() {
  const client = new SepidarClient();
  const [items, stocks] = await Promise.all([client.fetchItems(), client.fetchStocks()]);

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let skipped = 0;

  for (const item of items) {
    const stock = item.stock ?? stocks.get(item.code);
    const existing = await prisma.product.findFirst({ where: { sku: item.code } });

    if (!existing) {
      created++;
      if (dryRun) continue;
      // Draft: a human reviews name/description/images before it goes live.
      await prisma.product.create({
        data: {
          name: item.name,
          nameEn: item.name.slice(0, 200),
          description: 'این محصول به‌صورت خودکار از نرم‌افزار حسابداری (سپیدار) ایجاد شده و در انتظار تکمیل توضیحات است.',
          descriptionEn: item.name.slice(0, 200),
          price: item.sellPrice,
          stock: stock ?? 0,
          category: item.group ?? 'عمومی',
          brand: null,
          sku: item.code,
          slug: slugify(item.code),
          isActive: false,
          tags: item.barcode ? [item.barcode] : [],
        },
      });
      continue;
    }

    const nextPrice = item.sellPrice;
    const nextStock = stock ?? existing.stock;
    if (nextPrice === existing.price && nextStock === existing.stock && existing.name === item.name) {
      unchanged++;
      continue;
    }

    updated++;
    if (dryRun) continue;
    await prisma.product.update({
      where: { id: existing.id },
      data: { price: nextPrice, stock: nextStock, name: item.name },
    });
  }

  const summary = { total: items.length, created, updated, unchanged, skipped, dryRun };
  logger.info(summary, 'accounting sync complete');
  console.log(JSON.stringify(summary, null, 2));
}

run()
  .catch((error) => {
    logger.error({ err: error }, 'accounting sync failed');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
