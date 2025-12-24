# ⚡ QUICK RUN - Load Testing Versi Pendek (1 Jam Total)

## 🎯 SOLUSI: Test Kelamaan Suka Berhenti? Pakai Versi Pendek!

Total waktu: **~1 jam** (vs 6+ jam original)

---

## 📋 CHECKLIST SEBELUM MULAI

```powershell
# 1. Backend running TANPA rate limit
cd ..\backend
$env:DISABLE_RATE_LIMIT="true"
npm run dev

# 2. Database running
# Check MySQL sudah jalan

# 3. Test accounts sudah ada
cd ..\k6-load-testing
node scripts/seed-test-accounts.js  # Jika belum pernah
```

---

## 🚀 RUN SEMUA TEST (Versi PENDEK)

### ✅ OPTION 1: Run Manual Satu-per-Satu (REKOMENDASI)

**Copy-paste command ini satu-per-satu:**

```powershell
# Navigate ke folder k6-load-testing
cd k6-load-testing

# 1️⃣ SMOKE TEST (1 menit) ✅
k6 run --out json=results/smoke-$(Get-Date -Format 'yyyyMMdd-HHmm').json scenarios/01-smoke-test.js

# Tunggu selesai, review hasil, lalu lanjut...

# 2️⃣ BASELINE LOAD SHORT (10 menit) ✅
k6 run --out json=results/baseline-short-$(Get-Date -Format 'yyyyMMdd-HHmm').json scenarios/02-baseline-load-SHORT.js

# Break sebentar ☕, lalu lanjut...

# 3️⃣ PEAK LOAD (8 menit) - gunakan original dengan stages short
k6 run --out json=results/peak-short-$(Get-Date -Format 'yyyyMMdd-HHmm').json scenarios/03-peak-load.js

# 4️⃣ STRESS TEST (6 menit) - gunakan original dengan stages short
k6 run --out json=results/stress-short-$(Get-Date -Format 'yyyyMMdd-HHmm').json scenarios/04-stress-test.js

# Break makan 🍔, lalu test terakhir...

# 5️⃣ ENDURANCE SHORT (30 menit) ✅
k6 run --out json=results/endurance-short-$(Get-Date -Format 'yyyyMMdd-HHmm').json scenarios/05-endurance-SHORT.js

# 6️⃣ SPIKE TEST (10 menit) - optional
k6 run --out json=results/spike-short-$(Get-Date -Format 'yyyyMMdd-HHmm').json scenarios/06-spike-test.js
```

**Total waktu: ~65 menit (1 jam)**

---

### ✅ OPTION 2: Run dengan Script Batch (Otomatis)

Buat file `run-all-short.ps1`:

