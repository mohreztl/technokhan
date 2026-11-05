import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, Resolver } from 'react-hook-form';
import { faErrorMap, toEnglishDigits } from '@technokhan/shared';

/** «۱٬۲۵۰٬۰۰۰» / "1,250,000" / 1250000 → 1250000 (undefined when empty or not a number). */
export function parseNumber(v: unknown): number | undefined {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  const s = toEnglishDigits(String(v ?? ''))
    .replace(/[٬,\s]/g, '')
    .replace(/[^\d.-]/g, '');
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/** Textarea with one entry per line → trimmed, non-empty string[] (arrays pass through). */
export function splitLines(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  return String(v ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const joinLines = (arr?: string[] | null): string => (arr ?? []).join('\n');

/** Empty strings become `undefined` so optional fields validate. */
export const emptyToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

export const numberField = <S extends z.ZodTypeAny>(schema: S) => z.preprocess(parseNumber, schema);
export const linesField = <S extends z.ZodTypeAny>(schema: S) => z.preprocess(splitLines, schema);
export const optionalText = <S extends z.ZodTypeAny>(schema: S) => z.preprocess(emptyToUndefined, schema);

/**
 * `zodResolver` typed for a form whose raw values (`I`, strings from inputs)
 * differ from the parsed payload (`O`). The resolver returns parsed values, so
 * `handleSubmit` receives `O`.
 */
export function formResolver<I extends FieldValues, O>(schema: z.ZodType<O, unknown>): Resolver<I, unknown, O> {
  // zod 4 renamed the parse-time error map option from `errorMap` to `error`.
  return zodResolver(schema as never, { error: faErrorMap }) as unknown as Resolver<I, unknown, O>;
}
