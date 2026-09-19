'use server';

import { trackSchema } from '@autolounge/shared';
import type { TrackResult } from '@autolounge/shared';
import { apiPost } from '@/lib/api/client';

/**
 * The lookup runs on the server so the page works before — or entirely
 * without — hydration. A plain form POST keeps the phone number out of the
 * URL, which a GET submit would otherwise leave in history and referrers.
 */
export type TrackState =
  | { status: 'idle' }
  | { status: 'invalid'; message: string; values: { code: string; phoneNumber: string } }
  | { status: 'missing'; message: string; values: { code: string; phoneNumber: string } }
  /** The API did not answer; the client retries against the demo transport. */
  | { status: 'unreachable'; values: { code: string; phoneNumber: string } }
  | { status: 'found'; result: TrackResult; values: { code: string; phoneNumber: string } };

export async function lookupTrackAction(_previous: TrackState, formData: FormData): Promise<TrackState> {
  const values = {
    code: String(formData.get('code') ?? ''),
    phoneNumber: String(formData.get('phoneNumber') ?? ''),
  };

  const parsed = trackSchema.safeParse(values);
  if (!parsed.success) {
    return { status: 'invalid', message: parsed.error.issues[0]?.message ?? 'اطلاعات وارد شده معتبر نیست', values };
  }

  const response = await apiPost<TrackResult>('/track', parsed.data, { auth: false });
  if (response.ok) return { status: 'found', result: response.data, values };
  if (response.offline) return { status: 'unreachable', values };
  return { status: 'missing', message: response.error, values };
}
