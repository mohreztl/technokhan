'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight, LogIn, ShoppingBag } from 'lucide-react';
import type { Address, PaymentMethod } from '@technokhan/shared';
import { ROUTES, createOrderSchema, effectivePrice } from '@technokhan/shared';
import { RollingNumber } from '@/components/creative';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { showToast } from '@/components/ui/toaster';
import { useRequireAuth } from '@/components/auth/login-sheet';
import { WizardStepper } from '@/components/booking/wizard-stepper';
import { useAddresses, useCreateOrder, useRequestPayment } from '@/lib/hooks';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useAuth } from '@/lib/store/auth-store';
import { useCart, useCartStore } from '@/lib/store/cart-store';
import { useHydrated } from '@/lib/store/hydration';
import { savePendingPayment } from './pending-payment';
import { CheckoutSummary } from './checkout-summary';
import { StepAddress } from './step-address';
import { COD_MAX_SUBTOTAL, StepPayment } from './step-payment';
import { StepReview } from './step-review';

const CHECKOUT_STEPS = [
  { key: 'address', label: 'آدرس', title: 'آدرس ارسال', hint: 'سفارش به کدام آدرس ارسال شود؟' },
  { key: 'payment', label: 'پرداخت', title: 'روش پرداخت', hint: 'پرداخت آنلاین یا در محل' },
  { key: 'review', label: 'بازبینی', title: 'بازبینی و ثبت', hint: 'جزئیات سفارش را بررسی کنید' },
] as const;

type StepIndex = 0 | 1 | 2;

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? -32 : 32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
};

const fadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const addressKey = (a: Address | null) => (a ? (a.id ?? JSON.stringify(a)) : null);

function CheckoutSkeleton() {
  return (
    <div className="container-custom pb-16" aria-busy="true" aria-label="در حال بارگذاری">
      <Skeleton className="mb-2 h-8 w-40" />
      <Skeleton className="mb-8 h-4 w-64" />
      <div className="mx-auto mb-8 flex max-w-md justify-between">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="space-y-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="hidden h-72 rounded-2xl lg:block" />
      </div>
    </div>
  );
}

