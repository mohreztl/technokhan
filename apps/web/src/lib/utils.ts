import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price to Persian currency format
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + ' تومان';
}

/**
 * Format number to Persian
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fa-IR').format(num);
}

/**
 * Convert Persian digits to English
 */
export function persianToEnglish(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d).toString());
}

/**
 * Convert English digits to Persian
 */
export function englishToPersian(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

/**
 * Format date to Persian
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format duration in minutes to readable format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${formatNumber(mins)} دقیقه`;
  } else if (mins === 0) {
    return `${formatNumber(hours)} ساعت`;
  } else {
    return `${formatNumber(hours)} ساعت و ${formatNumber(mins)} دقیقه`;
  }
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Generate slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u0600-\u06FF]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Validate Iranian phone number
 */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = persianToEnglish(phone.replace(/\D/g, ''));
  return /^09[0-9]{9}$/.test(cleaned);
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = persianToEnglish(phone.replace(/\D/g, ''));
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
