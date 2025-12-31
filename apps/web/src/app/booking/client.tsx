'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BOOKING_TIME_SLOTS, PROVINCES, ServiceType } from '@autolounge/shared';
import type { Service } from '@autolounge/shared';
import { formatPrice, formatDuration, englishToPersian } from '@/lib/utils';

// Mock Services
const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'رپینت و صافکاری کامل',
    nameEn: 'Full Paint Restoration',
    description: 'بازگرداندن درخشش اصلی رنگ خودرو',
    descriptionEn: 'Restore original paint shine',
    price: 15000000,
    duration: 480,
    type: ServiceType.PAINT_RESTORATION,
    images: [],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'دیتیلینگ حرفه‌ای',
    nameEn: 'Professional Detailing',
    description: 'شست‌وشو و پولیش کامل داخل و خارج',
    descriptionEn: 'Complete interior and exterior detailing',
    price: 3500000,
    duration: 240,
    type: ServiceType.DETAILING,
    images: [],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'سرامیک کوتینگ',
    nameEn: 'Ceramic Coating',
    description: 'محافظت ۵ ساله با نانو سرامیک',
    descriptionEn: '5-year protection',
    price: 8000000,
    duration: 360,
    type: ServiceType.CERAMIC_COATING,
    images: [],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'PPF (محافظ رنگ)',
    nameEn: 'Paint Protection Film',
    description: 'نصب فیلم محافظ رنگ',
    descriptionEn: 'PPF installation',
    price: 25000000,
    duration: 720,
    type: ServiceType.PPF,
    images: [],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'کاورینگ رپ',
    nameEn: 'Car Wrap',
    description: 'تغییر رنگ کامل خودرو',
    descriptionEn: 'Full color change',
    price: 35000000,
    duration: 1440,
    type: ServiceType.CAR_WRAP,
    images: [],
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Car Brands
const CAR_BRANDS = [
  'بنز', 'BMW', 'آئودی', 'پورشه', 'رنجروور', 'تویوتا', 'لکسوس',
  'هوندا', 'مزدا', 'هیوندای', 'کیا', 'پژو', 'سمند', 'دنا', 'سایر'
];

interface BookingFormData {
  serviceId: string;
  date: string;
  timeSlot: string;
  name: string;
  phone: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  carColor: string;
  location: string;
  notes: string;
}

const STEPS = [
  { id: 1, title: 'انتخاب خدمت', icon: Sparkles },
  { id: 2, title: 'تاریخ و ساعت', icon: Calendar },
  { id: 3, title: 'اطلاعات خودرو', icon: Car },
  { id: 4, title: 'اطلاعات شخصی', icon: User },
  { id: 5, title: 'تأیید نهایی', icon: CheckCircle },
];

