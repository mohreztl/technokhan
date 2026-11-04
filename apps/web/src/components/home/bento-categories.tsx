import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CATEGORIES } from '@autolounge/shared';
import { CATEGORY_MEDIA } from '@/content/media-assets';
import { cn } from '@/lib/utils';

/** Asymmetric image-led category grid with restrained perspective hover feedback. */
export function BentoCategories() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[240px]">
      {CATEGORIES.map((category, index) => {
        const media = CATEGORY_MEDIA[category.id as keyof typeof CATEGORY_MEDIA];
        return (
          <Link key={category.id} href={`/category/${category.id}`} className={cn('group relative min-h-56 overflow-hidden rounded-2xl border border-border bg-card transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-secondary/50', index === 0 && 'sm:col-span-2 lg:row-span-2 lg:min-h-0', index === 3 && 'lg:col-span-2')}>
            <Image src={media.src} alt={media.alt} fill sizes={index === 0 ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 640px) 100vw, 25vw'} className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
            <span className="absolute inset-0 bg-gradient-to-t from-[#090b0cf2] via-[#090b0c33] to-transparent" />
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
              <span><span className="block text-lg font-black">{category.name}</span><span className="mt-1 block text-xs leading-6 text-white/65">{category.description}</span></span>
              <ArrowLeft className="mb-1 size-5 shrink-0 text-[#c8f45a] transition-transform group-hover:-translate-x-1 rtl:rotate-180" aria-hidden="true" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
