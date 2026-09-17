'use client';

import * as React from 'react';
import type { FaqItem } from '@autolounge/shared';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export interface FaqAccordionProps {
  items: FaqItem[];
  /** Value (id) of the item open by default. */
  defaultOpen?: string;
  className?: string;
}

export const faqItemValue = (item: FaqItem, index: number) => item.id ?? `faq-${index}`;

/** FAQ list in a card with one open answer at a time. */
export function FaqAccordion({ items, defaultOpen, className }: FaqAccordionProps) {
  if (items.length === 0) return null;
  return (
    <Accordion
      type="single"
      defaultValue={defaultOpen ?? []}
      className={cn(
        'divide-y divide-border rounded-2xl border border-border bg-card px-4 sm:px-6',
        className
      )}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={faqItemValue(item, index)}
          value={faqItemValue(item, index)}
          className="border-b-0"
        >
          <AccordionTrigger className="py-4 text-base">{item.question}</AccordionTrigger>
          <AccordionContent className="leading-8">{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
