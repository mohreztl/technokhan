'use client';

import * as React from 'react';
import {
  BOOKING_STATUS_LABELS,
  BookingStatus,
  ORDER_STATUS_LABELS,
  OrderStatus,
  PAYMENT_STATUS_LABELS,
  PaymentStatus,
} from '@autolounge/shared';
import { cn } from '@/lib/utils';

export type StatusKind = 'order' | 'booking' | 'payment';

export interface StatusMeta {
  label: string;
  /** Soft tinted pill classes. */
  className: string;
  /** Leading dot color. */
  dotClassName: string;
}

const TONES = {
  warning: {
    className: 'border-warning/30 bg-warning/10 text-warning',
    dotClassName: 'bg-warning',
  },
  info: {
    className: 'border-info/30 bg-info/10 text-info',
    dotClassName: 'bg-info',
  },
  navy: {
    className: 'border-primary/30 bg-primary/10 text-primary dark:border-primary-200/30 dark:bg-primary-200/10 dark:text-primary-100',
    dotClassName: 'bg-primary dark:bg-primary-200',
  },
  gold: {
    className: 'border-secondary/50 bg-secondary/15 text-secondary-800 dark:text-secondary-300',
    dotClassName: 'bg-secondary',
  },
  success: {
    className: 'border-success/30 bg-success/10 text-success',
    dotClassName: 'bg-success',
  },
  destructive: {
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
    dotClassName: 'bg-destructive',
  },
  muted: {
    className: 'border-border bg-muted/60 text-muted-foreground',
    dotClassName: 'bg-muted-foreground',
  },
} as const;

type Tone = keyof typeof TONES;

const ORDER_TONES: Record<string, Tone> = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.PROCESSING]: 'info',
  [OrderStatus.SHIPPED]: 'gold',
  [OrderStatus.DELIVERED]: 'success',
  [OrderStatus.CANCELLED]: 'destructive',
};

const BOOKING_TONES: Record<string, Tone> = {
  [BookingStatus.PENDING]: 'warning',
  [BookingStatus.CONFIRMED]: 'navy',
  [BookingStatus.IN_PROGRESS]: 'gold',
  [BookingStatus.COMPLETED]: 'success',
  [BookingStatus.CANCELLED]: 'destructive',
};

const PAYMENT_TONES: Record<string, Tone> = {
  [PaymentStatus.PENDING]: 'warning',
  [PaymentStatus.PAID]: 'success',
  [PaymentStatus.FAILED]: 'destructive',
  [PaymentStatus.REFUNDED]: 'muted',
};

/** Ordered status lists for selects and flows. */
export const ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

export const BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
];

/** The natural next step of a booking (pending → confirmed → in_progress → completed). */
export function nextBookingStatus(status: BookingStatus): BookingStatus | null {
  switch (status) {
    case BookingStatus.PENDING:
      return BookingStatus.CONFIRMED;
    case BookingStatus.CONFIRMED:
      return BookingStatus.IN_PROGRESS;
    case BookingStatus.IN_PROGRESS:
      return BookingStatus.COMPLETED;
    default:
      return null;
  }
}

/** The natural next step of an order (pending → processing → shipped → delivered). */
export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case OrderStatus.PENDING:
      return OrderStatus.PROCESSING;
    case OrderStatus.PROCESSING:
      return OrderStatus.SHIPPED;
    case OrderStatus.SHIPPED:
      return OrderStatus.DELIVERED;
    default:
      return null;
  }
}

export function statusLabel(kind: StatusKind, status: string): string {
  const labels =
    kind === 'order' ? ORDER_STATUS_LABELS : kind === 'booking' ? BOOKING_STATUS_LABELS : PAYMENT_STATUS_LABELS;
  return labels[status] ?? status;
}

export function statusMeta(kind: StatusKind, status: string): StatusMeta {
  const tones = kind === 'order' ? ORDER_TONES : kind === 'booking' ? BOOKING_TONES : PAYMENT_TONES;
  const tone = TONES[tones[status] ?? 'muted'];
  return { label: statusLabel(kind, status), ...tone };
}

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  kind: StatusKind;
  status: string;
  size?: 'sm' | 'md';
  withDot?: boolean;
}

/** Tinted pill for order / booking / payment statuses with the shared Persian labels. */
export function StatusBadge({ kind, status, size = 'md', withDot = true, className, ...props }: StatusBadgeProps) {
  const meta = statusMeta(kind, status);
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        meta.className,
        className
      )}
      {...props}
    >
      {withDot && <span className={cn('h-1.5 w-1.5 rounded-full', meta.dotClassName)} aria-hidden="true" />}
      {meta.label}
    </span>
  );
}
