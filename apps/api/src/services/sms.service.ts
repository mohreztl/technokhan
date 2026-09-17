import axios from 'axios';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { config, hasSmsCredentials } from '../config';
import { logger } from '../lib/logger';

const MELIPAYAMAK_API = 'https://rest.payamak-panel.com/api/SendSMS/SendSMS';

// OTP configuration
const OTP_EXPIRY_MINUTES = 2;
const OTP_MAX_ATTEMPTS = 5;
const OTP_COOLDOWN_SECONDS = 60;

export type OTPFailureReason = 'expired' | 'invalid' | 'max_attempts';

/** Secure 6-digit OTP */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashOTP(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function verifyOTPHash(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

/** Cooldown between two OTP requests for the same phone number */
export async function canRequestOTP(
  phoneNumber: string
): Promise<{ canRequest: boolean; waitSeconds?: number }> {
  const lastOTP = await prisma.oTP.findFirst({
    where: { phoneNumber },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  if (lastOTP) {
    const cooldownEnd = lastOTP.createdAt.getTime() + OTP_COOLDOWN_SECONDS * 1000;
    const now = Date.now();
    if (now < cooldownEnd) {
      return { canRequest: false, waitSeconds: Math.ceil((cooldownEnd - now) / 1000) };
    }
  }

  return { canRequest: true };
}

/** Create a new OTP (stored hashed); returns the plain code for delivery */
export async function createOTP(phoneNumber: string): Promise<string> {
  const code = generateOTP();
  const hashedCode = await hashOTP(code);

  await prisma.oTP.deleteMany({ where: { phoneNumber, used: false } });
  await prisma.oTP.create({
    data: {
      phoneNumber,
      code: hashedCode,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  return code;
}

/**
 * Verify an OTP. Outside production, `OTP_DEV_BYPASS_CODE` is always accepted.
 */
export async function verifyOTP(
  phoneNumber: string,
  code: string
): Promise<{ valid: boolean; reason?: OTPFailureReason }> {
  if (config.otpDevBypassCode && code === config.otpDevBypassCode) {
    await prisma.oTP.updateMany({ where: { phoneNumber, used: false }, data: { used: true } });
    logger.info({ phoneNumber }, 'OTP accepted via OTP_DEV_BYPASS_CODE');
    return { valid: true };
  }

  const otp = await prisma.oTP.findFirst({
    where: { phoneNumber, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) return { valid: false, reason: 'expired' };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) return { valid: false, reason: 'max_attempts' };

  const isValid = await verifyOTPHash(code, otp.code);
  if (!isValid) {
    const updated = await prisma.oTP.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });
    return {
      valid: false,
      reason: updated.attempts >= OTP_MAX_ATTEMPTS ? 'max_attempts' : 'invalid',
    };
  }

  await prisma.oTP.update({ where: { id: otp.id }, data: { used: true } });
  return { valid: true };
}

/**
 * Low-level MeliPayamak send. Returns false (and logs) when credentials are
 * missing; throws in production when the gateway rejects the message.
 */
export async function sendSms(to: string, text: string): Promise<boolean> {
  if (!hasSmsCredentials()) {
    logger.info({ to, text }, 'SMS not sent (MELIPAYAMAK_* credentials are empty) — logged instead');
    return false;
  }

  try {
    const response = await axios.post(
      MELIPAYAMAK_API,
      {
        username: config.melipayamak.username,
        password: config.melipayamak.password,
        to,
        from: config.melipayamak.from,
        text,
        isFlash: false,
      },
      { timeout: 10_000 }
    );

    if (response.data?.RetStatus !== 1) {
      throw new Error(`MeliPayamak error: ${response.data?.StrRetStatus ?? 'unknown'}`);
    }

    logger.info({ to }, 'SMS sent');
    return true;
  } catch (error) {
    logger.error({ err: error, to }, 'Failed to send SMS');
    if (config.isProduction) throw error;
    logger.warn({ to, text }, 'DEV MODE — SMS content');
    return false;
  }
}

/** Send the OTP code (logged instead of sent when no credentials are configured) */
export async function sendOTP(phoneNumber: string, code: string): Promise<void> {
  if (!hasSmsCredentials()) {
    logger.info(`OTP for ${phoneNumber}: ${code} (MeliPayamak not configured)`);
    return;
  }
  const message = `کد تایید شما در اتولانژ: ${code}\nاین کد به مدت ۲ دقیقه معتبر است.`;
  await sendSms(phoneNumber, message);
}

/** Fire-and-forget notification: never throws */
export async function sendNotification(phoneNumber: string, message: string): Promise<void> {
  try {
    await sendSms(phoneNumber, message);
  } catch (error) {
    logger.error({ err: error, phoneNumber }, 'Notification SMS failed');
  }
}

export async function sendBookingConfirmation(
  phoneNumber: string,
  serviceName: string,
  date: string,
  timeSlot: string,
  trackingCode?: string | null
): Promise<void> {
  const message = `رزرو شما در اتولانژ ثبت شد
خدمت: ${serviceName}
تاریخ: ${date}
ساعت: ${timeSlot}${trackingCode ? `\nکد پیگیری: ${trackingCode}` : ''}
با تشکر از انتخاب شما`;

  await sendNotification(phoneNumber, message);
}

export async function sendOrderConfirmation(
  phoneNumber: string,
  trackingCode: string,
  totalPrice: number
): Promise<void> {
  const message = `سفارش شما در اتولانژ ثبت شد
کد پیگیری: ${trackingCode}
مبلغ کل: ${totalPrice.toLocaleString('fa-IR')} تومان
برای پیگیری سفارش به پروفایل خود مراجعه کنید`;

  await sendNotification(phoneNumber, message);
}

export async function sendPaymentConfirmation(
  phoneNumber: string,
  kind: 'order' | 'booking',
  trackingCode: string,
  refId: string
): Promise<void> {
  const typeText = kind === 'order' ? 'سفارش' : 'رزرو';
  const message = `پرداخت ${typeText} ${trackingCode} در اتولانژ با موفقیت انجام شد
شماره پیگیری بانکی: ${refId}`;
  await sendNotification(phoneNumber, message);
}

export async function sendStatusUpdate(
  phoneNumber: string,
  type: 'order' | 'booking',
  status: string
): Promise<void> {
  const statusMessages: Record<string, Record<string, string>> = {
    order: {
      processing: 'در حال پردازش',
      shipped: 'ارسال شد',
      delivered: 'تحویل داده شد',
      cancelled: 'لغو شد',
    },
    booking: {
      confirmed: 'تایید شد',
      in_progress: 'در حال انجام',
      completed: 'تکمیل شد',
      cancelled: 'لغو شد',
    },
  };

  const statusText = statusMessages[type][status] || status;
  const typeText = type === 'order' ? 'سفارش' : 'رزرو';
  await sendNotification(phoneNumber, `وضعیت ${typeText} شما در اتولانژ: ${statusText}`);
}
