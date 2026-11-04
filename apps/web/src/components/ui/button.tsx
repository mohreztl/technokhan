'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex select-none touch-manipulation items-center justify-center gap-2 rounded-xl font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-control hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground shadow-control hover:bg-secondary/90',
        accent: 'bg-accent text-accent-foreground shadow-control hover:bg-accent/90',
        outline: 'border border-foreground/25 bg-transparent text-foreground hover:border-foreground hover:bg-foreground/5',
        ghost: 'text-foreground hover:bg-foreground/7',
        link: 'min-h-0 px-0 text-foreground underline-offset-4 hover:underline',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        success: 'bg-success text-success-foreground hover:bg-success/90',
        glass: 'border border-border/70 bg-background/65 text-foreground backdrop-blur-xl hover:bg-background/90',
      },
      size: {
        sm: 'min-h-11 px-4 text-sm',
        md: 'min-h-11 px-5 text-sm',
        lg: 'min-h-12 px-6 text-base',
        xl: 'min-h-14 px-8 text-lg',
        icon: 'h-11 w-11 p-0',
        'icon-sm': 'h-11 w-11 p-0 [&_svg]:h-4 [&_svg]:w-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Clone a Link or other single child with button styling instead of nesting controls. */
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

type ButtonChild = React.ReactElement<{
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
  'aria-disabled'?: boolean;
  'aria-busy'?: boolean;
}>;

/** Accessible action control with loading, icon, glass and polymorphic link variants. */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, loadingText, children, disabled, asChild, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild && React.isValidElement(children)) {
      const child = children as ButtonChild;
      return React.cloneElement(child, {
        ...props,
        ...child.props,
        ref,
        className: cn(classes, child.props.className),
        'aria-disabled': disabled || loading || undefined,
        'aria-busy': loading || undefined,
      });
    }

    return (
      <button ref={ref} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {loadingText ?? 'در حال بارگذاری…'}
          </span>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button, buttonVariants };
