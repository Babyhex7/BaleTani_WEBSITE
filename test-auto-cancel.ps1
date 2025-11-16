# AUTO-CANCEL ORDER SYSTEM - TEST SCRIPT
# Testing dengan timeout 10 detik

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AUTO-CANCEL ORDER - TEST SCRIPT" -ForegroundColor Yellow
Write-Host "  Timeout: 10 DETIK (testing mode)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Cek .env untuk memastikan NODE_ENV
Write-Host "[1] Cek environment..." -ForegroundColor Green
$envFile = "c:\Users\mybook_bagas\BaleTani_Web\BaleTani_WEBSITE\backend\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match 'NODE_ENV\s*=\s*production') {
        Write-Host "   WARNING: NODE_ENV = production (akan pakai 10 menit)" -ForegroundColor Red
        Write-Host "   Silakan ubah ke 'development' untuk testing 10 detik" -ForegroundColor Yellow
    }
    else {
        Write-Host "   ✓ NODE_ENV bukan production (akan pakai 10 detik)" -ForegroundColor Green
    }
}
else {
    Write-Host "   ✓ .env tidak ditemukan (default: 10 detik)" -ForegroundColor Green
}
Write-Host ""

# Step 2: Jalankan migration
Write-Host "[2] Jalankan database migration..." -ForegroundColor Green
Write-Host "   Silakan jalankan SQL berikut di database Anda:" -ForegroundColor Yellow
Write-Host ""
Get-Content "c:\Users\mybook_bagas\BaleTani_Web\BaleTani_WEBSITE\backend\migrations\add_payment_expiry_fields.sql"
Write-Host ""
Write-Host "   Tekan Enter setelah migration berhasil..." -ForegroundColor Yellow
Read-Host

# Step 3: Start backend server
Write-Host "[3] Starting backend server..." -ForegroundColor Green
Set-Location "c:\Users\mybook_bagas\BaleTani_Web\BaleTani_WEBSITE\backend"
Write-Host "   Server akan start dengan auto-cancel cron job" -ForegroundColor Cyan
Write-Host "   Cron interval: 30 detik" -ForegroundColor Cyan
Write-Host ""

# Jalankan server
npm start
