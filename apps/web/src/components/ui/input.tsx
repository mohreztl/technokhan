'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Shared control chrome for text-like fields (48px tall, 16px text so iOS never zooms). */
export const fieldControlClass = cn(
  'flex h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground shadow-xs',
  'transition-[border-color,box-shadow,background-color] duration-200',
  'placeholder:text-muted-foreground/70',
  'focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/40',
  'disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-muted/40'
);

export const fieldErrorClass = 'border-destructive focus:border-destructive focus:ring-destructive/30';

export interface FieldShellProps {
  id: string;
  label?: React.ReactNode;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + hint/error, with the ids wired for `aria-describedby`. */
export function FieldShell({ id, label, error, hint, required, className, children }: FieldShellProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-foreground">
          {label}
          {required && (
            <span className="ms-1 text-secondary" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 animate-field-error text-xs leading-5 text-destructive"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-5 text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: React.ReactNode): string | undefined {
  const ids = [error ? `${id}-error` : null, !error && hint ? `${id}-hint` : null].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  error?: string;
  hint?: React.ReactNode;
  /** Decorative icon on the start (right in RTL) side. */
  startIcon?: React.ReactNode;
  /** Decorative icon / unit on the end side. */
  endIcon?: React.ReactNode;
  /** Classes for the outer wrapper. */
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, containerClassName, type = 'text', label, error, hint, startIcon, endIcon, id, required, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? `input-${generatedId}`;

    return (
      <FieldShell id={inputId} label={label} error={error} hint={hint} required={required} className={containerClassName}>
        <div className="relative">
          {startIcon && (
            <span
              className="pointer-events-none absolute inset-s-3.5 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-5 [&_svg]:w-5"
              aria-hidden="true"
            >
              {startIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(inputId, error, hint)}
            className={cn(
              fieldControlClass,
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              startIcon && 'ps-11',
              endIcon && 'pe-11',
              error && fieldErrorClass,
              className
            )}
            {...props}
          />
          {endIcon && (
            <span
              className="pointer-events-none absolute inset-e-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground [&_svg]:h-5 [&_svg]:w-5"
              aria-hidden="true"
            >
              {endIcon}
            </span>
          )}
        </div>
      </FieldShell>
    );
  }
);

Input.displayName = 'Input';

export { Input };
