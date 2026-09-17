'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldShell, describedBy, fieldControlClass, fieldErrorClass } from '@/components/ui/input';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: React.ReactNode;
  error?: string;
  hint?: React.ReactNode;
  options: SelectOption[];
  /** Disabled first option shown while nothing is selected. */
  placeholder?: string;
  startIcon?: React.ReactNode;
  containerClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, containerClassName, label, error, hint, options, placeholder, startIcon, id, required, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? `select-${generatedId}`;

    return (
      <FieldShell id={selectId} label={label} error={error} hint={hint} required={required} className={containerClassName}>
        <div className="relative">
          {startIcon && (
            <span
              className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-5 [&_svg]:w-5"
              aria-hidden="true"
            >
              {startIcon}
            </span>
          )}
          <select
            id={selectId}
            ref={ref}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(selectId, error, hint)}
            className={cn(
              fieldControlClass,
              'cursor-pointer appearance-none pe-11',
              startIcon && 'ps-11',
              error && fieldErrorClass,
              className
            )}
            {...props}
          >
            {placeholder !== undefined && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute end-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </FieldShell>
    );
  }
);

Select.displayName = 'Select';

export { Select };
