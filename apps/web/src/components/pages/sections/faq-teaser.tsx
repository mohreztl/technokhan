import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, MessageCircleQuestion } from 'lucide-react';
import { FAQ, ROUTES } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/premium-components';
import { FaqAccordion } from '@/components/catalog/faq-accordion';

export interface FaqTeaserProps {
  /** Number of questions to show (default 4). */
  limit?: number;
}

export function FaqTeaser({ limit = 4 }: FaqTeaserProps) {
  const items = FAQ.slice(0, limit);
  if (items.length === 0) return null;

  return (
    <section className="py-16 lg:py-24" aria-labelledby="faq-teaser-title">
      <div className="container-custom max-w-3xl">
        <SectionHeading
          id="faq-teaser-title"
          eyebrow="سؤالات متداول"
          title="پاسخ پرسش‌های شما"
          subtitle="پیش از رزرو، پاسخ رایج‌ترین پرسش‌ها دربارهٔ نوبت‌دهی، پرداخت و گارانتی را بخوانید."
        />
        <FaqAccordion items={items} />
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" size="lg" className="min-h-12 gap-2">
            <Link href={ROUTES.FAQ}>
              <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
              همهٔ سؤالات متداول
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
