import { BOOKING_STATUS_LABELS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@autolounge/shared';
import { Badge, type BadgeProps } from '@/components/ui/badge';

type Variant = NonNullable<BadgeProps['variant']>;

const ORDER_VARIANTS: Record<string, Variant> = {
  pending: 'warning',
  processing: 'secondary',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'destructive',
};

const PAYMENT_VARIANTS: Record<string, Variant> = {
  pending: 'warning',
  paid: 'success',
  failed: 'destructive',
  refunded: 'muted',
};

const BOOKING_VARIANTS: Record<string, Variant> = {
  pending: 'warning',
  confirmed: 'secondary',
  in_progress: 'default',
  completed: 'success',
  cancelled: 'destructive',
};

interface StatusBadgeProps {
  status: string;
  size?: BadgeProps['size'];
  className?: string;
}

export function OrderStatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  return (
    <Badge variant={ORDER_VARIANTS[status] ?? 'outline'} size={size} className={className}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PaymentStatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  return (
    <Badge variant={PAYMENT_VARIANTS[status] ?? 'outline'} size={size} className={className}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function BookingStatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  return (
    <Badge variant={BOOKING_VARIANTS[status] ?? 'outline'} size={size} className={className}>
      {BOOKING_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
