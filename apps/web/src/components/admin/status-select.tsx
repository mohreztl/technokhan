'use client';

import * as React from 'react';
import { Ban } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { BOOKING_STATUSES, ORDER_STATUSES, statusLabel } from '@/components/admin/status-badge';

export interface StatusSelectProps {
  kind: 'order' | 'booking';
  value: string;
  onChange: (next: string) => void;
  label?: string;
  disabled?: boolean;
  /** Statuses that ask for confirmation before they are applied. Default: `cancelled`. */
  destructive?: string[];
  /** Restrict the options (defaults to every status of the kind). */
  options?: string[];
  error?: string;
  className?: string;
}

/**
 * Native select over the shared status lists. Picking a destructive status
 * opens a confirm dialog first; the value only changes after confirmation.
 */
export function StatusSelect({
  kind,
  value,
  onChange,
  label = 'وضعیت',
  disabled,
  destructive = ['cancelled'],
  options,
  error,
  className,
}: StatusSelectProps) {
  const [pending, setPending] = React.useState<string | null>(null);
  const list = options ?? (kind === 'order' ? ORDER_STATUSES : BOOKING_STATUSES);

  const handle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (next === value) return;
    if (destructive.includes(next)) {
      setPending(next);
      return;
    }
    onChange(next);
  };

  return (
    <div className={className}>
      <Select
        label={label}
        value={value}
        onChange={handle}
        disabled={disabled}
        error={error}
        options={list.map((s) => ({ value: s, label: statusLabel(kind, s) }))}
      />
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(o) => {
          if (!o) setPending(null);
        }}
        title={`تغییر وضعیت به «${pending ? statusLabel(kind, pending) : ''}»`}
        description="این تغییر برای مشتری قابل مشاهده است و معمولاً قابل بازگشت نیست. ادامه می‌دهید؟"
        confirmLabel="بله، تغییر بده"
        destructive
        icon={<Ban />}
        onConfirm={() => {
          if (pending) onChange(pending);
          setPending(null);
        }}
      />
    </div>
  );
}
