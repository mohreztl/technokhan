import type { Metadata } from 'next';
import { DesignSystemShowcase } from './client';

export const metadata: Metadata = {
  title: 'دیزاین سیستم',
  description: 'توکن‌ها، تایپوگرافی و کامپوننت‌های تعاملی دیزاین سیستم تکنو خان.',
  robots: { index: false, follow: false },
};

/** Living documentation for the TechnoKhan interface primitives. */
export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
