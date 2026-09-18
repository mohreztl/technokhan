import { z } from 'zod';
import { toPersianDigits } from '../utils/digits';

/**
 * Persian messages for the generic zod issues. Schemas carry their own message
 * for the specific ones; this covers everything they do not — chiefly a missing
 * required field, which zod otherwise reports in English.
 *
 * The web installs it per-parse through the form resolver; the API installs it
 * globally, since its validation errors are surfaced to the user verbatim.
 *
 * zod 4 shape: the map takes the issue alone — there is no `ctx`, and returning
 * `undefined` is how you defer to zod's own message. The issue fields moved too:
 * `type` → `origin`, `received` → `input`, and `invalid_enum_value` /
 * `invalid_string` collapsed into `invalid_value` / `invalid_format`.
 */
export const faErrorMap: z.ZodErrorMap = (issue) => {
  switch (issue.code) {
    case 'invalid_type':
      if (issue.expected === 'int') return { message: 'باید عدد صحیح باشد' };
      if (issue.input == null || (typeof issue.input === 'number' && Number.isNaN(issue.input))) {
        return { message: 'این فیلد الزامی است' };
      }
      return { message: 'مقدار وارد شده معتبر نیست' };
    case 'too_small':
      if (issue.origin === 'string') return { message: `حداقل ${fa(issue.minimum)} حرف وارد کنید` };
      if (issue.origin === 'number') {
        return {
          message: issue.inclusive
            ? `باید حداقل ${fa(issue.minimum)} باشد`
            : `باید بزرگ‌تر از ${fa(issue.minimum)} باشد`,
        };
      }
      if (issue.origin === 'array') return { message: `حداقل ${fa(issue.minimum)} مورد لازم است` };
      return { message: 'مقدار وارد شده کم است' };
    case 'too_big':
      if (issue.origin === 'string') return { message: `حداکثر ${fa(issue.maximum)} حرف مجاز است` };
      if (issue.origin === 'number') return { message: `باید حداکثر ${fa(issue.maximum)} باشد` };
      return { message: 'مقدار وارد شده زیاد است' };
    case 'invalid_value':
      return { message: 'گزینهٔ معتبری انتخاب کنید' };
    case 'invalid_format':
      return { message: 'قالب وارد شده معتبر نیست' };
    case 'unrecognized_keys':
      return { message: 'فیلد ناشناخته در درخواست وجود دارد' };
    default:
      return undefined;
  }
};

const fa = (n: number | bigint): string => toPersianDigits(String(n));
