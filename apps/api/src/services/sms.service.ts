import axios from 'axios';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { config, hasSmsCredentials } from '../config';
import { logger } from '../lib/logger';

const KAVENEGAR_API = 'https://api.kavenegar.com/v1';
const MELLIPAYAMAK_API = 'https://restful.payamakapi.ir/api/SendSMS';

// OTP configuration
const OTP_EXPIRY_MINUTES = 2;
const OTP_MAX_ATTEMPTS = 5;
const OTP_COOLDOWN_SECONDS = 60;

/** Melli Payamak RESTful send. Returns true when the gateway accepted the message. */
async function sendSmsMelliPayamak(to: string, text: string): Promise<boolean> {
  const mp = config.sms.mellipayamak;
  const response = await axios.post(
    `${MELLIPAYAMAK_API}/SendSMS`,
    { username: mp.username, password: mp.password, to, text, from: mp.from },
    { timeout: 15_000 }
  );
  const result = response.data;
  if (Number(result?.RetStatus) !== 1) {
    throw new Error(`MelliPayamak error: ${result?.StrRetStatus ?? 'unknown'}`);
  }
  return true;
}

/** Melli Payamak pattern (خدماتی) send — required for OTP once the number is restricted. */
async function sendPatternMelliPayamak(to: string, text: string, bodyId: number): Promise<boolean> {
  const mp = config.sms.mellipayamak;
  const response = await axios.post(
    `${MELLIPAYAMAK_API}/BaseServiceNumber`,
    { username: mp.username, password: mp.password, to, text, bodyId },
    { timeout: 15_000 }
  );
  const result = response.data;
  if (Number(result?.RetStatus) !== 1) {
    throw new Error(`MelliPayamak pattern error: ${result?.StrRetStatus ?? 'unknown'}`);
  }
  return true;
}

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
 * Send an SMS through the configured provider (Melli Payamak by default,
 * Kavenegar when SMS_PROVIDER=kavenegar). Credentials are never logged.
 * In development, missing credentials keep the existing console fallback.
 */
export async function sendSms(to: string, text: string): Promise<boolean> {
  if (!hasSmsCredentials()) {
    logger.info({ to, text }, 'SMS not sent (provider credentials are empty) — logged instead');
    return false;
  }

  try {
    if (config.sms.provider === 'kavenegar') {
      const response = await axios.post(
        `${KAVENEGAR_API}/${encodeURIComponent(config.sms.kavenegar.apiKey)}/sms/send.json`,
        null,
        {
          params: { receptor: to, sender: config.sms.kavenegar.sender, message: text },
          timeout: 10_000,
        }
      );

      const result = response.data?.entries?.[0];
      if (!result || ![200, 4].includes(Number(result.status))) {
        throw new Error(`Kavenegar error: ${result?.message ?? 'unknown'}`);
      }

      logger.info({ to }, 'SMS sent through Kavenegar');
      return true;
    }

    await sendSmsMelliPayamak(to, text);
    logger.info({ to }, 'SMS sent through Melli Payamak');
    return true;
  } catch (error) {
    logger.error({ err: error, to }, `Failed to send SMS through ${config.sms.provider}`);
    if (config.isProduction) throw error;
    logger.warn({ to, text }, 'DEV MODE — SMS content');
    return false;
  }
}

/** Send the OTP code (logged instead of sent when no credentials are configured) */
export async function sendOTP(phoneNumber: string, code: string): Promise<void> {
  if (!hasSmsCredentials()) {
    logger.info(`OTP for ${phoneNumber}: ${code} (SMS provider not configured)`);
    return;
  }
  const mp = config.sms.mellipayamak;
  if (config.sms.provider === 'mellipayamak' && mp.otpBodyId > 0) {
    await sendPatternMelliPayamak(phoneNumber, code, mp.otpBodyId);
    return;
  }
  const message = `کد تایید شما در ${config.brandName}: ${code}\nاین کد به مدت ۲ دقیقه معتبر است.`;
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
  const message = `رزرو شما در ${config.brandName} ثبت شد
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
  const message = `سفارش شما در ${config.brandName} ثبت شد
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
  const message = `پرداخت ${typeText} ${trackingCode} در ${config.brandName} با موفقیت انجام شد
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
  await sendNotification(phoneNumber, `وضعیت ${typeText} شما در ${config.brandName}: ${statusText}`);
}
