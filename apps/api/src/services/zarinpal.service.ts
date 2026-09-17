import axios from 'axios';
import { config } from '../config';
import { logger } from '../lib/logger';

/**
 * Zarinpal payment gateway v4 client. All amounts are Toman (`currency: "IRT"`).
 * https://www.zarinpal.com/docs/paymentGateway/
 */
const API_BASE = config.zarinpal.sandbox
  ? 'https://sandbox.zarinpal.com/pg/v4/payment'
  : 'https://payment.zarinpal.com/pg/v4/payment';

export const GATEWAY_URL = config.zarinpal.sandbox
  ? 'https://sandbox.zarinpal.com/pg/StartPay'
  : 'https://payment.zarinpal.com/pg/StartPay';

interface ZarinpalEnvelope<T> {
  data: T | [];
  errors: { code?: number; message?: string; validations?: unknown } | [];
}

interface RequestData {
  code: number;
  message: string;
  authority: string;
  fee_type?: string;
  fee?: number;
}

interface VerifyData {
  code: number;
  message: string;
  card_hash?: string;
  card_pan?: string;
  ref_id?: number;
  fee_type?: string;
  fee?: number;
}

export type RequestResult =
  | { ok: true; authority: string; paymentUrl: string }
  | { ok: false; code: number; message: string };

export type VerifyResult =
  | { ok: true; code: number; refId: string; cardPan?: string }
  | { ok: false; code: number; message: string };

const ERROR_MESSAGES: Record<number, string> = {
  [-9]: 'اطلاعات ارسال‌شده به درگاه نامعتبر است',
  [-10]: 'شناسه پذیرنده نامعتبر است',
  [-11]: 'پذیرنده غیرفعال است',
  [-12]: 'تلاش بیش از حد در بازه زمانی کوتاه',
  [-15]: 'درگاه پرداخت به حالت تعلیق درآمده است',
  [-50]: 'مبلغ پرداخت‌شده با مبلغ تراکنش مطابقت ندارد',
  [-51]: 'پرداخت ناموفق بود',
  [-52]: 'خطای غیرمنتظره در درگاه پرداخت',
  [-53]: 'پرداخت متعلق به این پذیرنده نیست',
  [-54]: 'شناسه تراکنش نامعتبر است',
  [-55]: 'تراکنش مورد نظر یافت نشد',
};

function errorFrom<T>(envelope: ZarinpalEnvelope<T>): { code: number; message: string } {
  const errors = Array.isArray(envelope.errors) ? undefined : envelope.errors;
  const code = errors?.code ?? -52;
  return { code, message: ERROR_MESSAGES[code] || errors?.message || 'خطا در ارتباط با درگاه پرداخت' };
}

export async function requestPayment(input: {
  amount: number;
  callbackUrl: string;
  description: string;
  mobile?: string;
  email?: string | null;
}): Promise<RequestResult> {
  try {
    const { data } = await axios.post<ZarinpalEnvelope<RequestData>>(
      `${API_BASE}/request.json`,
      {
        merchant_id: config.zarinpal.merchantId,
        amount: Math.round(input.amount),
        currency: 'IRT',
        callback_url: input.callbackUrl,
        description: input.description,
        metadata: {
          mobile: input.mobile,
          email: input.email || undefined,
        },
      },
      { timeout: 15_000 }
    );

    if (!Array.isArray(data.data) && data.data.code === 100 && data.data.authority) {
      return {
        ok: true,
        authority: data.data.authority,
        paymentUrl: `${GATEWAY_URL}/${data.data.authority}`,
      };
    }
    const err = errorFrom(data);
    logger.error({ zarinpal: data }, 'Zarinpal request rejected');
    return { ok: false, ...err };
  } catch (error) {
    logger.error({ err: error }, 'Zarinpal request failed');
    return { ok: false, code: -52, message: 'ارتباط با درگاه پرداخت برقرار نشد' };
  }
}

export async function verifyPayment(input: { amount: number; authority: string }): Promise<VerifyResult> {
  try {
    const { data } = await axios.post<ZarinpalEnvelope<VerifyData>>(
      `${API_BASE}/verify.json`,
      {
        merchant_id: config.zarinpal.merchantId,
        amount: Math.round(input.amount),
        currency: 'IRT',
        authority: input.authority,
      },
      { timeout: 15_000 }
    );

    if (!Array.isArray(data.data) && (data.data.code === 100 || data.data.code === 101)) {
      return {
        ok: true,
        code: data.data.code,
        refId: String(data.data.ref_id ?? ''),
        cardPan: data.data.card_pan,
      };
    }
    const err = errorFrom(data);
    logger.error({ zarinpal: data }, 'Zarinpal verify rejected');
    return { ok: false, ...err };
  } catch (error) {
    logger.error({ err: error }, 'Zarinpal verify failed');
    return { ok: false, code: -52, message: 'ارتباط با درگاه پرداخت برقرار نشد' };
  }
}
