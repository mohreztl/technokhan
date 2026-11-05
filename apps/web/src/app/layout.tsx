import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/organisms/navbar';
import { Footer } from '@/components/organisms/footer';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { ScrollProgress } from '@/components/ui/interactive-effects';
import { JsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

const vazirmatn = localFont({
  src: '../../public/fonts/Vazirmatn-Variable.ttf',
  variable: '--font-vazirmatn',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: true,
  fallback: ['Tahoma', 'Arial', 'sans-serif'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://technokhan.com';

export const metadata: Metadata = {
  title: {
    default: 'تکنو خان | گجت‌های اورجینال، انتخاب دقیق',
    template: '%s | تکنو خان',
  },
  description: 'فروشگاه تخصصی گجت‌های هوشمند، لوازم جانبی موبایل و تجهیزات دیجیتال با ضمانت اصالت و راهنمای انتخاب.',
  keywords: ['گجت هوشمند', 'لوازم جانبی موبایل', 'هدفون', 'شارژر GaN', 'پاوربانک', 'ساعت هوشمند', 'تکنو خان'],
  authors: [{ name: 'TechnoKhan' }],
  creator: 'TechnoKhan',
  publisher: 'TechnoKhan',
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL(siteUrl),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: '/',
    siteName: 'تکنو خان',
    title: 'تکنو خان | گجت‌های اورجینال، انتخاب دقیق',
    description: 'تجهیزات دیجیتال منتخب با ضمانت اصالت، ارسال سریع و راهنمای تخصصی خرید.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تکنو خان',
    description: 'گجت‌های اورجینال، انتخاب دقیق.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'تکنو خان', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2F3EF' },
    { media: '(prefers-color-scheme: dark)', color: '#090B0C' },
  ],
};

/** Persian RTL document shell with a self-hosted variable font and global providers. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} no-js`} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.remove('no-js')" }} />
        <a href="#content" className="fixed inset-s-4 top-3 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-transform focus:translate-y-0">
          رفتن به محتوای اصلی
        </a>
        <Suspense fallback={null}><GoogleAnalytics /></Suspense>
        <Providers>
          <ScrollProgress />
          <div className="flex min-h-dvh flex-col">
            <Navbar />
            <main id="content" tabIndex={-1} className="flex-1 pt-[calc(5rem+env(safe-area-inset-top))] pb-tabbar lg:pb-0">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
