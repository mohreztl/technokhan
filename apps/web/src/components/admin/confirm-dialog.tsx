'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for deletes / cancellations. */
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/** Sheet on mobile, dialog on desktop — one confirm and one cancel button, 44px each. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'تأیید',
  cancelLabel = 'انصراف',
  destructive = false,
  loading = false,
  onConfirm,
  icon,
  children,
}: ConfirmDialogProps) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(o) => {
        if (loading && !o) return;
        onOpenChange(o);
      }}
      title={title}
      description={description}
      hideHeader
      snapPoints={[0.5]}
      dismissible={!loading}
      desktopClassName="max-w-md"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'primary'}
            loading={loading}
            loadingText="لطفاً صبر کنید…"
            onClick={() => void onConfirm()}
            data-autofocus
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <span
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full [&_svg]:h-7 [&_svg]:w-7',
            destructive ? 'bg-destructive/10 text-destructive' : 'bg-secondary/20 text-secondary-800 dark:text-secondary-300'
          )}
          aria-hidden="true"
        >
          {icon ?? <AlertTriangle />}
        </span>
        <h3 className="text-lg font-black text-foreground text-balance">{title}</h3>
        {description && <p className="text-sm leading-6 text-muted-foreground">{description}</p>}
        {children}
      </div>
    </ResponsiveDialog>
  );
}
