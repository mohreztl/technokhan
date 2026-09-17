'use client';

import * as React from 'react';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { JalaliCalendar } from '@/components/ui/jalali-calendar';
import { Button } from '@/components/ui/button';
import { formatJalali } from '@/lib/jalali';

export interface DateFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: Date | null;
  /** `null` clears the filter. */
  onChange: (date: Date | null) => void;
  title?: string;
  minDate?: Date;
  maxDate?: Date;
}

/** Jalali calendar in a sheet / dialog with a «پاک کردن» action. Any day (past or future) can be picked. */
export function DateFilterDialog({
  open,
  onOpenChange,
  value,
  onChange,
  title = 'فیلتر تاریخ',
  minDate,
  maxDate,
}: DateFilterDialogProps) {
  const today = React.useMemo(() => new Date(), []);
  const min = React.useMemo(() => minDate ?? new Date(today.getFullYear() - 2, today.getMonth(), 1), [minDate, today]);
  const max = React.useMemo(() => maxDate ?? new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()), [maxDate, today]);

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={value ? `انتخاب شده: ${formatJalali(value, true)}` : 'روزی را انتخاب کنید یا فیلتر را پاک کنید.'}
      snapPoints={[0.85]}
      desktopClassName="max-w-md"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={!value}
            onClick={() => {
              onChange(null);
              onOpenChange(false);
            }}
          >
            پاک کردن
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            بستن
          </Button>
        </div>
      }
    >
      <div className="pt-1">
        <JalaliCalendar
          value={value ?? today}
          minDate={min}
          maxDate={max}
          onChange={(d) => {
            onChange(d);
            onOpenChange(false);
          }}
        />
      </div>
    </ResponsiveDialog>
  );
}
