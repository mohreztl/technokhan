'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(): DialogContextValue {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error('Dialog components must be used within Dialog');
  return context;
}

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/** Controlled native dialog context; the browser owns focus, Escape and focus return. */
export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const id = React.useId();
  const value = React.useMemo(() => ({ open, onOpenChange: onOpenChange ?? (() => {}), titleId: `${id}-title`, descriptionId: `${id}-description` }), [id, onOpenChange, open]);
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { onOpenChange } = useDialogContext();
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: React.MouseEventHandler<HTMLElement> }>;
    return React.cloneElement(child, {
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event);
        if (!event.defaultPrevented) onOpenChange(true);
      },
    });
  }
  return <button type="button" onClick={() => onOpenChange(true)}>{children}</button>;
}

export interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

/** Modal content rendered through the native top-layer dialog element. */
export function DialogContent({ className, children, onClose }: DialogContentProps) {
  const { open, onOpenChange, titleId, descriptionId } = useDialogContext();
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      closedby="any"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn('m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-border bg-popover p-6 text-popover-foreground shadow-panel backdrop:bg-background/75 backdrop:backdrop-blur-md', className)}
      onClose={() => { onOpenChange(false); onClose?.(); }}
      onClick={(event) => {
        if ('closedBy' in HTMLDialogElement.prototype) return;
        const dialog = ref.current;
        if (!dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
      }}
    >
      <button type="button" onClick={close} className="absolute end-4 top-4 inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="بستن">
        <X className="size-5" aria-hidden="true" />
      </button>
      {children}
    </dialog>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col gap-2 pe-10 text-start', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDialogContext();
  return <h2 id={titleId} className={cn('text-2xl font-bold text-foreground', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useDialogContext();
  return <p id={descriptionId} className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />;
}
