# خلاصه داکریزیشن (Docker Setup Summary)

## ✅ فایل‌های ایجاد شده

### 1. Dockerfile‌ها
- ✅ `apps/api/Dockerfile` - Docker image برای API (Fastify)
- ✅ `apps/web/Dockerfile` - Docker image برای Web (Next.js)
- ✅ `.dockerignore` - فایل‌های قابل ignore در build
- ✅ `apps/api/.dockerignore` - Ignore مخصوص API
- ✅ `apps/web/.dockerignore` - Ignore مخصوص Web

### 2. Docker Compose
- ✅ `docker-compose.yml` - Production setup با PostgreSQL + API + Web + Nginx
- ✅ `docker-compose.dev.yml` - Development setup با Adminer و Redis

### 3. Environment Files
- ✅ `.env.example` - نمونه تنظیمات production
- ✅ `.env.development` - نمونه تنظیمات development

### 4. Scripts و Tools
- ✅ `docker.ps1` - PowerShell script برای مدیریت Docker (ویندوز)
- ✅ `quick-start.ps1` - راه‌اندازی سریع (ویندوز)
- ✅ `quick-start.sh` - راه‌اندازی سریع (لینوکس/مک)
- ✅ `Makefile` - دستورات مفید (لینوکس/مک)

### 5. Nginx
- ✅ `nginx/nginx.conf` - تنظیمات Reverse Proxy (اختیاری)

### 6. Documentation
- ✅ `DOCKER.md` - راهنمای کامل فارسی Docker
- ✅ `README.md` - آپدیت شده با بخش Docker

### 7. CI/CD
- ✅ `.github/workflows/docker-build.yml` - GitHub Actions برای build خودکار

### 8. تغییرات در کد
- ✅ `apps/web/next.config.js` - اضافه شدن `output: 'standalone'` برای Docker

## 🚀 نحوه استفاده

### راه‌اندازی سریع (ویندوز)
```powershell
# اجرای اسکریپت quick start
.\quick-start.ps1

# یا استفاده از docker.ps1
.\docker.ps1 up
```

### راه‌اندازی سریع (لینوکس/مک)
```bash
# دادن دسترسی اجرا
chmod +x quick-start.sh

# اجرای اسکریپت
./quick-start.sh

# یا استفاده از Makefile
make up
```

### راه‌اندازی دستی
```bash
# 1. کپی کردن environment file
cp .env.example .env

# 2. ویرایش .env و تنظیم مقادیر

# 3. اجرای Docker Compose
docker-compose up -d --build
```

## 📦 سرویس‌های در دسترس

پس از اجرای موفق:

| سرویس | آدرس | پورت |
|-------|------|------|
| وب‌سایت | http://localhost:3000 | 3000 |
| API | http://localhost:5000 | 5000 |
| PostgreSQL | localhost:5432 | 5432 |
| Nginx (اختیاری) | http://localhost | 80 |

## 🔧 دستورات پرکاربرد

### با PowerShell (ویندوز)
```powershell
.\docker.ps1 up          # اجرای سرویس‌ها
.\docker.ps1 down        # متوقف کردن سرویس‌ها
.\docker.ps1 logs        # مشاهده لاگ‌ها
.\docker.ps1 restart     # ری‌استارت
.\docker.ps1 clean       # پاکسازی کامل
.\docker.ps1 help        # نمایش راهنما
```

### با Makefile (لینوکس/مک)
```bash
make up          # اجرای سرویس‌ها
make down        # متوقف کردن سرویس‌ها
make logs        # مشاهده لاگ‌ها
make restart     # ری‌استارت
make clean       # پاکسازی کامل
make help        # نمایش راهنما
```

### با Docker Compose مستقیم
```bash
docker-compose up -d              # اجرای سرویس‌ها
docker-compose down               # متوقف کردن
docker-compose logs -f            # لاگ‌ها
docker-compose ps                 # وضعیت کانتینرها
docker-compose up -d --build      # ریبیلد و اجرا
```

## 🏗️ معماری Docker

```
┌─────────────────────────────────┐
│      Nginx (Port 80)            │ ← اختیاری
│    [Reverse Proxy]              │
└────────────┬────────────────────┘
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

## 🎯 ویژگی‌های Docker Setup

### Dockerfile‌ها
- ✅ Multi-stage build برای حجم کمتر
- ✅ Production-ready با security best practices
- ✅ Health checks برای همه سرویس‌ها
- ✅ استفاده از Node 18 Alpine (سبک)

### Docker Compose
- ✅ Orchestration کامل تمام سرویس‌ها
- ✅ Network isolation
- ✅ Volume management برای persistence
- ✅ Depends on و health checks
- ✅ Environment variables

### Scripts
- ✅ PowerShell script برای ویندوز با پشتیبانی فارسی
- ✅ Makefile برای لینوکس/مک
- ✅ Quick start scripts برای راه‌اندازی سریع
- ✅ دستورات Backup و Restore

### CI/CD
- ✅ GitHub Actions برای build خودکار
- ✅ Multi-registry support
- ✅ Cache optimization
- ✅ Test integration

## 📚 مستندات

برای اطلاعات کامل‌تر:
- [DOCKER.md](./DOCKER.md) - راهنمای کامل فارسی
- [README.md](./README.md) - معرفی پروژه

## 🔐 نکات امنیتی

⚠️ قبل از دیپلوی production حتما:

1. ✅ رمزهای قوی در `.env` تنظیم کنید
2. ✅ `JWT_SECRET` را تغییر دهید
3. ✅ دسترسی دیتابیس را محدود کنید
4. ✅ از HTTPS استفاده کنید
5. ✅ Firewall را تنظیم کنید
6. ✅ Backup منظم از دیتابیس بگیرید

## ✨ مزایای این Setup

- 🚀 راه‌اندازی سریع (یک دستور)
- 📦 Isolated environment
- 🔄 Reproducible builds
- 🛡️ Security best practices
- 📊 Health monitoring
- 🔧 آسان برای maintain
- 🌐 آماده برای production

## 🆘 در صورت مشکل

1. لاگ‌ها را چک کنید: `.\docker.ps1 logs`
2. وضعیت سرویس‌ها: `.\docker.ps1 ps`
3. Health check: `.\docker.ps1 health`
4. راهنمای کامل: [DOCKER.md](./DOCKER.md)

---

**تاریخ ایجاد**: 1 ژانویه 2026  
**وضعیت**: ✅ آماده برای استفاده