export function BookingPageClient() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    serviceId: '',
    date: '',
    timeSlot: '',
    name: '',
    phone: '',
    carBrand: '',
    carModel: '',
    carYear: '',
    carColor: '',
    location: '',
    notes: '',
  });

  const selectedService = MOCK_SERVICES.find(s => s.id === formData.serviceId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.serviceId !== '';
      case 2: return formData.date !== '' && formData.timeSlot !== '';
      case 3: return formData.carBrand !== '' && formData.carModel !== '' && formData.carYear !== '' && formData.carColor !== '';
      case 4: return formData.name !== '' && formData.phone !== '' && formData.location !== '';
      default: return true;
    }
  };

  // Generate next 14 days for date picker
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    // Skip Fridays (day 5 in Persian calendar context, but we'll use simple logic)
    return {
      date: date.toISOString().split('T')[0],
      dayName: new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date),
      dayNumber: new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date),
      monthName: new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date),
      isDisabled: date.getDay() === 5, // Friday
    };
  });

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-background py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-4">رزرو شما ثبت شد!</h1>
            <p className="text-muted-foreground mb-8">
              کد پیگیری: <span className="font-bold text-foreground">BK-{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
              <br />
              به زودی کارشناسان ما برای تأیید نهایی با شما تماس خواهند گرفت
            </p>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 text-right">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">خدمت:</span>
                      <span className="font-medium">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">تاریخ:</span>
                      <span className="font-medium">{formData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ساعت:</span>
                      <span className="font-medium">{formData.timeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">خودرو:</span>
                      <span className="font-medium">{formData.carBrand} {formData.carModel}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="text-muted-foreground">مبلغ:</span>
                      <span className="font-bold text-primary">{formatPrice(selectedService?.price || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
                بازگشت به صفحه اصلی
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4 gap-2">
              <Calendar className="h-3 w-3" />
              رزرو آنلاین
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-gradient-luxury">
              رزرو نوبت خدمات
            </h1>
            <p className="text-muted-foreground">
              در چند قدم ساده نوبت خود را رزرو کنید
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-8 border-b border-border">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-4 overflow-x-auto pb-4">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap ${
                    currentStep === step.id
                      ? 'bg-primary text-primary-foreground'
                      : currentStep > step.id
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                  <span className="sm:hidden text-sm font-medium">{step.id}</span>
                </motion.div>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 ${currentStep > step.id ? 'bg-success' : 'bg-border'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-12">
        <div className="container-custom max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Service */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                  خدمت مورد نظر خود را انتخاب کنید
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {MOCK_SERVICES.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all ${
                        formData.serviceId === service.id
                          ? 'ring-2 ring-primary border-primary'
                          : 'hover:shadow-lg'
                      }`}
                      onClick={() => setFormData({ ...formData, serviceId: service.id })}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-bold text-foreground">{service.name}</h3>
                          {formData.serviceId === service.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDuration(service.duration)}
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(service.price)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Date & Time */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                  تاریخ و ساعت را انتخاب کنید
                </h2>

                {/* Date Picker */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">تاریخ</h3>
                  <div className="flex gap-3 overflow-x-auto pb-4">
                    {availableDates.map((day) => (
                      <button
                        key={day.date}
                        disabled={day.isDisabled}
                        onClick={() => setFormData({ ...formData, date: day.date })}
                        className={`flex-shrink-0 w-20 p-3 rounded-xl border text-center transition-all ${
                          day.isDisabled
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : formData.date === day.date
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card border-border hover:border-primary'
                        }`}
                      >
                        <div className="text-xs mb-1">{day.dayName}</div>
                        <div className="text-2xl font-bold">{day.dayNumber}</div>
                        <div className="text-xs">{day.monthName}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">ساعت</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BOOKING_TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setFormData({ ...formData, timeSlot: slot })}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          formData.timeSlot === slot
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card border-border hover:border-primary'
                        }`}
                      >
                        <Clock className="h-4 w-4 mx-auto mb-2" />
                        <span className="font-medium">{englishToPersian(slot)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Car Info */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                  مشخصات خودروی خود را وارد کنید
                </h2>
                <Card>
                  <CardContent className="p-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          برند خودرو *
                        </label>
                        <select
                          name="carBrand"
                          value={formData.carBrand}
                          onChange={handleChange}
                          className="w-full h-12 px-4 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">انتخاب کنید</option>
                          {CAR_BRANDS.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          مدل خودرو *
                        </label>
                        <Input
                          name="carModel"
                          value={formData.carModel}
                          onChange={handleChange}
                          placeholder="مثال: E200"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          سال ساخت *
                        </label>
                        <Input
                          name="carYear"
                          value={formData.carYear}
                          onChange={handleChange}
                          placeholder="مثال: ۱۴۰۲"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          رنگ خودرو *
                        </label>
                        <Input
                          name="carColor"
                          value={formData.carColor}
                          onChange={handleChange}
                          placeholder="مثال: مشکی"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Personal Info */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                  اطلاعات تماس خود را وارد کنید
                </h2>
                <Card>
                  <CardContent className="p-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          نام و نام خانوادگی *
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="نام شما"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          شماره تماس *
                        </label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        محل ارائه خدمات *
                      </label>
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full h-12 px-4 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">انتخاب کنید</option>
                        <option value="workshop">مراجعه به مجموعه</option>
                        <option value="home">خدمات در محل</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        توضیحات اضافی
                      </label>
                      <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="توضیحات یا درخواست‌های خاص..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                  بررسی و تأیید نهایی
                </h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Service */}
                      <div className="flex items-start gap-4 pb-6 border-b border-border">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">خدمت</h4>
                          <p className="text-muted-foreground">{selectedService?.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            مدت زمان: {formatDuration(selectedService?.duration || 0)}
                          </p>
                        </div>
                        <div className="text-left">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(selectedService?.price || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-start gap-4 pb-6 border-b border-border">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">تاریخ و ساعت</h4>
                          <p className="text-muted-foreground">
                            {formData.date} - {englishToPersian(formData.timeSlot)}
                          </p>
                        </div>
                      </div>

                      {/* Car */}
                      <div className="flex items-start gap-4 pb-6 border-b border-border">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Car className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">خودرو</h4>
                          <p className="text-muted-foreground">
                            {formData.carBrand} {formData.carModel} - {formData.carYear} - {formData.carColor}
                          </p>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">اطلاعات تماس</h4>
                          <p className="text-muted-foreground">{formData.name}</p>
                          <p className="text-muted-foreground">{formData.phone}</p>
                          <p className="text-muted-foreground text-sm">
                            {formData.location === 'workshop' ? 'مراجعه به مجموعه' : 'خدمات در محل'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                مرحله قبل
              </Button>
            )}
            {currentStep < 5 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="gap-2 mr-auto"
              >
                مرحله بعد
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 mr-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال ثبت...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    ثبت رزرو
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
