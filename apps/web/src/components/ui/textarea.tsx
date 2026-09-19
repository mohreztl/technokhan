'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { FieldShell, describedBy, fieldControlClass, fieldErrorClass } from '@/components/ui/input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
  hint?: React.ReactNode;
  startIcon?: React.ReactNode;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, label, error, hint, startIcon, id, required, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? `textarea-${generatedId}`;

    return (
      <FieldShell id={textareaId} label={label} error={error} hint={hint} required={required} className={containerClassName}>
        <div className="relative">
          {startIcon && (
            <span
              className="pointer-events-none absolute inset-s-3.5 top-3.5 text-muted-foreground [&_svg]:h-5 [&_svg]:w-5"
              aria-hidden="true"
            >
              {startIcon}
            </span>
          )}
          <textarea
            id={textareaId}
            ref={ref}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(textareaId, error, hint)}
            className={cn(
              fieldControlClass,
              'h-auto min-h-[120px] resize-y py-3 leading-7',
              startIcon && 'ps-11',
              error && fieldErrorClass,
              className
            )}
            {...props}
          />
        </div>
      </FieldShell>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
