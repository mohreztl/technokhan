import type { Metadata } from 'next';
import { FAQ } from '@technokhan/shared';
import { FaqClient } from './client';

export const metadata: Metadata = {
  title: 'سوالات متداول تکنو خان',
  description: 'پاسخ پرسش‌های پرتکرار درباره اصالت، ارسال، گارانتی، بازگشت کالا، GaN و پرداخت در نسخه نمایشی.',
  alternates: { canonical: '/faq' },
};

/** Searchable FAQ page with FAQPage structured data. */
export default function FaqPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
  };
  return <><FaqClient /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} /></>;
}
