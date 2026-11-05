'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ROUTES, type Service } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/premium-components';
import { RevealOnScroll } from '@/components/ui/card-3d';
import { ServiceCard } from '@/components/molecules/service-card';
import { SnapRow } from '@/components/catalog/snap-row';

export interface FeaturedServicesProps {
  services: Service[];
}

/** Featured services: swipe row on phones, three-column grid at `lg`. */
export function FeaturedServices({ services }: FeaturedServicesProps) {
  const items = services.slice(0, 6);
  if (items.length === 0) return null;

  return (
    <section className="py-16 lg:py-24" aria-labelledby="featured-services-title">
      <div className="container-custom">
        <SectionHeading
          id="featured-services-title"
          eyebrow="خدمات ویژه"
          title="خدمات تخصصی اتولانژ"
          subtitle="از سرامیک بدنه تا احیای رنگ؛ هر خدمت با مواد اورجینال، تکنسین‌های دارای مدرک و گارانتی کتبی انجام می‌شود."
        />

        <SnapRow label="خدمات ویژه" desktopClassName="lg:grid-cols-3">
          {items.map((service) => (
            <ServiceCard key={service.id} service={service} className="h-full" />
          ))}
        </SnapRow>

        <RevealOnScroll className="mt-10 flex justify-center lg:mt-14" delay={0.1}>
          <Button asChild variant="outline" size="lg" className="min-h-12 gap-2 px-8">
            <Link href={ROUTES.SERVICES}>
              مشاهده همهٔ خدمات
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </Button>
        </RevealOnScroll>
      </div>
    </section>
  );
}
