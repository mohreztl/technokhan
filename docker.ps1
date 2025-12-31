# AutoLounge Docker Management Script
# Persian/Farsi friendly PowerShell script

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Service = ""
)

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Show-Help {
    Write-ColorOutput Cyan "=== AutoLounge Docker Management ==="
    Write-Host ""
    Write-ColorOutput Green "دستورات اصلی (Main Commands):"
    Write-Host "  .\docker.ps1 build           - ساخت تمام ایمیج‌ها"
    Write-Host "  .\docker.ps1 up              - اجرای تمام سرویس‌ها"
    Write-Host "  .\docker.ps1 down            - متوقف کردن سرویس‌ها"
    Write-Host "  .\docker.ps1 restart         - ری‌استارت سرویس‌ها"
    Write-Host "  .\docker.ps1 ps              - نمایش کانتینرهای در حال اجرا"
    Write-Host ""
    Write-ColorOutput Green "مشاهده لاگ‌ها (Logs):"
    Write-Host "  .\docker.ps1 logs            - لاگ تمام سرویس‌ها"
    Write-Host "  .\docker.ps1 logs api        - لاگ API"
    Write-Host "  .\docker.ps1 logs web        - لاگ Web"
    Write-Host "  .\docker.ps1 logs db         - لاگ Database"
    Write-Host ""
    Write-ColorOutput Green "محیط توسعه (Development):"
    Write-Host "  .\docker.ps1 dev             - اجرای دیتابیس برای Development"
    Write-Host "  .\docker.ps1 dev-full        - اجرای محیط کامل Development"
    Write-Host "  .\docker.ps1 dev-down        - متوقف کردن محیط Development"
    Write-Host ""
    Write-ColorOutput Green "محیط تولید (Production):"
    Write-Host "  .\docker.ps1 prod            - اجرای محیط Production با Nginx"
    Write-Host "  .\docker.ps1 rebuild         - ریبیلد و ری‌استارت"
    Write-Host ""
    Write-ColorOutput Green "Prisma:"
    Write-Host "  .\docker.ps1 prisma-generate - Generate Prisma Client"
    Write-Host "  .\docker.ps1 prisma-migrate  - اجرای Migration‌ها"
    Write-Host "  .\docker.ps1 prisma-studio   - باز کردن Prisma Studio"
    Write-Host ""
    Write-ColorOutput Green "دیتابیس (Database):"
    Write-Host "  .\docker.ps1 backup          - گرفتن Backup از دیتابیس"
    Write-Host "  .\docker.ps1 restore FILE    - بازگردانی Backup"
    Write-Host ""
    Write-ColorOutput Green "ابزار (Tools):"
    Write-Host "  .\docker.ps1 shell api       - باز کردن Shell در API"
    Write-Host "  .\docker.ps1 shell web       - باز کردن Shell در Web"
    Write-Host "  .\docker.ps1 shell db        - باز کردن PostgreSQL Shell"
    Write-Host "  .\docker.ps1 health          - چک کردن سلامت سرویس‌ها"
    Write-Host "  .\docker.ps1 stats           - نمایش Resource Usage"
    Write-Host ""
    Write-ColorOutput Green "پاکسازی (Cleanup):"
    Write-Host "  .\docker.ps1 clean           - پاک کردن کامل"
    Write-Host "  .\docker.ps1 prune           - حذف فایل‌های غیرضروری Docker"
    Write-Host ""
}

