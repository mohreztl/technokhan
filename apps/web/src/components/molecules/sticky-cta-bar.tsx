'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { discountPercent, formatToman, toPersianDigits } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { springSheet } from '@/lib/animation-variants';

export interface StickyCtaSecondaryAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

export interface StickyCtaBarProps {
  price: number;
  oldPrice?: number;
  /** Small caption above the price, e.g. «شروع از» */
  priceLabel?: string;
  primaryLabel: string;
  primaryIcon?: React.ReactNode;
  onPrimary?: () => void;
  /** Renders the primary action as a link instead of a button. */
  primaryHref?: string;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  secondary?: StickyCtaSecondaryAction[];
  visible: boolean;
  className?: string;
}

/**
 * Returns true once the user has scrolled and the referenced in-page CTA is
 * out of view — the moment the sticky bar should take over.
 */
export function useStickyCta(ref: React.RefObject<Element | null>): boolean {
  const inView = useInView(ref, { margin: '0px 0px -8% 0px' });
  const [hasScrolled, setHasScrolled] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      if (window.scrollY > 24) setHasScrolled(true);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  return hasScrolled && !inView;
}

/**
 * Mobile-only sticky bottom bar for detail pages (price + primary action +
 * optional secondary icon actions). Portals to `body` so page transforms and
 * filters cannot capture its `fixed` positioning.
 */
export function StickyCtaBar({
  price,
  oldPrice,
  priceLabel,
  primaryLabel,
  primaryIcon,
  onPrimary,
  primaryHref,
  primaryDisabled,
  primaryLoading,
  secondary = [],
  visible,
  className,
}: StickyCtaBarProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const hasDiscount = typeof oldPrice === 'number' && oldPrice > price;
  const percent = hasDiscount ? discountPercent({ price: oldPrice, discountPrice: price }) : 0;

  const primaryClasses = 'h-12 flex-1 gap-2 rounded-xl text-base shadow-glow-secondary';

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-cta"
          role="region"
          aria-label="اقدام سریع"
          dir="rtl"
          className={cn(
            'fixed inset-x-0 bottom-0 z-40 lg:hidden',
            'glass-effect-strong border-t border-border/40 bg-background/90 dark:bg-background/85',
            'pb-safe',
            className
          )}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={springSheet}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex min-w-0 shrink-0 flex-col leading-tight">
              {priceLabel && (
                <span className="text-[11px] text-muted-foreground">{priceLabel}</span>
              )}
              <span className="text-base font-black text-foreground tabular-nums">
                {formatToman(price)}
              </span>
              {hasDiscount && (
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="line-through">{formatToman(oldPrice)}</span>
                  <span className="rounded-md bg-destructive/15 px-1 py-px font-bold text-destructive">
                    {toPersianDigits(percent)}٪
                  </span>
                </span>
              )}
            </div>

            {secondary.map((action) => (
              <IconButton
                key={action.label}
                label={action.label}
                icon={action.icon}
                variant="glass"
                active={action.active}
                onClick={action.onClick}
                className={cn(
                  'shrink-0 rounded-xl',
                  action.active && 'bg-destructive/10 text-destructive'
                )}
              />
            ))}

            {primaryHref ? (
              <Button
                asChild
                variant="secondary"
                className={cn(primaryClasses, primaryDisabled && 'pointer-events-none opacity-50')}
              >
                <Link href={primaryHref} aria-disabled={primaryDisabled}>
                  {primaryIcon}
                  {primaryLabel}
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className={primaryClasses}
                onClick={onPrimary}
                disabled={primaryDisabled}
                loading={primaryLoading}
              >
                {primaryIcon}
                {primaryLabel}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
