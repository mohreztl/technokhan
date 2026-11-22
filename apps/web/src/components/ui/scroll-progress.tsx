import { cn } from '@/lib/utils';

export function ScrollProgress({ className, color = 'bg-secondary' }: { className?: string; color?: string }) {
  return (
    <div className={cn('scroll-progress pointer-events-none fixed inset-x-0 top-0 z-60 h-1', className)} aria-hidden="true">
      <div className={cn('scroll-progress-bar h-full origin-right', color)} />
    </div>
  );
}
