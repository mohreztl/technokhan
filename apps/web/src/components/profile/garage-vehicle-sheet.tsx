'use client';

import { useMemo, useState } from 'react';
import { Car, Check } from 'lucide-react';
import type { VehicleSize } from '@technokhan/shared';
import { CAR_COLORS, VEHICLE_SIZES } from '@technokhan/shared';
import { PlateInput, isPlateComplete } from '@/components/creative';
import { Button } from '@/components/ui/button';
import { Input, fieldErrorClass } from '@/components/ui/input';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select } from '@/components/ui/select';
import { showToast } from '@/components/ui/toaster';
import { emptyVehicleDraft, type BookingVehicleDraft } from '@/lib/booking/draft';
import { OTHER_BRAND, brandOptions, draftToVehicle, jalaliYearOptions, modelOptions } from '@/lib/booking/wizard';
import { GARAGE_MAX_VEHICLES, useGarageStore } from '@/lib/store/garage-store';
import { cn } from '@/lib/utils';

export interface GarageVehicleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Errors = Partial<Record<'brand' | 'model' | 'year' | 'color' | 'plate', string>>;

function validate(v: BookingVehicleDraft): Errors {
  const errors: Errors = {};
  if (!v.brand) errors.brand = 'برند خودرو را انتخاب کنید';
  if (v.model.trim().length < 2) errors.model = 'مدل خودرو را وارد کنید';
  if (!v.year) errors.year = 'سال ساخت را انتخاب کنید';
  if (!v.color) errors.color = 'رنگ خودرو را انتخاب کنید';
  if (v.plate.trim() && !isPlateComplete(v.plate)) errors.plate = 'پلاک را کامل وارد کنید';
  return errors;
}

/** Add-a-vehicle sheet for the profile garage. */
export function GarageVehicleSheet({ open, onOpenChange }: GarageVehicleSheetProps) {
  const addVehicle = useGarageStore((s) => s.addVehicle);
  const count = useGarageStore((s) => s.vehicles.length);
  const [vehicle, setVehicle] = useState<BookingVehicleDraft>(emptyVehicleDraft);
  const [size, setSize] = useState<VehicleSize>('medium');
  const [errors, setErrors] = useState<Errors>({});

  const brands = useMemo(brandOptions, []);
  const models = useMemo(() => modelOptions(vehicle.brand), [vehicle.brand]);
  const years = useMemo(jalaliYearOptions, []);
  const sizes = useMemo(() => VEHICLE_SIZES.map((s) => ({ value: s.id, label: s.label })), []);
  const isOther = vehicle.brand === OTHER_BRAND;

  const patch = (p: Partial<BookingVehicleDraft>) => setVehicle((prev) => ({ ...prev, ...p }));

  const onModel = (name: string) => {
    patch({ model: name });
    const match = models.find((m) => m.value === name);
    if (match?.size) setSize(match.size);
  };

  const reset = () => {
    setVehicle(emptyVehicleDraft());
    setSize('medium');
    setErrors({});
  };

  const submit = () => {
    const errs = validate(vehicle);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (count >= GARAGE_MAX_VEHICLES) {
      showToast.error(`حداکثر ${GARAGE_MAX_VEHICLES} خودرو می‌توانید ذخیره کنید`);
      return;
    }
    addVehicle(draftToVehicle(vehicle, size));
    showToast.success('خودرو به گاراژ اضافه شد');
    reset();
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      title="افزودن خودرو"
      description="مشخصات خودرو برای رزروهای بعدی ذخیره می‌شود."
      snapPoints={[0.92]}
      desktopClassName="max-w-lg"
      footer={
        <Button size="lg" className="w-full" onClick={submit}>
          <Car className="h-5 w-5" aria-hidden="true" />
          ذخیره در گاراژ
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="garage-brand"
            label="برند"
            required
            options={brands}
            placeholder="انتخاب برند"
            value={vehicle.brand}
            onChange={(e) => patch({ brand: e.target.value, model: '' })}
            error={errors.brand}
          />
          {isOther ? (
            <Input
              id="garage-model"
              label="مدل"
              required
              value={vehicle.model}
              onChange={(e) => patch({ model: e.target.value })}
              error={errors.model}
              placeholder="مثلاً هایما S7"
              maxLength={60}
            />
          ) : (
            <Select
              id="garage-model"
              label="مدل"
              required
              options={models}
              placeholder={vehicle.brand ? 'انتخاب مدل' : 'ابتدا برند را انتخاب کنید'}
              disabled={!vehicle.brand}
              value={vehicle.model}
              onChange={(e) => onModel(e.target.value)}
              error={errors.model}
            />
          )}
          <Select
            id="garage-year"
            label="سال ساخت"
            required
            options={years}
            placeholder="انتخاب سال"
            value={vehicle.year ? String(vehicle.year) : ''}
            onChange={(e) => patch({ year: e.target.value ? Number(e.target.value) : null })}
            error={errors.year}
          />
          <Select
            id="garage-size"
            label="اندازهٔ خودرو"
            options={sizes}
            value={size}
            onChange={(e) => setSize(e.target.value as VehicleSize)}
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            رنگ <span className="text-destructive">*</span>
          </legend>
          <div role="radiogroup" aria-label="رنگ خودرو" className="flex flex-wrap gap-2">
            {CAR_COLORS.map((c) => {
              const active = vehicle.color === c.name;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => patch({ color: c.name })}
                  className={cn(
                    'flex min-h-[44px] items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                    active ? 'border-secondary bg-secondary/15' : 'border-border bg-card hover:border-secondary/60'
                  )}
                >
                  <span aria-hidden="true" className="h-5 w-5 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: c.hex }} />
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
          id="garage-plate"
          label="پلاک (اختیاری)"
          value={vehicle.plate}
          onChange={(value) => patch({ plate: value })}
          error={errors.plate}
        />
      </div>
    </ResponsiveDialog>
  );
}
