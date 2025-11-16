# QUICK FIX - Jalankan Migration
# Run this BEFORE starting server

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DATABASE MIGRATION - PAYMENT EXPIRY" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Baca migration file
$migrationPath = "c:\Users\mybook_bagas\BaleTani_Web\BaleTani_WEBSITE\backend\migrations\add_payment_expiry_fields.sql"
$sqlContent = Get-Content $migrationPath -Raw

Write-Host "📋 Migration SQL:" -ForegroundColor Green
Write-Host $sqlContent -ForegroundColor White
Write-Host ""

Write-Host "⚠️  INSTRUKSI:" -ForegroundColor Yellow
Write-Host "1. Buka phpMyAdmin atau MySQL client" -ForegroundColor White
Write-Host "2. Pilih database BaleTani" -ForegroundColor White
Write-Host "3. Klik tab 'SQL'" -ForegroundColor White
Write-Host "4. Copy-paste SQL di atas" -ForegroundColor White
Write-Host "5. Klik 'Go' / 'Execute'" -ForegroundColor White
Write-Host ""

# Copy to clipboard (if available)
try {
    $sqlContent | Set-Clipboard
    Write-Host "✅ SQL sudah di-copy ke clipboard!" -ForegroundColor Green
    Write-Host "   Tinggal paste (Ctrl+V) di phpMyAdmin" -ForegroundColor Cyan
}
catch {
    Write-Host "ℹ️  Copy manual SQL di atas" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Tekan Enter setelah migration berhasil..." -ForegroundColor Yellow
Read-Host

Write-Host "`n✅ Siap! Sekarang start server dengan: npm start" -ForegroundColor Green
Write-Host ""
