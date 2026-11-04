import { discountPercent, formatToman, toPersianDigits } from '@autolounge/shared';
import { cn } from '@/lib/utils';

export interface PriceTagProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
  className?: string;
}

/** Displays Toman prices with Persian tabular numerals and an optional discount badge. */
export function PriceTag({ price, originalPrice, size = 'md', showDiscount = true, className }: PriceTagProps) {
  const discounted = originalPrice !== undefined && originalPrice > price;
  const percent = discounted ? discountPercent({ price: originalPrice, discountPrice: price }) : 0;
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1 tabular-nums', className)}>
      <span className={cn('font-extrabold tracking-tight text-foreground', size === 'sm' && 'text-base', size === 'md' && 'text-xl', size === 'lg' && 'text-3xl')}>
        {formatToman(price)}
      </span>
      {discounted && <del className="text-xs text-muted-foreground">{formatToman(originalPrice)}</del>}
      {discounted && showDiscount && (
        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
          {toPersianDigits(percent)}٪
        </span>
      )}
    </div>
  );
}
