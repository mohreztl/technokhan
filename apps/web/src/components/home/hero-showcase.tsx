'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, ShieldCheck, Truck, Zap } from 'lucide-react';
import { CATEGORIES } from '@technokhan/shared';
import { HERO_SHELF_MEDIA } from '@/content/media-assets';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getShelfOffset } from './hero-shelf-utils';
import styles from './hero-showcase.module.css';

const CATEGORY_TAGS: Record<string, string> = {
  chargers: 'GaN / 140W',
  headphones: 'ANC / 60H',
  powerbanks: 'MagSafe / 20K',
  gaming: 'DESK / PRO',
  wearables: 'Ti / GPS',
  cables: 'USB4 / 100W',
};

/** Cinematic product-shelf hero where every category hangs inside one navigable 3D scene. */
export function HeroShowcase() {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = React.useState(0);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const activeCategory = CATEGORIES[active] ?? CATEGORIES[0]!;
  const activeMedia = HERO_SHELF_MEDIA[activeCategory.id as keyof typeof HERO_SHELF_MEDIA];

  const selectCategory = React.useCallback((index: number) => {
    setActive(((index % CATEGORIES.length) + CATEGORIES.length) % CATEGORIES.length);
  }, []);

  const rotateX = reducedMotion ? 12 : 12 + tilt.y * 4;
  const rotateY = reducedMotion ? 0 : tilt.x * 7;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x, y });
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectCategory(active + 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectCategory(active - 1);
    }
  };

  return (
    <section className={styles.hero} aria-label="ویترین قفسه تکنو خان">
      <div className={styles.backdropWord} aria-hidden="true">TECHNOKHAN</div>

      <header className={styles.header}>
        <Badge variant="original" className="border-white/20 bg-white/10 text-white">
          <ShieldCheck className="size-3.5" aria-hidden="true" /> ضمانت اصالت و بررسی سریال
        </Badge>
        <p className={styles.kicker}>قفسه‌ی انتخاب دقیق</p>
        <h1 className={styles.title}>دسته‌ی درست، جلوی چشم.</h1>
        <p className={styles.lead}>
          به‌جای شلوغی ویترین، شش مسیر روشن روی یک قفسه: شارژ، صدا، انرژی همراه، میز کار، پوشیدنی و اتصال. هر دسته فقط با محصولاتی که ارزش بررسی دارند.
        </p>
        <div className={styles.actions}>
          <Button asChild size="lg">
            <Link href={`/category/${activeCategory.id}`}>ورود به {activeCategory.name} <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" /></Link>
          </Button>
          <Button asChild size="lg" variant="glass" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
            <Link href="/shop">مشاهده همه محصولات</Link>
          </Button>
        </div>
        <p className={styles.activeSummary}>
          روی صحنه: <strong>{activeCategory.name}</strong>
          <span aria-hidden="true">/</span>
          {activeCategory.description}
        </p>
        <div className={styles.trust}>
          <span><Truck className="size-4 text-[#c8f45a]" aria-hidden="true" /> ارسال سریع با رهگیری</span>
          <span><Zap className="size-4 text-[#c8f45a]" aria-hidden="true" /> ۷ روز فرصت بازگشت</span>
        </div>
      </header>

      <div className={styles.scene} onPointerMove={handlePointerMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
        <div className={styles.floor} aria-hidden="true" />
        <div className={styles.shelf} style={{ '--rx': `${rotateX}deg`, '--ry': `${rotateY}deg` } as React.CSSProperties}>
          <div className={`${styles.rail} ${styles.railTop}`} aria-hidden="true" />
          <div className={`${styles.rail} ${styles.railBottom}`} aria-hidden="true" />
          <div className={`${styles.support} ${styles.supportStart}`} aria-hidden="true" />
          <div className={`${styles.support} ${styles.supportEnd}`} aria-hidden="true" />

          {CATEGORIES.map((category, index) => {
            const offset = getShelfOffset(index, active, CATEGORIES.length);
            const distance = Math.abs(offset);
            const media = HERO_SHELF_MEDIA[category.id as keyof typeof HERO_SHELF_MEDIA];
            const itemStyle = {
              '--x': `${offset * 225}px`,
              '--y': `${distance * 16}px`,
              '--z': `${distance * -95}px`,
              '--ry': `${offset * -13}deg`,
              '--scale': `${distance === 0 ? 1 : 0.82}`,
              zIndex: 20 - distance,
              opacity: distance > 2 ? 0.34 : 1,
              filter: distance > 0 ? `blur(${Math.min(2.4, distance * 0.85)}px)` : undefined,
            } as React.CSSProperties;

            return (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                aria-label={`مشاهده دسته ${category.name}`}
                aria-current={offset === 0 ? 'true' : undefined}
                className={`${styles.item} ${offset === 0 ? styles.itemActive : ''}`}
                style={itemStyle}
              >
                <span className={styles.hanger} aria-hidden="true" />
                <span className={styles.card}>
                  <Image
                    src={media.src}
                    alt={media.alt}
                    width={media.width}
                    height={media.height}
                    priority={offset === 0}
                    fetchPriority={offset === 0 ? 'high' : 'low'}
                    sizes="(max-width: 767px) 78vw, 225px"
                  />
                  <span className={styles.tag}>{CATEGORY_TAGS[category.id] ?? 'TECH'}</span>
                  <span className={styles.name}>{category.name}</span>
                </span>
              </Link>
            );
          })}
        </div>

        <button type="button" className={`${styles.nav} ${styles.navPrev}`} aria-label="دسته قبلی" onClick={() => selectCategory(active - 1)}>
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
        <button type="button" className={`${styles.nav} ${styles.navNext}`} aria-label="دسته بعدی" onClick={() => selectCategory(active + 1)}>
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className={styles.controls} role="tablist" aria-label="دسته‌های روی قفسه" onKeyDown={handleTabKeyDown}>
        {CATEGORIES.map((category, index) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            className={`${styles.control} ${index === active ? styles.controlActive : ''}`}
            onClick={() => selectCategory(index)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="sr-only">
        تصویر فعال: {activeMedia.alt}
      </div>
    </section>
  );
}
