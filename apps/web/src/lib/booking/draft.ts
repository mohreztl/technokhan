import type { VehicleSize, WrapFinish } from '@autolounge/shared';

/**
 * Booking wizard draft, mirrored to `sessionStorage` so a reload, an inline
 * login or a payment round-trip never loses the user's progress.
 */

export const BOOKING_DRAFT_KEY = 'autolounge_booking_draft';
export const BOOKING_DRAFT_VERSION = 1 as const;

export type BookingLocationChoice = 'center' | 'onsite';
/** 0 = خدمت, 1 = زمان, 2 = خودرو, 3 = بازبینی */
export type BookingStepIndex = 0 | 1 | 2 | 3;

export interface BookingVehicleDraft {
  brand: string;
  /** Model name; free text when `brand` is «سایر». */
  model: string;
  /** Jalali year (what the API's `carYear` expects). */
  year: number | null;
  /** Persian colour name from `CAR_COLORS`. */
  color: string;
  /** Normalized plate «12 ب 345 - 11» or empty. */
  plate: string;
  /** Garage vehicle the form was filled from (if any). */
  garageId: string | null;
}

export interface BookingDraft {
  version: typeof BOOKING_DRAFT_VERSION;
  step: BookingStepIndex;
  serviceId: string;
  size: VehicleSize;
  addonIds: string[];
  /** Wrap colour / finish carried over from the wrap visualizer deep link. */
  wrapColorId: string | null;
  wrapFinish: WrapFinish | null;
  /** Gregorian `yyyy-MM-dd`. */
  date: string | null;
  /** One of `BOOKING_TIME_SLOTS`. */
  timeSlot: string | null;
  vehicle: BookingVehicleDraft;
  location: BookingLocationChoice;
  onsiteAddress: string;
  notes: string;
  saveToGarage: boolean;
  updatedAt: number;
}

export const emptyVehicleDraft = (): BookingVehicleDraft => ({
  brand: '',
  model: '',
  year: null,
  color: '',
  plate: '',
  garageId: null,
});

export function emptyDraft(): BookingDraft {
  return {
    version: BOOKING_DRAFT_VERSION,
    step: 0,
    serviceId: '',
    size: 'medium',
    addonIds: [],
    wrapColorId: null,
    wrapFinish: null,
    date: null,
    timeSlot: null,
    vehicle: emptyVehicleDraft(),
    location: 'center',
    onsiteAddress: '',
    notes: '',
    saveToGarage: true,
    updatedAt: 0,
  };
}

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

const isStep = (v: unknown): v is BookingStepIndex => v === 0 || v === 1 || v === 2 || v === 3;

/** Typed read; returns `null` when nothing (or an older version) is stored. */
export function loadDraft(): BookingDraft | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(BOOKING_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BookingDraft> | null;
    if (!parsed || parsed.version !== BOOKING_DRAFT_VERSION) {
      s.removeItem(BOOKING_DRAFT_KEY);
      return null;
    }
    const base = emptyDraft();
    return {
      ...base,
      ...parsed,
      step: isStep(parsed.step) ? parsed.step : 0,
      addonIds: Array.isArray(parsed.addonIds) ? parsed.addonIds.filter((x) => typeof x === 'string') : [],
      vehicle: { ...base.vehicle, ...(parsed.vehicle ?? {}) },
    };
  } catch {
    return null;
  }
}

export function saveDraft(draft: BookingDraft): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(BOOKING_DRAFT_KEY, JSON.stringify({ ...draft, updatedAt: Date.now() }));
  } catch {
    /* quota / private mode: keep in memory only */
  }
}

export function clearDraft(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(BOOKING_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
