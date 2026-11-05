'use client';

import React from 'react';
import { Award, Calendar, Shield, ShoppingBag, Sparkles, Zap } from 'lucide-react';
import { ROUTES } from '@technokhan/shared';
import { HeroCarousel, type HeroSlide } from '@/components/organisms/hero-carousel';
import { HeroStats } from '@/components/pages/sections/hero-stats';

const heroSlides: HeroSlide[] = [
  {
    id: 'brand',
    title: 'اتولانژ',
    subtitle: 'مرکز تخصصی مراقبت و زیبایی خودرو',
    description:
      'با بیش از ۱۰ سال تجربه در دیتیلینگ، سرامیک کوتینگ و کارواش حرفه‌ای، به خودروی شما زیبایی و حفاظتی استثنایی می‌بخشیم',
    image: '/hero1.webp',
    imageAlt: 'خودروی لوکس پس از دیتیلینگ در اتولانژ',
    badge: 'رتبه یک در خدمات زیبایی خودرو',
    features: [
      { icon: Shield, text: 'گارانتی کیفیت' },
      { icon: Zap, text: 'خدمات سریع' },
      { icon: Award, text: 'تجهیزات مدرن' },
    ],
    ctaPrimary: { text: 'رزرو آنلاین', href: ROUTES.BOOKING, icon: Calendar },
    ctaSecondary: { text: 'فروشگاه محصولات', href: ROUTES.PRODUCTS, icon: ShoppingBag },
  },
  {
    id: 'detailing',
    title: 'دیتیلینگ حرفه‌ای',
    subtitle: 'تخصص ما در جزئیات',
    description:
      'خودروی شما را با تجهیزات مدرن و محصولات برتر جهانی، داخل و خارج، به اوج زیبایی می‌رسانیم',
    image: '/hero2.webp',
    imageAlt: 'دیتیلینگ داخل و خارج خودرو',
    ctaPrimary: { text: 'رزرو آنلاین', href: ROUTES.BOOKING, icon: Calendar },
    ctaSecondary: { text: 'مشاهده خدمات', href: ROUTES.SERVICES, icon: Sparkles },
  },
  {
    id: 'ceramic',
    title: 'سرامیک کوتینگ',
    subtitle: 'محافظت پیشرفته نانو',
    description: 'حفاظت ۵ ساله از بدنه خودرو با فناوری نانو سرامیک؛ درخشش آینه‌ای و ضد آب',
    image: '/hero3.webp',
    imageAlt: 'اجرای سرامیک کوتینگ روی بدنه خودرو',
    ctaPrimary: { text: 'رزرو آنلاین', href: ROUTES.BOOKING, icon: Calendar },
    ctaSecondary: { text: 'مشاهده خدمات', href: ROUTES.SERVICES, icon: Sparkles },
  },
];

/** Landing hero: the cinematic carousel (owns the page `h1`) plus the stats strip below it. */
export const HeroSection: React.FC = () => {
  return (
    <>
      <HeroCarousel slides={heroSlides} autoPlayInterval={7000} enableAutoPlay />
      <HeroStats />
    </>
  );
};
