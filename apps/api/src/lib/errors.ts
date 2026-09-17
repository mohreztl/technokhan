export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'CONFLICT'
  | 'PAYMENT_ERROR'
  | 'INTERNAL';

/**
 * Error carrying an HTTP status and a stable machine-readable code.
 * Thrown from routes/hooks and formatted by the global error handler in server.ts.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(statusCode: number, code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (message = 'موردی یافت نشد') => new ApiError(404, 'NOT_FOUND', message);
export const unauthorized = (message = 'احراز هویت نامعتبر است. لطفاً دوباره وارد شوید') =>
  new ApiError(401, 'UNAUTHORIZED', message);
export const forbidden = (message = 'شما به این بخش دسترسی ندارید') =>
  new ApiError(403, 'FORBIDDEN', message);
export const badRequest = (message: string, details?: unknown) =>
  new ApiError(400, 'VALIDATION_ERROR', message, details);
export const conflict = (message: string) => new ApiError(409, 'CONFLICT', message);
export const rateLimited = (message = 'تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید') =>
  new ApiError(429, 'RATE_LIMITED', message);
export const paymentError = (message: string, statusCode = 502, details?: unknown) =>
  new ApiError(statusCode, 'PAYMENT_ERROR', message, details);
