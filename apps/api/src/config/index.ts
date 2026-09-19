import dotenv from 'dotenv';

// Load .env before anything reads process.env (this module is imported first by server.ts).
// `quiet` suppresses the "injected env (n) from .env" banner dotenv 17 started
// printing, which lands on stdout ahead of the logger and breaks JSON log parsing.
dotenv.config({ quiet: true });

const env = process.env;
const nodeEnv = env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function int(value: string | undefined, fallback: number): number {
  const n = parseInt(value || '', 10);
  return Number.isFinite(n) ? n : fallback;
}

const webUrl = (env.WEB_URL || 'http://localhost:3000').replace(/\/$/, '');

export const config = {
  env: nodeEnv,
  isProduction,
  port: int(env.PORT, 5000),
  host: env.HOST || '0.0.0.0',
  databaseUrl: env.DATABASE_URL || '',
  jwtSecret: env.JWT_SECRET || '',
  jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',
  allowedOrigins: (env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  webUrl,
  paymentCallbackUrl: env.PAYMENT_CALLBACK_URL || `${webUrl}/checkout/callback`,
  zarinpal: {
    merchantId: env.ZARINPAL_MERCHANT_ID || '',
    sandbox: bool(env.ZARINPAL_SANDBOX, true),
  },
  melipayamak: {
    username: env.MELIPAYAMAK_USERNAME || '',
    password: env.MELIPAYAMAK_PASSWORD || '',
    from: env.MELIPAYAMAK_FROM || '',
  },
  /** Demo OTP accepted outside production (empty = disabled) */
  otpDevBypassCode: !isProduction ? env.OTP_DEV_BYPASS_CODE || '' : '',
  adminPhone: env.ADMIN_PHONE || '09120000000',
  /** IANA timezone used for "today"/"past slot" booking rules */
  bookingTimezone: env.BOOKING_TIMEZONE || 'Asia/Tehran',
  rateLimit: {
    global: {
      max: int(env.RATE_LIMIT_MAX, 300),
      timeWindow: env.RATE_LIMIT_WINDOW || '1 minute',
    },
    contact: { max: 5, timeWindow: '15 minutes' },
    otp: { max: 10, timeWindow: '15 minutes' },
  },
} as const;

/** True when the Zarinpal gateway should be simulated (no merchant id outside production) */
export const isDemoGateway = (): boolean => !config.isProduction && !config.zarinpal.merchantId;

export const hasSmsCredentials = (): boolean =>
  Boolean(config.melipayamak.username && config.melipayamak.password && config.melipayamak.from);
