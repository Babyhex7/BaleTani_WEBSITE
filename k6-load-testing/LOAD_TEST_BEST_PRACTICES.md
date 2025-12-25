# 🚀 LOAD TESTING BEST PRACTICES & TROUBLESHOOTING GUIDE

## 📋 **DAFTAR ISI**

1. [Penjelasan Connection Pool](#penjelasan-connection-pool)
2. [Best Practices Load Testing](#best-practices-load-testing)
3. [Troubleshooting Guide](#troubleshooting-guide)
4. [Monitoring Tools](#monitoring-tools)
5. [Recommended Test Scenarios](#recommended-test-scenarios)

---

## 🔍 **1. PENJELASAN CONNECTION POOL**

### **Apa itu Database Connection Pool?**

Connection pool adalah **kumpulan koneksi database yang sudah dibuat sebelumnya** dan siap digunakan oleh aplikasi. Tanpa connection pool, setiap request harus:

1. Buka koneksi TCP ke MySQL (slow - ~50-100ms)
2. Authenticate user
3. Jalankan query
4. Tutup koneksi

Dengan pool: **Ambil koneksi existing → Query → Kembalikan ke pool** (fast - ~1-5ms)

### **Analogi Sederhana**

Bayangkan **taksi online**:

- **Tanpa Pool**: Setiap mau naik taksi, harus beli mobil baru, pakai, terus buang (mahal & lama)
- **Dengan Pool**: Ada 100 taksi standby. Butuh taksi? Ambil yang available. Selesai? Kembalikan. (efisien)

### **Konfigurasi Pool BaleTani**

```javascript
pool: {
  max: 100,        // Maksimal 100 koneksi bersamaan
  min: 20,         // Selalu siapkan 20 koneksi warm
  acquire: 120000, // Timeout 120 detik untuk dapat koneksi
  idle: 30000,     // Tutup koneksi jika idle 30 detik
}
```

### **Skenario MySQL Connection Max**

**MySQL Default: 151 max_connections**

#### **Skenario 1: Low Traffic (10-50 concurrent users)**

- **Dibutuhkan**: 10-30 koneksi
- **Pool setting**: max: 50, min: 10
- **Status**: ✅ Sangat aman
- **Recommendation**: Default setting cukup

#### **Skenario 2: Medium Traffic (50-200 concurrent users)**

- **Dibutuhkan**: 50-100 koneksi
- **Pool setting**: max: 100, min: 20 ⬅️ **CURRENT SETTING**
- **Status**: ✅ Optimal untuk BaleTani
- **Recommendation**: Monitor pool usage, scale jika perlu

#### **Skenario 3: High Traffic (200-500 concurrent users)**

- **Dibutuhkan**: 100-200 koneksi
- **Pool setting**: max: 150, min: 30
- **Status**: ⚠️ Butuh increase MySQL max_connections
- **Recommendation**:
  - Set MySQL: `max_connections = 300`
  - Pool: `max: 200, min: 40`
  - Consider read replicas

#### **Skenario 4: Very High Traffic (500+ concurrent users)**

- **Dibutuhkan**: 200-500 koneksi
- **Pool setting**: max: 200-300, min: 50
- **Status**: 🔴 Critical - butuh architecture changes
- **Recommendation**:
  - Horizontal scaling (multiple backend instances)
  - Database read replicas
  - Connection pooler (PgBouncer equivalent for MySQL: ProxySQL)
  - Cache aggressive (Redis)

### **Kenapa Test dengan 50 VUs Gagal 86%?**

```
50 VUs × 3-5 requests/journey = 150-250 concurrent requests
```

**Masalah bukan di pool (max: 100)**, tapi kemungkinan:

1. **Slow queries** → Each connection held too long → Pool exhausted
2. **Cache not working** → Every request hits DB
3. **Connection leaks** → Connections not returned to pool
4. **MySQL timeout** → MySQL default timeout = 8 hours, tapi OS bisa terminate earlier

---

## 🎯 **2. BEST PRACTICES LOAD TESTING**

### **A. Progressive Load Testing**

**JANGAN** langsung test dengan 50 VUs! Gunakan strategi bertahap:

```
Level 1: Debug Test (10 VUs × 5 min)     ← START HERE
Level 2: Smoke Test (20 VUs × 5 min)     ← Validate fixes
Level 3: Baseline (50 VUs × 10 min)      ← Current target
Level 4: Peak (100 VUs × 15 min)         ← Future target
Level 5: Stress (200+ VUs × 20 min)      ← Production ready
```

### **B. Monitoring Checklist**

Saat load test, monitor:

✅ **Backend logs**

- Error messages
- Request duration
- Cache hit/miss rate

✅ **Database**

```bash
# Check active connections
SHOW STATUS LIKE 'Threads_connected';

# Check max connections
SHOW VARIABLES LIKE 'max_connections';

# Check slow queries
SHOW FULL PROCESSLIST;
```

✅ **Connection Pool**

- Hit endpoint: `GET http://localhost:5000/api/pool-stats`
- Watch for: `borrowed > 80` (80% pool usage = danger)

✅ **System Resources**

- Task Manager: CPU, RAM, Disk I/O
- Network: Check bandwidth usage

### **C. Optimization Tips**

#### **1. Enable Aggressive Caching**

```javascript
// Cache EVERYTHING di load test
CUSTOMER.PRODUCTS_LIST: 600 seconds (10 min)
CUSTOMER.PRODUCT_DETAIL: 900 seconds (15 min)
CUSTOMER.CATEGORIES: 1800 seconds (30 min)
```

#### **2. Disable Unnecessary Logging**

```env
# Di .env untuk load test
NODE_ENV=production  # Disable SQL logging
LOG_LEVEL=error      # Only log errors
```

#### **3. Optimize Queries**

```sql
-- Add indexes jika belum ada
CREATE INDEX idx_products_active ON products(is_active, product_type);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(selling_price);
```

#### **4. Connection Pool Tuning**

Untuk load test dengan X VUs:

```javascript
// Rule of thumb: pool.max = VUs × 2-3
VUs = 10  → pool.max = 30
VUs = 50  → pool.max = 100-150
VUs = 100 → pool.max = 200-300
```

---

## 🔧 **3. TROUBLESHOOTING GUIDE**

### **Issue 1: 86% Request Failures**

**Symptoms:**

- Login works (100%)
- Product list fails (0%)
- High error rate on public endpoints

**Diagnosis:**

1. Check backend logs:

```bash
cd backend
npm run dev
# Look for: "getAllProducts ERROR", "Connection timeout", "ECONNREFUSED"
```

2. Check pool stats during test:

```bash
# In another terminal
curl http://localhost:5000/api/pool-stats
```

**Possible Causes:**

| Cause                     | Fix                                         |
| ------------------------- | ------------------------------------------- |
| Connection pool exhausted | Increase `pool.max` to 150                  |
| Slow queries (>1 second)  | Add indexes, optimize queries               |
| Connection leaks          | Check `pool.available` never decreases to 0 |
| Cache not working         | Verify cache service initialized            |
| MySQL max_connections hit | Increase MySQL `max_connections = 300`      |

### **Issue 2: "ETIMEDOUT" or "ECONNREFUSED"**

**Symptoms:**

```
error: "dial: connection refused"
error_code: "1212"
```

**Diagnosis:**

1. Backend crashed → Check backend terminal
2. MySQL down → Check MySQL service
3. Port conflict → Another app using port 5000

**Fix:**

```bash
# Restart backend
cd backend
npm run dev

# Check MySQL
mysql -u root -p
```

### **Issue 3: High Response Time (>2 seconds)**

**Symptoms:**

- `p(95) > 2000ms`
- Many "SLOW QUERY" warnings

**Diagnosis:**

Check slow query log:

```javascript
// Enable in database.js temporarily
logging: (sql, timing) => {
  if (timing > 1000) {
    console.log(`🐌 SLOW: ${timing}ms - ${sql.substring(0, 100)}`);
  }
};
```

**Fix:**

1. Add missing indexes
2. Reduce JOIN depth
3. Use pagination (limit queries to 12-50 items)
4. Implement query result caching

### **Issue 4: Memory Leaks**

**Symptoms:**

- Memory usage increases over time
- Backend crashes after 10-15 minutes

**Diagnosis:**

Check Node.js memory:

```bash
# In backend terminal, you'll see
Heap: 1524MB / 2048MB (75%)  # Dangerous!
```

**Fix:**

1. Check for connection leaks:

```javascript
// Add in controller after query
finally {
  // Sequelize auto-releases, but double-check
  console.log('Pool stats:', getPoolStats());
}
```

2. Clear large objects:

```javascript
// After response sent
res.json(data);
data = null; // Help GC
```

---

## 📊 **4. MONITORING TOOLS**

### **Real-Time Monitoring**

#### **1. Pool Stats API**

```bash
# Check during test
watch -n 2 'curl -s http://localhost:5000/api/pool-stats | jq'

# Expected output:
{
  "pool": {
    "total": 45,
    "available": 38,
    "borrowed": 7,
    "max": 100
  },
  "utilization": "7.00%",
  "status": "✅ LOW - Pool healthy"
}
```

#### **2. MySQL Monitoring**

```sql
-- In MySQL shell, run periodically
SELECT
  id, user, db, command, time, state, info
FROM information_schema.processlist
WHERE command != 'Sleep'
ORDER BY time DESC;
```

#### **3. K6 Real-Time Output**

```bash
# K6 shows live stats every 10 seconds
http_req_duration.............: avg=69ms   p(95)=302ms
http_req_failed................: 13.54%    # Monitor this!
http_reqs......................: 17329     28.7/s
```

### **Post-Test Analysis**

#### **1. Check Test Results JSON**

```bash
cd k6-load-testing/results
cat baseline-short.json | jq '.metrics.http_req_failed'
```

#### **2. Backend Logs Analysis**

```bash
# Count errors
grep "ERROR" backend-log.txt | wc -l

# Find slow queries
grep "SLOW QUERY" backend-log.txt | sort -rn
```

---

## 🧪 **5. RECOMMENDED TEST SCENARIOS**

### **Step-by-Step Testing Plan**

#### **Phase 1: Debug & Validation (Start Here)**

```bash
# Test 1: Debug with 10 VUs (5 min)
k6 run scenarios/00-debug-test.js

# Expected: <5% error rate
# If fails: Check backend logs, fix issues, retry
```

#### **Phase 2: Smoke Test**

```bash
# Test 2: Smoke test (1 VU, 2 min)
k6 run scenarios/01-smoke-test-SHORT.js

# Expected: 0% error rate
# Purpose: Validate all endpoints work
```

#### **Phase 3: Baseline Load**

```bash
# Test 3: Baseline with 50 VUs (10 min)
k6 run scenarios/02-baseline-load-SHORT.js

# Expected: <1% error rate
# Purpose: Measure normal load performance
```

#### **Phase 4: Peak Load**

```bash
# Test 4: Peak with 100 VUs (15 min)
k6 run scenarios/03-peak-load-SHORT.js

# Expected: <5% error rate
# Purpose: Measure performance at peak hours
```

#### **Phase 5: Stress Test**

```bash
# Test 5: Stress with 200 VUs (20 min)
k6 run scenarios/04-stress-test-SHORT.js

# Expected: May fail - that's OK!
# Purpose: Find breaking point
```

### **Test Success Criteria**

| Metric            | Target    | Critical |
| ----------------- | --------- | -------- |
| Error rate        | <1%       | <5%      |
| P95 response time | <1000ms   | <2000ms  |
| P99 response time | <2000ms   | <5000ms  |
| Requests/sec      | >10 req/s | >5 req/s |
| Pool utilization  | <70%      | <90%     |

### **When to Scale Up**

Scale backend/database jika:

1. ✅ Error rate <1% di baseline test
2. ✅ P95 response time <1000ms
3. ✅ Pool utilization <70%
4. ✅ Semua smoke test pass

→ **THEN** increase VUs to 100 (peak test)

---

## 🎓 **QUICK REFERENCE**

### **Common Commands**

```bash
# Start backend with monitoring
cd backend && npm run dev

# Run debug test (10 VUs)
cd k6-load-testing
.\bin\k6-v0.48.0-windows-amd64\k6.exe run scenarios/00-debug-test.js

# Check pool stats
curl http://localhost:5000/api/pool-stats

# Check cache stats
curl http://localhost:5000/api/cache/stats

# Stop all node processes (if backend stuck)
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

### **Environment Variables for Load Test**

```env
# .env optimal settings for load testing
NODE_ENV=development
DISABLE_RATE_LIMIT=true
LOG_LEVEL=warn  # Only warn/error logs
DB_POOL_MAX=150  # Increase if needed
```

### **MySQL Optimization**

```sql
-- Check current settings
SHOW VARIABLES LIKE 'max_connections';
SHOW VARIABLES LIKE 'wait_timeout';

-- Increase if needed (requires MySQL restart)
SET GLOBAL max_connections = 300;
SET GLOBAL wait_timeout = 28800;
```

---

## 📝 **KESIMPULAN**

### **Untuk Test BaleTani Saat Ini:**

1. ✅ **Pool sudah optimal**: max: 100, min: 20
2. ✅ **Rate limiting disabled**: `DISABLE_RATE_LIMIT=true`
3. ⚠️ **Perlu isolasi masalah**: Run `00-debug-test.js` dengan 10 VUs
4. ⚠️ **Perlu monitoring**: Check `/api/pool-stats` saat test
5. ⚠️ **Perlu logging**: Backend logs akan show root cause

### **Next Steps:**

```bash
# 1. Restart backend untuk load logging updates
cd backend
npm run dev

# 2. Run debug test (10 VUs only)
cd k6-load-testing
.\bin\k6-v0.48.0-windows-amd64\k6.exe run scenarios/00-debug-test.js

# 3. Monitor pool stats (open new terminal)
while($true) { curl http://localhost:5000/api/pool-stats; Start-Sleep 5 }

# 4. Analyze results & backend logs
```

---

**Dibuat untuk**: Skripsi/Jurnal BaleTani E-Commerce  
**Tanggal**: 24 Desember 2025  
**Author**: Bagas Load Testing Team
