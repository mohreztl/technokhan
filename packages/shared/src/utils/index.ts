// Shared utility functions
export * from './digits';
export * from './pricing';
export * from './tracking';

import { toEnglishDigits, formatToman } from './digits';

/** @deprecated use formatToman */
export const formatPrice = (price: number): string => formatToman(price);

export const formatPhoneNumber = (phone: string): string => {
  // Format: 09XX XXX XXXX
  const cleaned = toEnglishDigits(phone).replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

export const normalizePhoneNumber = (phone: string): string =>
  toEnglishDigits(phone).replace(/\D/g, '');

export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = normalizePhoneNumber(phone);
  return /^09\d{9}$/.test(cleaned);
};

export const validatePostalCode = (postalCode: string): boolean => {
  const cleaned = toEnglishDigits(postalCode).replace(/\D/g, '');
  return /^\d{10}$/.test(cleaned);
};

/** Slug that keeps Persian letters (used for ids and anchors) */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/** Booking tracking code from a db id: "BK-3F9A2C" */
export const trackingCodeFromId = (prefix: string, id: string): string =>
  `${prefix}-${id.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase()}`;

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
