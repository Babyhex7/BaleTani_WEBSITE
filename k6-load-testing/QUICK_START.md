# 🚀 QUICK START GUIDE - K6 Load Testing BaleTani

Panduan cepat untuk mulai load testing dalam **15 menit**!

---

## ✅ Prerequisites

- [x] K6 installed (`k6 version`)
- [x] Node.js installed (`node --version`)
- [x] MySQL database `baletani_db` running
- [x] Backend running di `http://localhost:5000`

---

## 📋 Step-by-Step Setup (15 menit)

### **Step 1: Install K6** (2 menit)

```powershell
# Windows (via Chocolatey)
choco install k6

# Verify installation
k6 version
# Output: k6 v0.48.0 atau lebih baru
```

---

### **Step 2: Install Dependencies** (1 menit)

```powershell
# Navigate ke folder k6-load-testing
cd k6-load-testing

# Install Node.js dependencies
npm install
```

---

### **Step 3: Setup Environment** (1 menit)

```powershell
# Copy .env.example ke .env
copy .env.example .env

# Edit .env (optional, default sudah OK)
# BASE_URL=http://localhost:5000
```

---

### **Step 4: Create Test Customers** (3 menit)

**Option A: Via Node.js Script (RECOMMENDED)**

```powershell
# Buat 100 test customers di database
node scripts/seed-test-accounts.js

# Output:
# ✅ Created 100 accounts
# Phone: 6281000000001 - 6281000000100
# Password: test123
```

**Option B: Via SQL Script**

```sql
-- Buka MySQL Workbench atau MySQL CLI
-- Connect ke database baletani_db
-- Execute script:
SOURCE scripts/create-test-customers.sql;
```

---

### **Step 5: Generate Test Data** (2 menit)

```powershell
# Export customers & products ke JSON
node scripts/generate-test-data.js

# Output:
# ✅ customers.json (100 accounts)
# ✅ products.json (500 products)
# ✅ categories.json (categories)
```

**Verify files created:**

```powershell
dir data\*.json
```

---

### **Step 6: Verify Backend Running** (1 menit)

```powershell
# Test backend health
curl http://localhost:5000/api/health

# Expected output:
# {"status":"ok"}
```

**Jika backend belum running:**

```powershell
cd ..\backend
npm start

# Wait sampai muncul:
# Server running on port 5000
```

---

### **Step 7: Run Smoke Test** (1 menit)

```powershell
# Quick validation - 1 VU, 1 menit
k6 run scenarios/01-smoke-test.js
```

**Expected Output:**

```
✓ health: status 200
✓ login: status 200
✓ products: status 200
✓ add cart: success

checks.........................: 100.00% ✓ 15
http_req_duration..............: avg=250ms
```

**Jika PASS → Lanjut ke Step 8 ✅**  
**Jika FAIL → Check error messages**

---

### **Step 8: Run Baseline Test** (30 menit)

```powershell
# Normal load - 50 VUs, 30 menit
k6 run scenarios/02-baseline-load.js
```

Test akan run selama **30 menit**. Anda bisa:

- ☕ Ambil kopi
- 📊 Monitor backend logs
- 💻 Check database connections
- 📈 Watch metrics real-time di terminal

---

## 🎯 Test Results

Setelah test selesai, K6 akan tampilkan summary:

```
     ✓ login successful
     ✓ products loaded
     ✓ cart updated

     checks.........................: 98.50% ✓ 2955     ✗ 45
     http_req_duration..............: avg=420ms  p(95)=890ms
     http_req_failed................: 0.80%  ✓ 24
     http_reqs......................: 3000   50/s
     iterations.....................: 150    2.5/s
     vus............................: 50     min=0      max=50
```

### Interpret Results:

✅ **PASS** jika:

- `http_req_duration p(95)` < 1000ms
- `http_req_failed` < 1%
- `checks` > 95%

⚠️ **PERLU OPTIMASI** jika:

- `http_req_duration p(95)` > 1500ms
- `http_req_failed` > 3%
- `checks` < 90%

---

## 📊 Running Other Scenarios

### **Peak Load Test** (Flash Sale)

```powershell
# 150 VUs, 15 menit
k6 run scenarios/03-peak-load.js
```

### **Stress Test** (Breaking Point)

```powershell
# 300+ VUs, find breaking point
k6 run scenarios/04-stress-test.js
```

### **Endurance Test** (Stability - 4 jam)

```powershell
# 50 VUs, 4 jam (run overnight)
k6 run scenarios/05-endurance-test.js
```

### **Spike Test** (Traffic Surge)

```powershell
# 20 → 200 → 20 VUs, recovery test
k6 run scenarios/06-spike-test.js
```

---

## 💾 Save Results to File

```powershell
# Export results ke JSON
k6 run --out json=results/baseline-2025-12-04.json scenarios/02-baseline-load.js

# Export summary only
k6 run --summary-export=results/summary.json scenarios/02-baseline-load.js

# Multiple outputs
k6 run \
  --out json=results/test.json \
  --summary-export=results/summary.json \
  scenarios/02-baseline-load.js
```

---

## 🔧 Troubleshooting

### Problem: K6 command not found

```powershell
# Solusi: Add K6 ke PATH
$env:Path += ";C:\k6"

# Atau restart terminal setelah install
```

### Problem: Connection refused to localhost:5000

```powershell
# Solusi: Start backend
cd backend
npm start

# Verify
curl http://localhost:5000/api/health
```

### Problem: Login failed (401 Unauthorized)

```powershell
# Solusi: Re-seed test accounts
node scripts/seed-test-accounts.js

# Verify
node scripts/generate-test-data.js
```

### Problem: No test data (customers.json not found)

```powershell
# Solusi: Generate test data
node scripts/generate-test-data.js

# Verify files
dir data\*.json
```

### Problem: MySQL connection error

```powershell
# Check .env file
# Pastikan DB_HOST, DB_USER, DB_PASSWORD, DB_NAME correct

# Test connection manually
mysql -u root -p baletani_db
```

---

## 🎉 Next Steps After Baseline Test

1. **Analyze Results**

   - Review response time (p95, p99)
   - Check error rate
   - Identify slow endpoints

2. **Run Peak Load Test**

   - Simulate flash sale
   - Test rate limiting
   - Monitor cache effectiveness

3. **Run Stress Test**

   - Find breaking point
   - Document max capacity
   - Identify bottlenecks

4. **Optimize & Retest**
   - Fix bottlenecks
   - Add indexes
   - Optimize queries
   - Re-run baseline untuk compare

---

## 📚 Documentation

- **Full README**: `README.md`
- **Config**: `config/` folder
- **Helpers**: `lib/` folder
- **Test Data**: `data/README.md`

---

## 🆘 Need Help?

Check logs untuk error details:

```powershell
# Backend logs
cd backend
npm start

# Check specific error
tail -f logs/app.log | grep ERROR
```

---

**Happy Load Testing! 🚀**
