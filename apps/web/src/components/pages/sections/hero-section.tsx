'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Calendar,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Award,
  Shield,
  Zap,
  Star,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroCarousel, HeroSlide } from '@/components/organisms/hero-carousel';
import { ROUTES } from '@autolounge/shared';
import {
  heroBadge,
  heroHeading,
  heroDescription,
  heroFeatures,
  heroCTA,
  heroStats,
  heroScrollIndicator,
  staggerContainer,
} from '@/lib/animation-variants';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { MorphingBlobs, AnimatedGradientText } from '@/components/ui/animated-gradient';
import { SplitText, AnimatedCounter } from '@/components/ui/text-effects';
import { MagneticButton, FloatingCard } from '@/components/ui/card-3d';
import { GoldBadge, PremiumButton } from '@/components/ui/premium-components';
import { RippleButton, ScrollProgress } from '@/components/ui/interactive-effects';

// Hero carousel slides data
const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: 'اتولانژ',
    subtitle: 'رتبه یک در خدمات زیبایی خودرو',
    description: 'با بیش از ۱۰ سال تجربه در دیتیلینگ، سرامیک کوتینگ و کارواش حرفه‌ای',
    image: '/hero1.webp',
    ctaPrimary: {
      text: 'رزرو آنلاین',
      href: ROUTES.BOOKING,
    },
    ctaSecondary: {
      text: 'فروشگاه محصولات',
      href: ROUTES.PRODUCTS,
    },
  },
  {
    id: 2,
    title: 'دیتیلینگ حرفه‌ای',
    subtitle: 'تخصص ما در جزئیات',
    description:
      'خودروی شما را با استفاده از تجهیزات مدرن و محصولات برتر جهانی به اوج زیبایی می‌رسانیم',
    image: '/hero1.webp',
    ctaPrimary: {
      text: 'مشاهده خدمات',
      href: ROUTES.SERVICES,
    },
  },
  {
    id: 3,
    title: 'سرامیک کوتینگ',
    subtitle: 'محافظت پیشرفته',
    description: 'حفاظت ۵ ساله از بدنه خودرو با فناوری نانو سرامیک',
    image: '/hero1.webp',
    ctaPrimary: {
      text: 'اطلاعات بیشتر',
      href: ROUTES.SERVICES,
    },
  },
];

