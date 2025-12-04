# 🚀 K6 Load Testing - BaleTani Customer Flow

## 📋 Overview

Load testing suite menggunakan K6 untuk menguji **Customer Journey** BaleTani E-Commerce Platform:

- Customer Authentication (Register & Login)
- Product Browsing (Public endpoints)
- Shopping Cart Operations
- Checkout & Order Creation
- Order History

---

## 🎯 Tujuan Testing

- ✅ Validasi performa sistem pada beban normal (50 concurrent users)
- ✅ Test kapasitas sistem pada peak load (150 concurrent users)
- ✅ Identifikasi breaking point sistem (stress test)
- ✅ Detect memory leaks & stability issues (endurance test)
- ✅ Test recovery dari traffic spike

**Target Performance:**

- Response time p95: <1000ms (normal load)
- Error rate: <1% (normal), <3% (peak)
- Database pool: <80% utilization
- Cache hit ratio: >70%

---

## 🏗️ Struktur Folder

```
k6-load-testing/
├── README.md                    # Dokumentasi ini
├── package.json                 # Dependencies (optional)
├── .env.example                 # Template environment variables
├── .gitignore                   # Ignore results & .env
│
├── config/
│   ├── stages.js                # Load profiles (baseline, peak, stress, etc)
│   ├── thresholds.js            # Success criteria per scenario
│   └── endpoints.js             # API endpoint definitions
│
├── lib/
│   ├── auth.js                  # Login helpers (customer)
│   ├── helpers.js               # Utility functions
│   └── checks.js                # Common check functions
│
├── data/
│   ├── customers.json           # 100 test customer accounts
│   ├── products.json            # 500 products from database
│   ├── categories.json          # Product categories
│   └── README.md                # How to generate test data
│
├── scenarios/
│   ├── 01-smoke-test.js         # Quick sanity check (1 VU, 1 min)
│   ├── 02-baseline-load.js      # Normal load (50 VUs, 30 min)
│   ├── 03-peak-load.js          # Flash sale (150 VUs, 15 min)
│   ├── 04-stress-test.js        # Breaking point (300+ VUs)
│   ├── 05-endurance-test.js     # Stability (50 VUs, 4 hours)
│   └── 06-spike-test.js         # Recovery test (20→200→20 VUs)
│
├── journeys/
│   ├── customer-auth.js         # Register & Login flow
│   ├── customer-browse.js       # Product browsing flow
│   ├── customer-cart.js         # Add to cart flow
│   ├── customer-checkout.js     # Full purchase flow
│   └── customer-history.js      # Order history flow
│
├── scripts/
│   ├── generate-test-data.js    # Export DB data to JSON
│   ├── seed-test-accounts.js    # Create 100 customer accounts
│   └── cleanup.js               # Remove test data
│
└── results/
    ├── .gitkeep
    └── (test results akan tersimpan di sini)
```

---

## 🛠️ Setup & Installation

### 1. Install K6

**Windows (via Chocolatey):**

```powershell
choco install k6
```

**Windows (Manual):**

1. Download dari: https://github.com/grafana/k6/releases
2. Extract `k6.exe` ke `C:\k6\`
3. Add ke PATH: `C:\k6`

**Verify installation:**

```powershell
k6 version
# Output: k6 v0.48.0 (atau lebih baru)
```

### 2. Generate Test Data

**A. Create Test Customer Accounts (100 accounts):**

```sql
-- Run di MySQL database baletani_db
-- File: scripts/create-test-customers.sql

-- Create 100 test customers
-- Phone: 6281000000001 - 6281000000100
-- Password: "test123" (akan di-hash dengan bcrypt)

DELIMITER $$

