'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ type = 'single', defaultValue = [], children, className }: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  );

  const toggleItem = React.useCallback(
    (value: string) => {
      setOpenItems((current) => {
        const isOpen = current.includes(value);
        if (type === 'single') return isOpen ? [] : [value];
        return isOpen ? current.filter((item) => item !== value) : [...current, value];
      });
    },
    [type]
  );

  const ctx = React.useMemo(() => ({ openItems, toggleItem, type }), [openItems, toggleItem, type]);

  return (
    <AccordionContext.Provider value={ctx}>
      <div className={cn('w-full', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface AccordionItemContextType {
  value: string;
  triggerId: string;
  contentId: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextType | undefined>(undefined);

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  const id = React.useId();
  const ctx = React.useMemo(
    () => ({ value, triggerId: `${id}-trigger`, contentId: `${id}-content` }),
    [id, value]
  );
  return (
    <AccordionItemContext.Provider value={ctx}>
      <div className={cn('border-b border-border', className)} data-value={value}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within Accordion');
  const item = React.useContext(AccordionItemContext);
  if (!item) throw new Error('AccordionTrigger must be used within AccordionItem');

  const isOpen = context.openItems.includes(item.value);

  return (
    <button
      type="button"
      id={item.triggerId}
      aria-expanded={isOpen}
      aria-controls={item.contentId}
      onClick={() => context.toggleItem(item.value)}
      className={cn(
        'flex min-h-11 w-full items-center justify-between gap-3 py-3 text-start font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
    >
      <span className="flex-1">{children}</span>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300',
          isOpen && 'rotate-180 text-secondary'
        )}
      />
    </button>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error('AccordionContent must be used within Accordion');
  const item = React.useContext(AccordionItemContext);
  if (!item) throw new Error('AccordionContent must be used within AccordionItem');

  const isOpen = context.openItems.includes(item.value);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id={item.contentId}
          role="region"
          aria-labelledby={item.triggerId}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className={cn('pb-4 pt-0 text-sm leading-7 text-muted-foreground', className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
