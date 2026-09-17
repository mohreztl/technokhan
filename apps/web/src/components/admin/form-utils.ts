import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, Resolver } from 'react-hook-form';
import { toEnglishDigits } from '@autolounge/shared';

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

/** Persian messages for the generic zod issues (schemas already carry their own for the specific ones). */
export const faErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === 'integer') return { message: 'باید عدد صحیح باشد' };
      if (issue.received === 'undefined' || issue.received === 'null' || issue.received === 'nan') {
        return { message: 'این فیلد الزامی است' };
      }
      return { message: 'مقدار وارد شده معتبر نیست' };
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') return { message: `حداقل ${toFa(issue.minimum)} حرف وارد کنید` };
      if (issue.type === 'number') {
        return { message: issue.inclusive ? `باید حداقل ${toFa(issue.minimum)} باشد` : `باید بزرگ‌تر از ${toFa(issue.minimum)} باشد` };
      }
      if (issue.type === 'array') return { message: `حداقل ${toFa(issue.minimum)} مورد لازم است` };
      return { message: 'مقدار وارد شده کم است' };
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') return { message: `حداکثر ${toFa(issue.maximum)} حرف مجاز است` };
      if (issue.type === 'number') return { message: `باید حداکثر ${toFa(issue.maximum)} باشد` };
      return { message: 'مقدار وارد شده زیاد است' };
    case z.ZodIssueCode.invalid_enum_value:
      return { message: 'گزینهٔ معتبری انتخاب کنید' };
    case z.ZodIssueCode.invalid_string:
      return { message: 'قالب وارد شده معتبر نیست' };
    default:
      return { message: ctx.defaultError };
  }
};

function toFa(n: number | bigint): string {
  return String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

/**
 * `zodResolver` typed for a form whose raw values (`I`, strings from inputs)
 * differ from the parsed payload (`O`). The resolver returns parsed values, so
 * `handleSubmit` receives `O`.
 */
export function formResolver<I extends FieldValues, O>(schema: z.ZodType<O, z.ZodTypeDef, unknown>): Resolver<I, unknown, O> {
  return zodResolver(schema, { errorMap: faErrorMap }) as unknown as Resolver<I, unknown, O>;
}
