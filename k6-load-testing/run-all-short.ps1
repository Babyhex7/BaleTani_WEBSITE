# ============================================
# RUN ALL LOAD TESTS - SHORT VERSION
# ============================================
# Script untuk menjalankan semua load test versi pendek
# Total durasi: ~1 jam (vs 6+ jam original)
#
# CARA PAKAI:
# PowerShell -ExecutionPolicy Bypass -File run-all-short.ps1
#
# ATAU:
# .\run-all-short.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     K6 LOAD TESTING - SHORT VERSION (1 Hour Total)        ║" -ForegroundColor Cyan
Write-Host "║                    BaleTani Platform                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# CONFIGURATION
# ============================================
$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$results_dir = "results"

# ============================================
# PRE-FLIGHT CHECKS
# ============================================
Write-Host "🔍 Pre-flight checks..." -ForegroundColor Yellow

# Check if K6 is installed
try {
    $k6Version = k6 version
    Write-Host "   ✅ K6 found: $k6Version" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ K6 not installed! Install with: choco install k6" -ForegroundColor Red
    exit 1
}

# Check if results directory exists
if (-not (Test-Path $results_dir)) {
    Write-Host "   📁 Creating results directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $results_dir | Out-Null
    Write-Host "   ✅ Results directory created" -ForegroundColor Green
}
else {
    Write-Host "   ✅ Results directory exists" -ForegroundColor Green
}

