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

export function Accordion({
  type = 'single',
  defaultValue = [],
  children,
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  );

  const toggleItem = (value: string) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(value) ? [] : [value]);
    } else {
      setOpenItems(
        openItems.includes(value)
          ? openItems.filter((item) => item !== value)
          : [...openItems, value]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn('w-full', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const AccordionItemContext = React.createContext<string | undefined>(undefined);

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={value}>
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

  const { openItems, toggleItem } = context;
  const parent = React.useContext(AccordionItemContext);
  if (!parent) throw new Error('AccordionTrigger must be used within AccordionItem');

  const isOpen = openItems.includes(parent);

  return (
    <button
      onClick={() => toggleItem(parent)}
      className={cn(
        'flex w-full items-center justify-between py-4 text-right font-medium transition-all hover:text-primary',
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn('h-5 w-5 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
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

  const { openItems } = context;
  const itemElement = React.useContext(AccordionItemContext);

  // Get value from parent AccordionItem
  const value = itemElement || '';
  const isOpen = openItems.includes(value);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className={cn('pb-4 pt-0 text-muted-foreground', className)}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
