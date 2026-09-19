'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Car, Check, MapPin, X } from 'lucide-react';
import type { VehicleSize } from '@autolounge/shared';
import { CAR_COLORS, CONTACT, VEHICLE_SIZES, toPersianDigits } from '@autolounge/shared';
import { PlateInput } from '@/components/creative';
import { Input, fieldErrorClass } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Radio } from '@/components/ui/radio';
import { Checkbox } from '@/components/ui/checkbox';
import { useGarageStore, vehicleDisplayName } from '@/lib/store/garage-store';
import { useHydrated } from '@/lib/store/hydration';
import type { BookingVehicleDraft } from '@/lib/booking/draft';
import { OTHER_BRAND, brandOptions, jalaliYearOptions, modelOptions } from '@/lib/booking/wizard';
import { cn } from '@/lib/utils';
import type { StepProps } from './step-props';

/** Step ۳ — vehicle details, plate, location and notes. */
export function StepVehicle({ draft, dispatch, errors }: StepProps) {
  const vehicles = useGarageStore((s) => s.vehicles);
  const hydrated = useHydrated(useGarageStore);
  const v = draft.vehicle;
  const isOther = v.brand === OTHER_BRAND;

  const brands = useMemo(brandOptions, []);
  const models = useMemo(() => modelOptions(v.brand), [v.brand]);
  const years = useMemo(jalaliYearOptions, []);
  const sizes = useMemo(() => VEHICLE_SIZES.map((s) => ({ value: s.id, label: s.label })), []);

  const patch = (p: Partial<BookingVehicleDraft>) => dispatch({ type: 'vehicle', patch: p });

  const onModel = (name: string) => {
    patch({ model: name });
    const match = models.find((m) => m.value === name);
    if (match?.size) dispatch({ type: 'size', size: match.size });
  };

  return (
    <div className="space-y-6">
      {hydrated && vehicles.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold">خودروهای گاراژ شما</h3>
          <div className="hide-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
            {vehicles.map((car) => {
              const active = v.garageId === car.id;
              return (
                <button
                  key={car.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    active
                      ? dispatch({ type: 'clear-vehicle' })
                      : dispatch({ type: 'fill-vehicle', vehicle: car })
                  }
                  className={cn(
                    'flex min-h-[48px] shrink-0 snap-start items-center gap-2 rounded-xl border px-3 py-2 text-start transition-colors',
                    active
                      ? 'border-secondary bg-secondary/15 shadow-glow-secondary'
                      : 'border-border bg-card hover:border-secondary/60'
                  )}
                >
                  <Car className={cn('h-5 w-5 shrink-0', active ? 'text-secondary' : 'text-muted-foreground')} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{vehicleDisplayName(car)}</span>
                    <span className="block text-xs text-muted-foreground">
                      {car.color}
                      {car.plate ? ` · ${toPersianDigits(car.plate)}` : ''}
                    </span>
                  </span>
                  {active && <X className="ms-1 h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <Select
          id="vehicle-brand"
          label="برند خودرو"
          required
          options={brands}
          placeholder="انتخاب برند"
          value={v.brand}
          onChange={(e) => patch({ brand: e.target.value, model: '' })}
          error={errors.brand}
          startIcon={<Car className="h-5 w-5" aria-hidden="true" />}
        />
        {isOther ? (
          <Input
            id="vehicle-model"
            label="مدل خودرو"
            required
            value={v.model}
            onChange={(e) => patch({ model: e.target.value })}
            error={errors.model}
            placeholder="مثلاً هایما S7"
            maxLength={60}
          />
        ) : (
          <Select
            id="vehicle-model"
            label="مدل خودرو"
            required
            options={models}
            placeholder={v.brand ? 'انتخاب مدل' : 'ابتدا برند را انتخاب کنید'}
            disabled={!v.brand}
            value={v.model}
            onChange={(e) => onModel(e.target.value)}
            error={errors.model}
          />
        )}
        <Select
          id="vehicle-year"
          label="سال ساخت"
          required
          options={years}
          placeholder="انتخاب سال"
          value={v.year ? String(v.year) : ''}
          onChange={(e) => patch({ year: e.target.value ? Number(e.target.value) : null })}
          error={errors.year}
        />
        <Select
          id="vehicle-size"
          label="اندازهٔ خودرو"
          options={sizes}
          value={draft.size}
          onChange={(e) => dispatch({ type: 'size', size: e.target.value as VehicleSize })}
          hint="بر اساس مدل پیشنهاد می‌شود و روی قیمت اثر دارد"
        />
      </section>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          رنگ خودرو <span className="text-destructive">*</span>
        </legend>
        <div role="radiogroup" aria-label="رنگ خودرو" className="flex flex-wrap gap-2">
          {CAR_COLORS.map((c) => {
            const active = v.color === c.name;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => patch({ color: c.name })}
                className={cn(
                  'flex min-h-[44px] items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary/50',
                  active
                    ? 'border-secondary bg-secondary/15 shadow-glow-secondary'
                    : 'border-border bg-card hover:border-secondary/60'
                )}
              >
                <span
                  aria-hidden="true"
                  className="h-5 w-5 rounded-full border border-black/10 shadow-inner"
                  style={{ backgroundColor: c.hex }}
                />
                {c.name}
                {active && <Check className="h-4 w-4 text-secondary" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        {errors.color && (
          <p role="alert" className={cn(fieldErrorClass, 'mt-2')}>
            {errors.color}
          </p>
        )}
      </fieldset>

      <PlateInput
        id="vehicle-plate"
        label="پلاک خودرو (اختیاری)"
        value={v.plate}
        onChange={(value) => patch({ plate: value })}
        error={errors.plate}
      />

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-medium">محل انجام خدمت</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Radio
            variant="card"
            name="booking-location"
            value="center"
            checked={draft.location === 'center'}
            onChange={() => dispatch({ type: 'location', location: 'center' })}
            icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
            label="مرکز اتولانژ"
            description={CONTACT.address}
          />
          <Radio
            variant="card"
            name="booking-location"
            value="onsite"
            checked={draft.location === 'onsite'}
            onChange={() => dispatch({ type: 'location', location: 'onsite' })}
            icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
            label="در محل شما"
            description="اعزام تیم سیار به آدرس شما"
          />
        </div>
        <AnimatePresence initial={false}>
          {draft.location === 'onsite' && (
            <motion.div
              key="onsite-address"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <Textarea
                id="onsite-address"
                label="آدرس محل"
                required
                rows={3}
                maxLength={300}
                value={draft.onsiteAddress}
                onChange={(e) => dispatch({ type: 'onsite-address', value: e.target.value })}
                error={errors.onsiteAddress}
                placeholder="شهر، خیابان، کوچه، پلاک…"
                hint="هزینهٔ اعزام بر اساس مسافت محاسبه و پیش از مراجعه به شما اطلاع داده می‌شود."
                containerClassName="pt-1"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </fieldset>

      <Textarea
        id="booking-notes"
        label="توضیحات (اختیاری)"
        rows={3}
        maxLength={500}
        value={draft.notes}
        onChange={(e) => dispatch({ type: 'notes', value: e.target.value })}
        error={errors.notes}
        placeholder="مثلاً: خط و خش روی گلگیر جلو، حساسیت به مواد شوینده…"
      />

      {!v.garageId && (
        <Checkbox
          id="save-to-garage"
          variant="row"
          label="ذخیره در گاراژ"
          description="برای رزروهای بعدی مشخصات این خودرو را به خاطر می‌سپاریم"
          checked={draft.saveToGarage}
          onChange={(e) => dispatch({ type: 'save-to-garage', value: e.target.checked })}
        />
      )}
    </div>
  );
}
