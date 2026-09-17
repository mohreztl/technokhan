'use client';

import * as React from 'react';
import { useIsMobile } from '@/lib/hooks/use-media-query';
import { BottomSheet, type BottomSheetProps } from '@/components/ui/bottom-sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface ResponsiveDialogProps extends BottomSheetProps {
  /** Extra classes for the desktop dialog panel (e.g. `max-w-4xl p-0`). */
  desktopClassName?: string;
}

/**
 * Bottom sheet below `lg`, centered dialog above. Same props on both sides
 * (`open`, `onOpenChange`, `title`, `description`, `footer`, `children`).
 */
export function ResponsiveDialog({ desktopClassName, ...props }: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) return <BottomSheet {...props} />;

  const { open, onOpenChange, title, description, footer, children, hideHeader } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-h-[90dvh]', desktopClassName)}>
        {(title || description) && !hideHeader && (
          <DialogHeader className="text-right pe-10">
            {title && <DialogTitle className="text-xl">{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {title && hideHeader && <h2 className="sr-only">{title}</h2>}
        {children}
        {footer && <DialogFooter className="mt-4">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
