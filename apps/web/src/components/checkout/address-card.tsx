'use client';

import { Check, MapPin, Phone } from 'lucide-react';
import type { Address } from '@autolounge/shared';
import { toPersianDigits } from '@autolounge/shared';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface AddressCardProps {
  address: Address;
  /** renders as a selectable radio card when `onSelect` is given */
  selected?: boolean;
  onSelect?: () => void;
  /** action buttons (edit / delete / set default) rendered under the address */
  actions?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

/** Address summary used by the checkout picker, the review step and the profile address book. */
export function AddressCard({ address, selected, onSelect, actions, compact, className }: AddressCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
            {address.fullName}
            {address.isDefault && (
              <Badge variant="gold" size="sm">
                پیش‌فرض
              </Badge>
            )}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            <span dir="ltr" className="tabular-nums">
              {toPersianDigits(address.phoneNumber)}
            </span>
          </p>
        </div>
        {onSelect && (
          <span
            aria-hidden="true"
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
              selected ? 'border-secondary bg-secondary text-secondary-foreground' : 'border-border'
            )}
          >
            {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </span>
        )}
      </div>
      <p className={cn('mt-2 flex items-start gap-1.5 text-sm leading-6', compact && 'line-clamp-2')}>
        <MapPin className="mt-1 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
        <span>
          {address.province}، {address.city}، {address.address}
          <span className="block text-xs text-muted-foreground">
            کد پستی: <span dir="ltr">{toPersianDigits(address.postalCode)}</span>
          </span>
        </span>
      </p>
      {actions && <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">{actions}</div>}
    </>
  );

  const base = cn('w-full rounded-2xl border p-4 text-start transition-colors', className);

  if (onSelect) {
    return (
      <button
        type="button"
        role="radio"
        aria-checked={!!selected}
        onClick={onSelect}
        className={cn(
          base,
          'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary/50',
          selected ? 'border-secondary bg-secondary/10 shadow-glow-secondary' : 'border-border bg-card hover:border-secondary/60'
        )}
      >
        {body}
      </button>
    );
  }

  return <div className={cn(base, 'border-border bg-card')}>{body}</div>;
}
