'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const generatedId = React.useId();
    const radioId = id || generatedId;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center">
          <input
            type="radio"
            id={radioId}
            ref={ref}
            className={cn(
              'peer h-5 w-5 shrink-0 rounded-full border-2 border-input bg-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer',
              'checked:border-primary checked:border-[6px]',
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                htmlFor={radioId}
                className="text-sm font-medium leading-none text-foreground cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
            )}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio };
