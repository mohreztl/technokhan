'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Star,
  ChevronLeft,
  Award,
  Shield,
  Users,
  TrendingUp,
  Phone,
  Share2,
  Heart,
  ThumbsUp,
  Play,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { ServiceCard } from '@/components/molecules/service-card';
import { ROUTES, ServiceType, type Service } from '@autolounge/shared';

// Features data
const SERVICE_FEATURES = [
  'پولیش چند مرحله‌ای حرفه‌ای',
  'اصلاح کامل رنگ و برطرف کردن خط‌اندازی‌ها',
  'محافظت با واکس پریمیوم',
  'استفاده از محصولات برند جهانی',
  'ضمانت کیفیت کار',
  'گارانتی یک‌ساله',
];

// Process steps data
const SERVICE_STEPS = [
  { title: 'بازرسی اولیه', description: 'بررسی وضعیت رنگ خودرو و شناسایی مشکلات', icon: '🔍' },
  { title: 'آماده‌سازی', description: 'شستشوی دقیق و آماده‌سازی سطح', icon: '🧽' },
  { title: 'پولیش مرحله اول', description: 'برطرف کردن خطوط عمیق و اکسیداسیون', icon: '⚙️' },
  { title: 'پولیش مرحله دوم', description: 'صیقل و درخشش نهایی', icon: '✨' },
  { title: 'محافظت', description: 'اعمال واکس یا سرامیک کوتینگ', icon: '🛡️' },
  { title: 'بازرسی نهایی', description: 'کنترل کیفیت و تحویل', icon: '✅' },
];

// Testimonials mock data
const MOCK_TESTIMONIALS = [
  {
    id: '1',
    userName: 'علی محمدی',
    rating: 5,
    comment:
      'واقعاً عالی بود! ماشینم مثل تازه از نمایشگاه درآمده. کیفیت کار و رفتار کارشناسان فوق‌العاده بود.',
    date: '۱۴۰۲/۱۲/۱۰',
    carModel: 'بنز C200',
    verified: true,
    helpful: 28,
  },
  {
    id: '2',
    userName: 'رضا احمدی',
    rating: 5,
    comment:
      'بعد از ۷ سال، رنگ ماشینم کاملاً کدر شده بود. با این سرویس، دوباره مثل روز اول شد. ممنون از تیم اتولانژ!',
    date: '۱۴۰۲/۱۲/۰۵',
    carModel: 'BMW 320i',
    verified: true,
    helpful: 19,
  },
  {
    id: '3',
    userName: 'سارا کریمی',
    rating: 5,
    comment: 'حرفه‌ای‌ترین کار که دیدم. تمام خطوط و لکه‌ها برطرف شد و درخششی باورنکردنی گرفت.',
    date: '۱۴۰۲/۱۱/۲۸',
    carModel: 'Audi A4',
    verified: false,
    helpful: 15,
  },
  {
    id: '4',
    userName: 'محمد رضایی',
    rating: 5,
    comment: 'قیمت عالی، کیفیت عالی، خدمات عالی. به همه توصیه می‌کنم.',
    date: '۱۴۰۲/۱۱/۲۰',
    carModel: 'Hyundai Sonata',
    verified: true,
    helpful: 22,
  },
];

