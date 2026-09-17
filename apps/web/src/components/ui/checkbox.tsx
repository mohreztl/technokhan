'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  /** `row` = list row, `card` = bordered selectable card. */
  variant?: 'row' | 'card';
  containerClassName?: string;
}

/**
 * Native checkbox with a drawn-in check mark. With a label the whole row is
 * the hit area (at least 44px); without one it renders just the 20px box.
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, containerClassName, label, description, error, variant = 'row', id, disabled, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id ?? `checkbox-${generatedId}`;
    const hasText = Boolean(label || description);
    const isCard = variant === 'card';
    const errorId = `${checkboxId}-error`;

    return (
      <div className={cn(hasText ? 'w-full' : 'inline-flex', containerClassName)}>
        <label
          htmlFor={checkboxId}
          className={cn(
            'group relative flex cursor-pointer select-none items-start gap-3',
            hasText && 'min-h-[44px]',
            isCard
              ? cn(
                  'rounded-2xl border border-border/60 bg-muted/30 p-4 transition-all duration-300',
                  'hover:border-border has-[:checked]:border-secondary has-[:checked]:bg-secondary/10',
                  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-secondary/50'
                )
              : hasText && 'py-2',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          <span className={cn('relative flex h-5 w-5 shrink-0 items-center justify-center', hasText && 'mt-0.5')}>
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              disabled={disabled}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className={cn(
                'peer absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed',
                className
              )}
              {...props}
            />
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-0 rounded-md border-2 border-input bg-background transition-all duration-200',
                'peer-checked:border-primary peer-checked:bg-primary dark:peer-checked:border-secondary dark:peer-checked:bg-secondary',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-secondary/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
                error && 'border-destructive'
              )}
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                'pointer-events-none absolute inset-0 h-full w-full p-[3px] text-primary-foreground dark:text-secondary-foreground',
                '[stroke-dasharray:24] [stroke-dashoffset:24] transition-[stroke-dashoffset] duration-300 ease-out peer-checked:[stroke-dashoffset:0]'
              )}
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>

          {hasText && (
            <span className="min-w-0 flex-1">
              {label && <span className="block text-sm font-semibold leading-6 text-foreground">{label}</span>}
              {description && (
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{description}</span>
              )}
            </span>
          )}
        </label>
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