function AnonymousCard({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="container-custom pb-16">
      <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-6 text-center shadow-luxury">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <LogIn className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-black">برای تکمیل خرید وارد شوید</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          سبد خرید شما محفوظ می‌ماند. با شمارهٔ موبایل وارد شوید تا آدرس و سفارش‌هایتان ذخیره شود.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" onClick={onLogin}>
            <LogIn className="h-5 w-5" aria-hidden="true" />
            ورود / ثبت‌نام
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href={ROUTES.CART}>
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              بازگشت به سبد خرید
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Three-step checkout (address → payment → review). Online payments hand off
 * to the gateway and come back through `/checkout/callback`; cash on delivery
 * lands on the order page directly.
 */
export function CheckoutFlow() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { status } = useAuth();
  const ensureAuth = useRequireAuth();
  const cartHydrated = useHydrated(useCartStore);
  const { items, totals, couponCode, clearCart } = useCart();
  const addresses = useAddresses();
  const createOrder = useCreateOrder();
  const requestPayment = useRequestPayment();

  const [step, setStep] = useState<StepIndex>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [maxReached, setMaxReached] = useState<StepIndex>(0);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [localAddresses, setLocalAddresses] = useState<Address[]>([]);
  const [method, setMethod] = useState<PaymentMethod>('zarinpal');
  const [notes, setNotes] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === 'authenticated';
  // memoised so the preselect effect below does not re-run on every render
  const savedAddresses = useMemo(() => addresses.data ?? [], [addresses.data]);
  const allAddresses = useMemo(() => [...savedAddresses, ...localAddresses], [savedAddresses, localAddresses]);

  /* empty cart → back to the cart page (never while idle / submitting) */
  useEffect(() => {
    if (cartHydrated && status !== 'idle' && items.length === 0 && !submitting) {
      router.replace(ROUTES.CART);
    }
  }, [cartHydrated, status, items.length, submitting, router]);

  /* preselect the default (or first) saved address */
  useEffect(() => {
    if (selectedAddress || savedAddresses.length === 0) return;
    setSelectedAddress(savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0] ?? null);
  }, [savedAddresses, selectedAddress]);

  /* COD is capped */
  useEffect(() => {
    if (method === 'cod' && totals.subtotal > COD_MAX_SUBTOTAL) setMethod('zarinpal');
  }, [method, totals.subtotal]);

  const goTo = useCallback(
    (next: StepIndex, dir: 1 | -1) => {
      setDirection(dir);
      setError(null);
      setStep(next);
      setMaxReached((m) => (next > m ? next : m));
      topRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    },
    [reduced]
  );

  const validateStep = (index: StepIndex): string | null => {
    if (index === 0 && !selectedAddress) return 'آدرس ارسال را انتخاب یا اضافه کنید';
    if (index === 1 && method === 'cod' && totals.subtotal > COD_MAX_SUBTOTAL) return 'پرداخت در محل برای این مبلغ ممکن نیست';
    if (index === 2 && !accepted) return 'برای ثبت سفارش باید قوانین را بپذیرید';
    return null;
  };

  const submit = async () => {
    const message = validateStep(2) ?? validateStep(0) ?? validateStep(1);
    if (message) {
      setError(message);
      showToast.error(message);
      return;
    }
    if (!ensureAuth()) return;

    const parsed = createOrderSchema.safeParse({
      items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity, unitPrice: effectivePrice(i.product), selection: i.selection })),
      shippingAddress: selectedAddress,
      paymentMethod: method,
      couponCode: couponCode ?? undefined,
      notes: notes.trim() || undefined,
    });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'اطلاعات سفارش کامل نیست';
      setError(msg);
      showToast.error(msg);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let orderId = createdOrderId;
      if (!orderId) {
        const order = await createOrder.mutateAsync(parsed.data);
        orderId = order.id;
        setCreatedOrderId(order.id);
      }

      if (method === 'zarinpal') {
        const r = await requestPayment.mutateAsync({ orderId, callbackUrl: '/checkout/callback' });
        savePendingPayment({ orderId, authority: r.authority, amount: r.amount });
        window.location.assign(r.paymentUrl);
        return; // keep the busy state while the browser navigates
      }

      clearCart();
      showToast.orderSuccess(orderId);
      router.replace(`${ROUTES.ORDERS}/${orderId}?new=1`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'ثبت سفارش ناموفق بود';
      setError(msg);
      showToast.error('ثبت سفارش ناموفق بود', msg);
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    const message = validateStep(step);
    if (message) {
      setError(message);
      showToast.error(message);
      return;
    }
    if (step < 2) {
      goTo((step + 1) as StepIndex, 1);
      return;
    }
    void submit();
  };

  const handleBack = () => {
    if (step > 0) goTo((step - 1) as StepIndex, -1);
  };

  const handleStepSelect = (index: number) => {
    const target = index as StepIndex;
    if (target === step) return;
    if (target < step) {
      goTo(target, -1);
      return;
    }
    for (let i = step; i < target; i++) {
      const message = validateStep(i as StepIndex);
      if (message) {
        setError(message);
        return;
      }
    }
    goTo(target, 1);
  };

  if (status === 'idle' || !cartHydrated) return <CheckoutSkeleton />;
  if (!isAuthenticated) return <AnonymousCard onLogin={() => ensureAuth()} />;
  if (items.length === 0) return <CheckoutSkeleton />;

  const meta = CHECKOUT_STEPS[step];
  const isLast = step === 2;
  const submitLabel = method === 'cod' ? 'ثبت سفارش' : 'پرداخت و ثبت سفارش';
  const busy = submitting || createOrder.isPending || requestPayment.isPending;

  return (
    <div ref={topRef} className="container-custom scroll-mt-24 pb-28 lg:pb-16">
      <header className="mb-6 text-center lg:text-start">
        <p className="text-xs font-semibold tracking-[0.3em] text-secondary">تسویه‌حساب</p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl">{meta.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{meta.hint}</p>
      </header>

      <WizardStepper
        steps={CHECKOUT_STEPS}
        current={step}
        maxReached={maxReached}
        onSelect={handleStepSelect}
        layoutId="checkout-stepper-ring"
        className="mx-auto mb-8 max-w-md lg:mx-0"
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
        <section className="min-w-0">
          {/* Keyed enter animation, deliberately without AnimatePresence: mode="wait" holds the
              new step back until the old one reports its exit, and when that report never
              arrives the wizard is stranded on the previous step. */}
          <motion.div
            key={step}
            custom={direction}
            variants={reduced ? fadeVariants : slideVariants}
            initial="enter"
            animate="center"
            transition={{ duration: reduced ? 0.15 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <StepAddress
                addresses={allAddresses}
                loading={addresses.isLoading}
                loadError={addresses.isError ? 'دریافت آدرس‌ها ناموفق بود.' : null}
                onRetry={() => addresses.refetch()}
                selected={selectedAddress}
                onSelect={(a) => {
                  setSelectedAddress(a);
                  setError(null);
                }}
                onCreated={(a) => {
                  if (a.id?.startsWith('local-')) setLocalAddresses((prev) => [...prev, a]);
                  setSelectedAddress(a);
                  setError(null);
                }}
                error={error}
              />
            )}
            {step === 1 && (
              <StepPayment
                method={method}
                onMethodChange={(m) => {
                  setMethod(m);
                  setError(null);
                }}
                notes={notes}
                onNotesChange={setNotes}
                subtotal={totals.subtotal}
                couponCode={couponCode}
              />
            )}
            {step === 2 && (
              <StepReview
                items={items}
                address={selectedAddress}
                method={method}
                totals={totals}
                accepted={accepted}
                onAcceptedChange={(v) => {
                  setAccepted(v);
                  if (v) setError(null);
                }}
                error={error}
                onEdit={(target) => goTo(target, -1)}
              />
            )}
          </motion.div>

          {createdOrderId && error && (
            <p className="mt-4 text-sm text-muted-foreground">
              سفارش شما ثبت شده است؛ می‌توانید پرداخت را از{' '}
              <Link href={`${ROUTES.ORDERS}/${createdOrderId}`} className="font-medium text-secondary underline-offset-4 hover:underline">
                صفحهٔ سفارش
              </Link>{' '}
              انجام دهید.
            </p>
          )}

          <div className="mt-8 hidden items-center justify-between gap-4 lg:flex">
            <Button variant="ghost" size="lg" onClick={handleBack} disabled={step === 0 || busy}>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
              قبلی
            </Button>
            <Button size="lg" onClick={handleNext} loading={busy} loadingText={isLast ? 'در حال ثبت…' : undefined}>
              {isLast ? submitLabel : 'ادامه'}
              {!isLast && <ArrowLeft className="h-5 w-5" aria-hidden="true" />}
            </Button>
          </div>
        </section>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <CheckoutSummary items={items} totals={totals} />
        </aside>
      </div>

      {/* mobile sticky bar — the tab bar is hidden on /checkout, so it sits at the very bottom */}
      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <div className="glass-effect-strong border-t border-border/40 px-4 pb-safe pt-3">
          <div className="mb-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground">مبلغ قابل پرداخت</p>
              <p className="text-lg font-black leading-tight text-secondary">
                <RollingNumber value={totals.total} />
                <span className="ms-1 text-xs font-medium text-foreground">تومان</span>
              </p>
            </div>
            {step > 0 && (
              <IconButton
                label="مرحلهٔ قبل"
                icon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}
                variant="ghost"
                onClick={handleBack}
                disabled={busy}
              />
            )}
            <Button
              size="lg"
              className="min-w-[150px]"
              onClick={handleNext}
              loading={busy}
              loadingText={isLast ? 'در حال ثبت…' : undefined}
            >
              {isLast ? submitLabel : 'ادامه'}
              {!isLast && <ArrowLeft className="h-5 w-5" aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
