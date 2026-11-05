'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Booking, Service } from '@technokhan/shared';
import { CONTACT, SERVICES, computeQuote, createBookingSchema, findService } from '@technokhan/shared';
import { RollingNumber } from '@/components/creative';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { showToast } from '@/components/ui/toaster';
import { useRequireAuth } from '@/components/auth/login-sheet';
import { useAuth } from '@/lib/store/auth-store';
import { useGarageStore } from '@/lib/store/garage-store';
import { useCreateBooking } from '@/lib/hooks';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { clearDraft, saveDraft, type BookingStepIndex } from '@/lib/booking/draft';
import {
  LAST_STEP,
  WIZARD_STEPS,
  draftToVehicle,
  firstInvalidStep,
  initDraft,
  parseBookingParams,
  restoreDraft,
  validateStep,
  vehicleModelLabel,
  wizardReducer,
  type StepErrors,
} from '@/lib/booking/wizard';
import { cn } from '@/lib/utils';
import { WizardStepper } from './wizard-stepper';
import { BookingWizardSkeleton } from './wizard-skeleton';
import { BookingSummaryCard } from './booking-summary-card';
import { BookingSuccess } from './booking-success';
import { StepService } from './step-service';
import { StepSchedule } from './step-schedule';
import { StepVehicle } from './step-vehicle';
import { StepReview } from './step-review';

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

const LOCATION_LABELS = { center: 'مرکز اتولانژ', onsite: 'در محل مشتری' } as const;

/**
 * Four-step booking flow. The draft lives in a reducer mirrored to
 * `sessionStorage`; URL params (`service, size, addons, color, finish, date`)
 * seed it and always win over the stored draft.
 */
