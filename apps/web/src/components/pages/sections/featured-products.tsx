'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { ROUTES, type Product } from '@technokhan/shared';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/premium-components';
import { RevealOnScroll } from '@/components/ui/card-3d';
import { ProductCard } from '@/components/molecules/product-card';
import { SnapRow } from '@/components/catalog/snap-row';

export interface FeaturedProductsProps {
  products: Product[];
}

/** Featured products: swipe row on phones, four-column grid at `lg`. */
export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const items = products.slice(0, 8);
  if (items.length === 0) return null;

  return (
    <section
      className="bg-linear-to-b from-background via-muted/30 to-background py-16 lg:py-24"
      aria-labelledby="featured-products-title"
    >
      <div className="container-custom">
        <SectionHeading
          id="featured-products-title"
          eyebrow="فروشگاه"
          title="محصولات پرفروش"
          subtitle="همان محصولاتی که در سالن اتولانژ استفاده می‌کنیم؛ اورجینال، با ضمانت اصالت و ارسال سریع."
        />

        <SnapRow
          label="محصولات پرفروش"
          desktopClassName="lg:grid-cols-4"
          slideClassName="flex-[0_0_72%] sm:flex-[0_0_46%] md:flex-[0_0_34%]"
        >
          {items.map((product) => (
            <ProductCard key={product.id} product={product} className="h-full" />
          ))}
        </SnapRow>

        <RevealOnScroll className="mt-10 flex justify-center lg:mt-14" delay={0.1}>
          <Button asChild variant="primary" size="lg" className="min-h-12 gap-2 px-8 shadow-glow-primary">
            <Link href={ROUTES.PRODUCTS}>
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              مشاهده فروشگاه
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </Button>
        </RevealOnScroll>
      </div>
    </section>
  );
}
