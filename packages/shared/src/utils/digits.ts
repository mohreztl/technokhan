// Digit helpers: Persian (U+06F0–U+06F9) and Arabic-Indic (U+0660–U+0669) <-> ASCII

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toEnglishDigits(input: string | number): string {
  return String(input)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** 1250000 -> "۱٬۲۵۰٬۰۰۰" */
export function formatNumberFa(value: number): string {
  return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(value);
}

/** 1250000 -> "۱٬۲۵۰٬۰۰۰ تومان" */
export function formatToman(value: number): string {
  return `${formatNumberFa(value)} تومان`;
}

/** Compact Persian money for tight UI: 1250000 -> "۱.۲۵ میلیون" */
export function formatTomanCompact(value: number): string {
  if (value >= 1_000_000_000) return `${toPersianDigits((value / 1_000_000_000).toFixed(1))} میلیارد`;
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${toPersianDigits(Number.isInteger(m) ? m : m.toFixed(1))} میلیون`;
  }
  if (value >= 1_000) return `${formatNumberFa(Math.round(value / 1000))} هزار`;
  return formatNumberFa(value);
}
