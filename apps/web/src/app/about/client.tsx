'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarCheck, Eye, Gem, HeartHandshake, MessageSquareQuote, Sparkles } from 'lucide-react';
import { CERTIFICATIONS, GALLERY, ROUTES, TEAM } from '@autolounge/shared';
import { fadeInUp, staggerContainer, viewportConfig } from '@/lib/animation-variants';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/premium-components';
import { AnimatedCounter } from '@/components/ui/text-effects';
import { ParallaxSection, RevealOnScroll } from '@/components/ui/card-3d';
import { AmbientOrbs } from '@/components/ui/ambient';
import { ProcessTimeline } from '@/components/creative/process-timeline';
import { PROCESS_STEPS } from '@/components/pages/sections/process-section';
import { TeamSection } from '@/components/pages/team-section';
import { CertificationsStrip } from '@/components/pages/certifications-strip';

const EXPERIENCE_YEARS = Math.max(...TEAM.map((member) => member.experienceYears ?? 0));

const STATS = [
  { value: EXPERIENCE_YEARS, suffix: '+', label: 'سال تجربه' },
  { value: TEAM.length, label: 'متخصص دارای مدرک' },
  { value: CERTIFICATIONS.length, label: 'گواهی‌نامهٔ بین‌المللی' },
  { value: GALLERY.length, label: 'پروژهٔ ثبت‌شده' },
];

const VALUES = [
  {
    icon: Gem,
    title: 'کیفیت بدون مصالحه',
    description: 'فقط مواد اورجینال برندهای معتبر و ابزار حرفه‌ای؛ هر پروژه پیش از تحویل چندمرحله‌ای بازرسی می‌شود.',
  },
  {
    icon: Eye,
    title: 'شفافیت کامل',
    description: 'قیمت هر خدمت پیش از رزرو مشخص است و در هر مرحله می‌دانید خودروی شما در چه وضعیتی است.',
  },
  {
    icon: Sparkles,
    title: 'تخصص به‌روز',
    description: 'تکنسین‌های ما دوره‌های رسمی برندهای جهانی را گذرانده‌اند و دانش خود را مدام به‌روز می‌کنند.',
  },
  {
    icon: HeartHandshake,
    title: 'مسئولیت‌پذیری',
    description: 'گارانتی کتبی و پشتیبانی پس از تحویل؛ رضایت شما تا مدت‌ها پس از خروج از سالن برای ما مهم است.',
  },
];

export function AboutPageClient() {
  return (
    <div className="pb-8 lg:pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden py-14 text-center lg:py-20" aria-labelledby="about-title">
        <AmbientOrbs variant="section" />
        <div className="container-custom relative">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-secondary">درباره ما</p>
          <h1 id="about-title" className="mx-auto max-w-3xl text-balance text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
            جایی که خودروی شما دوباره می‌درخشد
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-sm leading-7 text-muted-foreground sm:text-base">
            اتولانژ مرکز تخصصی مراقبت و زیبایی خودرو در تهران است؛ با تیمی که هر خودرو را مثل خودروی خودش تحویل می‌گیرد.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-10 lg:py-16" aria-labelledby="story-title">
        <div className="container-custom grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <ParallaxSection speed={0.15} className="order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/60 shadow-luxury">
              <Image
                src="/images/about-story.webp"
                alt="سالن اتولانژ"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
              <p className="absolute bottom-5 start-5 end-5 text-sm font-semibold text-white">
                سالن اتولانژ، تهران
              </p>
            </div>
          </ParallaxSection>

          <div className="order-1 lg:order-2">
            <SectionHeading
              id="story-title"
              eyebrow="داستان ما"
              title="از یک ایده تا مرجع مراقبت خودروهای لوکس"
              align="start"
              className="mb-6"
            />
            <div className="space-y-4 text-sm leading-8 text-muted-foreground sm:text-base">
              <p>
                اتولانژ را {TEAM[0]?.name} پس از سال‌ها کار در صنعت خودرو و گذراندن دوره‌های تخصصی دیتیلینگ در خارج از کشور بنیان گذاشت؛
                با یک هدف ساده: آوردن استاندارد جهانی مراقبت از خودرو به تهران.
              </p>
              <p>
                امروز تیم ما از تکنسین‌های دارای مدرک رسمی برندهای بین‌المللی تشکیل شده و هر پروژه — از سرامیک و فیلم محافظ تا احیای رنگ —
                پیش از تحویل، شخصاً بازبینی می‌شود.
              </p>
            </div>

            <motion.dl
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig.once}
              className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
            >
              {STATS.map((stat) => (
                <motion.div key={stat.label} variants={fadeInUp} className="rounded-2xl border border-border bg-card p-4">
                  <dd className="text-2xl font-black text-foreground sm:text-3xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </dd>
                  <dt className="mt-1 text-xs text-muted-foreground">{stat.label}</dt>
                </motion.div>
              ))}
            </motion.dl>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/40 py-16 lg:py-24" aria-labelledby="values-title">
        <div className="container-custom">
          <SectionHeading id="values-title" eyebrow="ارزش‌ها" title="آنچه به آن پایبندیم" />
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig.once}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {VALUES.map(({ icon: Icon, title, description }) => (
              <motion.li key={title} variants={fadeInUp} className="rounded-2xl border border-border bg-card p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Team */}
      <TeamSection members={TEAM} />

      {/* Certifications */}
      <CertificationsStrip items={CERTIFICATIONS} />

      {/* Process */}
      <section className="py-16 lg:py-24" aria-labelledby="about-process-title">
        <div className="container-custom">
          <SectionHeading id="about-process-title" eyebrow="روند کار" title="از رزرو تا تحویل" />
          <ProcessTimeline steps={PROCESS_STEPS} />
        </div>
      </section>

      {/* Testimonials link + CTA */}
      <section className="bg-primary py-14 text-primary-foreground lg:py-20" aria-labelledby="about-cta-title">
        <div className="container-custom text-center">
          <RevealOnScroll>
            <h2 id="about-cta-title" className="text-balance text-2xl font-black sm:text-3xl">
              خودروی خود را به دست متخصصان بسپارید
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-primary-foreground/75 sm:text-base">
              مشاورهٔ اولیه و بازدید رایگان است؛ نظر مشتریان ما را بخوانید و بعد تصمیم بگیرید.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="secondary" size="lg" className="min-h-12 w-full gap-2 px-8 shadow-glow-secondary sm:w-auto">
                <Link href={ROUTES.BOOKING}>
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                  رزرو نوبت
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="min-h-12 w-full gap-2 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground sm:w-auto">
                <Link href={`${ROUTES.HOME}#testimonials`}>
                  <MessageSquareQuote className="h-5 w-5" aria-hidden="true" />
                  نظرات مشتریان
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
