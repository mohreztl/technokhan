import { toEnglishDigits, type SiteSettings } from '@technokhan/shared';

const BALE_URL = 'https://ble.ir/technokhan';

export interface SupportContactLink {
  id: 'phone' | 'bale' | 'whatsapp';
  label: string;
  href: string;
}

type ContactSettings = Pick<SiteSettings, 'phone' | 'mobile' | 'whatsapp'>;

function validWhatsAppUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'wa.me' && /^\/\d{7,15}\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

export function getSupportContactLinks(settings: ContactSettings): SupportContactLink[] {
  const links: SupportContactLink[] = [];
  const phone = toEnglishDigits(settings.mobile.trim() || settings.phone.trim()).replace(/[\s()-]/g, '');
  if (/^\+?\d{7,15}$/.test(phone)) links.push({ id: 'phone', label: 'تماس تلفنی', href: `tel:${phone}` });
  links.push({ id: 'bale', label: 'پیام در بله', href: BALE_URL });
  const whatsapp = settings.whatsapp.trim();
  if (validWhatsAppUrl(whatsapp)) links.push({ id: 'whatsapp', label: 'پیام در واتس‌اپ', href: whatsapp });
  return links;
}
