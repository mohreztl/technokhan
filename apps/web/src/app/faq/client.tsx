'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { FAQ, toPersianDigits } from '@technokhan/shared';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

/** Searchable Persian FAQ accordion with category labels and keyboard access. */
export function FaqClient() {
  const [query, setQuery] = React.useState('');
  const items = FAQ.filter((item) => `${item.question} ${item.answer} ${item.category}`.toLocaleLowerCase('fa').includes(query.trim().toLocaleLowerCase('fa')));
  return (
    <div className="container-custom max-w-4xl py-8 sm:py-12">
      <header className="mb-8 text-center"><Badge variant="original">پاسخ روشن، پیش از انتخاب</Badge><h1 className="mt-4 text-4xl font-black">سوالات متداول تکنو خان</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">اصالت، ارسال، گارانتی، پرداخت و فناوری؛ بدون پاسخ مبهم.</p></header>
      <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} label="جستجو در سوالات" placeholder="مثلاً گارانتی یا GaN" startIcon={<Search />} />
      <p className="mt-4 text-xs text-muted-foreground">{toPersianDigits(items.length)} پاسخ</p>
      <Accordion type="single" defaultValue="faq-authenticity" className="mt-5">
        {items.map((item) => <AccordionItem key={item.id} value={item.id ?? `faq-${item.question}`}><AccordionTrigger><span className="flex items-center gap-3"><Badge variant="muted" size="sm">{item.category}</Badge>{item.question}</span></AccordionTrigger><AccordionContent>{item.answer}</AccordionContent></AccordionItem>)}
      </Accordion>
    </div>
  );
}
