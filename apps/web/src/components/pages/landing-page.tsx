import type { Product, Service } from '@autolounge/shared';
import { HeroSection } from './sections/hero-section';
import { FeaturedServices } from './sections/featured-services';
import { QuoteTeaser } from './sections/quote-teaser';
import { FeaturedProducts } from './sections/featured-products';
import { CTASection } from './sections/cta-section';

export interface LandingPageProps {
  products: Product[];
  services: Service[];
}

/**
 * Server composition of the home page. Sections that need browser state are
 * their own `'use client'` files under `./sections`.
 */
export function LandingPage({ products, services }: LandingPageProps) {
  return (
    <>
      <HeroSection />
      <FeaturedServices services={services} />
      <QuoteTeaser />
      <FeaturedProducts products={products} />
      <CTASection />
    </>
  );
}
