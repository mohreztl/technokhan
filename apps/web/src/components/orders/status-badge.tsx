import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@technokhan/shared';
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
