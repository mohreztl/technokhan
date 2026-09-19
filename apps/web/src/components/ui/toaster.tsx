'use client';

import * as React from 'react';
import { Toaster as SonnerToaster, toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';

/**
 * `showToast` is a plain module object, so its action buttons have no hook to
 * reach the router with. The mounted <Toaster /> parks the router here, which
 * turns those actions into client-side navigations instead of full reloads
 * that throw away the cart, the scroll position and every warm cache entry.
 */
let navigate: ((href: string) => void) | null = null;

function go(href: string) {
  if (navigate) navigate(href);
  else window.location.href = href;
}

export function Toaster() {
  const { theme } = useTheme();
  const router = useRouter();

  React.useEffect(() => {
    navigate = (href) => router.push(href);
    return () => {
      navigate = null;
    };
  }, [router]);

  return (
    <SonnerToaster
      theme={theme as 'light' | 'dark' | 'system'}
      position="top-center"
      dir="rtl"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: 'group font-sans border-border bg-background text-foreground shadow-lg',
          title: 'font-bold text-foreground',
          description: 'text-muted-foreground text-sm',
          actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
          cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80',
          success: 'border-green-500/50 bg-green-500/10',
          error: 'border-red-500/50 bg-red-500/10',
          warning: 'border-yellow-500/50 bg-yellow-500/10',
          info: 'border-blue-500/50 bg-blue-500/10',
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        error: <XCircle className="h-5 w-5 text-red-500" />,
        warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        loading: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
      }}
      expand={true}
      richColors
      closeButton
    />
  );
}

// Custom toast functions with Persian messages
export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },
  
  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },
  
  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },
  
  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
  
  // Specialized toasts for common actions
  addedToCart: (productName: string) => {
    toast.success('به سبد خرید اضافه شد', {
      description: productName,
      action: {
        label: 'مشاهده سبد',
        onClick: () => {
          useCartStore.getState().openCart();
        },
      },
    });
  },
  
  removedFromCart: (productName: string) => {
    toast.success('از سبد خرید حذف شد', {
      description: productName,
    });
  },
  
  addedToWishlist: (productName: string) => {
    toast.success('به علاقه‌مندی‌ها اضافه شد', {
      description: productName,
      action: {
        label: 'مشاهده',
        onClick: () => go('/wishlist'),
      },
    });
  },
  
  loginRequired: () => {
    toast.warning('ابتدا وارد حساب کاربری شوید', {
      action: {
        label: 'ورود',
        onClick: () => go('/login'),
      },
    });
  },
  
  bookingSuccess: (serviceName: string, date: string) => {
    toast.success('رزرو شما با موفقیت ثبت شد', {
      description: `${serviceName} - ${date}`,
      duration: 6000,
    });
  },
  
  orderSuccess: (orderId: string) => {
    toast.success('سفارش شما با موفقیت ثبت شد', {
      description: `کد سفارش: ${orderId}`,
      action: {
        label: 'پیگیری',
        onClick: () => go(`/orders/${orderId}`),
      },
      duration: 8000,
    });
  },
  
  paymentSuccess: () => {
    toast.success('پرداخت با موفقیت انجام شد', {
      duration: 6000,
    });
  },
  
  paymentFailed: (reason?: string) => {
    toast.error('پرداخت ناموفق بود', {
      description: reason || 'لطفاً دوباره تلاش کنید',
      action: {
        label: 'تلاش مجدد',
        onClick: () => go('/orders'),
      },
    });
  },
  
  networkError: () => {
    toast.error('خطا در برقراری ارتباط', {
      description: 'لطفاً اتصال اینترنت خود را بررسی کنید',
    });
  },
  
  copySuccess: (text: string) => {
    toast.success('کپی شد', {
      description: text.length > 30 ? text.substring(0, 30) + '...' : text,
      duration: 2000,
    });
  },
  
  shareSuccess: () => {
    toast.success('با موفقیت به اشتراک گذاشته شد');
  },
  
  // Promise-based toast for async operations
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: Error) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },
};

// Re-export toast for direct usage
export { toast };
