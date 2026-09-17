'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/lib/hooks/use-body-scroll-lock';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const { onOpenChange } = React.useContext(DialogContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange(true),
    } as any);
  }

  return (
    <button onClick={() => onOpenChange(true)} type="button">
      {children}
    </button>
  );
}

export function DialogContent({ className, children, onClose }: DialogContentProps) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  useBodyScrollLock(open);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
        onClose?.();
      }
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onOpenChange, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              onOpenChange(false);
              onClose?.();
            }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-effect-strong rounded-2xl p-6 shadow-luxury',
                className
              )}
            >
              <button
                onClick={() => {
                  onOpenChange(false);
                  onClose?.();
                }}
                className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">بستن</span>
              </button>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-2 text-center sm:text-right mb-4', className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-2xl font-bold text-foreground', className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 sm:space-x-reverse mt-6',
        className
      )}
      {...props}
    />
  );
}
