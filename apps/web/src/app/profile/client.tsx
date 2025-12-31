'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Package,
  Calendar,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronLeft,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Edit2,
  Plus,
  Phone,
  Mail,
  Car,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/lib/store';
import { ROUTES } from '@autolounge/shared';

// Mock data
const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    date: '۱۴۰۳/۰۱/۱۵',
    status: 'delivered',
    total: 2500000,
    items: [
      { name: 'واکس کارناوبا پریمیوم', quantity: 1, price: 2250000 },
      { name: 'دستمال میکروفایبر', quantity: 2, price: 125000 },
    ],
  },
  {
    id: 'ORD-002',
    date: '۱۴۰۳/۰۱/۱۰',
    status: 'shipped',
    total: 4950000,
    items: [
      { name: 'کیت دیتیلینگ حرفه‌ای', quantity: 1, price: 4950000 },
    ],
  },
  {
    id: 'ORD-003',
    date: '۱۴۰۳/۰۱/۰۵',
    status: 'processing',
    total: 1850000,
    items: [
      { name: 'پولیش کامپاوند', quantity: 1, price: 1850000 },
    ],
  },
];

const MOCK_BOOKINGS = [
  {
    id: 'BK-001',
    service: 'دیتیلینگ حرفه‌ای خودرو',
    date: '۱۴۰۳/۰۱/۲۰',
    time: '۱۰:۰۰',
    status: 'confirmed',
    car: 'BMW 320i',
    price: 3500000,
  },
  {
    id: 'BK-002',
    service: 'سرامیک کوتینگ',
    date: '۱۴۰۳/۰۱/۲۵',
    time: '۰۹:۰۰',
    status: 'pending',
    car: 'بنز C200',
    price: 12000000,
  },
];

const MOCK_ADDRESSES = [
  {
    id: '1',
    title: 'خانه',
    address: 'تهران، ونک، خیابان ملاصدرا، پلاک ۱۲۳، واحد ۴',
    phone: '۰۹۱۲۱۲۳۴۵۶۷',
    isDefault: true,
  },
  {
    id: '2',
    title: 'محل کار',
    address: 'تهران، سعادت‌آباد، میدان کاج، پلاک ۴۵',
    phone: '۰۲۱۲۲۳۴۵۶۷۸',
    isDefault: false,
  },
];

const ORDER_STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'در انتظار پرداخت', color: 'bg-yellow-500', icon: <Clock className="h-4 w-4" /> },
  processing: { label: 'در حال پردازش', color: 'bg-blue-500', icon: <Package className="h-4 w-4" /> },
  shipped: { label: 'ارسال شده', color: 'bg-purple-500', icon: <Truck className="h-4 w-4" /> },
  delivered: { label: 'تحویل شده', color: 'bg-green-500', icon: <CheckCircle2 className="h-4 w-4" /> },
  cancelled: { label: 'لغو شده', color: 'bg-red-500', icon: <XCircle className="h-4 w-4" /> },
};

const BOOKING_STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' }> = {
  pending: { label: 'در انتظار تأیید', variant: 'secondary' },
  confirmed: { label: 'تأیید شده', variant: 'success' },
  completed: { label: 'انجام شده', variant: 'default' },
  cancelled: { label: 'لغو شده', variant: 'destructive' },
};

type Tab = 'overview' | 'orders' | 'bookings' | 'addresses' | 'favorites' | 'settings';

