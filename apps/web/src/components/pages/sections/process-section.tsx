import * as React from 'react';
import type { ServiceStep } from '@autolounge/shared';
import { SectionHeading } from '@/components/ui/premium-components';
import { ProcessTimeline } from '@/components/creative/process-timeline';

/** Generic customer journey shown on the home page (service pages use `service.steps`). */
export const PROCESS_STEPS: ServiceStep[] = [
  {
    title: 'مشاوره و بازدید',
    description: 'کارشناس ما وضعیت رنگ و بدنه را بررسی می‌کند و بهترین راهکار را متناسب با بودجهٔ شما پیشنهاد می‌دهد.',
    icon: 'search-check',
  },
  {
    title: 'رزرو آنلاین',
    description: 'زمان مناسب را از تقویم انتخاب کنید؛ تأیید نوبت بلافاصله پیامک می‌شود.',
    icon: 'calendar-check',
  },
  {
    title: 'اجرا توسط متخصصان',
    description: 'کار در سالن مجهز اتولانژ با مواد اورجینال و ابزار حرفه‌ای توسط تکنسین‌های دارای مدرک انجام می‌شود.',
    icon: 'sparkles',
  },
  {
    title: 'کنترل کیفیت',
    description: 'هر پروژه پیش از تحویل زیر نور بازرسی، به‌صورت چندمرحله‌ای بررسی و ثبت می‌شود.',
    icon: 'clipboard-check',
  },
  {
    title: 'تحویل و پشتیبانی',
    description: 'خودرو با گارانتی کتبی تحویل می‌شود و تیم پشتیبانی پس از تحویل در کنار شماست.',
    icon: 'key',
  },
];

export function ProcessSection() {
  return (
    <section className="py-16 lg:py-24" aria-labelledby="process-title">
      <div className="container-custom">
        <SectionHeading
          id="process-title"
          eyebrow="روند کار"
          title="از رزرو تا تحویل، در پنج قدم"
          subtitle="فرایندی شفاف و قابل پیگیری؛ در هر مرحله می‌دانید خودروی شما در چه وضعیتی است."
        />
        <ProcessTimeline steps={PROCESS_STEPS} />
      </div>
    </section>
  );
}
