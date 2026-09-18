'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
  baseId: string;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const baseId = React.useId();
  const [internal, setInternal] = React.useState(value ?? defaultValue);
  const activeTab = value ?? internal;

  const setActiveTab = React.useCallback(
    (next: string) => {
      setInternal(next);
      onValueChange?.(next);
    },
    [onValueChange]
  );

  const ctx = React.useMemo(() => ({ activeTab, setActiveTab, baseId }), [activeTab, setActiveTab, baseId]);

  return (
    <TabsContext.Provider value={ctx}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'hide-scrollbar -mx-4 flex items-center gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0',
        className
      )}
    >
      <div className="inline-flex min-w-full items-center gap-1 rounded-xl bg-muted p-1 text-muted-foreground sm:min-w-0">
        {children}
      </div>
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const { activeTab, setActiveTab, baseId } = context;
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveTab(value)}
      className={cn(
        'relative inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'text-foreground' : 'hover:text-foreground',
        className
      )}
    >
      {isActive && (
        <motion.span
          layoutId={`${baseId}-active-tab`}
          className="absolute inset-0 -z-10 rounded-lg bg-background shadow-xs"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  const { activeTab, baseId } = context;
  if (activeTab !== value) return null;

  return (
    <motion.div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('mt-4', className)}
    >
      {children}
    </motion.div>
  );
}
