import type { Metadata } from 'next';
import { FAQ, ROUTES, SERVICES } from '@autolounge/shared';
import type { FaqItem } from '@autolounge/shared';
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';
import { FaqPageClient } from './client';

export const metadata: Metadata = {
  title: 'سؤالات متداول | پاسخ به پرسش‌های شما',
  description:
    'پاسخ پرسش‌های پرتکرار دربارهٔ رزرو نوبت، قیمت و دوام خدمات، گارانتی، ارسال محصولات و شیوهٔ پرداخت در اتولانژ.',
  alternates: { canonical: ROUTES.FAQ },
  openGraph: {
    title: 'سؤالات متداول اتولانژ',
    description: 'هر چیزی که پیش از رزرو یا خرید لازم است بدانید.',
  },
};

/**
 * Service-specific questions live on each Service. Collecting them here means a
 * visitor searching "دوام سرامیک چقدر است" lands on one page that answers it,
 * instead of having to guess which service page to open.
 */
export interface FaqGroup {
  category: string;
  items: FaqItem[];
  /** Set when the group comes from a service, so the card can link to it. */
  serviceId?: string;
}

function faqGroups(): FaqGroup[] {
  const general = new Map<string, FaqItem[]>();
  for (const item of FAQ) {
    const category = item.category ?? 'عمومی';
    general.set(category, [...(general.get(category) ?? []), item]);
  }

  const fromServices = SERVICES.filter((s) => s.faq?.length && s.isActive !== false).map((s) => ({
    category: s.name,
    serviceId: s.id,
    items: s.faq!,
  }));

  return [...Array.from(general, ([category, items]) => ({ category, items })), ...fromServices];
}

export default function FaqPage() {
  const groups = faqGroups();
  const all = groups.flatMap((g) => g.items);

  return (
    <>
      <JsonLd
        data={[
          faqJsonLd(all),
          breadcrumbJsonLd([
            { name: 'خانه', href: ROUTES.HOME },
            { name: 'سؤالات متداول', href: ROUTES.FAQ },
          ]),
        ]}
      />
      <FaqPageClient groups={groups} />
    </>
  );
}
