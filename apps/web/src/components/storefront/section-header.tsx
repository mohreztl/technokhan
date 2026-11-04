import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

/** Shared editorial heading for storefront sections with an optional collection link. */
export function SectionHeader({ title, description, href, linkLabel = 'مشاهده همه' }: SectionHeaderProps) {
  return (
    <div className="mb-7 flex items-end justify-between gap-5 border-b border-border pb-5">
      <div>
        <h2 className="text-balance text-2xl font-black tracking-tight text-foreground sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>}
      </div>
      {href && <Link href={href} className="group hidden min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-foreground sm:inline-flex">{linkLabel}<ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180" aria-hidden="true" /></Link>}
    </div>
  );
}
