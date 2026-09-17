'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { OtpForm } from '@/components/auth/otp-form';
import { useAuth } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';

/**
 * Inline login (bottom sheet on mobile, dialog on desktop) so booking and
 * checkout never have to leave the page. Open it with `useRequireAuth()`.
 */
export function LoginSheet() {
  const open = useUIStore((s) => s.loginSheetOpen);
  const redirect = useUIStore((s) => s.loginRedirect);
  const close = useUIStore((s) => s.closeLoginSheet);
  const router = useRouter();

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) close();
      }}
      title="ورود یا ثبت‌نام"
      description="برای ادامه، شماره موبایل خود را وارد کنید؛ کد تأیید پیامک می‌شود."
      snapPoints={[0.72, 0.92]}
      desktopClassName="max-w-md"
    >
      <div className="pt-2">
        <OtpForm
          compact
          onSuccess={() => {
            const target = redirect;
            close();
            if (target) router.push(target);
          }}
        />
      </div>
    </ResponsiveDialog>
  );
}

/**
 * Returns `ensureAuth(redirect?)`: true when the user is signed in, otherwise
 * opens the login sheet (navigating to `redirect` after success) and returns false.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const openLoginSheet = useUIStore((s) => s.openLoginSheet);
  return useCallback(
    (redirect?: string) => {
      if (isAuthenticated) return true;
      openLoginSheet(redirect);
      return false;
    },
    [isAuthenticated, openLoginSheet]
  );
}