switch ($Command.ToLower()) {
    "help" {
        Show-Help
    }
    "build" {
        Write-ColorOutput Cyan "ساخت ایمیج‌ها..."
        docker-compose build
        Write-ColorOutput Green "✓ ایمیج‌ها ساخته شدند"
    }
    "up" {
        Write-ColorOutput Cyan "اجرای سرویس‌ها..."
        docker-compose up -d
        Write-ColorOutput Green "✓ سرویس‌ها اجرا شدند"
        Write-Host "Web: http://localhost:3000"
        Write-Host "API: http://localhost:5000"
    }
    "down" {
        Write-ColorOutput Cyan "متوقف کردن سرویس‌ها..."
        docker-compose down
        Write-ColorOutput Green "✓ سرویس‌ها متوقف شدند"
    }
    "restart" {
        Write-ColorOutput Cyan "ری‌استارت سرویس‌ها..."
        if ($Service) {
            docker-compose restart $Service
            Write-ColorOutput Green "✓ سرویس $Service ری‌استارت شد"
        } else {
            docker-compose restart
            Write-ColorOutput Green "✓ تمام سرویس‌ها ری‌استارت شدند"
        }
    }
    "logs" {
        if ($Service) {
            docker-compose logs -f $Service
        } else {
            docker-compose logs -f
        }
    }
    "ps" {
        docker-compose ps
    }
    "dev" {
        Write-ColorOutput Cyan "اجرای محیط Development..."
        docker-compose -f docker-compose.dev.yml up -d
        Write-ColorOutput Green "✓ محیط Development اجرا شد"
        Write-Host "PostgreSQL: localhost:5432"
    }
    "dev-full" {
        Write-ColorOutput Cyan "اجرای محیط کامل Development..."
        docker-compose -f docker-compose.dev.yml --profile with-admin --profile with-redis up -d
        Write-ColorOutput Green "✓ محیط Development با تمام ابزارها اجرا شد"
        Write-Host "PostgreSQL: localhost:5432"
        Write-Host "Adminer: http://localhost:8080"
        Write-Host "Redis: localhost:6379"
    }
    "dev-down" {
        docker-compose -f docker-compose.dev.yml down
        Write-ColorOutput Green "✓ محیط Development متوقف شد"
    }
    "prod" {
        Write-ColorOutput Cyan "اجرای محیط Production..."
        docker-compose --profile with-nginx up -d --build
        Write-ColorOutput Green "✓ محیط Production اجرا شد"
        Write-Host "Application: http://localhost"
    }
    "rebuild" {
        Write-ColorOutput Cyan "ریبیلد و ری‌استارت..."
        docker-compose up -d --build
        Write-ColorOutput Green "✓ ریبیلد انجام شد"
    }
    "shell" {
        switch ($Service.ToLower()) {
            "api" {
                docker-compose exec api sh
            }
            "web" {
                docker-compose exec web sh
            }
            "db" {
                docker-compose exec postgres psql -U autolounge -d autolounge
            }
            default {
                Write-ColorOutput Red "لطفا سرویس را مشخص کنید: api, web, db"
            }
        }
    }
    "prisma-generate" {
        Write-ColorOutput Cyan "Generate Prisma Client..."
        docker-compose exec api pnpm prisma:generate
        Write-ColorOutput Green "✓ Prisma Client ساخته شد"
    }
    "prisma-migrate" {
        Write-ColorOutput Cyan "اجرای Migration‌ها..."
        docker-compose exec api pnpm prisma migrate deploy
        Write-ColorOutput Green "✓ Migration‌ها اجرا شدند"
    }
    "prisma-studio" {
        Write-ColorOutput Cyan "باز کردن Prisma Studio..."
        docker-compose exec api pnpm prisma:studio
    }
    "backup" {
        Write-ColorOutput Cyan "گرفتن Backup از دیتابیس..."
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupFile = "backups/backup_$timestamp.sql"
        
        if (-not (Test-Path "backups")) {
            New-Item -ItemType Directory -Path "backups" | Out-Null
        }
        
        docker-compose exec -T postgres pg_dump -U autolounge autolounge > $backupFile
        Write-ColorOutput Green "✓ Backup ذخیره شد: $backupFile"
    }
    "restore" {
        if (-not $Service) {
            Write-ColorOutput Red "لطفا فایل Backup را مشخص کنید"
            Write-Host "مثال: .\docker.ps1 restore backups/backup_file.sql"
            exit 1
        }
        
        if (-not (Test-Path $Service)) {
            Write-ColorOutput Red "فایل پیدا نشد: $Service"
            exit 1
        }
        
        Write-ColorOutput Cyan "بازگردانی دیتابیس از $Service..."
        Get-Content $Service | docker-compose exec -T postgres psql -U autolounge autolounge
        Write-ColorOutput Green "✓ دیتابیس بازگردانی شد"
    }
    "health" {
        Write-ColorOutput Cyan "چک کردن سلامت سرویس‌ها..."
        
        try {
            $apiResponse = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5
            if ($apiResponse.StatusCode -eq 200) {
                Write-ColorOutput Green "✓ API: سالم"
            }
        } catch {
            Write-ColorOutput Red "✗ API: مشکل دارد"
        }
        
        try {
            $webResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
            if ($webResponse.StatusCode -eq 200) {
                Write-ColorOutput Green "✓ Web: سالم"
            }
        } catch {
            Write-ColorOutput Red "✗ Web: مشکل دارد"
        }
    }
    "stats" {
        docker stats --no-stream
    }
    "clean" {
        $confirmation = Read-Host "هشدار: تمام داده‌ها حذف خواهند شد! ادامه می‌دهید؟ (y/N)"
        if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
            Write-ColorOutput Cyan "پاکسازی..."
            docker-compose down -v
            docker rmi autolounge-api autolounge-web 2>$null
            Write-ColorOutput Green "✓ پاکسازی انجام شد"
        }
    }
    "prune" {
        Write-ColorOutput Cyan "حذف فایل‌های غیرضروری Docker..."
        docker system prune -f
        Write-ColorOutput Green "✓ پاکسازی انجام شد"
    }
    default {
        Write-ColorOutput Red "دستور نامعتبر: $Command"
        Write-Host ""
        Show-Help
    }
}
