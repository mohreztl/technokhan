'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Leading icon (rendered in a soft tile on the `card` variant). */
  icon?: React.ReactNode;
  /** `row` = compact list row, `card` = bordered selectable card. */
  variant?: 'row' | 'card';
  /** Content on the end side (price, badge). */
  trailing?: React.ReactNode;
  containerClassName?: string;
}

/**
 * Native radio with a custom animated indicator. The whole label is the
 * hit area (at least 44px), so it works as a list row or a selectable card.
 */
const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    { className, containerClassName, label, description, icon, variant = 'row', trailing, id, disabled, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const radioId = id ?? `radio-${generatedId}`;
    const isCard = variant === 'card';

    return (
      <label
        htmlFor={radioId}
        className={cn(
          'group relative flex min-h-[44px] cursor-pointer select-none items-center gap-3',
          isCard
            ? cn(
                'rounded-2xl border border-border/60 bg-muted/30 p-4 transition-all duration-300',
                'hover:border-border has-[:checked]:border-secondary has-[:checked]:bg-secondary/10 has-[:checked]:shadow-glow-secondary',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-secondary/50'
              )
            : 'py-2',
          disabled && 'cursor-not-allowed opacity-60',
          containerClassName
        )}
      >
        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            type="radio"
            id={radioId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'peer absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-0 rounded-full border-2 border-input bg-background transition-colors duration-200',
              'peer-checked:border-secondary',
              !isCard &&
                'peer-focus-visible:ring-2 peer-focus-visible:ring-secondary/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background'
            )}
          />
          <span
            aria-hidden="true"
            className="absolute inset-[5px] scale-0 rounded-full bg-secondary transition-transform duration-200 ease-out peer-checked:scale-100"
          />
        </span>

        {icon && (
          <span
            className={cn(
              'flex shrink-0 items-center justify-center text-secondary [&_svg]:h-5 [&_svg]:w-5',
              isCard &&
                'h-11 w-11 rounded-xl bg-background/80 shadow-sm transition-colors group-has-[:checked]:bg-secondary group-has-[:checked]:text-secondary-foreground'
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        {(label || description) && (
          <span className="min-w-0 flex-1">
            {label && <span className="block text-sm font-semibold leading-6 text-foreground">{label}</span>}
            {description && (
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{description}</span>
            )}
          </span>
        )}

        {trailing && <span className="shrink-0 text-sm font-semibold text-foreground">{trailing}</span>}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio };
