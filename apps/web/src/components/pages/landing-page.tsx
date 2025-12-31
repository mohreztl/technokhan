'use client';

import React from 'react';
import { HeroSection } from './sections/hero-section';
import { FeaturedServices } from './sections/featured-services';
import { FeaturedProducts } from './sections/featured-products';
import { WhyChooseUs } from './sections/why-choose-us';
import { Testimonials } from './sections/testimonials';
import { CTASection } from './sections/cta-section';

export const LandingPage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <FeaturedServices />
      <WhyChooseUs />
      <FeaturedProducts />
      <Testimonials />
      <CTASection />
    </>
  );
};