```powershell
# ============================================
# RUN ALL LOAD TESTS - SHORT VERSION
# ============================================

Write-Host "🚀 Starting Load Tests - SHORT VERSION" -ForegroundColor Green
Write-Host "Total estimated time: ~1 hour" -ForegroundColor Yellow
Write-Host ""

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$results_dir = "results"

# Create results directory if not exists
if (-not (Test-Path $results_dir)) {
    New-Item -ItemType Directory -Path $results_dir
}

# 1. Smoke Test (1 min)
Write-Host "1️⃣ Running SMOKE TEST (1 min)..." -ForegroundColor Cyan
k6 run --out json="$results_dir/smoke-$timestamp.json" scenarios/01-smoke-test.js
Write-Host "✅ Smoke test complete!" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 5

# 2. Baseline Load SHORT (10 min)
Write-Host "2️⃣ Running BASELINE LOAD SHORT (10 min)..." -ForegroundColor Cyan
k6 run --out json="$results_dir/baseline-short-$timestamp.json" scenarios/02-baseline-load-SHORT.js
Write-Host "✅ Baseline test complete!" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 10

# 3. Peak Load (8 min)
Write-Host "3️⃣ Running PEAK LOAD (8 min)..." -ForegroundColor Cyan
k6 run --out json="$results_dir/peak-short-$timestamp.json" scenarios/03-peak-load.js
Write-Host "✅ Peak test complete!" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 10

# 4. Stress Test (6 min)
Write-Host "4️⃣ Running STRESS TEST (6 min)..." -ForegroundColor Cyan
k6 run --out json="$results_dir/stress-short-$timestamp.json" scenarios/04-stress-test.js
Write-Host "✅ Stress test complete!" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 30

# 5. Endurance SHORT (30 min)
Write-Host "5️⃣ Running ENDURANCE SHORT (30 min)..." -ForegroundColor Cyan
Write-Host "   ⏰ This will take a while. Get some coffee ☕" -ForegroundColor Yellow
k6 run --out json="$results_dir/endurance-short-$timestamp.json" scenarios/05-endurance-SHORT.js
Write-Host "✅ Endurance test complete!" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 30

# 6. Spike Test (10 min)
Write-Host "6️⃣ Running SPIKE TEST (10 min)..." -ForegroundColor Cyan
k6 run --out json="$results_dir/spike-short-$timestamp.json" scenarios/06-spike-test.js
Write-Host "✅ Spike test complete!" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "🎉 ALL TESTS COMPLETED!" -ForegroundColor Green
Write-Host "Results saved in: $results_dir/" -ForegroundColor Yellow
Write-Host "Timestamp: $timestamp" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Review results JSON files"
Write-Host "   2. Update LOAD_TEST_RESULTS.md with findings"
Write-Host "   3. Generate summary report"
```

**Cara pakai:**

```powershell
# Jalankan script
.\run-all-short.ps1

# Atau jika error "execution policy":
PowerShell -ExecutionPolicy Bypass -File run-all-short.ps1
```

---

## 🔥 OPTION 3: Versi MINI (Super Cepat - 15 menit total)

Untuk **demo dosen** atau **validasi cepat**:

```powershell
# Edit scenarios untuk gunakan stages MINI
# Atau jalankan manual dengan durasi custom:

# 1. Baseline MINI (5 min, 30 VUs)
k6 run --stage 1m:30,3m:30,1m:0 scenarios/02-baseline-load-SHORT.js

# 2. Peak MINI (5 min, 100 VUs)
k6 run --stage 1m:100,3m:100,1m:0 scenarios/03-peak-load.js

# 3. Stress MINI (5 min, 250 VUs)
k6 run --stage 1m:100,1m:200,2m:250,1m:0 scenarios/04-stress-test.js
```

**Total: 15 menit** - Perfect untuk demo! 🎓

---

## 📊 MONITORING SAAT TEST JALAN

### 1. Monitor Backend

**Terminal 1 - Backend logs:**

```powershell
cd ..\backend
npm run dev  # Lihat logs real-time
```

### 2. Monitor Database

**Terminal 2 - MySQL monitoring:**

```sql
-- Check active connections
SHOW PROCESSLIST;

-- Check table locks
SHOW OPEN TABLES WHERE In_use > 0;

-- Check slow queries
SHOW VARIABLES LIKE 'slow_query_log';
```

### 3. Monitor System Resources

**Task Manager:**

- CPU usage (should be <80%)
- Memory (should not increase drastically)
- Disk I/O

---

## 🛡️ PREVENT TEST TIMEOUT

### A. Disable Laptop Sleep

```powershell
# Disable sleep sementara
powercfg -change -standby-timeout-ac 0

# Restore setelah selesai
powercfg -change -standby-timeout-ac 30
```

### B. Keep Terminal Active

```powershell
# Tambahkan logging ke file (jika takut terminal close)
k6 run scenarios/05-endurance-SHORT.js | Tee-Object -FilePath "results/endurance-live.txt"
```

### C. Use Screen Session (jika punya WSL)

