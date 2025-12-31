import { Metadata } from 'next';
import { AboutPageClient } from './client';

export const metadata: Metadata = {
  title: 'درباره ما | تاریخچه و معرفی تیم اتولانژ',
  description: 'آشنایی با مجموعه اتولانژ، تیم متخصص ما، تاریخچه و افتخارات. بیش از ۱۰ سال تجربه در خدمات مراقبت و زیبایی خودرو',
  openGraph: {
    title: 'درباره اتولانژ | مرکز تخصصی مراقبت از خودرو',
    description: 'آشنایی با مجموعه اتولانژ، تیم متخصص ما و تاریخچه بیش از ۱۰ ساله در خدمات خودرو',
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