export const HeroSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Animated Background with Morphing Blobs */}
      <div className="absolute inset-0">
        <MorphingBlobs className="opacity-30 dark:opacity-20" />
      </div>

      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 mesh-gradient-light dark:mesh-gradient-dark animate-gradient opacity-50" />

      {/* Hero Carousel */}
      <motion.div 
        className="absolute inset-0"
        style={{ y, opacity }}
      >
        <HeroCarousel slides={heroSlides} autoPlayInterval={6000} enableAutoPlay={true} />
      </motion.div>

      {/* Premium Gold Lines - Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-[20%] left-0 w-[30%] h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '400%' }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className="absolute top-[80%] right-0 w-[30%] h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent"
          initial={{ x: '100%' }}
          animate={{ x: '-400%' }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Animated Orbs - Enhanced */}
      <motion.div
        className="absolute top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 via-primary/20 to-secondary/10 dark:from-primary/20 dark:to-primary/30 rounded-full blur-3xl will-animate-opacity"
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, 180, 360],
              }
        }
        transition={
          prefersReducedMotion
            ? {}
            : {
                duration: 15,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-secondary/10 via-secondary/20 to-primary/10 dark:from-secondary/20 dark:to-secondary/30 rounded-full blur-3xl will-animate-opacity"
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: [1.3, 1, 1.3],
                opacity: [0.3, 0.2, 0.3],
                rotate: [360, 180, 0],
              }
        }
        transition={
          prefersReducedMotion
            ? {}
            : {
                duration: 18,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 py-20">
        <motion.div
          className="text-center max-w-5xl mx-auto"
          variants={prefersReducedMotion ? undefined : staggerContainer}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
        >
          {/* Badge - Premium */}
          <motion.div
            variants={prefersReducedMotion ? undefined : heroBadge}
            className="mb-8"
          >
            <GoldBadge size="md" className="gap-2">
              <Star className="h-4 w-4 fill-current" />
              <span>رتبه یک در خدمات زیبایی خودرو</span>
              <Sparkles className="h-4 w-4" />
            </GoldBadge>
          </motion.div>

          {/* Main Heading - Animated */}
          <motion.h1 variants={prefersReducedMotion ? undefined : heroHeading} className="mb-6">
            {prefersReducedMotion ? (
              <>
                <span className="block text-7xl md:text-8xl lg:text-9xl font-black mb-4 text-gradient-luxury leading-tight">
                  اتولانژ
                </span>
                <span className="block text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                  مرکز تخصصی مراقبت از خودرو
                </span>
              </>
            ) : (
              <>
                <AnimatedGradientText className="block text-7xl md:text-8xl lg:text-9xl font-black mb-4 leading-tight">
                  اتولانژ
                </AnimatedGradientText>
                <span className="block text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                  <SplitText text="مرکز تخصصی مراقبت از خودرو" animation="fadeUp" delay={0.3} stagger={0.02} />
                </span>
              </>
            )}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={prefersReducedMotion ? undefined : heroDescription}
            className="text-lg md:text-xl text-foreground-muted mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            با بیش از <span className="text-secondary font-bold">۱۰ سال تجربه</span> در دیتیلینگ،
            سرامیک کوتینگ و کارواش حرفه‌ای، به خودروی شما زیبایی و حفاظت{' '}
            <span className="text-secondary font-bold">استثنایی</span> می‌بخشیم
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            variants={prefersReducedMotion ? undefined : heroFeatures}
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
          >
            {[
              { icon: Shield, text: 'گارانتی کیفیت' },
              { icon: Zap, text: 'خدمات سریع' },
              { icon: Award, text: 'تجهیزات مدرن' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full"
              >
                <item.icon className="h-4 w-4 text-secondary" />
                <span className="text-foreground text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons - Enhanced */}
          <motion.div
            variants={prefersReducedMotion ? undefined : heroCTA}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href={ROUTES.BOOKING}>
              <PremiumButton variant="gold" size="lg" className="min-w-[200px]">
                <Calendar className="h-5 w-5 ml-2" />
                رزرو آنلاین
                <ChevronRight className="h-5 w-5 mr-2" />
              </PremiumButton>
            </Link>

            <Link href={ROUTES.PRODUCTS}>
              <PremiumButton variant="glass" size="lg" className="min-w-[200px]">
                <ShoppingBag className="h-5 w-5 ml-2" />
                فروشگاه محصولات
              </PremiumButton>
            </Link>

            {/* Video Play Button */}
            <MagneticButton 
              className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              magneticStrength={0.2}
            >
              <Play className="h-6 w-6 text-secondary fill-secondary" />
            </MagneticButton>
          </motion.div>

          {/* Stats - Animated Counters */}
          <motion.div
            variants={prefersReducedMotion ? undefined : heroStats}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { value: 10, label: 'سال تجربه', suffix: '+', gradient: 'from-primary to-primary-foreground' },
              { value: 5000, label: 'مشتری راضی', suffix: '+', gradient: 'from-secondary to-accent' },
              { value: 100, label: 'محصول', suffix: '+', gradient: 'from-success to-info' },
              { value: 24, label: 'ساعت پشتیبانی', suffix: '/۷', gradient: 'from-accent to-destructive' },
            ].map((stat, index) => (
              <FloatingCard key={stat.label} delay={index * 0.5}>
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -5 }}
                  transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.7 + index * 0.1 }}
                  className="glass-effect-strong p-6 rounded-2xl hover:shadow-xl transition-all duration-300 will-animate-scale border border-white/10"
                >
                  <div
                    className={`text-5xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-2`}
                  >
                    {prefersReducedMotion ? (
                      `${stat.value}${stat.suffix}`
                    ) : (
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2.5} />
                    )}
                  </div>
                  <div className="text-foreground-muted text-sm font-medium">{stat.label}</div>
                </motion.div>
              </FloatingCard>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        variants={prefersReducedMotion ? undefined : heroScrollIndicator}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate="visible"
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, 10, 0] }}
          transition={prefersReducedMotion ? {} : { duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-foreground-muted text-xs font-medium">اسکرول کنید</span>
          <div className="w-6 h-10 border-2 border-border rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-secondary rounded-full"
              animate={prefersReducedMotion ? {} : { y: [0, 16, 0] }}
              transition={prefersReducedMotion ? {} : { duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
