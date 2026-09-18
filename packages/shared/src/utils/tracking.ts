import { BOOKING_STATUS_LABELS, ORDER_STATUS_LABELS } from '../constants';

export type TrackKind = 'order' | 'booking';

/** The happy path, in order. `cancelled` is not on it — it ends the timeline. */
const ORDER_STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;
const BOOKING_STEPS = ['pending', 'confirmed', 'in_progress', 'completed'] as const;

export interface TrackingStep {
  status: string;
  label: string;
  /** Reached — this step or a later one is the current status. */
  done: boolean;
  /** Where the order or booking stands right now. */
  current: boolean;
}

/**
 * The progress bar behind a tracking code. A cancelled record keeps the steps
 * it had actually reached and marks none of them current, so the UI can show
 * where it stopped rather than an empty timeline.
 */
export function trackingTimeline(kind: TrackKind, status: string): TrackingStep[] {
  const steps: readonly string[] = kind === 'order' ? ORDER_STEPS : BOOKING_STEPS;
  const labels = kind === 'order' ? ORDER_STATUS_LABELS : BOOKING_STATUS_LABELS;
  const cancelled = status === 'cancelled';
  const index = steps.indexOf(status);

  return steps.map((step, i) => ({
    status: step,
    label: labels[step] ?? step,
    done: !cancelled && index >= 0 && i <= index,
    current: !cancelled && i === index,
  }));
}

/** True once nothing further will happen — delivered, completed or cancelled. */
export function isTerminalStatus(kind: TrackKind, status: string): boolean {
  if (status === 'cancelled') return true;
  return status === (kind === 'order' ? 'delivered' : 'completed');
}

/** `or-9726dq` / « OR-9726DQ » → `OR-9726DQ`; anything unusable → ''. */
export function normalizeTrackingCode(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/[\s_‌]+/g, '');
  const withDash = /^(OR|BK)-?/.test(cleaned) ? cleaned.replace(/^(OR|BK)-?/, '$1-') : cleaned;
  return /^(OR|BK)-[A-Z0-9]{4,20}$/.test(withDash) ? withDash : '';
}

/** Which record a well-formed code points at. */
export function trackingCodeKind(code: string): TrackKind | null {
  if (code.startsWith('OR-')) return 'order';
  if (code.startsWith('BK-')) return 'booking';
  return null;
}
