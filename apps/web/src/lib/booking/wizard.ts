import { z } from 'zod';
import { getYear } from 'date-fns-jalali';
import type { Service, Vehicle, VehicleSize, WrapFinish } from '@autolounge/shared';
import {
  BOOKING_MAX_DAYS_AHEAD,
  BOOKING_TIME_SLOTS,
  CLOSED_WEEKDAYS,
  VEHICLE_CATALOG,
  VEHICLE_SIZES,
  toPersianDigits,
} from '@autolounge/shared';
import { isPlateComplete } from '@/components/creative/plate-input';
import { fromIsoDate, toIsoDate } from '@/lib/jalali';
import {
  emptyDraft,
  emptyVehicleDraft,
  loadDraft,
  type BookingDraft,
  type BookingLocationChoice,
  type BookingStepIndex,
  type BookingVehicleDraft,
} from './draft';

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

export const WIZARD_STEPS = [
  { key: 'service', label: 'خدمت', title: 'انتخاب خدمت', hint: 'خدمت، اندازهٔ خودرو و افزودنی‌ها' },
  { key: 'schedule', label: 'زمان', title: 'انتخاب زمان', hint: 'روز و بازهٔ زمانی مراجعه' },
  { key: 'vehicle', label: 'خودرو', title: 'مشخصات خودرو', hint: 'مدل، رنگ، پلاک و محل انجام' },
  { key: 'review', label: 'بازبینی', title: 'بازبینی و ثبت', hint: 'جزئیات رزرو را بررسی کنید' },
] as const;

export const LAST_STEP: BookingStepIndex = 3;
export const OTHER_BRAND = 'سایر';

