import type { Pagination } from '@autolounge/shared';
import { API_PREFIX } from '@autolounge/shared';
import { getAuthToken, useAuthStore } from '@/lib/store/auth-store';

export type ApiOk<T> = { ok: true; data: T; pagination?: Pagination; status: number };
export type ApiErr = {
  ok: false;
  error: string;
  status: number;
  code?: string;
  /** network failure / timeout — the API is unreachable */
  offline: boolean;
  details?: unknown;
};
export type ApiResult<T> = ApiOk<T> | ApiErr;

export interface ApiFetchOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
  /** abort after N ms (default 8000) */
  timeoutMs?: number;
  /** attach the bearer token when available (default true) */
  auth?: boolean;
  /** Next.js fetch cache options (server only) */
  next?: { revalidate?: number | false; tags?: string[] };
}

const isServer = typeof window === 'undefined';

export function apiHost(): string {
  if (isServer) {
    return (
      process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    ).replace(/\/$/, '');
  }
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
}

export function apiBase(): string {
  return `${apiHost()}${API_PREFIX}`;
}

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

export const NETWORK_ERROR_MESSAGE = 'ارتباط با سرور برقرار نشد';

export function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)));
    else sp.append(k, String(v));
  });
  const q = sp.toString();
  return q ? `?${q}` : '';
}

/**
 * Isomorphic fetch wrapper for the AutoLounge API. Never throws.
 * Parses the `{ success, data, pagination, error, code }` envelope.
 */
export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<ApiResult<T>> {
  const { body, headers = {}, timeoutMs = 8000, auth = true, next, ...init } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const finalHeaders: Record<string, string> = { Accept: 'application/json', ...headers };
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (auth && !isServer) {
    const token = getAuthToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${apiBase()}${path}`, {
      ...init,
      headers: finalHeaders,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      signal: controller.signal,
      ...(next && isServer ? { next } : {}),
      cache: init.cache ?? (next ? undefined : 'no-store'),
    } as RequestInit);

    let json: any = null;
    const text = await res.text();
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }

    if (!res.ok || (json && json.success === false)) {
      if (res.status === 401 && !isServer && auth) {
        useAuthStore.getState().logout();
      }
      return {
        ok: false,
        status: res.status,
        error: json?.error || json?.message || httpErrorMessage(res.status),
        code: json?.code,
        details: json?.details,
        offline: false,
      };
    }

    const data = (json && 'data' in json ? json.data : json) as T;
    return { ok: true, data, pagination: json?.pagination, status: res.status };
  } catch (err) {
    const aborted = (err as Error)?.name === 'AbortError';
    return {
      ok: false,
      status: 0,
      error: aborted ? 'پاسخ سرور بیش از حد طول کشید' : NETWORK_ERROR_MESSAGE,
      code: aborted ? 'TIMEOUT' : 'NETWORK',
      offline: true,
    };
  } finally {
    clearTimeout(timer);
  }
}

function httpErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'اطلاعات ارسال‌شده معتبر نیست';
    case 401:
      return 'لطفاً وارد حساب کاربری خود شوید';
    case 403:
      return 'شما دسترسی لازم را ندارید';
    case 404:
      return 'موردی یافت نشد';
    case 409:
      return 'درخواست با وضعیت فعلی تداخل دارد';
    case 429:
      return 'تعداد درخواست‌ها زیاد است، کمی بعد تلاش کنید';
    default:
      return 'خطایی در سرور رخ داد';
  }
}

/** Convenience helpers */
export const apiGet = <T>(path: string, opts?: ApiFetchOptions) =>
  apiFetch<T>(path, { ...opts, method: 'GET' });
export const apiPost = <T>(path: string, body?: unknown, opts?: ApiFetchOptions) =>
  apiFetch<T>(path, { ...opts, method: 'POST', body });
export const apiPut = <T>(path: string, body?: unknown, opts?: ApiFetchOptions) =>
  apiFetch<T>(path, { ...opts, method: 'PUT', body });
export const apiDelete = <T>(path: string, opts?: ApiFetchOptions) =>
  apiFetch<T>(path, { ...opts, method: 'DELETE' });

/** Throws on failure — for React Query `queryFn`s */
export async function unwrap<T>(p: Promise<ApiResult<T>>): Promise<T> {
  const r = await p;
  if (!r.ok) {
    const e = new Error(r.error) as Error & { status: number; code?: string; offline: boolean };
    e.status = r.status;
    e.code = r.code;
    e.offline = r.offline;
    throw e;
  }
  return r.data;
}
