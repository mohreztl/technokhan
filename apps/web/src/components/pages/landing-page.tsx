import type { GalleryItem, Product, Service } from '@technokhan/shared';
import { HeroSection } from './sections/hero-section';
import { FeaturedServices } from './sections/featured-services';
import { QuoteTeaser } from './sections/quote-teaser';
import { BeforeAfterShowcase } from './sections/before-after-showcase';
import { FeaturedProducts } from './sections/featured-products';
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
  return (
    <>
      <HeroSection />
      <FeaturedServices services={services} />
      <QuoteTeaser />
      <BeforeAfterShowcase items={gallery} />
      <FeaturedProducts products={products} />
      <CTASection />
    </>
  );
}
