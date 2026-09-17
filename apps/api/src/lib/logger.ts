import type { FastifyBaseLogger } from 'fastify';

/**
 * Thin logger facade so modules without access to the Fastify instance
 * (sms.service, payment helpers) still log through Pino once the server has started.
 */
type LogFn = (obj: unknown, msg?: string) => void;

let bound: FastifyBaseLogger | null = null;

function emit(level: 'info' | 'warn' | 'error' | 'debug'): LogFn {
  return (obj, msg) => {
    if (bound) {
      if (typeof obj === 'string') bound[level](obj);
      else bound[level](obj as object, msg);
      return;
    }
    const line = typeof obj === 'string' ? obj : `${msg ?? ''} ${JSON.stringify(obj)}`;
    // eslint-disable-next-line no-console
    (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(line);
  };
}

export const logger = {
  info: emit('info'),
  warn: emit('warn'),
  error: emit('error'),
  debug: emit('debug'),
};

export function bindLogger(instance: FastifyBaseLogger): void {
  bound = instance;
}
