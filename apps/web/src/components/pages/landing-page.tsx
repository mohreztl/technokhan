import * as React from 'react';
import { SERVICES, findService, type GalleryItem, type Product, type Service } from '@autolounge/shared';
import { HeroSection } from './sections/hero-section';
import { FeaturedServices } from './sections/featured-services';
import { QuoteTeaser } from './sections/quote-teaser';
import { BeforeAfterShowcase } from './sections/before-after-showcase';
import { WhyChooseUs } from './sections/why-choose-us';
import { FeaturedProducts } from './sections/featured-products';
import { ProcessSection } from './sections/process-section';
import { WrapTeaser } from './sections/wrap-teaser';
import { Testimonials } from './sections/testimonials';
import { MagazineTeaser } from './sections/magazine-teaser';
import { FaqTeaser } from './sections/faq-teaser';
import { CTASection } from './sections/cta-section';

export interface LandingPageProps {
  products: Product[];
  services: Service[];
  gallery: GalleryItem[];
}

/**
 * Server composition of the home page. Sections that need browser state are
 * their own `'use client'` files under `./sections`.
 */
export function LandingPage({ products, services, gallery }: LandingPageProps) {
  const wrapService = findService('car-wrap');

  return (
    <>
      <HeroSection />
      <FeaturedServices services={services} />
      <QuoteTeaser services={SERVICES} />
      <BeforeAfterShowcase items={gallery} />
      <WhyChooseUs />
      <FeaturedProducts products={products} />
      <ProcessSection />
      <WrapTeaser basePrice={wrapService?.pricing?.medium ?? wrapService?.price} />
      <Testimonials />
      <MagazineTeaser />
      <FaqTeaser />
      <CTASection />
    </>
  );
}
