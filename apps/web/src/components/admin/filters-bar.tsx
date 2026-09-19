'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { toPersianDigits } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { springTab } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';

export interface FilterChip {
  value: string;
  label: string;
  count?: number;
}

export interface FiltersBarProps {
  /** Single-select chips (usually statuses). */
  chips?: FilterChip[];
  value?: string;
  onChange?: (value: string) => void;
  chipsLabel?: string;
  /** Extra controls: inline from `md`, inside a sheet below it. */
  extra?: React.ReactNode;
  /** Badge on the mobile «فیلترها» button. */
  activeCount?: number;
  onReset?: () => void;
  sheetTitle?: string;
  /** Rendered at the end of the row on every size (typically a `SearchInput`). */
  end?: React.ReactNode;
  className?: string;
}

/** Horizontally scrollable chip row, plus a filter sheet on phones for the extra controls. */
export function FiltersBar({
  chips,
  value,
  onChange,
  chipsLabel = 'فیلتر وضعیت',
  extra,
  activeCount = 0,
  onReset,
  sheetTitle = 'فیلترها',
  end,
  className,
}: FiltersBarProps) {
  const isNarrow = useMediaQuery('(max-width: 767px)', false);
  const [open, setOpen] = React.useState(false);
  const layoutId = React.useId();

  return (
    <div className={cn('space-y-3', className)}>
      {end && <div>{end}</div>}
      {(chips?.length || extra) && (
        <div className="flex items-center gap-2">
          {chips && chips.length > 0 && (
            <div
              role="radiogroup"
              aria-label={chipsLabel}
              className="hide-scrollbar -mx-4 flex min-w-0 flex-1 gap-2 overflow-x-auto px-4 py-0.5 sm:mx-0 sm:px-0"
            >
              {chips.map((chip) => {
                const active = chip.value === value;
                return (
                  <button
                    key={chip.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange?.(chip.value)}
                    className={cn(
                      'relative flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors lg:h-10',
                      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      active ? 'border-transparent text-primary-foreground' : 'border-border/70 bg-background text-foreground hover:bg-secondary/10'
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId={`chip-${layoutId}`}
                        className="absolute inset-0 rounded-full bg-primary"
                        transition={springTab}
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10">{chip.label}</span>
                    {typeof chip.count === 'number' && (
                      <span
                        className={cn(
                          'relative z-10 rounded-full px-1.5 text-[11px] tabular-nums',
                          active ? 'bg-white/20' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {toPersianDigits(chip.count)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {extra && isNarrow && (
            <IconButton
              label="فیلترهای بیشتر"
              icon={<SlidersHorizontal />}
              variant="outline"
              badge={activeCount}
              className="rounded-xl border-border"
              onClick={() => setOpen(true)}
            />
          )}
        </div>
      )}

      {extra && !isNarrow && <div className="flex flex-wrap items-end gap-3">{extra}</div>}

      {extra && isNarrow && (
        <ResponsiveDialog
          open={open}
          onOpenChange={setOpen}
          title={sheetTitle}
          snapPoints={[0.6, 0.9]}
          footer={
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={!onReset || activeCount === 0}
                onClick={() => {
                  onReset?.();
                  setOpen(false);
                }}
              >
                حذف فیلترها
              </Button>
              <Button type="button" onClick={() => setOpen(false)}>
                اعمال
              </Button>
            </div>
          }
        >
          <div className="space-y-4 pt-1">{extra}</div>
        </ResponsiveDialog>
      )}
    </div>
  );
}
