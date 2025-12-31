# 🐳 راهنمای Docker - اتولانژ (AutoLounge)

این راهنما مراحل نصب و اجرای AutoLounge با استفاده از Docker را شرح می‌دهد.

## 📋 پیش‌نیازها

قبل از شروع، اطمینان حاصل کنید که موارد زیر را نصب کرده‌اید:

- [Docker](https://docs.docker.com/get-docker/) (نسخه 20.10 یا بالاتر)
- [Docker Compose](https://docs.docker.com/compose/install/) (نسخه 2.0 یا بالاتر)

## 🚀 راه‌اندازی سریع

### 1. کپی کردن فایل Environment

ابتدا فایل `.env.example` را کپی کرده و نام آن را به `.env` تغییر دهید:

```bash
cp .env.example .env
```

### 2. تنظیمات Environment

فایل `.env` را باز کرده و مقادیر زیر را تغییر دهید:

```env
# رمز عبور قوی برای دیتابیس تنظیم کنید
POSTGRES_PASSWORD=your_strong_password_here

# یک کلید محرمانه قوی برای JWT تنظیم کنید
JWT_SECRET=your_very_strong_jwt_secret_here

# اطلاعات سرویس SMS
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret
```

### 3. اجرای Docker Compose

برای بالا آوردن تمام سرویس‌ها:

```bash
docker-compose up -d
```

این دستور سه سرویس را اجرا می‌کند:
- **PostgreSQL** (پورت 5432): دیتابیس
- **API** (پورت 5000): بک‌اند Fastify
- **Web** (پورت 3000): فرانت‌اند Next.js

### 4. چک کردن وضعیت سرویس‌ها

```bash
docker-compose ps
```

### 5. مشاهده لاگ‌ها

برای مشاهده لاگ همه سرویس‌ها:

```bash
docker-compose logs -f
```

برای مشاهده لاگ یک سرویس خاص:

```bash
docker-compose logs -f api
docker-compose logs -f web
```

## 🌐 دسترسی به برنامه

بعد از اجرای موفقیت‌آمیز:

- **وب‌سایت**: http://localhost:3000
- **API**: http://localhost:5000
- **Database**: localhost:5432

**نکته مهم**: در production، اگر از Nginx استفاده می‌کنید، باید `NEXT_PUBLIC_API_URL` را به آدرس عمومی API تنظیم کنید (مثلاً `https://api.yourdomain.com`).

## 🔧 دستورات مفید

### متوقف کردن سرویس‌ها

```bash
docker-compose down
```

### متوقف کردن و حذف Volume‌ها (حذف دیتابیس)

```bash
docker-compose down -v
```

### ری‌استارت سرویس‌ها

```bash
docker-compose restart
```

### ری‌استارت یک سرویس خاص

```bash
docker-compose restart api
```

### ریبیلد کردن ایمیج‌ها

اگر تغییراتی در کد ایجاد کرده‌اید:

```bash
docker-compose up -d --build
```

### اجرای دستورات Prisma

```bash
# Generate Prisma Client
docker-compose exec api pnpm prisma:generate

# Run Migrations
docker-compose exec api pnpm prisma migrate deploy

# Open Prisma Studio
docker-compose exec api pnpm prisma:studio
```

### دسترسی به شل کانتینر

```bash
# API Container
docker-compose exec api sh

# Web Container
docker-compose exec web sh

# Database Container
docker-compose exec postgres psql -U autolounge -d autolounge
```

## 🔒 استفاده از Nginx (اختیاری)

برای استفاده از Nginx به عنوان Reverse Proxy:

```bash
docker-compose --profile with-nginx up -d
```

این کار Nginx را روی پورت 80 اجرا می‌کند که درخواست‌ها را به سرویس‌های مناسب هدایت می‌کند.

## 🏗️ معماری Docker

```
┌─────────────────────────────────────────┐
│           Nginx (Port 80)               │
│         [Optional Reverse Proxy]        │
└─────────────┬───────────────────────────┘
              │
      ┌───────┴────────┐
      │                │
      ▼                ▼
┌─────────┐      ┌─────────┐
│   Web   │      │   API   │
│ (Next)  │◄────►│(Fastify)│
│ Port    │      │ Port    │
│  3000   │      │  5000   │
└─────────┘      └────┬────┘
                      │
                      ▼
                ┌──────────┐
                │PostgreSQL│
                │ Port     │
                │  5432    │
                └──────────┘
```

## 📦 ساختار Dockerfile‌ها

### API Dockerfile
- **Build Stage**: نصب dependencies، generate Prisma Client، و build TypeScript
- **Runner Stage**: اجرای migration‌ها و استارت سرور

### Web Dockerfile
- **Dependencies Stage**: نصب dependencies
- **Builder Stage**: Build Next.js با standalone output
- **Runner Stage**: اجرای Next.js با حداقل حجم

## 🔍 Health Checks

هر سرویس دارای health check است:

```bash
# Check API health
curl http://localhost:5000/health

# Check Web health
curl http://localhost:3000/api/health
```

## 🚨 عیب‌یابی (Troubleshooting)

### دیتابیس Connect نمی‌شود

```bash
# چک کردن وضعیت دیتابیس
docker-compose logs postgres

# ری‌استارت دیتابیس
docker-compose restart postgres
```

### API اجرا نمی‌شود

```bash
# مشاهده لاگ‌های API
docker-compose logs api

# چک کردن اتصال دیتابیس
docker-compose exec api sh
# پس از ورود:
node -e "require('./dist/lib/prisma').prisma.\$connect().then(() => console.log('Connected'))"
```

### حافظه کم

اگر کانتینرها به خاطر کمبود حافظه کرش می‌کنند:

```bash
# افزایش حافظه Docker (در Docker Desktop)
# Settings > Resources > Memory > افزایش به 4GB یا بیشتر
```

### پاک کردن کامل و شروع از نو

```bash
# متوقف کردن همه چیز
docker-compose down -v

# حذف تمام ایمیج‌های پروژه
docker rmi autolounge-api autolounge-web

# شروع دوباره
docker-compose up -d --build
```

## 🌐 دیپلوی Production

### تنظیمات امنیتی مهم

1. **تغییر رمزهای عبور**: همیشه رمزهای قوی استفاده کنید
2. **HTTPS**: در production حتما از HTTPS استفاده کنید
3. **Firewall**: فقط پورت‌های ضروری را باز کنید
4. **Backup**: از دیتابیس به طور منظم backup بگیرید

### استفاده از Docker Swarm یا Kubernetes

برای مقیاس‌پذیری بیشتر، می‌توانید از:
- **Docker Swarm** برای orchestration ساده
- **Kubernetes** برای orchestration پیشرفته

### Backup دیتابیس

```bash
# Backup
docker-compose exec postgres pg_dump -U autolounge autolounge > backup.sql

# Restore
docker-compose exec -T postgres psql -U autolounge autolounge < backup.sql
```

## 📊 مانیتورینگ

برای مانیتورینگ سرویس‌ها می‌توانید از:
- **Docker Stats**: `docker stats`
- **Prometheus + Grafana**: برای monitoring پیشرفته
- **ELK Stack**: برای log aggregation

## 🤝 مشارکت

برای مشارکت در پروژه، لطفاً [CONTRIBUTING.md](./CONTRIBUTING.md) را مطالعه کنید.

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است. برای اطلاعات بیشتر [LICENSE](./LICENSE) را ببینید.

## 🆘 پشتیبانی

اگر مشکلی دارید:
1. ابتدا [Issues](https://github.com/yourusername/autolounge/issues) را چک کنید
2. سوال جدید در Issues بپرسید
3. با تیم توسعه تماس بگیرید

---

**نکته**: این راهنما به طور مداوم به‌روزرسانی می‌شود. برای آخرین تغییرات، مستندات را چک کنید.