CREATE PROCEDURE generate_test_customers()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE phone VARCHAR(20);
    DECLARE hashed_pwd VARCHAR(255);
    DECLARE customer_uuid VARCHAR(36);

    -- Bcrypt hash untuk "test123" (10 rounds)
    SET hashed_pwd = '$2a$10$X9k3qZJZ0eF.K7LzZzL.1OJ3Y5F3B.Q9x3J3Z0eF.K7LzZzL.1O';

    WHILE i <= 100 DO
        -- Generate phone number: 6281000000001 - 6281000000100
        SET phone = CONCAT('628100000', LPAD(i, 4, '0'));
        SET customer_uuid = UUID();

        -- Insert if not exists
        INSERT IGNORE INTO customers (
            customer_id,
            phone_number,
            password,
            full_name,
            address,
            is_active,
            created_at
        ) VALUES (
            customer_uuid,
            phone,
            hashed_pwd,
            CONCAT('Test Customer ', i),
            CONCAT('Jl. Test No. ', i, ', Jakarta'),
            1,
            NOW()
        );

        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

-- Execute procedure
CALL generate_test_customers();

-- Verify
SELECT COUNT(*) as total_test_customers
FROM customers
WHERE phone_number LIKE '628100000%';
```

**B. Export Data ke JSON:**

```javascript
// File: scripts/generate-test-data.js
// Run: node scripts/generate-test-data.js

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // Your MySQL password
  database: "baletani_db",
};

