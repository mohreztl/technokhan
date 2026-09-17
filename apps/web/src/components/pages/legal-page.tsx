import Link from 'next/link';
import { CalendarClock, FileText, ShieldCheck } from 'lucide-react';
import type { LegalDoc } from '@autolounge/shared';
import { toPersianDigits } from '@autolounge/shared';
import { cn } from '@/lib/utils';

const sectionId = (i: number) => `section-${i + 1}`;

/** Shared renderer for /privacy and /terms: sticky table of contents on desktop, chip row on mobile. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const Icon = doc.slug === 'privacy' ? ShieldCheck : FileText;
  return (
    <div className="container-custom py-8 lg:py-14">
      <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary via-primary to-[#0B3560] p-6 text-white shadow-luxury sm:p-10">
        <div className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-secondary/25 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-secondary ring-1 ring-white/15">
            <Icon className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-black sm:text-4xl">{doc.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">{doc.description}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-secondary">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden />
              آخرین به‌روزرسانی: {toPersianDigits(doc.updatedAt)}
            </p>
          </div>
        </div>
      </header>

      {/* mobile: chip row */}
      <nav aria-label="فهرست بخش‌ها" className="hide-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 lg:hidden">
        {doc.sections.map((s, i) => (
          <a
            key={sectionId(i)}
            href={`#${sectionId(i)}`}
            className="shrink-0 rounded-full border border-border bg-background-secondary px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-secondary hover:text-secondary"
          >
            {toPersianDigits(i + 1)}. {s.heading}
          </a>
        ))}
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
        {/* desktop: sticky TOC */}
        <aside className="hidden lg:block">
          <nav aria-label="فهرست بخش‌ها" className="sticky top-28 rounded-2xl border border-border bg-background-secondary/60 p-4">
            <p className="mb-3 text-xs font-bold tracking-wide text-muted-foreground">فهرست مطالب</p>
            <ol className="space-y-1">
              {doc.sections.map((s, i) => (
                <li key={sectionId(i)}>
                  <a
                    href={`#${sectionId(i)}`}
                    className="flex items-baseline gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-secondary/10 hover:text-secondary"
                  >
                    <span className="text-xs text-secondary">{toPersianDigits(i + 1)}</span>
                    <span>{s.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
            <div className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
              سؤالی دارید؟{' '}
              <Link href="/contact" className="font-semibold text-secondary hover:underline">
                با ما تماس بگیرید
              </Link>
            </div>
          </nav>
        </aside>

        <article className="min-w-0">
          {doc.sections.map((s, i) => (
            <section
              key={sectionId(i)}
              id={sectionId(i)}
              className={cn('scroll-mt-28 border-b border-border py-7 first:pt-0 last:border-b-0', 'lg:py-9')}
            >
              <h2 className="flex items-center gap-3 text-lg font-bold sm:text-2xl">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-sm font-black text-secondary">
                  {toPersianDigits(i + 1)}
                </span>
                {s.heading}
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-8 text-foreground/85">
                {s.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
                {s.bullets && s.bullets.length > 0 && (
                  <ul className="space-y-2 ps-1">
                    {s.bullets.map((b, j) => (
                      <li key={j} className="flex gap-3">
                        <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <footer className="mt-8 rounded-2xl border border-secondary/30 bg-secondary/5 p-5 text-sm leading-7 text-foreground/80">
            این سند ممکن است به‌روزرسانی شود. ادامهٔ استفاده از خدمات اتولانژ به معنای پذیرش آخرین نسخهٔ آن است.
            برای هرگونه پرسش از طریق{' '}
            <Link href="/contact" className="font-semibold text-secondary hover:underline">
              صفحهٔ تماس
            </Link>{' '}
            با ما در ارتباط باشید.
          </footer>
        </article>
      </div>
    </div>
  );
}