// Related services
const RELATED_SERVICES: Service[] = [
  {
    id: '2',
    name: 'دیتیلینگ حرفه‌ای خودرو',
    nameEn: 'Professional Car Detailing',
    description: 'شست‌وشو، واکس و پولیش کامل',
    descriptionEn: 'Complete detailing service',
    price: 3500000,
    duration: 240,
    type: ServiceType.DETAILING,
    images: ['/images/services/detailing.jpg'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'سرامیک کوتینگ پیشرفته',
    nameEn: 'Advanced Ceramic Coating',
    description: 'محافظت حرفه‌ای رنگ خودرو',
    descriptionEn: 'Professional paint protection',
    price: 12000000,
    duration: 360,
    type: ServiceType.CERAMIC_COATING,
    images: ['/images/services/ceramic.jpg'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'پوشش محافظ رنگ (PPF)',
    nameEn: 'Paint Protection Film',
    description: 'نصب فیلم محافظ شفاف',
    descriptionEn: 'Transparent protective film',
    price: 18000000,
    duration: 540,
    type: ServiceType.PPF,
    images: ['/images/services/ppf.jpg'],
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Service type labels
const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [ServiceType.PAINT_RESTORATION]: 'رپینت و صافکاری',
  [ServiceType.DETAILING]: 'دیتیلینگ',
  [ServiceType.CERAMIC_COATING]: 'سرامیک کوتینگ',
  [ServiceType.CAR_WRAP]: 'رپ کامل',
  [ServiceType.PPF]: 'پوشش محافظ',
  [ServiceType.INTERIOR_CLEANING]: 'شستشوی داخلی',
  [ServiceType.ENGINE_CLEANING]: 'شستشوی موتور',
  [ServiceType.HEADLIGHT_RESTORATION]: 'ترمیم چراغ',
  [ServiceType.CUSTOM]: 'سفارشی',
};

interface ServiceDetailClientProps {
  service: Service;
}

export function ServiceDetailClient({ service }: ServiceDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);

  const durationHours = Math.floor(service.duration / 60);
  const durationMinutes = service.duration % 60;
  const durationText =
    durationHours > 0
      ? `${durationHours} ساعت${durationMinutes > 0 ? ` و ${durationMinutes} دقیقه` : ''}`
      : `${durationMinutes} دقیقه`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.name,
          text: service.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-background"
    >
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10" />

        <div className="container-custom px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <motion.nav
            variants={itemVariants}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
            aria-label="Breadcrumb"
          >
            <Link href={ROUTES.HOME} className="hover:text-foreground transition-colors">
              خانه
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <Link href={ROUTES.SERVICES} className="hover:text-foreground transition-colors">
              خدمات
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{service.name}</span>
          </motion.nav>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div variants={itemVariants} className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted border border-primary/10 group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={service.images[selectedImage] || '/images/placeholder-service.jpg'}
                      alt={service.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {service.featured && (
                    <Badge className="bg-secondary text-secondary-foreground px-4 py-1.5 text-sm">
                      ⭐ محبوب‌ترین
                    </Badge>
                  )}
                </div>

                {/* Video Play Button (placeholder) */}
                <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-8 w-8 text-primary fill-primary mr-[-4px]" />
                  </div>
                </button>
              </div>

              {/* Thumbnail Gallery */}
              {service.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {service.images.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden transition-all ${
                        selectedImage === index
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image || '/images/placeholder-service.jpg'}
                        alt={`${service.name} - تصویر ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12vw"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Service Info */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Category Badge */}
              <Badge variant="secondary" className="text-sm px-4 py-1">
                {SERVICE_TYPE_LABELS[service.type] || service.type}
              </Badge>

              {/* Title */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">
                  {service.name}
                </h1>
                <p className="text-lg text-muted-foreground">{service.nameEn}</p>
              </div>

              {/* Price and Duration Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm">مدت زمان</span>
                  </div>
                  <p className="text-2xl font-bold">{durationText}</p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/10">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm">قیمت خدمات</span>
                  </div>
                  <p className="text-2xl font-bold text-secondary">
                    {service.price.toLocaleString('fa-IR')}
                    <span className="text-sm font-normal text-muted-foreground mr-1">تومان</span>
                  </p>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <div>
                <h3 className="font-bold mb-3">ویژگی‌های خدمات:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SERVICE_FEATURES.slice(0, 4).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-muted/50 border border-primary/5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link href={`${ROUTES.BOOKING}?service=${service.id}`} className="block">
                  <Button variant="primary" size="xl" className="w-full gap-3 text-base">
                    <Calendar className="h-5 w-5" />
                    رزرو نوبت برای این خدمات
                  </Button>
                </Link>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Phone className="h-4 w-4" />
                    مشاوره رایگان
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={isFavorite ? 'text-destructive border-destructive' : ''}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive' : ''}`} />
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-primary/10">
                <div className="flex flex-col items-center gap-2 text-center p-3 rounded-xl bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">متخصصان مجرب</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center p-3 rounded-xl bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-secondary" />
                  </div>
                  <span className="text-xs text-muted-foreground">ضمانت کیفیت</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center p-3 rounded-xl bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-success" />
                  </div>
                  <span className="text-xs text-muted-foreground">+۵۰۰۰ مشتری</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Details Tabs Section */}
      <section className="py-12 lg:py-16">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8 w-full justify-center flex-wrap">
                <TabsTrigger value="description" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  توضیحات کامل
                </TabsTrigger>
                <TabsTrigger value="process" className="gap-2">
                  <Clock className="h-4 w-4" />
                  مراحل انجام کار
                </TabsTrigger>
                <TabsTrigger value="testimonials" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  نظرات ({MOCK_TESTIMONIALS.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <div className="space-y-8 p-6 sm:p-8 rounded-2xl bg-muted/30 border border-primary/10">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">درباره این خدمات</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-primary/10">
                    <h4 className="text-xl font-bold mb-4">چرا این خدمات را انتخاب کنید؟</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card className="border-primary/10">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Award className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h5 className="font-bold mb-1">کیفیت حرفه‌ای</h5>
                              <p className="text-sm text-muted-foreground">
                                استفاده از بهترین ابزار و محصولات روز دنیا برای نتیجه‌ای بی‌نظیر
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-primary/10">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                              <Users className="h-6 w-6 text-secondary" />
                            </div>
                            <div>
                              <h5 className="font-bold mb-1">تیم متخصص</h5>
                              <p className="text-sm text-muted-foreground">
                                کارشناسان مجرب با سال‌ها تجربه در زمینه مراقبت از خودرو
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-primary/10">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                              <Shield className="h-6 w-6 text-success" />
                            </div>
                            <div>
                              <h5 className="font-bold mb-1">گارانتی کیفیت</h5>
                              <p className="text-sm text-muted-foreground">
                                ضمانت یک‌ساله روی تمام خدمات با پشتیبانی کامل
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-primary/10">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                              <Clock className="h-6 w-6 text-accent-foreground" />
                            </div>
                            <div>
                              <h5 className="font-bold mb-1">وقت‌شناسی</h5>
                              <p className="text-sm text-muted-foreground">
                                تحویل به‌موقع و احترام به زمان شما
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* All Features */}
                  <div className="pt-6 border-t border-primary/10">
                    <h4 className="text-xl font-bold mb-4">شامل این خدمات می‌شود:</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SERVICE_FEATURES.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-xl bg-background/50"
                        >
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="process">
                <div className="p-6 sm:p-8 rounded-2xl bg-muted/30 border border-primary/10">
                  <h3 className="text-2xl font-bold mb-8">مراحل انجام کار</h3>
                  <div className="space-y-4">
                    {SERVICE_STEPS.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-2xl shrink-0">
                            {step.icon}
                          </div>
                          {index < SERVICE_STEPS.length - 1 && (
                            <div className="w-0.5 h-full bg-gradient-to-b from-primary/50 to-transparent my-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">مرحله {index + 1}</span>
                          </div>
                          <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="testimonials">
                <div className="space-y-6 p-6 sm:p-8 rounded-2xl bg-muted/30 border border-primary/10">
                  {/* Summary */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-primary/10">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">نظرات مشتریان</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className="h-6 w-6 fill-yellow-500 text-yellow-500"
                            />
                          ))}
                        </div>
                        <span className="text-2xl font-bold">۵.۰</span>
                        <span className="text-muted-foreground">
                          از {MOCK_TESTIMONIALS.length} نظر
                        </span>
                      </div>
                    </div>
                    <Button variant="primary" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      ثبت نظر جدید
                    </Button>
                  </div>

                  {/* Testimonials List */}
                  <div className="space-y-4">
                    {MOCK_TESTIMONIALS.map((testimonial) => (
                      <motion.div
                        key={testimonial.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-5 rounded-xl bg-background/50 border border-primary/5"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar size="md" />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold">{testimonial.userName}</span>
                                {testimonial.verified && (
                                  <Badge variant="success" className="text-xs">
                                    <CheckCircle2 className="h-3 w-3 ml-1" />
                                    تایید شده
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{testimonial.carModel}</span>
                                <span>•</span>
                                <span>{testimonial.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${
                                  index < testimonial.rating
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-foreground leading-relaxed mb-4">{testimonial.comment}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            مفید بود ({testimonial.helpful})
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <Badge variant="secondary" className="mb-3">خدمات مرتبط</Badge>
                <h2 className="text-2xl sm:text-3xl font-black">
                  شاید این خدمات هم مناسب شما باشد
                </h2>
              </div>
              <Link href={ROUTES.SERVICES}>
                <Button variant="outline" className="gap-2">
                  مشاهده همه
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {RELATED_SERVICES.map((relatedService, index) => (
                <motion.div
                  key={relatedService.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ServiceCard service={relatedService} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
            <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
            
            <div className="relative p-8 sm:p-12 lg:p-16 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-foreground mb-4">
                آماده‌اید خودروتان را متحول کنید؟
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                همین الان نوبت رزرو کنید و از خدمات حرفه‌ای ما بهره‌مند شوید
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`${ROUTES.BOOKING}?service=${service.id}`}>
                  <Button
                    size="xl"
                    className="bg-white text-primary hover:bg-white/90 gap-2 w-full sm:w-auto"
                  >
                    <Calendar className="h-5 w-5" />
                    رزرو نوبت
                  </Button>
                </Link>
                <Link href={ROUTES.CONTACT}>
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-white text-white hover:bg-white/10 gap-2 w-full sm:w-auto"
                  >
                    <Phone className="h-5 w-5" />
                    تماس با ما
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
