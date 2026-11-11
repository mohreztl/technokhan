import type { Metadata } from 'next';
import { ContactForm } from './client';

export const metadata: Metadata = {
  title: 'تماس با تکنو خان',
  description: 'پرسش درباره سفارش، اصالت، گارانتی یا انتخاب گجت؛ فرم تماس تکنو خان و راهنمای پشتیبانی.',
  alternates: { canonical: '/contact' },
};

/** Contact page with support guidance and a validated demo contact form. */
export default function ContactPage() {
  return <ContactForm />;
}
