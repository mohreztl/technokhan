'use client';

import * as React from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toEnglishDigits, toPersianDigits } from '@technokhan/shared';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

export const PLATE_LETTERS = [
  'الف',
  'ب',
  'پ',
  'ت',
  'ث',
  'ج',
  'د',
  'س',
  'ص',
  'ط',
  'ع',
  'ف',
  'ق',
  'ک',
  'گ',
  'ل',
  'م',
  'ن',
  'و',
  'ه',
  'ی',
  'ژ',
] as const;
export type PlateLetter = (typeof PLATE_LETTERS)[number];

const LETTER_HINTS: Partial<Record<PlateLetter, string>> = {
  الف: 'دولتی',
  پ: 'پلیس',
  ت: 'تاکسی',
  ث: 'سپاه',
  ع: 'عمومی',
  ک: 'کشاورزی',
  ژ: 'معلولین و جانبازان',
};

export interface PlateParts {
  first: string; // 2 digits
  letter: string;
  second: string; // 3 digits
  region: string; // 2 digits (under «ایران»)
}

const EMPTY: PlateParts = { first: '', letter: '', second: '', region: '' };

/** Lenient parser for "12 ب 345 - 11" (Persian/Arabic/Latin digits, partial values allowed). */
export function parsePlate(value?: string | null): PlateParts {
  if (!value) return { ...EMPTY };
  const v = toEnglishDigits(value).replace(/[‌\s]+/g, ' ').trim();
  const [mainRaw = '', regionRaw = ''] = v.split(/\s*[-–—]\s*/);
  const region = regionRaw.replace(/\D/g, '').slice(0, 2);
  const m = mainRaw.match(/^(\d{0,2})\s*([^\d\s-]*)\s*(\d{0,3})/);
  return {
    first: m?.[1] ?? '',
    letter: m?.[2] ?? '',
    second: m?.[3] ?? '',
    region,
  };
}

/** Normalized storage format: "12 ب 345 - 11" (Latin digits). Empty parts stay empty. */
export function formatPlate(parts: PlateParts): string {
  const { first, letter, second, region } = parts;
  if (!first && !letter && !second && !region) return '';
  return `${first} ${letter} ${second} - ${region}`;
}

export function isPlateComplete(value?: string | null): boolean {
  const p = parsePlate(value);
  return (
    p.first.length === 2 &&
    (PLATE_LETTERS as readonly string[]).includes(p.letter) &&
    p.second.length === 3 &&
    p.region.length === 2
  );
}

export interface PlateInputProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  /** error message (string) or just the error state (true) */
  error?: string | boolean;
  disabled?: boolean;
  /** adds a hidden input carrying the normalized value for plain forms */
  name?: string;
  id?: string;
  label?: string;
}

const CELL =
  'h-11 w-full rounded-md bg-transparent text-center text-xl font-bold tabular-nums text-neutral-900 outline-hidden placeholder:text-neutral-300 focus:bg-secondary/25 disabled:cursor-not-allowed';

/**
 * Iranian licence plate input: [2 digits][letter][3 digits] | «ایران» [2 digits].
 * Emits the normalized string "12 ب 345 - 11"; accepts any digit script when typing.
 */
