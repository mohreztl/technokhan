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
  /** Storefront brand used in SMS copy — per project (technokhan / aryatechno) */
  brandName: env.SMS_BRAND_NAME || 'تکنو خان',
  paymentCallbackUrl: env.PAYMENT_CALLBACK_URL || `${webUrl}/checkout/callback`,
  payment: {
    /** zarinpal (default) or zibal */
    provider: (env.PAYMENT_PROVIDER || 'zarinpal').toLowerCase() === 'zibal' ? 'zibal' : 'zarinpal',
  },
  zarinpal: {
    merchantId: env.ZARINPAL_MERCHANT_ID || '',
    sandbox: bool(env.ZARINPAL_SANDBOX, true),
  },
  zibal: {
    merchantId: env.ZIBAL_MERCHANT || env.ZIBAL_MERCHANT_ID || '',
    timeoutMs: int(env.ZIBAL_TIMEOUT_MS, 15_000),
  },
  sms: {
    /** mellipayamak (default) or kavenegar — both stay implemented */
    provider: (env.SMS_PROVIDER || 'mellipayamak').toLowerCase() === 'kavenegar' ? 'kavenegar' : 'mellipayamak',
    mellipayamak: {
      username: env.MELIPAYAMAK_USERNAME || '',
      password: env.MELIPAYAMAK_PASSWORD || '',
      from: env.MELIPAYAMAK_FROM || '',
      /** Pattern-OTP body id; empty sends a plain SMS instead */
      otpBodyId: int(env.MELIPAYAMAK_OTP_BODY_ID, 0),
    },
    kavenegar: {
      apiKey: env.KAVENEGAR_API_KEY || '',
      sender: env.KAVENEGAR_SENDER || '',
    },
  },
  /** Sepidar accounting (همکاران سیستم) — the product/stock source of truth */
  sepidar: {
    baseUrl: (env.SEPIDAR_BASE_URL || '').replace(/\/$/, ''),
    username: env.SEPIDAR_USERNAME || '',
    password: env.SEPIDAR_PASSWORD || '',
    /** Item filter: only items in this price-list are synced */
    priceListId: int(env.SEPIDAR_PRICE_LIST_ID, 0),
    timeoutMs: int(env.SEPIDAR_TIMEOUT_MS, 15_000),
  },
  /** Basalam marketplace seller account */
  basalam: {
    token: env.BASALAM_TOKEN || '',
    vendorId: env.BASALAM_VENDOR_ID || '',
    timeoutMs: int(env.BASALAM_TIMEOUT_MS, 15_000),
  },
  /** S3-compatible object storage (Parspack) for uploaded images */
  s3: {
    endpoint: (env.S3_ENDPOINT || '').replace(/\/$/, ''),
    region: env.S3_REGION || 'us-east-1',
    bucket: env.S3_BUCKET || '',
    prefix: (env.S3_PREFIX || '').replace(/^\/+|\/+$/g, ''),
    accessKey: env.S3_ACCESS_KEY || '',
    secretKey: env.S3_SECRET_KEY || '',
    forcePathStyle: bool(env.S3_FORCE_PATH_STYLE, true),
    publicUrl: (env.S3_PUBLIC_URL || '').replace(/\/$/, ''),
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

/** True when the gateway should be simulated (no merchant id for the active gateway outside production) */
export const isDemoGateway = (): boolean => {
  if (config.isProduction) return false;
  const merchant =
    config.payment.provider === 'zibal' ? config.zibal.merchantId : config.zarinpal.merchantId;
  return !merchant;
};

export const hasSmsCredentials = (): boolean =>
  config.sms.provider === 'kavenegar'
    ? Boolean(config.sms.kavenegar.apiKey && config.sms.kavenegar.sender)
    : Boolean(config.sms.mellipayamak.username && config.sms.mellipayamak.password);

export const hasSepidarCredentials = (): boolean =>
  Boolean(config.sepidar.baseUrl && config.sepidar.username && config.sepidar.password);

export const hasBasalamCredentials = (): boolean => Boolean(config.basalam.token);

export const hasS3Credentials = (): boolean =>
  Boolean(
    config.s3.endpoint && config.s3.bucket && config.s3.accessKey && config.s3.secretKey && config.s3.publicUrl
  );
