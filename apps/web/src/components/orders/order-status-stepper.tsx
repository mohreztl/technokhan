'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Ban, Check, CheckCircle2, Clock3, Package, Truck } from 'lucide-react';
import { ORDER_STATUS_LABELS } from '@autolounge/shared';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

const FLOW: { key: string; icon: LucideIcon }[] = [
  { key: 'pending', icon: Clock3 },
  { key: 'processing', icon: Package },
  { key: 'shipped', icon: Truck },
  { key: 'delivered', icon: CheckCircle2 },
];

export interface OrderStatusStepperProps {
  status: string;
  className?: string;
}

/** pending → processing → shipped → delivered, with a cancelled branch. */
export function OrderStatusStepper({ status, className }: OrderStatusStepperProps) {
  const reduced = useReducedMotion();
  const cancelled = status === 'cancelled';
  const index = Math.max(0, FLOW.findIndex((s) => s.key === status));
  const progress = cancelled ? 0 : (index / (FLOW.length - 1)) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      <ol className="relative flex items-start" aria-label="وضعیت سفارش">
        <div
          aria-hidden="true"
          className="absolute top-5 h-0.5 overflow-hidden rounded-full bg-border"
          style={{ insetInline: `${50 / FLOW.length}%` }}
        >
          <motion.div
            layout
            className={cn('absolute inset-y-0 start-0', cancelled ? 'bg-destructive/60' : 'bg-secondary')}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 160, damping: 26 }}
          />
        </div>
        {FLOW.map((step, i) => {
          const done = !cancelled && i < index;
          const active = !cancelled && i === index;
          const Icon = step.icon;
          return (
            <li key={step.key} className="relative z-10 flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <motion.span
                initial={false}
                animate={active && !reduced ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={active && !reduced ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' } : undefined}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-colors',
                  done && 'border-secondary bg-secondary text-secondary-foreground',
                  active && 'border-secondary text-secondary shadow-glow-secondary',
                  !done && !active && 'border-border text-muted-foreground',
                  cancelled && i === 0 && 'border-destructive text-destructive'
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                ) : cancelled && i === 0 ? (
                  <Ban className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden="true" />
                )}
              </motion.span>
              <span
                className={cn(
                  'max-w-full truncate text-[11px] font-medium sm:text-xs',
                  active ? 'text-foreground' : done ? 'text-secondary' : 'text-muted-foreground'
                )}
              >
                {ORDER_STATUS_LABELS[step.key] ?? step.key}
              </span>
            </li>
          );
        })}
      </ol>
      {cancelled && (
        <p className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <Ban className="h-4 w-4 shrink-0" aria-hidden="true" />
          این سفارش لغو شده است.
        </p>
      )}
    </div>
  );
}
