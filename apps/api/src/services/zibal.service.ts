import axios from 'axios';
import { config } from '../config';
import { logger } from '../lib/logger';

/**
 * Zibal payment gateway v1 client. All amounts are Rial (Zibal only accepts Rial).
 * https://help.zibal.ir/IPG/API/
 */
const API_BASE = 'https://api.zibal.ir/v1';

interface RequestData {
  trackId: number;
  result: number;
  payLink: string;
}

interface VerifyData {
  result: number;
  refNumber?: number;
  cardNumber?: string;
  amount?: number;
}

export type RequestResult =
  | { ok: true; trackId: string; paymentUrl: string }
  | { ok: false; code: number; message: string };

export type VerifyResult =
  | { ok: true; code: number; refId: string; cardPan?: string }
  | { ok: false; code: number; message: string };

const ERROR_MESSAGES: Record<number, string> = {
  102: 'درگاه پرداخت فعال نیست',
  103: 'شناسه پذیرنده نامعتبر است',
  104: 'شناسه پذیرنده نامعتبر است',
  105: 'مبلغ پرداخت خارج از محدوده مجاز است',
  106: 'آدرس بازگشت (callback) معتبر نیست',
  113: 'آدرس بازگشت با آدرس ثبت‌شده در درگاه مطابقت ندارد',
  201: 'تراکنش یافت نشد',
  202: 'پرداخت ناموفق بود',
};

function messageFor(code: number, fallback?: string): string {
  return ERROR_MESSAGES[code] || fallback || 'خطا در ارتباط با درگاه پرداخت';
}

export async function requestPayment(input: {
  amount: number;
  callbackUrl: string;
  description: string;
  mobile?: string;
}): Promise<RequestResult> {
  try {
    const { data } = await axios.post<RequestData>(
      `${API_BASE}/request`,
      {
        merchant: config.zibal.merchantId,
        // Zibal expects Rial; the app works in Toman everywhere.
        amount: Math.round(input.amount) * 10,
        callbackUrl: input.callbackUrl,
        description: input.description,
        mobile: input.mobile,
      },
      { timeout: 15_000 }
    );

    if (data.result === 100 && data.trackId && data.payLink) {
      return { ok: true, trackId: String(data.trackId), paymentUrl: data.payLink };
    }
    logger.error({ zibal: data }, 'Zibal request rejected');
    return { ok: false, code: data.result, message: messageFor(data.result) };
  } catch (error) {
    logger.error({ err: error }, 'Zibal request failed');
    return { ok: false, code: -1, message: 'ارتباط با درگاه پرداخت برقرار نشد' };
  }
}

export async function verifyPayment(input: { trackId: string }): Promise<VerifyResult> {
  try {
    const { data } = await axios.post<VerifyData>(
      `${API_BASE}/verify`,
      { merchant: config.zibal.merchantId, trackId: Number(input.trackId) },
      { timeout: 15_000 }
    );

    // 101 = already verified before — treat as success like Zarinpal's 101.
    if (data.result === 100 || data.result === 101) {
      return {
        ok: true,
        code: data.result,
        refId: String(data.refNumber ?? ''),
        cardPan: data.cardNumber,
      };
    }
    logger.error({ zibal: data }, 'Zibal verify rejected');
    return { ok: false, code: data.result, message: messageFor(data.result) };
  } catch (error) {
    logger.error({ err: error }, 'Zibal verify failed');
    return { ok: false, code: -1, message: 'ارتباط با درگاه پرداخت برقرار نشد' };
  }
}
