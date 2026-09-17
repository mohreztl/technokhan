// Team members shown on the about page
import type { TeamMember } from '../types';

export const TEAM: TeamMember[] = [
  {
    id: 'ceo',
    name: 'امیرحسین رادمنش',
    role: 'بنیان‌گذار و مدیرعامل',
    bio: 'امیرحسین با بیش از ۱۵ سال تجربه در صنعت خودرو و پس از گذراندن دوره‌های تخصصی دیتیلینگ در آلمان و امارات، اتولانژ را با هدف ارائه‌ی استاندارد جهانی مراقبت از خودرو در تهران بنیان گذاشت. او هنوز هم هر پروژه‌ی سرامیک و PPF را پیش از تحویل شخصاً بازبینی می‌کند.',
    image: '/images/team/ceo.webp',
    experienceYears: 15,
    specialties: ['مدیریت کیفیت', 'پوشش‌های سرامیکی', 'مشاوره‌ی خودروهای لوکس'],
    socials: { instagram: 'https://instagram.com/autolounge.ir', linkedin: 'https://linkedin.com/company/autolounge' },
  },
  {
    id: 'tech-lead',
    name: 'سعید محمودی',
    role: 'مدیر فنی و متخصص پوشش‌های نانو',
    bio: 'سعید دارای گواهی رسمی Gtechniq و XPEL است و مسئولیت آموزش تکنسین‌ها و کنترل فنی تمام پروژه‌های سرامیک و فیلم محافظ را بر عهده دارد. تخصص او در اندازه‌گیری ضخامت رنگ و انتخاب روش صحیح اصلاح رنگ، اتولانژ را به مرجع خودروهای لوکس تبدیل کرده است.',
    image: '/images/team/tech-lead.webp',
    experienceYears: 12,
    specialties: ['سرامیک بدنه', 'فیلم محافظ رنگ', 'اصلاح رنگ چندمرحله‌ای'],
    socials: { instagram: 'https://instagram.com/autolounge.ir' },
  },
  {
    id: 'workshop-lead',
    name: 'رضا قنبری',
    role: 'سرپرست کارگاه و استاد احیای رنگ',
    bio: 'رضا با ۱۸ سال تجربه‌ی عملی در صافکاری و پولیش، نظارت بر اجرای روزانه‌ی کارگاه را بر عهده دارد و پیچیده‌ترین پروژه‌های احیای رنگ به دست او انجام می‌شود. دقت او در کار با دستگاه روتاری روی رنگ‌های نرم ژاپنی و رنگ‌های سخت آلمانی زبانزد همکاران است.',
    image: '/images/team/workshop-lead.webp',
    experienceYears: 18,
    specialties: ['احیای رنگ', 'پولیش روتاری', 'حذف خط‌وخش عمیق', 'رپ خودرو'],
  },
  {
    id: 'customer-relations',
    name: 'مهسا کاظمی',
    role: 'مدیر ارتباط با مشتریان',
    bio: 'مهسا از لحظه‌ی ثبت رزرو تا تحویل خودرو همراه مشتریان است و هماهنگی نوبت‌ها، خدمات در محل و پیگیری گارانتی را مدیریت می‌کند. باور او این است که تجربه‌ی مشتری باید به همان اندازه‌ی رنگ خودرو بی‌نقص باشد.',
    image: '/images/team/customer-relations.webp',
    experienceYears: 7,
    specialties: ['پشتیبانی مشتریان', 'مدیریت رزرو', 'پیگیری گارانتی'],
    socials: { instagram: 'https://instagram.com/autolounge.ir' },
  },
];
