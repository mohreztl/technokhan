# 🚀 راه‌اندازی سریع - اتولانژ

## برای شروع سریع:

### ویندوز
```powershell
.\quick-start.ps1
```

### لینوکس/مک
```bash
chmod +x quick-start.sh
./quick-start.sh
```

## یا به صورت دستی:

```bash
# 1. کپی environment file
cp .env.example .env

# 2. ویرایش .env و تنظیم:
#    - POSTGRES_PASSWORD
#    - JWT_SECRET
#    - SMS_API_KEY
#    - SMS_API_SECRET

# 3. اجرا
docker-compose up -d --build
```

## دسترسی:
- 🌐 Web: http://localhost:3000
- 🔌 API: http://localhost:5000
- 🗄️ DB: localhost:5432

## مستندات کامل:
- [DOCKER.md](./DOCKER.md) - راهنمای کامل Docker
- [DEPLOYMENT_READY_REPORT.md](./DEPLOYMENT_READY_REPORT.md) - گزارش بررسی

## دستورات مفید:
```powershell
.\docker.ps1 help     # نمایش راهنما
.\docker.ps1 logs     # مشاهده لاگ‌ها
.\docker.ps1 down     # متوقف کردن
.\docker.ps1 health   # چک سلامت
```

---
✅ **آماده دیپلوی!**