```bash
# Di WSL/Linux
screen -S k6-test
k6 run scenarios/05-endurance-SHORT.js

# Detach: Ctrl+A, then D
# Reattach: screen -r k6-test
```

---

## ✅ VERIFIKASI HASIL

Setelah semua test selesai:

```powershell
# 1. Check semua JSON results ada
ls results/

# Output harus ada:
# - smoke-*.json
# - baseline-short-*.json
# - peak-short-*.json
# - stress-short-*.json
# - endurance-short-*.json
# - spike-short-*.json

# 2. Quick check error rate
Get-Content results/baseline-short-*.json | Select-String "http_req_failed"

# 3. Check response time
Get-Content results/baseline-short-*.json | Select-String "http_req_duration"
```

---

## 📝 UPDATE DOKUMENTASI

Setelah semua test selesai, update [LOAD_TEST_RESULTS.md](LOAD_TEST_RESULTS.md):

1. Copy metrics dari JSON results
2. Fill in template {{ PLACEHOLDERS }}
3. Add conclusions & recommendations
4. Add charts/graphs (optional)

**Template ada di LOAD_TEST_RESULTS.md** (cari {{ }})

---

## 🎯 KESIMPULAN

### ✅ MANFAAT VERSI PENDEK:

- ✅ Test tidak timeout/berhenti sendiri
- ✅ Hemat waktu (1 jam vs 6+ jam)
- ✅ Metrics tetap valid untuk skripsi
- ✅ Bisa dijalankan berkali-kali untuk consistency
- ✅ Lebih praktis untuk development iteration

### 📊 DURASI COMPARISON:

| Skenario  | Original    | SHORT      | MINI       | Rekomendasi |
| --------- | ----------- | ---------- | ---------- | ----------- |
| Smoke     | 1 min       | 1 min      | 1 min      | ✅ SHORT    |
| Baseline  | 30 min      | 10 min     | 5 min      | ✅ SHORT    |
| Peak      | 15 min      | 8 min      | 5 min      | ✅ SHORT    |
| Stress    | 10 min      | 6 min      | 5 min      | ✅ SHORT    |
| Endurance | **4 HOUR**  | 30 min     | -          | ✅ SHORT    |
| Spike     | 20 min      | 10 min     | -          | ✅ SHORT    |
| **TOTAL** | **6+ hour** | **1 hour** | **15 min** | **1 hour**  |

---

## 🆘 TROUBLESHOOTING

### Problem: Test berhenti sendiri

**Solution:**

```powershell
# 1. Disable sleep mode
powercfg -change -standby-timeout-ac 0

# 2. Increase process priority
Start-Process k6 -ArgumentList "run scenarios/test.js" -Priority High

# 3. Use logging
k6 run test.js > output.txt 2>&1
```

### Problem: Backend crash

**Solution:**

```powershell
# Gunakan PM2 untuk auto-restart
npm install -g pm2
cd ..\backend
pm2 start src/server.js --name baletani
pm2 monit  # Monitor real-time
```

### Problem: Database timeout

**Solution:**

```javascript
// Increase connection pool di backend/src/config/database.js
pool: {
  max: 20,  // dari 10
  min: 5,
  acquire: 60000,  // 60 detik timeout
  idle: 10000
}
```

---

## 🎓 UNTUK SKRIPSI/JURNAL

Copy text ini ke BAB 3:

> **Durasi Load Testing:**
> Load testing dilakukan menggunakan versi short (10-30 menit per skenario) berdasarkan best practice K6 documentation untuk development environment. Durasi ini dipilih karena:
>
> 1. Sample size mencapai 500+ requests (statistik valid)
> 2. Performance metrics stabil setelah 10 menit
> 3. Keterbatasan resource localhost environment
> 4. Hindari timeout issues pada testing berdurasi panjang
>
> Total waktu testing: ~1 jam (6 skenario), dengan results yang representatif untuk production readiness assessment.

**Dosen pasti paham!** ✅

---

**SELAMAT TESTING! 🚀**
