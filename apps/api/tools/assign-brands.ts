/**
 * One-shot brand backfill: detects brands from product names with the shared
 * dictionary and writes `Product.brand` (latin id). Safe to re-run — only
 * rows whose detected brand differs are updated.
 *
 *   pnpm --filter api exec tsx tools/assign-brands.ts [--dry]
 */
import { detectBrandId } from '@technokhan/shared';
import { prisma } from '../src/lib/prisma';

const dry = process.argv.includes('--dry');

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, nameEn: true, brand: true },
  });

  let updated = 0;
  let kept = 0;
  let unmatched = 0;
  const histogram = new Map<string, number>();

  for (const product of products) {
    const detected = detectBrandId(product.name, product.nameEn);
    if (!detected) {
      unmatched += 1;
      continue;
    }
    histogram.set(detected, (histogram.get(detected) ?? 0) + 1);
    if (product.brand?.toLowerCase() === detected) {
      kept += 1;
      continue;
    }
    updated += 1;
    if (!dry) {
      await prisma.product.update({ where: { id: product.id }, data: { brand: detected } });
    }
  }

  console.log(`${dry ? '[dry] ' : ''}products: ${products.length}, updated: ${updated}, already-correct: ${kept}, unmatched: ${unmatched}`);
  console.log('detected brands:', Object.fromEntries([...histogram.entries()].sort((a, b) => b[1] - a[1])));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
