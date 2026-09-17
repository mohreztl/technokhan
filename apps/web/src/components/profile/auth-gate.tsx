'use client';

import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/components/auth/login-sheet';
import { useAuth } from '@/lib/store/auth-store';

export interface AuthGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  /** shown while the auth store is still hydrating (`status === 'idle'`) */
  skeleton?: React.ReactNode;
}

function DefaultSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="در حال بارگذاری">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}

/**
 * Renders `children` only for signed-in users. While the persisted auth store
 * hydrates it shows a skeleton (never redirects); anonymous visitors get a card
 * that opens the inline login sheet.
 */
export function AuthGate({ children, title = 'برای مشاهدهٔ این بخش وارد شوید', description, skeleton }: AuthGateProps) {
  const { status } = useAuth();
  const ensureAuth = useRequireAuth();

  if (status === 'idle') return <>{skeleton ?? <DefaultSkeleton />}</>;

  if (status === 'anonymous') {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-6 text-center shadow-luxury">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <LogIn className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-black">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {description ?? 'با شمارهٔ موبایل خود وارد شوید؛ بدون نیاز به رمز عبور.'}
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={() => ensureAuth()}>
          <LogIn className="h-5 w-5" aria-hidden="true" />
          ورود / ثبت‌نام
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
