import { PRODUCTS } from '@technokhan/shared';
import { apiFetch, buildQuery, isDemoMode } from '@/lib/api/client';
import { queryLocalProducts } from '@/lib/data/local-query';
import type { PagedList, Product } from '@technokhan/shared';

/**
 * Torob (ترب) product feed — the URL registered in the Torob seller panel.
 * Prices/stock come from the same API the storefront uses, so the accounting
 * sync (Sepidar) keeps the feed honest automatically.
 *
 * @see docs/wordpress-migration.md §فاز ۶ — verify price unit (Toman) and the
 * feed root element against the current Torob Feed Spec in the seller panel.
 */

export const revalidate = 600;
export const dynamic = 'force-static';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function getAllProducts(): Promise<Product[]> {
  if (!isDemoMode()) {
    try {
      const r = await apiFetch<Product[]>(`/products${buildQuery({ limit: 100 } as Record<string, unknown>)}`, {
        auth: false,
        timeoutMs: 4000,
        next: { revalidate: 600, tags: ['products'] },
      });
      if (r.ok && Array.isArray(r.data) && r.data.length) return r.data;
    } catch {
      // fall through to the bundled catalog so the feed always renders
    }
  }
  const local = queryLocalProducts({}) as PagedList<Product>;
  return local.items;
}

function productUrl(product: Product): string {
  return `${siteUrl}/product/${encodeURIComponent(product.slug ?? product.id)}`;
}

function toTorobXml(products: Product[]): string {
  const items = products
    .filter((p) => p.isActive !== false)
    .map((p) => {
      const price = Math.round(p.discountPrice ?? p.price);
      const oldPrice = p.discountPrice ? Math.round(p.price) : null;
      const image = p.images[0] ?? '';
      const absoluteImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
      return [
        '  <product>',
        `    <product_id>${escapeXml(p.sku ?? p.id)}</product_id>`,
        `    <title>${escapeXml(p.name)}</title>`,
        `    <category>${escapeXml(p.category)}</category>`,
        `    <price>${price}</price>`,
        ...(oldPrice ? [`    <old_price>${oldPrice}</old_price>`] : []),
        `    <availability>${p.stock > 0 ? 'instock' : 'outofstock'}</availability>`,
        `    <image_link>${escapeXml(absoluteImage)}</image_link>`,
        `    <url>${escapeXml(productUrl(p))}</url>`,
        '  </product>',
      ].join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<products>
${items}
</products>`;
}

export async function GET() {
  const products = await getAllProducts();
  return new Response(toTorobXml(products), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
    },
  });
}
