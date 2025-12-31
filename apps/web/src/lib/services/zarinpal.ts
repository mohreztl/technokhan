/**
 * Zarinpal Payment Gateway Integration
 * 
 * This module handles all Zarinpal payment operations including:
 * - Payment request (درخواست پرداخت)
 * - Payment verification (تایید پرداخت)
 * - Refund (استرداد وجه)
 */

// Zarinpal API endpoints
const ZARINPAL_API = {
  REQUEST: 'https://api.zarinpal.com/pg/v4/payment/request.json',
  VERIFY: 'https://api.zarinpal.com/pg/v4/payment/verify.json',
  START_PAY: 'https://www.zarinpal.com/pg/StartPay/',
  // Sandbox for testing
  SANDBOX_REQUEST: 'https://sandbox.zarinpal.com/pg/v4/payment/request.json',
  SANDBOX_VERIFY: 'https://sandbox.zarinpal.com/pg/v4/payment/verify.json',
  SANDBOX_START_PAY: 'https://sandbox.zarinpal.com/pg/StartPay/',
};

// Configuration
const config = {
  merchantId: process.env.NEXT_PUBLIC_ZARINPAL_MERCHANT_ID || '',
  callbackUrl: process.env.NEXT_PUBLIC_ZARINPAL_CALLBACK_URL || 'http://localhost:3000/checkout/callback',
  sandbox: process.env.NEXT_PUBLIC_ZARINPAL_SANDBOX === 'true',
};

// Types
export interface PaymentRequestParams {
  amount: number; // Amount in Rials (ریال)
  description: string;
  email?: string;
  mobile?: string;
  orderId?: string;
}

export interface PaymentRequestResponse {
  success: boolean;
  authority?: string;
  paymentUrl?: string;
  error?: string;
  code?: number;
}

export interface PaymentVerifyParams {
  authority: string;
  amount: number;
}

export interface PaymentVerifyResponse {
  success: boolean;
  refId?: number;
  cardPan?: string;
  cardHash?: string;
  feeType?: string;
  fee?: number;
  error?: string;
  code?: number;
}

// Error messages in Persian
const ERROR_MESSAGES: Record<number, string> = {
  [-1]: 'اطلاعات ارسال شده ناقص است',
  [-2]: 'IP و یا مرچنت کد پذیرنده صحیح نیست',
  [-3]: 'با توجه به محدودیت‌های شاپرک امکان پرداخت با رقم درخواست شده میسر نمی‌باشد',
  [-4]: 'سطح تأیید پذیرنده پایین‌تر از سطح نقره‌ای است',
  [-11]: 'درخواست مورد نظر یافت نشد',
  [-12]: 'امکان ویرایش درخواست میسر نمی‌باشد',
  [-21]: 'هیچ نوع عملیات مالی برای این تراکنش یافت نشد',
  [-22]: 'تراکنش ناموفق می‌باشد',
  [-33]: 'رقم تراکنش با رقم پرداخت شده مطابقت ندارد',
  [-34]: 'سقف تقسیم تراکنش از لحاظ تعداد یا رقم عبور نموده است',
  [-40]: 'اجازه دسترسی به متد مربوطه وجود ندارد',
  [-41]: 'اطلاعات ارسال شده مربوط به AdditionalData غیرمعتبر می‌باشد',
  [-42]: 'مدت زمان معتبر طول عمر شناسه پرداخت باید بین ۳۰ دقیقه تا ۴۵ روز باشد',
  [-54]: 'درخواست مورد نظر آرشیو شده است',
  [100]: 'عملیات با موفقیت انجام شد',
  [101]: 'عملیات پرداخت موفق بوده و قبلاً تأیید شده است',
};

/**
 * Get appropriate API endpoint based on sandbox mode
 */
function getEndpoint(endpoint: keyof typeof ZARINPAL_API): string {
  if (config.sandbox) {
    const sandboxKey = `SANDBOX_${endpoint}` as keyof typeof ZARINPAL_API;
    return ZARINPAL_API[sandboxKey] || ZARINPAL_API[endpoint];
  }
  return ZARINPAL_API[endpoint];
}

/**
 * Get error message from code
 */
function getErrorMessage(code: number): string {
  return ERROR_MESSAGES[code] || `خطای ناشناخته با کد ${code}`;
}

/**
 * Convert Toman to Rial
 */
export function tomanToRial(toman: number): number {
  return toman * 10;
}

/**
 * Convert Rial to Toman
 */
export function rialToToman(rial: number): number {
  return Math.floor(rial / 10);
}

/**
 * Request a new payment
 */
export async function requestPayment(
  params: PaymentRequestParams
): Promise<PaymentRequestResponse> {
  try {
    const response = await fetch(getEndpoint('REQUEST'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: config.merchantId,
        amount: params.amount,
        callback_url: config.callbackUrl,
        description: params.description,
        metadata: {
          email: params.email,
          mobile: params.mobile,
          order_id: params.orderId,
        },
      }),
    });

    const data = await response.json();

    if (data.data?.code === 100) {
      const authority = data.data.authority;
      return {
        success: true,
        authority,
        paymentUrl: `${getEndpoint('START_PAY')}${authority}`,
        code: 100,
      };
    }

    return {
      success: false,
      error: getErrorMessage(data.errors?.code || -1),
      code: data.errors?.code,
    };
  } catch (error) {
    console.error('Zarinpal request error:', error);
    return {
      success: false,
      error: 'خطا در برقراری ارتباط با درگاه پرداخت',
    };
  }
}

/**
 * Verify a payment after callback
 */
export async function verifyPayment(
  params: PaymentVerifyParams
): Promise<PaymentVerifyResponse> {
  try {
    const response = await fetch(getEndpoint('VERIFY'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: config.merchantId,
        amount: params.amount,
        authority: params.authority,
      }),
    });

    const data = await response.json();

    if (data.data?.code === 100 || data.data?.code === 101) {
      return {
        success: true,
        refId: data.data.ref_id,
        cardPan: data.data.card_pan,
        cardHash: data.data.card_hash,
        feeType: data.data.fee_type,
        fee: data.data.fee,
        code: data.data.code,
      };
    }

    return {
      success: false,
      error: getErrorMessage(data.errors?.code || -22),
      code: data.errors?.code,
    };
  } catch (error) {
    console.error('Zarinpal verify error:', error);
    return {
      success: false,
      error: 'خطا در تأیید پرداخت',
    };
  }
}

/**
 * Create a payment session and get redirect URL
 */
export async function createPaymentSession(
  amount: number, // in Toman
  description: string,
  options?: {
    email?: string;
    mobile?: string;
    orderId?: string;
  }
): Promise<PaymentRequestResponse> {
  return requestPayment({
    amount: tomanToRial(amount),
    description,
    ...options,
  });
}
