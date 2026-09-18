'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { toPersianDigits } from '@autolounge/shared';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

export interface WizardStepperStep {
  key: string;
  label: string;
}

export interface WizardStepperProps {
  steps: readonly WizardStepperStep[];
  /** zero-based active step */
  current: number;
  /** highest step the user has reached; earlier steps stay clickable */
  maxReached?: number;
  onSelect?: (index: number) => void;
  /** unique per stepper instance when two are mounted at once */
  layoutId?: string;
  className?: string;
}

/**
 * Horizontal progress stepper with Persian numbers, a gold progress line and a
 * shared-layout active ring. Completed steps are buttons (44px hit area).
 */
export function WizardStepper({
  steps,
  current,
  maxReached = current,
  onSelect,
  layoutId = 'wizard-stepper-ring',
  className,
}: WizardStepperProps) {
  const reduced = useReducedMotion();
  const total = steps.length;
  const progress = total > 1 ? (Math.min(current, total - 1) / (total - 1)) * 100 : 0;

  return (
    <nav aria-label="مراحل" className={cn('relative w-full', className)}>
      <ol className="relative flex items-start">
        {/* track + progress line, spanning circle centers */}
        <div
          aria-hidden="true"
          className="absolute top-[22px] h-0.5 overflow-hidden rounded-full bg-border"
          style={{ insetInline: `${50 / total}%` }}
        >
          <motion.div
            className="absolute inset-y-0 inset-s-0 bg-secondary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 30 }}
          />
        </div>

        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const reachable = index <= maxReached && !!onSelect && !active;
          return (
            <li key={step.key} className="relative z-10 flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onSelect?.(index)}
                aria-current={active ? 'step' : undefined}
                aria-label={`مرحلهٔ ${toPersianDigits(String(index + 1))}: ${step.label}`}
                className={cn(
                  'relative flex h-11 w-11 items-center justify-center rounded-full outline-hidden',
                  'focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  reachable ? 'cursor-pointer' : 'cursor-default'
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors duration-300',
                    done && 'border-secondary bg-secondary text-secondary-foreground',
                    active && 'border-secondary bg-background text-secondary shadow-glow-secondary',
                    !done && !active && 'border-border bg-background text-muted-foreground'
                  )}
                >
                  {done ? (
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                  ) : (
                    toPersianDigits(String(index + 1))
                  )}
                </span>
                {active && (
                  <motion.span
                    layoutId={layoutId}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full ring-2 ring-secondary/40"
                    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
              <span
                className={cn(
                  'max-w-full truncate text-xs font-medium transition-colors',
                  active ? 'text-foreground' : done ? 'text-secondary' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
