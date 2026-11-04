'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

/** Keyboard-accessible on/off control with native button semantics and a visible label. */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, label, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cn('relative h-7 w-12 shrink-0 rounded-full border border-border bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:opacity-50', checked && 'border-secondary bg-secondary', className)}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      <span aria-hidden="true" className={cn('absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-background shadow-control transition-[inset-inline-start] duration-200', checked ? 'start-[25px]' : 'start-[3px]')} />
    </button>
  )
);

Switch.displayName = 'Switch';
