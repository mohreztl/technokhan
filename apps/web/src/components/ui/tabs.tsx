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

/** Controlled or uncontrolled tabs with linked tab/panel ids. */
export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const baseId = React.useId();
  const [internal, setInternal] = React.useState(value ?? defaultValue);
  const activeTab = value ?? internal;
  const setActiveTab = React.useCallback((next: string) => { setInternal(next); onValueChange?.(next); }, [onValueChange]);
  const ctx = React.useMemo(() => ({ activeTab, setActiveTab, baseId }), [activeTab, setActiveTab, baseId]);
  return <TabsContext.Provider value={ctx}><div className={cn('w-full', className)}>{children}</div></TabsContext.Provider>;
}

/** Scrollable tablist with roving keyboard focus in both reading directions. */
export function TabsList({ children, className, label }: { children: React.ReactNode; className?: string; label?: string }) {
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0 || tabs.length === 0) return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' ? 1 : event.key === 'ArrowRight' ? -1 : 0;
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + direction + tabs.length) % tabs.length;
    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
  };

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className={cn('hide-scrollbar -mx-4 flex items-center gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0', className)}>
      <div className="inline-flex min-w-full items-center gap-1 rounded-xl border border-border/60 bg-muted p-1 text-muted-foreground sm:min-w-0">{children}</div>
    </div>
  );
}

interface TabsTriggerProps { value: string; children: React.ReactNode; className?: string; disabled?: boolean }

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  const { activeTab, setActiveTab, baseId } = context;
  const isActive = activeTab === value;
  return (
    <button type="button" role="tab" id={`${baseId}-tab-${value}`} aria-selected={isActive} aria-controls={`${baseId}-panel-${value}`} tabIndex={isActive ? 0 : -1} disabled={disabled} onClick={() => setActiveTab(value)} className={cn('relative inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50', isActive ? 'text-foreground' : 'hover:text-foreground', className)}>
      {isActive && <motion.span layoutId={`${baseId}-active-tab`} className="absolute inset-0 -z-10 rounded-lg bg-background shadow-control" transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }} />}
      <span className="relative">{children}</span>
    </button>
  );
}

interface TabsContentProps { value: string; children: React.ReactNode; className?: string }

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  const { activeTab, baseId } = context;
  if (activeTab !== value) return null;
  return <div role="tabpanel" id={`${baseId}-panel-${value}`} aria-labelledby={`${baseId}-tab-${value}`} className={cn('mt-4 animate-fade-in', className)}>{children}</div>;
}
