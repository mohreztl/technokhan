import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5',
  {
    variants: {
      variant: {
        default: 'border-primary/15 bg-primary text-primary-foreground',
        secondary: 'border-secondary/20 bg-secondary text-secondary-foreground',
        destructive: 'border-destructive/20 bg-destructive text-destructive-foreground',
        success: 'border-success/20 bg-success/10 text-success',
        warning: 'border-warning/25 bg-warning/10 text-warning',
        outline: 'border-border bg-transparent text-foreground',
        ghost: 'border-transparent bg-foreground/6 text-foreground',
        gold: 'border-secondary/35 bg-secondary/10 text-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
        deal: 'border-accent/20 bg-accent text-accent-foreground tabular-nums',
        stock: 'border-success/25 bg-success/10 text-success',
        original: 'border-foreground/15 bg-foreground/6 text-foreground',
        shipping: 'border-info/25 bg-info/10 text-info',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/** Compact semantic label for discounts, inventory, authenticity and delivery. */
export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