export function BookingWizard() {
  const searchParams = useSearchParams();
  const params = useMemo(() => parseBookingParams(searchParams), [searchParams]);
  const [draft, dispatch] = useReducer(wizardReducer, params, (p) => initDraft(p, SERVICES));

  const [ready, setReady] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [errors, setErrors] = useState<StepErrors>({});
  const [maxReached, setMaxReached] = useState<BookingStepIndex>(0);
  const [result, setResult] = useState<Booking | null>(null);

  const reduced = useReducedMotion();
  const { isAuthenticated } = useAuth();
  const ensureAuth = useRequireAuth();
  const createBooking = useCreateBooking();
  const addVehicle = useGarageStore((s) => s.addVehicle);
  const pendingSubmit = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  /* restore the stored draft once, after mount (SSR renders the URL-only draft) */
  useEffect(() => {
    const restored = restoreDraft(initDraft(params, SERVICES), params, SERVICES);
    dispatch({ type: 'restore', draft: restored });
    setMaxReached(restored.step);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* persist every change while the flow is in progress */
  useEffect(() => {
    if (ready && !result) saveDraft(draft);
  }, [draft, ready, result]);

  const service: Service = useMemo(
    () => findService(draft.serviceId) ?? (SERVICES[0] as Service),
    [draft.serviceId]
  );
  const quote = useMemo(
    () => computeQuote(service, draft.size, draft.addonIds),
    [service, draft.size, draft.addonIds]
  );

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }, [reduced]);

  const goTo = useCallback(
    (step: BookingStepIndex, dir: 1 | -1) => {
      setDirection(dir);
      setErrors({});
      dispatch({ type: 'step', step });
      setMaxReached((m) => (step > m ? step : m));
      scrollToTop();
    },
    [scrollToTop]
  );

  const doSubmit = useCallback(async () => {
    const address = draft.location === 'onsite' ? `آدرس: ${draft.onsiteAddress.trim()}` : '';
    const notes = [address, draft.notes.trim()].filter(Boolean).join('\n').slice(0, 500);

    const parsed = createBookingSchema.safeParse({
      serviceId: draft.serviceId,
      date: draft.date,
      timeSlot: draft.timeSlot,
      location: LOCATION_LABELS[draft.location],
      carModel: vehicleModelLabel(draft.vehicle),
      carYear: draft.vehicle.year,
      carColor: draft.vehicle.color,
      carPlate: draft.vehicle.plate.trim() || undefined,
      vehicleSize: draft.size,
      addonIds: draft.addonIds,
      notes: notes || undefined,
      totalPrice: quote.total,
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'اطلاعات رزرو کامل نیست';
      setErrors({ submit: message });
      showToast.error(message);
      return;
    }

    try {
      const booking = await createBooking.mutateAsync(parsed.data);
      if (draft.saveToGarage && !draft.vehicle.garageId) {
        addVehicle(draftToVehicle(draft.vehicle, draft.size));
      }
      clearDraft();
      setErrors({});
      setResult(booking);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'ثبت رزرو ناموفق بود';
      setErrors({ submit: message });
      showToast.error('ثبت رزرو ناموفق بود', message);
    }
  }, [draft, quote.total, createBooking, addVehicle]);

  const doSubmitRef = useRef(doSubmit);
  useEffect(() => {
    doSubmitRef.current = doSubmit;
  }, [doSubmit]);

  /* the user signed in through the inline sheet → finish the submission */
  useEffect(() => {
    if (isAuthenticated && pendingSubmit.current) {
      pendingSubmit.current = false;
      void doSubmitRef.current();
    }
  }, [isAuthenticated]);

  const handleNext = () => {
    const stepErrors = validateStep(draft.step, draft);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      showToast.error(Object.values(stepErrors)[0] ?? 'لطفاً فیلدهای الزامی را کامل کنید');
      return;
    }
    if (draft.step < LAST_STEP) {
      goTo((draft.step + 1) as BookingStepIndex, 1);
      return;
    }
    const invalid = firstInvalidStep(draft);
    if (invalid !== null) {
      goTo(invalid, -1);
      setErrors(validateStep(invalid, draft));
      return;
    }
    if (!ensureAuth()) {
      pendingSubmit.current = true;
      return;
    }
    void doSubmit();
  };

  const handleBack = () => {
    if (draft.step > 0) goTo((draft.step - 1) as BookingStepIndex, -1);
  };

  const handleStepSelect = (index: number) => {
    const target = index as BookingStepIndex;
    if (target === draft.step) return;
    if (target < draft.step) {
      goTo(target, -1);
      return;
    }
    const invalid = firstInvalidStep(draft);
    if (invalid !== null && invalid < target) {
      goTo(invalid, invalid > draft.step ? 1 : -1);
      setErrors(validateStep(invalid, draft));
      return;
    }
    goTo(target, 1);
  };

  if (result) {
    return (
      <BookingSuccess
        booking={result}
        service={service}
        durationMinutes={quote.durationMinutes}
        locationLabel={draft.location === 'onsite' ? draft.onsiteAddress.trim() : CONTACT.address}
      />
    );
  }

  if (!ready) return <BookingWizardSkeleton />;

  const submitting = createBooking.isPending;
  const isLast = draft.step === LAST_STEP;
  const stepMeta = WIZARD_STEPS[draft.step];
  const stepProps = { draft, dispatch, errors, service, quote };

  return (
    <div ref={topRef} className="container-custom scroll-mt-24 pb-24 lg:pb-16">
      <header className="mb-6 text-center lg:text-start">
        <p className="text-xs font-semibold tracking-[0.3em] text-secondary">رزرو آنلاین</p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl">{stepMeta.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{stepMeta.hint}</p>
      </header>

      <WizardStepper
        steps={WIZARD_STEPS}
        current={draft.step}
        maxReached={maxReached}
        onSelect={handleStepSelect}
        className="mx-auto mb-8 max-w-xl lg:mx-0"
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
        <section className="min-w-0">
          {/* Keyed enter animation, deliberately without AnimatePresence: mode="wait" holds the
              new step back until the old one reports its exit, and when that report never
              arrives the wizard is stranded on the previous step. */}
          <motion.div
            key={draft.step}
            custom={direction}
            variants={reduced ? fadeVariants : slideVariants}
            initial="enter"
            animate="center"
            transition={{ duration: reduced ? 0.15 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {draft.step === 0 && <StepService {...stepProps} />}
            {draft.step === 1 && <StepSchedule {...stepProps} />}
            {draft.step === 2 && <StepVehicle {...stepProps} />}
            {draft.step === 3 && (
              <StepReview {...stepProps} onEdit={(step) => goTo(step, -1)} />
            )}
          </motion.div>

          {/* desktop navigation */}
          <div className="mt-8 hidden items-center justify-between gap-4 lg:flex">
            <Button variant="ghost" size="lg" onClick={handleBack} disabled={draft.step === 0 || submitting}>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
              قبلی
            </Button>
            <Button size="lg" onClick={handleNext} loading={submitting} loadingText="در حال ثبت…">
              {isLast ? 'ثبت رزرو' : 'ادامه'}
              {!isLast && <ArrowLeft className="h-5 w-5" aria-hidden="true" />}
            </Button>
          </div>
        </section>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <BookingSummaryCard draft={draft} service={service} quote={quote} />
        </aside>
      </div>

      {/* mobile sticky bar (sits above the tab bar) */}
      <div
        className={cn(
          'fixed inset-x-0 z-30 lg:hidden',
          'bottom-[calc(4rem+env(safe-area-inset-bottom))]'
        )}
      >
        <div className="glass-effect-strong border-t border-border/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground">جمع تخمینی</p>
              <p className="text-lg font-black leading-tight text-secondary">
                <RollingNumber value={quote.total} />
                <span className="ms-1 text-xs font-medium text-foreground">تومان</span>
              </p>
            </div>
            {draft.step > 0 && (
              <IconButton
                label="مرحلهٔ قبل"
                icon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}
                variant="ghost"
                onClick={handleBack}
                disabled={submitting}
              />
            )}
            <Button
              size="lg"
              className="min-w-[136px]"
              onClick={handleNext}
              loading={submitting}
              loadingText="در حال ثبت…"
            >
              {isLast ? 'ثبت رزرو' : 'ادامه'}
              {!isLast && <ArrowLeft className="h-5 w-5" aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
