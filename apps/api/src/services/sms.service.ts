import axios from 'axios';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

const MELIPAYAMAK_API = 'https://rest.payamak-panel.com/api/SendSMS/SendSMS';

interface MeliPayamakConfig {
  username: string;
  password: string;
  from: string;
}

const config: MeliPayamakConfig = {
  username: process.env.MELIPAYAMAK_USERNAME || '',
  password: process.env.MELIPAYAMAK_PASSWORD || '',
  from: process.env.MELIPAYAMAK_FROM || '',
};

// OTP configuration
const OTP_EXPIRY_MINUTES = 2;
const OTP_MAX_ATTEMPTS = 5;
const OTP_COOLDOWN_MINUTES = 1;

/**
 * Generate a secure 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP code for secure storage
 */
export async function hashOTP(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

/**
 * Verify OTP code against hash
 */
export async function verifyOTPHash(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

/**
 * Check if user can request new OTP (cooldown check)
 */
export async function canRequestOTP(phoneNumber: string): Promise<{ canRequest: boolean; waitSeconds?: number }> {
  const lastOTP = await prisma.oTP.findFirst({
    where: { phoneNumber },
    orderBy: { createdAt: 'desc' },
  });

  if (lastOTP) {
    const cooldownEnd = new Date(lastOTP.createdAt.getTime() + OTP_COOLDOWN_MINUTES * 60 * 1000);
    const now = new Date();

    if (now < cooldownEnd) {
      const waitSeconds = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000);
      return { canRequest: false, waitSeconds };
    }
  }

  return { canRequest: true };
}

/**
 * Create and store OTP in database
 */
export async function createOTP(phoneNumber: string): Promise<string> {
  const code = generateOTP();
  const hashedCode = await hashOTP(code);

  // Delete old unused OTPs for this phone
  await prisma.oTP.deleteMany({
    where: {
      phoneNumber,
      used: false,
    },
  });

  // Create new OTP
  await prisma.oTP.create({
    data: {
      phoneNumber,
      code: hashedCode, // Store hashed OTP
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  return code; // Return plain code for SMS
}

/**
 * Verify OTP code from database
 * Note: After migration, add attempts tracking
 */
export async function verifyOTP(
  phoneNumber: string,
  code: string
): Promise<{ valid: boolean; reason?: 'expired' | 'invalid' | 'max_attempts' }> {
  // Find the latest OTP for this phone number
  const otp = await prisma.oTP.findFirst({
    where: {
      phoneNumber,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) {
    return { valid: false, reason: 'expired' };
  }

  // Verify the code
  const isValid = await verifyOTPHash(code, otp.code);

  if (!isValid) {
    return { valid: false, reason: 'invalid' };
  }

  // Mark OTP as used
  await prisma.oTP.update({
    where: { id: otp.id },
    data: { used: true },
  });

  return { valid: true };
}

/**
 * Send OTP code via MeliPayamak SMS Gateway
 */
export async function sendOTP(phoneNumber: string, code: string): Promise<void> {
  const message = `کد تایید شما در اتولانژ: ${code}\nاین کد به مدت ۲ دقیقه معتبر است.`;

  try {
    const response = await axios.post(MELIPAYAMAK_API, {
      username: config.username,
      password: config.password,
      to: phoneNumber,
      from: config.from,
      text: message,
      isFlash: false,
    });

    if (response.data.RetStatus !== 1) {
      throw new Error(`MeliPayamak API error: ${response.data.StrRetStatus}`);
    }

    console.log(`✅ OTP sent to ${phoneNumber}`);
  } catch (error) {
    console.error('❌ Failed to send OTP:', error);
    
    // In development, log the OTP instead of failing
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 DEV MODE - OTP for ${phoneNumber}: ${code}`);
      return;
    }
    
    throw error;
  }
}

/**
 * Send notification SMS
 */
export async function sendNotification(
  phoneNumber: string,
  message: string
): Promise<void> {
  try {
    const response = await axios.post(MELIPAYAMAK_API, {
      username: config.username,
      password: config.password,
      to: phoneNumber,
      from: config.from,
      text: message,
      isFlash: false,
    });

    if (response.data.RetStatus !== 1) {
      throw new Error(`MeliPayamak API error: ${response.data.StrRetStatus}`);
    }

    console.log(`✅ Notification sent to ${phoneNumber}`);
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    
    // In development, log the message instead of failing
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 DEV MODE - Notification for ${phoneNumber}: ${message}`);
      return;
    }
    
    throw error;
  }
}

/**
 * Send booking confirmation SMS
 */
export async function sendBookingConfirmation(
  phoneNumber: string,
  serviceName: string,
  date: string,
  timeSlot: string
): Promise<void> {
  const message = `✅ رزرو شما در اتولانژ ثبت شد
خدمت: ${serviceName}
تاریخ: ${date}
ساعت: ${timeSlot}
با تشکر از انتخاب شما`;

  await sendNotification(phoneNumber, message);
}

/**
 * Send order confirmation SMS
 */
export async function sendOrderConfirmation(
  phoneNumber: string,
  orderId: string,
  totalPrice: string
): Promise<void> {
  const message = `✅ سفارش شما در اتولانژ ثبت شد
شماره سفارش: ${orderId.slice(-8).toUpperCase()}
مبلغ کل: ${totalPrice} تومان
برای پیگیری سفارش به پروفایل خود مراجعه کنید`;

  await sendNotification(phoneNumber, message);
}

/**
 * Send status update SMS
 */
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
      'in-progress': 'در حال انجام',
      completed: 'تکمیل شد',
      cancelled: 'لغو شد',
    },
  };

  const statusText = statusMessages[type][status] || status;
  const typeText = type === 'order' ? 'سفارش' : 'رزرو';
  const message = `📋 وضعیت ${typeText} شما در اتولانژ: ${statusText}`;

  await sendNotification(phoneNumber, message);
}