async function generateTestData() {
  console.log("🔄 Connecting to database...");
  const connection = await mysql.createConnection(dbConfig);

  try {
    // 1. Export customers
    console.log("📦 Exporting customers...");
    const [customers] = await connection.query(`
      SELECT 
        customer_id, 
        phone_number, 
        full_name as name, 
        address
      FROM customers
      WHERE phone_number LIKE '628100000%'
      ORDER BY phone_number
      LIMIT 100
    `);

    const customersWithPassword = customers.map((c) => ({
      ...c,
      password: "test123", // Plaintext untuk K6 (akan di-hash oleh backend saat login)
    }));

    fs.writeFileSync(
      path.join(__dirname, "../data/customers.json"),
      JSON.stringify(customersWithPassword, null, 2)
    );
    console.log(`✅ Exported ${customers.length} customers`);

    // 2. Export products
    console.log("📦 Exporting products...");
    const [products] = await connection.query(`
      SELECT 
        product_id, 
        product_name, 
        price, 
        stock, 
        category_id
      FROM products
      WHERE is_active = 1
      ORDER BY RAND()
      LIMIT 500
    `);

    fs.writeFileSync(
      path.join(__dirname, "../data/products.json"),
      JSON.stringify(products, null, 2)
    );
    console.log(`✅ Exported ${products.length} products`);

    // 3. Export categories
    console.log("📦 Exporting categories...");
    const [categories] = await connection.query(`
      SELECT 
        category_id, 
        category_name, 
        slug
      FROM categories
      WHERE is_active = 1
      ORDER BY category_name
    `);

    fs.writeFileSync(
      path.join(__dirname, "../data/categories.json"),
      JSON.stringify(categories, null, 2)
    );
    console.log(`✅ Exported ${categories.length} categories`);

    console.log("\n🎉 Test data generation complete!");
    console.log(`\n📁 Files created in: ${path.join(__dirname, "../data/")}`);
    console.log("   - customers.json (100 test accounts)");
    console.log("   - products.json (500 products)");
    console.log("   - categories.json (all categories)\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

generateTestData();
```

**Install dependencies & run:**

```powershell
# Install mysql2 jika belum ada
npm install mysql2

# Run script
node scripts/generate-test-data.js
```

---

## ⚡ Penting: Disable Rate Limit untuk Load Testing

**Backend BaleTani memiliki rate limiter untuk security.** Untuk load testing, Anda harus disable rate limit:

### Option 1: Gunakan npm script (Recommended)

```powershell
# Di folder backend/
cd ../backend
npm run dev:no-limit
```

### Option 2: Manual set environment variable

```powershell
# Windows PowerShell
$env:DISABLE_RATE_LIMIT="true"
cd backend
npm run dev

# Windows CMD
set DISABLE_RATE_LIMIT=true
cd backend
npm run dev
```

### Option 3: Edit .env file backend

```env
# backend/.env
DISABLE_RATE_LIMIT=true
```

**⚠️ PENTING:**

- Rate limit harus di-disable sebelum menjalankan test
- Jika tidak, test akan gagal dengan error 429 "Terlalu banyak request"
- Jangan lupa **enable kembali** setelah load testing selesai (untuk production)

---

## 🎭 Test Scenarios

### 1️⃣ Smoke Test (Sanity Check)

**File:** `scenarios/01-smoke-test.js`  
**Duration:** 1 menit  
**VUs:** 1 user

```powershell
k6 run scenarios/01-smoke-test.js
```

**Purpose:** Quick validation bahwa semua endpoint berfungsi

---

### 2️⃣ Baseline Load Test (Normal Traffic)

**File:** `scenarios/02-baseline-load.js`  
**Duration:** 30 menit  
**VUs:** 50 concurrent users

```powershell
k6 run scenarios/02-baseline-load.js
```

**Expected Results:**

- ✅ Response time p95 <1000ms
- ✅ Error rate <1%
- ✅ Throughput: 50-100 req/s

---

### 3️⃣ Peak Load Test (Flash Sale)

**File:** `scenarios/03-peak-load.js`  
**Duration:** 15 menit  
**VUs:** 150 concurrent users

```powershell
k6 run scenarios/03-peak-load.js
```

**Expected Results:**

- ✅ Response time p95 <1500ms
- ✅ Error rate <3%
- ✅ Throughput: 150-250 req/s

---

### 4️⃣ Stress Test (Breaking Point)

**File:** `scenarios/04-stress-test.js`  
**Duration:** 10-15 menit  
**VUs:** 300+ users (ramp up until failure)

```powershell
k6 run scenarios/04-stress-test.js
```

**Purpose:** Find sistem breaking point (saat error rate >20%)

---

### 5️⃣ Endurance Test (Stability)

**File:** `scenarios/05-endurance-test.js`  
**Duration:** 4 jam  
**VUs:** 50 concurrent users (constant)

```powershell
k6 run scenarios/05-endurance-test.js
```

**Purpose:** Detect memory leaks & performance degradation over time

---

### 6️⃣ Spike Test (Traffic Surge)

**File:** `scenarios/06-spike-test.js`  
**Duration:** 20 menit  
**Pattern:** 20 → 200 → 20 users

```powershell
k6 run scenarios/06-spike-test.js
```

**Purpose:** Test system recovery dari sudden traffic spike

---

## 📊 Monitoring & Results

### View Results in Terminal

K6 akan menampilkan real-time metrics:

```
     ✓ login successful
     ✓ products loaded
     ✓ cart updated

     checks.........................: 98.50% ✓ 2955     ✗ 45
     data_received..................: 2.5 MB 42 kB/s
     data_sent......................: 850 kB 14 kB/s
     http_req_duration..............: avg=420ms  min=89ms   med=380ms  max=2.1s   p(90)=750ms  p(95)=890ms
     http_req_failed................: 0.80%  ✓ 24       ✗ 2976
     http_reqs......................: 3000   50/s
     iteration_duration.............: avg=15.2s  min=12.1s  med=14.8s  max=22.3s
     iterations.....................: 150    2.5/s
     vus............................: 50     min=0      max=50
     vus_max........................: 50     min=50     max=50
```

### Export Results to JSON

```powershell
# Export ke JSON untuk post-processing
k6 run --out json=results/baseline-2025-12-04.json scenarios/02-baseline-load.js

# Export summary only
k6 run --summary-export=results/summary.json scenarios/02-baseline-load.js
```

### Generate HTML Report

```powershell
# Install k6-reporter (optional)
npm install -g k6-to-junit

# Convert to HTML
k6 run --out json=results/test.json scenarios/02-baseline-load.js
# Then use online converter: https://k6.io/docs/results-output/
```

---

## 🎯 Success Criteria

### Response Time Thresholds

| Scenario  | p95 Target | p99 Target | Max     |
| --------- | ---------- | ---------- | ------- |
| Smoke     | <2000ms    | <3000ms    | <5000ms |
| Baseline  | <1000ms    | <2000ms    | <3000ms |
| Peak      | <1500ms    | <3000ms    | <5000ms |
| Endurance | <1200ms    | <2500ms    | <4000ms |

### Error Rate Thresholds

| Scenario  | Max Error Rate          |
| --------- | ----------------------- |
| Smoke     | 0%                      |
| Baseline  | <1%                     |
| Peak      | <3%                     |
| Stress    | Document breaking point |
| Endurance | <0.5%                   |

### System Resources

```
Database Connection Pool:
- Normal: <60% (60/100 connections)
- Peak: <80% (80/100 connections)

Cache Hit Ratio:
- Target: >70%

Memory (Node.js):
- Normal: 200-400MB
- Alert: >700MB or continuous growth
```

---

## 🚀 Quick Start

```powershell
# 1. Install K6
choco install k6

# 2. Clone or copy this folder to your test environment
cd k6-load-testing

# 3. Install Node.js dependencies (untuk scripts)
npm install

# 4. Setup database (create test customers)
# Execute SQL: scripts/create-test-customers.sql in MySQL

# 5. Generate test data
node scripts/generate-test-data.js

# 6. Verify backend is running
curl http://localhost:5000/api/health

# 7. Run smoke test (quick validation)
k6 run scenarios/01-smoke-test.js

# 8. Run baseline test (30 min)
k6 run scenarios/02-baseline-load.js

# 9. View results in terminal or export to JSON
```

---

## 📦 Portable Setup

Folder ini **100% portable** dan bisa dipindah ke repo lain dengan mudah:

### 1. Copy Entire Folder

```powershell
# Copy seluruh folder
xcopy k6-load-testing C:\path\to\new\repo\k6-load-testing /E /I
```

### 2. Update Environment Variables

```powershell
# Edit file .env (if used)
# Or pass as command line:
k6 run --env BASE_URL=http://production.com scenarios/02-baseline-load.js
```

### 3. Re-generate Test Data

```powershell
# Connect to new database & run
node scripts/generate-test-data.js
```

### 4. Ready to Run!

```powershell
k6 run scenarios/01-smoke-test.js
```

---

## 🔒 Security & Best Practices

### .gitignore

```gitignore
# File: .gitignore

# Results
results/*.json
results/*.html
results/*.csv

# Environment
.env

# Node modules (if using npm)
node_modules/

# OS files
.DS_Store
Thumbs.db

# Test data (optional - commit or ignore)
# data/*.json
```

### Environment Variables

```bash
# File: .env.example

# Backend API URL
BASE_URL=http://localhost:5000

# Test duration override (optional)
TEST_DURATION=30m

# Test VUs override (optional)
TEST_VUS=50

# Database connection (for scripts)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=baletani_db
```

**PENTING:** Copy `.env.example` ke `.env` dan sesuaikan dengan environment Anda.

---

## 📚 Learn More

### K6 Documentation

- Official Docs: https://k6.io/docs/
- JavaScript API: https://k6.io/docs/javascript-api/
- Examples: https://k6.io/docs/examples/

### K6 Best Practices

1. Use SharedArray untuk test data (memory efficient)
2. Add tags ke requests untuk filtering
3. Implement proper think time (sleep)
4. Use thresholds untuk pass/fail criteria
5. Monitor backend logs during tests

---

## 🆘 Troubleshooting

### Problem: K6 command not found

```powershell
# Solution: Add K6 to PATH
$env:Path += ";C:\k6"
```

### Problem: Connection refused to localhost:5000

```powershell
# Solution: Ensure backend is running
cd backend
npm start

# Verify
curl http://localhost:5000/api/health
```

### Problem: Test data tidak ada

```powershell
# Solution: Generate test data
node scripts/generate-test-data.js

# Verify
dir data\*.json
```

### Problem: Login gagal (401 Unauthorized)

```powershell
# Solution: Check password hash di database
# Test customers harus punya password: "test123"
# Atau re-run SQL script: scripts/create-test-customers.sql
```

---

## 📝 Next Steps

Setelah setup selesai:

1. ✅ Run smoke test untuk validasi
2. ✅ Run baseline test (capture normal performance)
3. ✅ Run peak test (simulate flash sale)
4. ✅ Run stress test (find breaking point)
5. ✅ Analyze results & create report
6. ✅ Implement optimizations
7. ✅ Re-run tests untuk validate improvements

---

## 🎉 Ready to Test!

Folder ini sudah siap untuk:

- ✅ Run di local machine
- ✅ Copy ke repo lain
- ✅ Run di CI/CD pipeline
- ✅ Share dengan tim

**Happy Load Testing! 🚀**