# Check if backend is running
Write-Host "   🔌 Checking backend availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend is running!" -ForegroundColor Green
    }
}
catch {
    Write-Host "   ❌ Backend not accessible at http://localhost:5000" -ForegroundColor Red
    Write-Host "   💡 Start backend with: cd ..\backend && npm run dev" -ForegroundColor Yellow
    $continue = Read-Host "   Continue anyway? (y/N)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Check if test data exists
if (Test-Path "data/customers.json") {
    $customers = Get-Content "data/customers.json" | ConvertFrom-Json
    Write-Host "   ✅ Test data found: $($customers.Count) customers" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Test data not found. Run: node scripts/seed-test-accounts.js" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ============================================
# TEST EXECUTION
# ============================================

Write-Host "🚀 Starting Load Tests - SHORT VERSION" -ForegroundColor Green
Write-Host "   Total estimated time: ~65 minutes (1 hour)" -ForegroundColor Yellow
Write-Host "   Results will be saved to: $results_dir/" -ForegroundColor Yellow
Write-Host ""

$startTime = Get-Date

# ============================================
# 1. SMOKE TEST (1 minute)
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "1️⃣  SMOKE TEST" -ForegroundColor Cyan
Write-Host "   Duration: 1 minute" -ForegroundColor Gray
Write-Host "   Purpose: Validate all endpoints are working" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$test1Start = Get-Date
k6 run --out json="$results_dir/smoke-$timestamp.json" scenarios/01-smoke-test.js
$test1End = Get-Date
$test1Duration = ($test1End - $test1Start).TotalSeconds

Write-Host ""
Write-Host "   ✅ Smoke test complete! (Took $([math]::Round($test1Duration, 0)) seconds)" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 5

# ============================================
# 2. BASELINE LOAD SHORT (10 minutes)
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "2️⃣  BASELINE LOAD TEST - SHORT" -ForegroundColor Cyan
Write-Host "   Duration: 10 minutes" -ForegroundColor Gray
Write-Host "   VUs: 50 concurrent users" -ForegroundColor Gray
Write-Host "   Purpose: Establish performance baseline" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$test2Start = Get-Date
k6 run --out json="$results_dir/baseline-short-$timestamp.json" scenarios/02-baseline-load-SHORT.js
$test2End = Get-Date
$test2Duration = ($test2End - $test2Start).TotalMinutes

Write-Host ""
Write-Host "   ✅ Baseline test complete! (Took $([math]::Round($test2Duration, 1)) minutes)" -ForegroundColor Green
Write-Host ""
Write-Host "   💡 Take a quick break ☕ before continuing..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# ============================================
# 3. PEAK LOAD (8 minutes)
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "3️⃣  PEAK LOAD TEST" -ForegroundColor Cyan
Write-Host "   Duration: 8 minutes" -ForegroundColor Gray
Write-Host "   VUs: 150 concurrent users (flash sale simulation)" -ForegroundColor Gray
Write-Host "   Purpose: Test system under high load" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$test3Start = Get-Date
k6 run --out json="$results_dir/peak-short-$timestamp.json" scenarios/03-peak-load.js
$test3End = Get-Date
$test3Duration = ($test3End - $test3Start).TotalMinutes

Write-Host ""
Write-Host "   ✅ Peak test complete! (Took $([math]::Round($test3Duration, 1)) minutes)" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 10

# ============================================
# 4. STRESS TEST (6 minutes)
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "4️⃣  STRESS TEST" -ForegroundColor Cyan
Write-Host "   Duration: 6 minutes" -ForegroundColor Gray
Write-Host "   VUs: Ramp to 300 users (find breaking point)" -ForegroundColor Gray
Write-Host "   Purpose: Identify system capacity limit" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$test4Start = Get-Date
k6 run --out json="$results_dir/stress-short-$timestamp.json" scenarios/04-stress-test.js
$test4End = Get-Date
$test4Duration = ($test4End - $test4Start).TotalMinutes

Write-Host ""
Write-Host "   ✅ Stress test complete! (Took $([math]::Round($test4Duration, 1)) minutes)" -ForegroundColor Green
Write-Host ""
Write-Host "   💡 Longer break recommended 🍔 before endurance test..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# ============================================
# 5. ENDURANCE SHORT (30 minutes)
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "5️⃣  ENDURANCE TEST - SHORT" -ForegroundColor Cyan
Write-Host "   Duration: 30 minutes" -ForegroundColor Gray
Write-Host "   VUs: 50 concurrent users (sustained)" -ForegroundColor Gray
Write-Host "   Purpose: Detect memory leaks and degradation" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   ⏰ This will take 30 minutes. Perfect time for:" -ForegroundColor Yellow
Write-Host "      - Get some coffee ☕" -ForegroundColor Yellow
Write-Host "      - Check email 📧" -ForegroundColor Yellow
Write-Host "      - Work on documentation 📝" -ForegroundColor Yellow
Write-Host ""

$test5Start = Get-Date
k6 run --out json="$results_dir/endurance-short-$timestamp.json" scenarios/05-endurance-SHORT.js
$test5End = Get-Date
$test5Duration = ($test5End - $test5Start).TotalMinutes

Write-Host ""
Write-Host "   ✅ Endurance test complete! (Took $([math]::Round($test5Duration, 1)) minutes)" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 30

# ============================================
# 6. SPIKE TEST (10 minutes)
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "6️⃣  SPIKE TEST" -ForegroundColor Cyan
Write-Host "   Duration: 10 minutes" -ForegroundColor Gray
Write-Host "   VUs: 20 → 200 → 20 (sudden spike)" -ForegroundColor Gray
Write-Host "   Purpose: Test recovery from traffic surge" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

$test6Start = Get-Date
k6 run --out json="$results_dir/spike-short-$timestamp.json" scenarios/06-spike-test.js
$test6End = Get-Date
$test6Duration = ($test6End - $test6Start).TotalMinutes

Write-Host ""
Write-Host "   ✅ Spike test complete! (Took $([math]::Round($test6Duration, 1)) minutes)" -ForegroundColor Green
Write-Host ""

# ============================================
# SUMMARY
# ============================================
$endTime = Get-Date
$totalDuration = ($endTime - $startTime).TotalMinutes

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  🎉 ALL TESTS COMPLETED! 🎉                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   Started:  $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor White
Write-Host "   Finished: $($endTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor White
Write-Host "   Total Duration: $([math]::Round($totalDuration, 1)) minutes" -ForegroundColor Yellow
Write-Host ""

Write-Host "   Tests Run:" -ForegroundColor White
$test1Min = [math]::Round($test1Duration / 60, 1)
$test2Min = [math]::Round($test2Duration, 1)
$test3Min = [math]::Round($test3Duration, 1)
$test4Min = [math]::Round($test4Duration, 1)
$test5Min = [math]::Round($test5Duration, 1)
$test6Min = [math]::Round($test6Duration, 1)
Write-Host "   - 1. Smoke Test        ($test1Min min)" -ForegroundColor Green
Write-Host "   - 2. Baseline Load     ($test2Min min)" -ForegroundColor Green
Write-Host "   - 3. Peak Load         ($test3Min min)" -ForegroundColor Green
Write-Host "   - 4. Stress Test       ($test4Min min)" -ForegroundColor Green
Write-Host "   - 5. Endurance Test    ($test5Min min)" -ForegroundColor Green
Write-Host "   - 6. Spike Test        ($test6Min min)" -ForegroundColor Green
Write-Host ""

Write-Host "   Results saved to: $results_dir/" -ForegroundColor Yellow
Write-Host "   Timestamp: $timestamp" -ForegroundColor Yellow
Write-Host ""

# List result files
Write-Host "   📁 Generated files:" -ForegroundColor Cyan
Get-ChildItem -Path $results_dir -Filter "*$timestamp.json" | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 1)
    Write-Host "      - $($_.Name) ($sizeKB KB)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "📝 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Review JSON result files for detailed metrics" -ForegroundColor White
Write-Host "   2. Update LOAD_TEST_RESULTS.md with findings" -ForegroundColor White
Write-Host "   3. Generate summary report & charts" -ForegroundColor White
Write-Host "   4. Document any issues found" -ForegroundColor White
Write-Host "   5. Ready for skripsi documentation! 🎓" -ForegroundColor White
Write-Host ""

Write-Host "💡 TIP: Compare results with previous runs to track improvements" -ForegroundColor Yellow
Write-Host ""

# Ask if user wants to open results folder
$openFolder = Read-Host "Open results folder in Explorer? (y/N)"
if ($openFolder -eq "y") {
    explorer $results_dir
}

Write-Host ""
Write-Host "✨ Happy analyzing! ✨" -ForegroundColor Green
Write-Host ""
