'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  ArrowRight,
  Shield,
  Sparkles,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/store';
import { ROUTES } from '@autolounge/shared';

type Step = 'phone' | 'otp';

const FEATURES = [
  'پیگیری سفارشات و رزروها',
  'تاریخچه خریدهای قبلی',
  'تخفیف‌های ویژه اعضا',
  'اطلاع از آخرین پیشنهادات',
];

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, login } = useAuth();
  
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const redirectUrl = searchParams.get('redirect') || ROUTES.HOME;

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 11)}`;
  };

  // Validate phone number (Iranian format)
  const isValidPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 11 && numbers.startsWith('09');
  };

  // Handle phone submission
  const handlePhoneSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isValidPhone(phone)) {
      setError('شماره موبایل معتبر نیست');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Move to OTP step
      setStep('otp');
      setCountdown(120); // 2 minutes countdown
      
      // Focus first OTP input
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch {
      setError('خطا در ارسال کد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  }, [phone]);

  // Handle OTP input
  const handleOtpChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleOtpSubmit(newOtp.join(''));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // Handle OTP keydown for backspace
  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  // Handle OTP paste
  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus appropriate input
      if (pastedData.length === 6) {
        handleOtpSubmit(pastedData);
      } else {
        otpRefs.current[pastedData.length]?.focus();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // Handle OTP submission
  const handleOtpSubmit = useCallback(async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      setError('کد تأیید باید ۶ رقم باشد');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // Simulate API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo: accept any 6-digit code
      const cleanPhone = phone.replace(/\D/g, '');
      
      // Login with auth store
      login({
        id: 'user-1',
        phoneNumber: cleanPhone,
        phone: cleanPhone,
        name: 'کاربر اتولانژ',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, 'demo-token-123');
      
      // Redirect
      router.push(redirectUrl);
    } catch {
      setError('کد تأیید نامعتبر است');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, phone, login, router, redirectUrl]);

  // Resend OTP
  const handleResendOtp = useCallback(async () => {
    if (countdown > 0) return;
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(120);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }, [countdown]);

  // Go back to phone step
  const handleBack = useCallback(() => {
    setStep('phone');
    setOtp(['', '', '', '', '', '']);
    setError('');
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
    exit: { opacity: 0, x: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <Link href={ROUTES.HOME} className="inline-block">
              <h1 className="text-3xl font-black">
                <span className="text-primary">اتو</span>
                <span className="text-secondary">لانژ</span>
              </h1>
            </Link>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div
                key="phone"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
              >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                  <Badge variant="secondary" className="mb-4">ورود / ثبت‌نام</Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">خوش آمدید!</h2>
                  <p className="text-muted-foreground">
                    برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید
                  </p>
                </motion.div>

                {/* Phone Form */}
                <motion.form variants={itemVariants} onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">شماره موبایل</label>
                    <div className="relative">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="0912 345 6789"
                        value={formatPhoneNumber(phone)}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="pr-12 text-lg h-14 text-left placeholder:text-right"
                        dir="ltr"
                        maxLength={13}
                        autoFocus
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="xl"
                    className="w-full gap-2"
                    disabled={isSubmitting || !isValidPhone(phone)}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        در حال ارسال...
                      </>
                    ) : (
                      <>
                        دریافت کد تأیید
                        <ArrowRight className="h-5 w-5 rotate-180" />
                      </>
                    )}
                  </Button>
                </motion.form>

                {/* Trust Badges */}
                <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-primary/10">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                    <Shield className="h-4 w-4 text-success" />
                    <span>اطلاعات شما نزد ما محفوظ است</span>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
              >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                  <Badge variant="success" className="mb-4">کد تأیید</Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">کد را وارد کنید</h2>
                  <p className="text-muted-foreground">
                    کد ۶ رقمی به شماره <span className="font-bold text-foreground ltr inline-block">{formatPhoneNumber(phone)}</span> ارسال شد
                  </p>
                </motion.div>

                {/* OTP Form */}
                <motion.div variants={itemVariants} className="space-y-6">
                  {/* OTP Inputs */}
                  <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 border-primary/20 bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        maxLength={1}
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )}

                  {/* Submit Button */}
                  <Button
                    variant="primary"
                    size="xl"
                    className="w-full gap-2"
                    onClick={() => handleOtpSubmit()}
                    disabled={isSubmitting || otp.some(d => !d)}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        در حال تأیید...
                      </>
                    ) : (
                      <>
                        تأیید و ورود
                        <Check className="h-5 w-5" />
                      </>
                    )}
                  </Button>

                  {/* Resend / Change Number */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || isSubmitting}
                      className="flex items-center gap-1 text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {countdown > 0 ? (
                        <span>ارسال مجدد ({Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')})</span>
                      ) : (
                        <span>ارسال مجدد کد</span>
                      )}
                    </button>
                    
                    <span className="hidden sm:inline text-muted-foreground">|</span>
                    
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      تغییر شماره موبایل
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terms */}
          <motion.p
            variants={itemVariants}
            className="mt-8 text-center text-xs text-muted-foreground"
          >
            با ورود به سایت،{' '}
            <Link href="/terms" className="text-primary hover:underline">
              قوانین و مقررات
            </Link>{' '}
            و{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              حریم خصوصی
            </Link>{' '}
            را می‌پذیرید.
          </motion.p>
        </motion.div>
      </div>

      {/* Right Side - Features (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
        <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-lg text-center text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
              <Sparkles className="h-10 w-10" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              عضویت در اتولانژ
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              با عضویت در اتولانژ از مزایای ویژه بهره‌مند شوید
            </p>

            <ul className="space-y-4 text-right">
              {FEATURES.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