export function PlateInput({
  value,
  onChange,
  className,
  error,
  disabled,
  name,
  id,
  label = 'پلاک خودرو',
}: PlateInputProps) {
  const uid = useId();
  const groupId = id ?? `plate-${uid}`;
  const errorId = `${groupId}-error`;
  const reduced = useReducedMotion();
  const [parts, setParts] = useState<PlateParts>(() => parsePlate(value));
  const [pickerOpen, setPickerOpen] = useState(false);
  const lastEmitted = useRef(formatPlate(parsePlate(value)));

  const rootRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const letterRef = useRef<HTMLButtonElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLInputElement>(null);

  // Controlled value changed from outside (e.g. reset) → re-parse.
  useEffect(() => {
    if (value === undefined || value === lastEmitted.current) return;
    lastEmitted.current = value;
    setParts(parsePlate(value));
  }, [value]);

  const commit = (patch: Partial<PlateParts>) => {
    const next = { ...parts, ...patch };
    setParts(next);
    const s = formatPlate(next);
    lastEmitted.current = s;
    onChange(s);
  };

  const onDigits =
    (key: 'first' | 'second' | 'region', max: number, next?: React.RefObject<HTMLElement | null>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, max);
      const patch: Partial<PlateParts> = {};
      patch[key] = digits;
      commit(patch);
      if (digits.length === max) next?.current?.focus();
    };

  const onBackspace =
    (prev?: React.RefObject<HTMLElement | null>) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && e.currentTarget.value === '' && prev?.current) {
        e.preventDefault();
        prev.current.focus();
      }
    };

  // Pasting a whole plate into the first cell fills every segment.
  const onPasteFull = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (/[^\d۰-۹٠-٩\s]/.test(text)) {
      e.preventDefault();
      commit(parsePlate(text));
      regionRef.current?.focus();
    }
  };

  const chooseLetter = (letter: string) => {
    commit({ letter });
    setPickerOpen(false);
    secondRef.current?.focus();
  };

  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPickerOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPickerOpen(false);
        letterRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  const hasError = Boolean(error);
  const errorText = typeof error === 'string' ? error : '';

  return (
    <div ref={rootRef} className={cn('w-full max-w-[360px]', className)}>
      <div
        id={groupId}
        role="group"
        aria-label={label}
        aria-describedby={errorText ? errorId : undefined}
        dir="ltr"
        className={cn(
          'flex h-16 w-full overflow-hidden rounded-lg border-2 bg-white shadow-xs transition-colors',
          hasError ? 'border-destructive ring-2 ring-destructive/30' : 'border-neutral-800',
          disabled && 'opacity-60'
        )}
      >
        {/* Blue strip (flag + I.R. IRAN) — always on the physical left */}
        <div
          aria-hidden="true"
          className="flex w-9 shrink-0 flex-col items-center justify-between bg-[#1d4ed8] py-1.5 text-white"
        >
          <span className="flex flex-col gap-px">
            <i className="block h-1 w-5 bg-[#239f40]" />
            <i className="block h-1 w-5 bg-white" />
            <i className="block h-1 w-5 bg-[#da0000]" />
          </span>
          <span className="text-center text-[7px] font-bold leading-[1.1] tracking-wide">
            I.R.
            <br />
            IRAN
          </span>
        </div>

        {/* [2 digits][letter][3 digits] */}
        <div className="flex flex-1 items-center justify-center gap-1 px-1.5">
          <input
            ref={firstRef}
            className={cn(CELL, 'w-12')}
            value={toPersianDigits(parts.first)}
            onChange={onDigits('first', 2, letterRef)}
            onPaste={onPasteFull}
            inputMode="numeric"
            autoComplete="off"
            maxLength={2}
            placeholder="۱۲"
            aria-label="دو رقم اول پلاک"
            aria-invalid={hasError || undefined}
            disabled={disabled}
          />
          <button
            ref={letterRef}
            type="button"
            aria-label={parts.letter ? `حرف پلاک: ${parts.letter}` : 'انتخاب حرف پلاک'}
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((o) => !o)}
            disabled={disabled}
            className={cn(
              'h-11 w-12 rounded-md font-bold text-neutral-900 outline-hidden transition-colors focus-visible:bg-secondary/25 disabled:cursor-not-allowed',
              parts.letter.length > 1 ? 'text-base' : 'text-xl',
              !parts.letter && 'text-sm text-neutral-400',
              pickerOpen && 'bg-secondary/25'
            )}
          >
            {parts.letter || 'حرف'}
          </button>
          <input
            ref={secondRef}
            className={cn(CELL, 'w-16')}
            value={toPersianDigits(parts.second)}
            onChange={onDigits('second', 3, regionRef)}
            onKeyDown={onBackspace(letterRef)}
            inputMode="numeric"
            autoComplete="off"
            maxLength={3}
            placeholder="۳۴۵"
            aria-label="سه رقم پلاک"
            aria-invalid={hasError || undefined}
            disabled={disabled}
          />
        </div>

        {/* «ایران» + region code */}
        <div className="flex w-16 shrink-0 flex-col items-center justify-center border-l-2 border-neutral-800 px-1">
          <span aria-hidden="true" className="text-[10px] font-bold leading-none text-neutral-900">
            ایران
          </span>
          <input
            ref={regionRef}
            className={cn(CELL, 'h-10 text-lg')}
            value={toPersianDigits(parts.region)}
            onChange={onDigits('region', 2)}
            onKeyDown={onBackspace(secondRef)}
            inputMode="numeric"
            autoComplete="off"
            maxLength={2}
            placeholder="۱۱"
            aria-label="کد شهر پلاک"
            aria-invalid={hasError || undefined}
            disabled={disabled}
          />
        </div>
      </div>

      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            role="listbox"
            aria-label="انتخاب حرف پلاک"
            initial={reduced ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="glass-effect-strong mt-2 grid grid-cols-6 gap-1 rounded-xl p-2 sm:grid-cols-8"
          >
            {PLATE_LETTERS.map((l) => {
              const selected = parts.letter === l;
              return (
                <button
                  key={l}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  title={LETTER_HINTS[l]}
                  onClick={() => chooseLetter(l)}
                  className={cn(
                    'h-11 rounded-lg text-base font-bold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary',
                    selected
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  {l}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {name && <input type="hidden" name={name} value={formatPlate(parts)} />}

      {errorText && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-destructive">
          {errorText}
        </p>
      )}
    </div>
  );
}
