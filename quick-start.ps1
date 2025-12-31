# Quick Start Script for AutoLounge Docker Setup
# راه‌اندازی سریع Docker

Write-Host "=== AutoLounge Docker Quick Start ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "چک کردن Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✓ Docker در حال اجرا است" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker در حال اجرا نیست. لطفا Docker Desktop را اجرا کنید" -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "فایل .env پیدا نشد. در حال کپی از .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ فایل .env ایجاد شد" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  لطفا فایل .env را ویرایش کرده و مقادیر زیر را تنظیم کنید:" -ForegroundColor Yellow
    Write-Host "  - POSTGRES_PASSWORD" -ForegroundColor White
    Write-Host "  - JWT_SECRET" -ForegroundColor White
    Write-Host "  - SMS_API_KEY" -ForegroundColor White
    Write-Host "  - SMS_API_SECRET" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "آیا می‌خواهید با تنظیمات پیش‌فرض ادامه دهید؟ (y/N)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "لطفا فایل .env را ویرایش کنید و دوباره اسکریپت را اجرا کنید" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "در حال ساخت و اجرای کانتینرها..." -ForegroundColor Cyan
Write-Host "این کار ممکن است چند دقیقه طول بکشد..." -ForegroundColor Yellow
Write-Host ""

docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ AutoLounge با موفقیت اجرا شد!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== لینک‌های دسترسی ===" -ForegroundColor Cyan
    Write-Host "  وب‌سایت:  http://localhost:3000" -ForegroundColor White
    Write-Host "  API:      http://localhost:5000" -ForegroundColor White
    Write-Host "  دیتابیس: localhost:5432" -ForegroundColor White
    Write-Host ""
    Write-Host "برای مشاهده لاگ‌ها: .\docker.ps1 logs" -ForegroundColor Yellow
    Write-Host "برای متوقف کردن: .\docker.ps1 down" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "برای کمک بیشتر: .\docker.ps1 help" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✗ خطا در اجرای Docker" -ForegroundColor Red
    Write-Host "لطفا لاگ‌ها را با دستور زیر بررسی کنید:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs" -ForegroundColor White
}