const VEHICLE_SIZE_IDS = VEHICLE_SIZES.map((v) => v.id) as [VehicleSize, ...VehicleSize[]];
const WRAP_FINISHES: WrapFinish[] = ['gloss', 'satin', 'matte', 'chrome'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/* ------------------------------------------------------------------ */
/* URL params                                                          */
/* ------------------------------------------------------------------ */

export interface BookingUrlParams {
  service?: string;
  size?: VehicleSize;
  addons?: string[];
  color?: string;
  finish?: WrapFinish;
  date?: string;
}

const isVehicleSize = (v: string | null): v is VehicleSize =>
  !!v && (VEHICLE_SIZE_IDS as string[]).includes(v);
const isWrapFinish = (v: string | null): v is WrapFinish =>
  !!v && (WRAP_FINISHES as string[]).includes(v);

/** Reads `?service=&size=&addons=a,b&color=&finish=&date=yyyy-MM-dd`, dropping invalid values. */
export function parseBookingParams(sp: URLSearchParams | null): BookingUrlParams {
  if (!sp) return {};
  const out: BookingUrlParams = {};
  const service = sp.get('service');
  if (service) out.service = service;
  const size = sp.get('size');
  if (isVehicleSize(size)) out.size = size;
  const addons = sp.get('addons');
  if (addons) {
    const list = addons
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    if (list.length) out.addons = list;
  }
  const color = sp.get('color');
  if (color) out.color = color;
  const finish = sp.get('finish');
  if (isWrapFinish(finish)) out.finish = finish;
  const date = sp.get('date');
  if (date && ISO_DATE.test(date) && isBookableDate(date)) out.date = date;
  return out;
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const startOfDay = (d: Date) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};

export const bookingMinDate = (): Date => startOfDay(new Date());

export const bookingMaxDate = (): Date => {
  const d = bookingMinDate();
  d.setDate(d.getDate() + BOOKING_MAX_DAYS_AHEAD);
  return d;
};

/** Today..today+BOOKING_MAX_DAYS_AHEAD and not a closed weekday. */
export function isBookableDate(iso: string): boolean {
  if (!ISO_DATE.test(iso)) return false;
  const d = fromIsoDate(iso);
  if (Number.isNaN(d.getTime())) return false;
  const t = startOfDay(d).getTime();
  if (t < bookingMinDate().getTime() || t > bookingMaxDate().getTime()) return false;
  return !CLOSED_WEEKDAYS.includes(d.getDay());
}

export const isoToday = () => toIsoDate(new Date());

/* ------------------------------------------------------------------ */
/* Draft init / restore                                                */
/* ------------------------------------------------------------------ */

const resolveServiceId = (id: string | undefined, services: Service[]) =>
  id && services.some((s) => s.id === id) ? id : (services[0]?.id ?? '');

/** URL-only initial state; deterministic so the server and first client render agree. */
export function initDraft(params: BookingUrlParams, services: Service[]): BookingDraft {
  const base = emptyDraft();
  return {
    ...base,
    serviceId: resolveServiceId(params.service, services),
    size: params.size ?? base.size,
    addonIds: params.addons ?? base.addonIds,
    wrapColorId: params.color ?? null,
    wrapFinish: params.finish ?? null,
    date: params.date ?? null,
  };
}

/** Merges the sessionStorage draft into `current`; URL params win where present. */
export function restoreDraft(
  current: BookingDraft,
  params: BookingUrlParams,
  services: Service[]
): BookingDraft {
  const stored = loadDraft();
  if (!stored) return current;

  const serviceId = params.service
    ? resolveServiceId(params.service, services)
    : resolveServiceId(stored.serviceId, services);
  const serviceChanged = stored.serviceId !== serviceId;

  const date = params.date ?? (stored.date && isBookableDate(stored.date) ? stored.date : null);
  const keepSlot = !serviceChanged && date === stored.date && !!stored.timeSlot;

  return {
    ...stored,
    serviceId,
    size: params.size ?? stored.size,
    addonIds: params.addons ?? (serviceChanged ? [] : stored.addonIds),
    wrapColorId: params.color ?? stored.wrapColorId,
    wrapFinish: params.finish ?? stored.wrapFinish,
    date: serviceChanged ? (params.date ?? null) : date,
    timeSlot: keepSlot && (BOOKING_TIME_SLOTS as readonly string[]).includes(stored.timeSlot!)
      ? stored.timeSlot
      : null,
    step: serviceChanged ? 0 : stored.step,
    version: current.version,
  };
}

/* ------------------------------------------------------------------ */
/* Reducer                                                             */
/* ------------------------------------------------------------------ */

export type WizardAction =
  | { type: 'restore'; draft: BookingDraft }
  | { type: 'quote'; serviceId: string; size: VehicleSize; addonIds: string[] }
  | { type: 'size'; size: VehicleSize }
  | { type: 'date'; date: string | null }
  | { type: 'slot'; timeSlot: string | null }
  | { type: 'vehicle'; patch: Partial<BookingVehicleDraft> }
  | { type: 'fill-vehicle'; vehicle: Vehicle }
  | { type: 'clear-vehicle' }
  | { type: 'location'; location: BookingLocationChoice }
  | { type: 'onsite-address'; value: string }
  | { type: 'notes'; value: string }
  | { type: 'save-to-garage'; value: boolean }
  | { type: 'step'; step: BookingStepIndex }
  | { type: 'reset' };

export function wizardReducer(state: BookingDraft, action: WizardAction): BookingDraft {
  switch (action.type) {
    case 'restore':
      return action.draft;
    case 'quote': {
      const serviceChanged = action.serviceId !== state.serviceId;
      return {
        ...state,
        serviceId: action.serviceId,
        size: action.size,
        addonIds: action.addonIds,
        timeSlot: serviceChanged ? null : state.timeSlot,
      };
    }
    case 'size':
      return { ...state, size: action.size };
    case 'date':
      return {
        ...state,
        date: action.date,
        timeSlot: action.date === state.date ? state.timeSlot : null,
      };
    case 'slot':
      return { ...state, timeSlot: action.timeSlot };
    case 'vehicle':
      return {
        ...state,
        vehicle: {
          ...state.vehicle,
          ...action.patch,
          garageId: action.patch.garageId ?? null,
        },
      };
    case 'fill-vehicle':
      return {
        ...state,
        size: action.vehicle.size ?? state.size,
        vehicle: vehicleToDraft(action.vehicle),
        saveToGarage: false,
      };
    case 'clear-vehicle':
      return { ...state, vehicle: emptyVehicleDraft(), saveToGarage: true };
    case 'location':
      return { ...state, location: action.location };
    case 'onsite-address':
      return { ...state, onsiteAddress: action.value };
    case 'notes':
      return { ...state, notes: action.value };
    case 'save-to-garage':
      return { ...state, saveToGarage: action.value };
    case 'step':
      return { ...state, step: action.step };
    case 'reset':
      return emptyDraft();
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export type StepErrors = Record<string, string>;

const serviceStepSchema = z.object({
  serviceId: z.string().min(1, 'خدمت را انتخاب کنید'),
  size: z.enum(VEHICLE_SIZE_IDS, { errorMap: () => ({ message: 'اندازهٔ خودرو را انتخاب کنید' }) }),
});

const scheduleStepSchema = z.object({
  date: z
    .string({
      required_error: 'روز مراجعه را انتخاب کنید',
      invalid_type_error: 'روز مراجعه را انتخاب کنید',
    })
    .regex(ISO_DATE, 'تاریخ نامعتبر است')
    .refine(isBookableDate, 'این روز قابل رزرو نیست'),
  timeSlot: z
    .string({
      required_error: 'بازهٔ زمانی را انتخاب کنید',
      invalid_type_error: 'بازهٔ زمانی را انتخاب کنید',
    })
    .min(1, 'بازهٔ زمانی را انتخاب کنید'),
});

const vehicleStepSchema = z
  .object({
    brand: z.string().min(1, 'برند خودرو را انتخاب کنید'),
    model: z.string().trim().min(2, 'مدل خودرو را وارد کنید').max(60, 'مدل خودرو خیلی طولانی است'),
    year: z
      .number({
        required_error: 'سال ساخت را انتخاب کنید',
        invalid_type_error: 'سال ساخت را انتخاب کنید',
      })
      .int()
      .min(1350, 'سال ساخت نامعتبر است')
      .max(1420, 'سال ساخت نامعتبر است'),
    color: z.string().min(1, 'رنگ خودرو را انتخاب کنید'),
    plate: z.string().refine((v) => !v.trim() || isPlateComplete(v), 'پلاک را کامل وارد کنید'),
    location: z.enum(['center', 'onsite']),
    onsiteAddress: z.string().max(300, 'آدرس حداکثر ۳۰۰ حرف'),
    notes: z.string().max(500, 'توضیحات حداکثر ۵۰۰ حرف'),
  })
  .superRefine((v, ctx) => {
    if (v.location === 'onsite' && v.onsiteAddress.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['onsiteAddress'],
        message: 'آدرس محل را کامل وارد کنید (حداقل ۱۰ حرف)',
      });
    }
  });

function issuesToErrors(result: z.SafeParseReturnType<unknown, unknown>): StepErrors {
  if (result.success) return {};
  const errors: StepErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** `{}` when the step is valid, otherwise `{ field: message }`. */
export function validateStep(step: BookingStepIndex, draft: BookingDraft): StepErrors {
  switch (step) {
    case 0:
      return issuesToErrors(serviceStepSchema.safeParse({ serviceId: draft.serviceId, size: draft.size }));
    case 1:
      return issuesToErrors(scheduleStepSchema.safeParse({ date: draft.date, timeSlot: draft.timeSlot }));
    case 2:
      return issuesToErrors(
        vehicleStepSchema.safeParse({
          brand: draft.vehicle.brand,
          model: draft.vehicle.model,
          year: draft.vehicle.year,
          color: draft.vehicle.color,
          plate: draft.vehicle.plate,
          location: draft.location,
          onsiteAddress: draft.onsiteAddress,
          notes: draft.notes,
        })
      );
    default:
      return {};
  }
}

export function firstInvalidStep(draft: BookingDraft): BookingStepIndex | null {
  for (const step of [0, 1, 2] as BookingStepIndex[]) {
    if (Object.keys(validateStep(step, draft)).length > 0) return step;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Option lists & helpers                                              */
/* ------------------------------------------------------------------ */

export const JALALI_YEAR_MIN = 1370;

export function jalaliYearOptions(): { value: string; label: string }[] {
  const max = Math.max(1405, getYear(new Date()) + 1);
  const out: { value: string; label: string }[] = [];
  for (let y = max; y >= JALALI_YEAR_MIN; y--) {
    out.push({ value: String(y), label: toPersianDigits(String(y)) });
  }
  return out;
}

export const brandOptions = () => [
  ...VEHICLE_CATALOG.map((b) => ({ value: b.brand, label: b.brand })),
  { value: OTHER_BRAND, label: 'سایر برندها' },
];

export const modelOptions = (brand: string) =>
  (VEHICLE_CATALOG.find((b) => b.brand === brand)?.models ?? []).map((m) => ({
    value: m.name,
    label: m.name,
    size: m.size,
  }));

/** «۰۸:۰۰ – ۱۰:۰۰» */
export const formatSlot = (slot: string) => toPersianDigits(slot).replace('-', '–');

/** Local start time of a slot such as `08:00 - 10:00` on the given day. */
export function slotStartDate(isoDate: string, slot: string): Date {
  const d = fromIsoDate(isoDate);
  const [h = '0', m = '0'] = (slot.split('-')[0] ?? '').trim().split(':');
  d.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
  return d;
}

export function slotDurationMinutes(slot: string): number {
  const [from, to] = slot.split('-').map((s) => s.trim());
  if (!from || !to) return 120;
  const toMin = (t: string) => {
    const [h = '0', m = '0'] = t.split(':');
    return (Number(h) || 0) * 60 + (Number(m) || 0);
  };
  const diff = toMin(to) - toMin(from);
  return diff > 0 ? diff : 120;
}

export function vehicleModelLabel(v: Pick<BookingVehicleDraft, 'brand' | 'model'>): string {
  const model = v.model.trim();
  if (!v.brand || v.brand === OTHER_BRAND) return model;
  return model.startsWith(v.brand) ? model : `${v.brand} ${model}`.trim();
}

export function vehicleToDraft(v: Vehicle): BookingVehicleDraft {
  return {
    brand: v.brand,
    model: v.model,
    year: v.year,
    color: v.color,
    plate: v.plate ?? '',
    garageId: v.id,
  };
}

export function draftToVehicle(v: BookingVehicleDraft, size: VehicleSize): Omit<Vehicle, 'id'> {
  return {
    brand: v.brand || OTHER_BRAND,
    model: v.model.trim(),
    year: v.year ?? JALALI_YEAR_MIN,
    color: v.color,
    plate: v.plate.trim() || undefined,
    size,
  };
}

export const sizeLabel = (size: VehicleSize) =>
  VEHICLE_SIZES.find((s) => s.id === size)?.label ?? size;
