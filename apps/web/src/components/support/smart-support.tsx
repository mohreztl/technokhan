'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, Headphones, Send, Sparkles, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSupportReply } from './support-replies';

interface Message {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  href?: string;
  linkLabel?: string;
}

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: 'assistant',
  text: 'سلام! راهنمای انتخاب گجت و پشتیبانی تکنو خان هستم. چه چیزی پیدا می‌کنید؟',
};

const QUICK_PROMPTS = ['پیشنهاد شارژر', 'شرایط ارسال', 'پیگیری سفارش'];

export function SmartSupport() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = React.useState('');
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const feedRef = React.useRef<HTMLDivElement>(null);
  const nextId = React.useRef(1);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.show();
      inputRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  React.useEffect(() => {
    const feed = feedRef.current;
    if (feed) feed.scrollTop = feed.scrollHeight;
  }, [messages]);

  const send = (value: string) => {
    const text = value.trim();
    if (!text) return;
    const reply = getSupportReply(text);
    const userMessage: Message = { id: nextId.current++, role: 'user', text };
    const assistantMessage: Message = { id: nextId.current++, role: 'assistant', ...reply };
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput('');
  };

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'بستن پشتیبانی هوشمند' : 'باز کردن پشتیبانی هوشمند'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-24 left-3 z-40 flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-[#151a1b] px-4 text-sm font-bold text-white shadow-panel transition-transform hover:-translate-y-0.5 sm:left-6 lg:bottom-6"
      >
        <Sparkles className="size-4 text-[#c8f45a]" aria-hidden="true" />
        <span className="hidden sm:inline">پشتیبانی هوشمند</span>
        <span className="sm:hidden">پشتیبانی</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="smart-support-title"
        className="fixed bottom-40 left-3 z-50 m-0 max-h-[min(680px,72dvh)] w-[calc(100%-1.5rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-border bg-popover p-0 text-popover-foreground shadow-panel [&:not([open])]:hidden open:flex sm:left-6 lg:bottom-24"
        onClose={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        <header className="flex items-center gap-3 bg-[#151a1b] p-4 text-white">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#c8f45a] text-[#111315]"><Bot className="size-5" aria-hidden="true" /></span>
          <div className="min-w-0 flex-1"><h2 id="smart-support-title" className="font-black">پشتیبانی هوشمند</h2><p className="mt-0.5 text-xs text-white/60">راهنمای انتخاب و خدمات تکنو خان</p></div>
          <button type="button" aria-label="بستن" onClick={() => setOpen(false)} className="flex size-11 cursor-pointer items-center justify-center rounded-xl hover:bg-white/10"><X className="size-5" aria-hidden="true" /></button>
        </header>

        <div ref={feedRef} className="min-h-56 flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite" aria-label="گفت‌وگوی پشتیبانی">
          {messages.map((message) => (
            <div key={message.id} className={message.role === 'user' ? 'flex justify-start' : 'flex justify-end'}>
              <div className={message.role === 'user' ? 'max-w-[88%] rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-sm leading-7 text-primary-foreground' : 'max-w-[92%] rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm leading-7'}>
                <div className="mb-1 flex items-center gap-1.5 text-[10px] opacity-65">{message.role === 'assistant' ? <Bot className="size-3" aria-hidden="true" /> : <UserRound className="size-3" aria-hidden="true" />}{message.role === 'assistant' ? 'راهنمای تکنو' : 'شما'}</div>
                <p>{message.text}</p>
                {message.href && <Link href={message.href} onClick={() => setOpen(false)} className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-bold text-secondary">{message.linkLabel}<ArrowLeft className="size-3.5" aria-hidden="true" /></Link>}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-3">
          <div className="hide-scrollbar mb-2 flex gap-2 overflow-x-auto" aria-label="پرسش‌های پیشنهادی">
            {QUICK_PROMPTS.map((prompt) => <button key={prompt} type="button" onClick={() => send(prompt)} className="min-h-11 shrink-0 cursor-pointer rounded-full border border-border px-3 text-xs hover:border-secondary">{prompt}</button>)}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); send(input); }} className="flex items-end gap-2">
            <label htmlFor="smart-support-input" className="sr-only">پیام برای پشتیبانی</label>
            <textarea
              ref={inputRef}
              id="smart-support-input"
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' || event.shiftKey) return;
                event.preventDefault();
                if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
                event.currentTarget.form?.requestSubmit();
              }}
              placeholder="پیام خود را بنویسید…"
              className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-secondary"
            />
            <Button type="submit" size="icon" aria-label="ارسال پیام" disabled={!input.trim()}><Send className="size-4" aria-hidden="true" /></Button>
          </form>
          <Link href="/contact" onClick={() => setOpen(false)} className="mt-2 flex min-h-11 items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"><Headphones className="size-3.5" aria-hidden="true" />ارتباط با کارشناس پشتیبانی</Link>
        </div>
      </dialog>
    </>
  );
}