export function ProfileClient() {
  const router = useRouter();
  const { state, logout } = useAuth();
  const { user, isAuthenticated } = state;
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!state.isLoading && !isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?redirect=/profile`);
    } else if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
      });
    }
  }, [isAuthenticated, state.isLoading, router, user]);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.HOME);
  };

  const handleSaveProfile = () => {
    // Save profile logic here
    setIsEditing(false);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

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
      className="min-h-screen bg-background py-8 sm:py-12"
    >
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar size="xl" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{user.name || 'کاربر اتولانژ'}</h1>
              <p className="text-muted-foreground">{user.phoneNumber}</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            خروج از حساب
          </Button>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
          <motion.div variants={itemVariants}>
            <TabsList className="mb-8 w-full justify-start overflow-x-auto flex-nowrap">
              <TabsTrigger value="overview" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">داشبورد</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">سفارشات</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">رزروها</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">آدرس‌ها</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">علاقه‌مندی</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">تنظیمات</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-muted-foreground">
                      تعداد سفارشات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{MOCK_ORDERS.length}</p>
                        <p className="text-sm text-muted-foreground">سفارش</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-muted-foreground">
                      رزروهای فعال
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{MOCK_BOOKINGS.length}</p>
                        <p className="text-sm text-muted-foreground">رزرو</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-muted-foreground">
                      کیف پول
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">۰</p>
                        <p className="text-sm text-muted-foreground">تومان</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Orders */}
              <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>آخرین سفارشات</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                      مشاهده همه
                      <ChevronLeft className="h-4 w-4 mr-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {MOCK_ORDERS.slice(0, 3).map((order) => {
                      const status = ORDER_STATUS_MAP[order.status];
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-primary/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${status.color} text-white flex items-center justify-center`}>
                              {status.icon}
                            </div>
                            <div>
                              <p className="font-medium">{order.id}</p>
                              <p className="text-sm text-muted-foreground">{order.date}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-bold">{order.total.toLocaleString('fa-IR')} تومان</p>
                            <p className="text-sm text-muted-foreground">{status.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Upcoming Bookings */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>رزروهای پیش‌رو</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('bookings')}>
                      همه
                      <ChevronLeft className="h-4 w-4 mr-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {MOCK_BOOKINGS.slice(0, 2).map((booking) => {
                      const status = BOOKING_STATUS_MAP[booking.status];
                      return (
                        <div key={booking.id} className="p-4 rounded-xl bg-muted/50 border border-primary/5">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{booking.service}</p>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {booking.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {booking.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <motion.div variants={itemVariants} className="space-y-4">
              {MOCK_ORDERS.map((order) => {
                const status = ORDER_STATUS_MAP[order.status];
                return (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl ${status.color} text-white flex items-center justify-center`}>
                            {status.icon}
                          </div>
                          <div>
                            <p className="font-bold">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.date}</p>
                          </div>
                        </div>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.name} × {item.quantity}</span>
                            <span className="text-muted-foreground">{item.price.toLocaleString('fa-IR')} تومان</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                        <span className="font-medium">جمع کل:</span>
                        <span className="text-xl font-bold text-secondary">{order.total.toLocaleString('fa-IR')} تومان</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <motion.div variants={itemVariants} className="space-y-4">
              {MOCK_BOOKINGS.map((booking) => {
                const status = BOOKING_STATUS_MAP[booking.status];
                return (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-bold">{booking.service}</h3>
                          <p className="text-muted-foreground">{booking.id}</p>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">تاریخ</p>
                            <p className="font-medium">{booking.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">ساعت</p>
                            <p className="font-medium">{booking.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">خودرو</p>
                            <p className="font-medium">{booking.car}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">هزینه</p>
                            <p className="font-medium">{booking.price.toLocaleString('fa-IR')} تومان</p>
                          </div>
                        </div>
                      </div>
                      
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-destructive">
                            لغو رزرو
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              <Link href={ROUTES.BOOKING}>
                <Button variant="primary" className="w-full gap-2">
                  <Plus className="h-5 w-5" />
                  رزرو جدید
                </Button>
              </Link>
            </motion.div>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <motion.div variants={itemVariants} className="space-y-4">
              {MOCK_ADDRESSES.map((address) => (
                <Card key={address.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold">{address.title}</p>
                            {address.isDefault && (
                              <Badge variant="secondary">پیش‌فرض</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">{address.address}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {address.phone}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" className="w-full gap-2">
                <Plus className="h-5 w-5" />
                افزودن آدرس جدید
              </Button>
            </motion.div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">لیست علاقه‌مندی خالی است</h3>
                  <p className="text-muted-foreground mb-6">
                    محصولات و خدمات مورد علاقه خود را به این لیست اضافه کنید
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href={ROUTES.PRODUCTS}>
                      <Button variant="outline">مشاهده محصولات</Button>
                    </Link>
                    <Link href={ROUTES.SERVICES}>
                      <Button variant="primary">مشاهده خدمات</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>اطلاعات حساب کاربری</CardTitle>
                    <Button
                      variant={isEditing ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    >
                      {isEditing ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 ml-2" />
                          ذخیره تغییرات
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-4 w-4 ml-2" />
                          ویرایش
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        نام و نام خانوادگی
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                        placeholder="نام خود را وارد کنید"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        شماره موبایل
                      </label>
                      <Input
                        value={formData.phone}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        ایمیل (اختیاری)
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        placeholder="example@email.com"
                        dir="ltr"
                        className="text-left"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name || '',
                            email: user.email || '',
                            phone: user.phoneNumber || '',
                          });
                        }}
                      >
                        انصراف
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="mt-6 border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">حذف حساب کاربری</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    با حذف حساب کاربری، تمام اطلاعات شما از جمله سفارشات و رزروها حذف خواهد شد.
                  </p>
                  <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                    درخواست حذف حساب
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
