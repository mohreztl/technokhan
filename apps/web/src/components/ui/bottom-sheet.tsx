'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  type PanInfo,
} from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/lib/hooks/use-body-scroll-lock';
import { IconButton } from '@/components/ui/icon-button';

export const SHEET_SPRING = { type: 'spring', damping: 28, stiffness: 300 } as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab focus inside `ref` while `active`, focuses the first focusable
 * element (or the container) on activation and restores focus on release.
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean) {
  React.useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;
    const previous = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute('data-focus-guard') && el.offsetParent !== null
      );

    const raf = requestAnimationFrame(() => {
      const preferred = container.querySelector<HTMLElement>('[data-autofocus]');
      const target = preferred ?? focusables()[0] ?? container;
      target.focus({ preventScroll: true });
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (current === first || !container.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !container.contains(current))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      if (previous && typeof previous.focus === 'function') {
        previous.focus({ preventScroll: true });
      }
    };
  }, [ref, active]);
}

/** Viewport height in px (visualViewport-aware), 0 until mounted. */
function useViewportHeight() {
  const [height, setHeight] = React.useState(0);
  React.useEffect(() => {
    const read = () => setHeight(window.visualViewport?.height ?? window.innerHeight);
    read();
    window.addEventListener('resize', read);
    window.visualViewport?.addEventListener('resize', read);
    return () => {
      window.removeEventListener('resize', read);
      window.visualViewport?.removeEventListener('resize', read);
    };
  }, []);
  return height;
}

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Fractions of the viewport height the sheet can rest at, ascending. */
  snapPoints?: number[];
  /** Index into `snapPoints` to open at. */
  initialSnap?: number;
  /** Allow backdrop tap, Escape and swipe-down to close. */
  dismissible?: boolean;
  /** Pinned below the scrollable content, padded for the home indicator. */
  footer?: React.ReactNode;
  /** Classes for the sheet surface. */
  className?: string;
  /** Classes for the scrollable content area. */
  contentClassName?: string;
  /** Hide the header row even when a title is given (title stays as the accessible name). */
  hideHeader?: boolean;
  children: React.ReactNode;
}

/**
 * Mobile bottom sheet: portal, drag-to-dismiss, snap points, focus trap,
 * Escape/backdrop close, body scroll lock, safe-area footer.
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  dismissible = true,
  footer,
  className,
  contentClassName,
  hideHeader = false,
  children,
}: BottomSheetProps) {
  const viewportHeight = useViewportHeight();
  const [mounted, setMounted] = React.useState(false);
  const [snap, setSnap] = React.useState(initialSnap);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (open) setSnap(Math.min(initialSnap, snapPoints.length - 1));
  }, [open, initialSnap, snapPoints.length]);

  useBodyScrollLock(open);
  useFocusTrap(sheetRef, open);

  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);

  React.useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, dismissible, close]);

  // Geometry: the sheet is as tall as the largest snap point; smaller snaps
  // translate it down so only `snap * viewport` stays visible.
  const maxVisible = Math.max(0, viewportHeight - 48);
  const snapPx = React.useMemo(
    () =>
      [...snapPoints]
        .sort((a, b) => a - b)
        .map((p) => Math.min(Math.round(p * viewportHeight), maxVisible)),
    [snapPoints, viewportHeight, maxVisible]
  );
  const sheetHeight = snapPx[snapPx.length - 1] ?? 0;
  const restY = (index: number) => sheetHeight - (snapPx[index] ?? sheetHeight);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (dismissible && (info.offset.y > 120 || info.velocity.y > 600)) {
      close();
      return;
    }
    const current = y.get();
    let nearest = snap;
    let best = Number.POSITIVE_INFINITY;
    snapPx.forEach((_, i) => {
      const d = Math.abs(restY(i) - current);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    // A strong upward flick expands, a downward one collapses one step
    if (info.velocity.y < -400) nearest = Math.min(snapPx.length - 1, snap + 1);
    else if (info.velocity.y > 400) nearest = Math.max(0, snap - 1);
    setSnap(nearest);
    animate(y, restY(nearest), SHEET_SPRING);
  };

  const startDrag = (e: React.PointerEvent) => {
    dragControls.start(e);
  };

  if (!mounted || viewportHeight === 0) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" dir="rtl">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismissible ? close : undefined}
            aria-hidden="true"
          />

          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={cn(
              'absolute inset-x-0 bottom-0 flex max-h-[calc(100dvh-3rem)] flex-col outline-hidden',
              'rounded-t-3xl border-t border-border/40 glass-effect-strong bg-background/95 dark:bg-background/90 shadow-luxury',
              'will-change-transform',
              className
            )}
            style={{ height: sheetHeight, y }}
            initial={{ y: sheetHeight }}
            animate={{ y: restY(snap) }}
            exit={{ y: sheetHeight }}
            transition={SHEET_SPRING}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.08}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
          >
            <motion.div
              className="flex min-h-0 flex-col"
              animate={{ height: snapPx[snap] ?? sheetHeight }}
              transition={SHEET_SPRING}
            >
              {/* Grab handle */}
              <div
                className="flex shrink-0 cursor-grab touch-none flex-col items-center pb-1 pt-3 active:cursor-grabbing"
                onPointerDown={startDrag}
              >
                <span className="h-1.5 w-12 rounded-full bg-foreground/25" aria-hidden="true" />
              </div>

              {(title || description) && !hideHeader && (
                <div
                  className="flex shrink-0 touch-none items-start justify-between gap-3 px-5 pb-3"
                  onPointerDown={startDrag}
                >
                  <div className="min-w-0">
                    {title && (
                      <h2 id={titleId} className="text-lg font-bold text-foreground">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id={descId} className="mt-0.5 text-sm text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                  {dismissible && (
                    <IconButton
                      label="بستن"
                      icon={<X />}
                      size="sm"
                      variant="ghost"
                      className="-me-2 -mt-1"
                      onClick={close}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              )}
              {hideHeader && (
                <>
                  {title && (
                    <h2 id={titleId} className="sr-only">
                      {title}
                    </h2>
                  )}
                  {dismissible && (
                    <IconButton
                      label="بستن"
                      icon={<X />}
                      size="sm"
                      variant="glass"
                      className="absolute inset-e-3 top-2 z-10"
                      onClick={close}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  )}
                </>
              )}

              <div
                className={cn(
                  'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4',
                  !footer && 'pb-safe',
                  contentClassName
                )}
              >
                {children}
                {!footer && <div className="h-4" aria-hidden="true" />}
              </div>

              {footer && (
                <div className="shrink-0 border-t border-border/40 bg-background/70 px-5 pt-3 pb-safe">
                  <div className="pb-3">{footer}</div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Tiny open/close state helper for sheets and dialogs. */
export function useSheetState(initial = false) {
  const [open, setOpen] = React.useState(initial);
  const onOpen = React.useCallback(() => setOpen(true), []);
  const onClose = React.useCallback(() => setOpen(false), []);
  const toggle = React.useCallback(() => setOpen((v) => !v), []);
  return { open, setOpen, onOpen, onClose, toggle } as const;
}
