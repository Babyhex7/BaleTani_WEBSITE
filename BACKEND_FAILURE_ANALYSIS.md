# 🔥 ANALISIS MENDALAM: Backend "Mati" Tapi Sebenarnya Masih Jalan

## 📊 **DIAGNOSIS: Kemungkinan Penyebab Utama**

Berdasarkan analisis kode dan konfigurasi, ada **7 kemungkinan utama** kenapa frontend tiba-tiba gagal ambil data padahal backend masih jalan:

---

## 🎯 **PENYEBAB #1: RATE LIMITER TERLALU KETAT** ⚠️ **SANGAT MUNGKIN**

### **Masalah:**

```javascript
// app.js - Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // ❌ HANYA 100 request per 15 menit per IP
});
app.use(limiter); // ❌ DITERAPKAN KE SEMUA ROUTE!
```

### **Skenario:**

1. User buka website → Load banyak endpoint sekaligus:

   - `/api/public/products` (1 request)
   - `/api/public/categories` (1 request)
   - `/api/public/discounts` (1 request)
   - Product images (10+ requests)
   - **Total: ~13 requests dalam 1 detik**

2. User browsing 5 menit:

   - Buka home → 13 requests
   - Buka products → 15 requests
   - Buka cart → 5 requests
   - Buka checkout → 8 requests
   - **Total: ~50 requests dalam 5 menit**

3. User refresh 2-3 kali → **100 requests tercapai** ❌

4. **RATE LIMIT TERCAPAI** → Semua request ditolak selama 15 menit!

### **Gejala:**

```
✅ Backend masih jalan (port 5000 aktif)
❌ Frontend error: "Too many requests from this IP"
❌ User lihat: "Gagal memuat data"
⏰ Setelah 15 menit → Normal lagi
```

### **Evidence dari Code:**

```javascript
// Response rate limit
message: {
  success: false,
  message: "Too many requests from this IP, please try again later.",
}
```

### **Solusi:**

```javascript
// ✅ NAIKKAN LIMIT atau HAPUS global limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Naik dari 100 ke 500 requests

  // ✅ Skip static files (images, uploads)
  skip: (req) => {
    return req.url.startsWith("/uploads/");
  },
});
```

---

## 🎯 **PENYEBAB #2: CONNECTION POOL EXHAUSTED** ⚠️ **SANGAT MUNGKIN**

### **Masalah:**

```javascript
// database.js - Pool config sekarang
pool: {
  max: 50,        // ✅ Sudah bagus
  min: 10,        // ✅ Sudah bagus
  acquire: 60000, // 60 detik timeout
  idle: 20000,    // 20 detik idle
}
```

### **Tapi Ada Masalah:**

```javascript
// ❌ TIDAK ADA ERROR HANDLING jika pool full
// ❌ TIDAK ADA QUEUE MANAGEMENT
// ❌ TIDAK ADA MONITORING realtime
```

### **Skenario:**

1. 20 user akses bersamaan
2. Setiap user: 5 requests simultan (products, cart, profile, categories, discounts)
3. Total: **100 concurrent requests**
4. Pool hanya: **50 connections**
5. **50 requests harus WAIT 60 detik** ⏳
6. Jika query lambat (>3 detik) → **Timeout cascade**

### **Gejala:**

```
❌ Error: "Connection acquisition timeout"
❌ Frontend: Network Error / Timeout
⏰ Backend log: No error (karena timeout, bukan crash)
```

### **Solusi:**

```javascript
pool: {
  max: 100,       // ✅ Naik ke 100
  min: 20,        // ✅ Naik ke 20
  acquire: 120000, // ✅ 2 menit timeout (naik dari 1 menit)
  idle: 30000,    // ✅ 30 detik idle

  // ✅ TAMBAH error handler
  handleDisconnects: true,

  // ✅ TAMBAH queue limit
  maxIdleTime: 30000,
  evictionRunIntervalMillis: 10000,
}
```

---

## 🎯 **PENYEBAB #3: CORS PREFLIGHT CACHE EXPIRED** ⚠️ **MUNGKIN**

### **Masalah:**

```javascript
// app.js - CORS config
corsOptions = {
  maxAge: 86400, // 24 jam cache untuk preflight
};
```

### **Skenario:**

1. User buka website pertama kali → CORS preflight (`OPTIONS`) success
2. Browser cache preflight untuk 24 jam
3. **Setelah 24 jam** → Cache expired
4. Browser kirim preflight lagi → **Jika backend lambat respond** → Frontend timeout
5. Main request tidak pernah terkirim

### **Gejala:**

```
Network Tab:
❌ OPTIONS /api/products (pending... timeout)
❌ GET /api/products (cancelled - karena preflight timeout)
```

### **Solusi:**

```javascript
// ✅ Enable preflight continue
corsOptions = {
  preflightContinue: false, // Sudah benar
  maxAge: 86400,

  // ✅ TAMBAH: Auto-handle preflight
  optionsSuccessStatus: 204, // Ganti dari 200 ke 204 (No Content)
};

// ✅ ATAU: Handle preflight secara manual
app.options("*", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
  });
  res.status(204).send();
});
```

---

## 🎯 **PENYEBAB #4: FRONTEND TIMEOUT TERLALU PENDEK** ⚠️ **MUNGKIN**

### **Masalah:**

```javascript
// apiClient.js - Axios config
const apiClient = axios.create({
  timeout: 15000, // ❌ Hanya 15 detik
});
```

### **Skenario:**

1. User request `/api/products` dengan banyak data
2. Backend processing: 5 detik
3. Database query: 8 detik (karena banyak JOIN, images, discounts)
4. Total: **13 detik**
5. **Masih di bawah 15 detik** → Success

**TAPI:** 6. Jika ada 1 query lambat (15+ detik) → **Frontend timeout** 7. Backend masih jalan → **User lihat error**

### **Gejala:**

```javascript
Error: timeout of 15000ms exceeded
```

### **Solusi:**

```javascript
// ✅ Naikan timeout untuk endpoint berat
const apiClient = axios.create({
  timeout: 30000, // 30 detik (naik dari 15)

  // ✅ ATAU: Custom timeout per endpoint
  timeout: (config) => {
    if (config.url.includes("/products")) return 30000;
    if (config.url.includes("/orders")) return 45000;
    return 15000;
  },
});
```

---

## 🎯 **PENYEBAB #5: MYSQL CONNECTION TIMEOUT** ⚠️ **MUNGKIN**

### **Masalah:**

```javascript
// database.js
dialectOptions: {
  connectTimeout: 60000, // 60 detik
}
```

### **Tapi MySQL Default:**

```sql
-- MySQL default settings
wait_timeout = 28800  -- 8 jam
interactive_timeout = 28800  -- 8 jam

-- ❌ Connection idle > 8 jam → MySQL kill connection
-- ❌ Sequelize tidak tahu → Pakai connection mati
-- ❌ Error: "Connection lost" atau "Protocol error"
```

### **Skenario:**

1. Pool buat 50 connections
2. Traffic rendah malam hari → Connections idle 9 jam
3. MySQL kill idle connections
4. **Sequelize masih simpan reference** (tidak tahu sudah disconnect)
5. User akses pagi → **Pakai connection mati** → Error

### **Gejala:**

```
❌ Error: Connection lost: The server closed the connection
❌ Error: Connection timeout
⏰ Terjadi setelah periode idle panjang (malam hari)
```

### **Solusi:**

```javascript
pool: {
  // ... existing config
  handleDisconnects: true, // ✅ Sudah ada

  // ✅ TAMBAH: Test connection sebelum pakai
  validate: (connection) => {
    return connection &&
           connection.state !== 'disconnected' &&
           connection.threadId !== undefined; // ✅ Check MySQL thread
  },
},

// ✅ TAMBAH: Ping connection secara berkala
dialectOptions: {
  connectTimeout: 60000,

  // ✅ Keep connection alive
  keepAlive: true,
  keepAliveInitialDelay: 10000, // 10 detik
},
```

---

## 🎯 **PENYEBAB #6: MEMORY LEAK / HIGH MEMORY** ⚠️ **JARANG**

### **Masalah:**

- Backend memory usage naik terus
- Garbage collector tidak sempat cleanup
- Process hang atau slow

### **Skenario:**

```javascript
// ❌ Potential memory leaks:

// 1. Cache tidak pernah di-clear
const cache = new Map();
// Jika tidak ada eviction → Infinite growth

// 2. Event listeners tidak di-remove
app.on("request", handler);
// Jika listener banyak → Memory leak

// 3. Database connections tidak di-release
// Jika error handling buruk → Connections tidak kembali ke pool
```

### **Gejala:**

```bash
# Backend masih jalan tapi SANGAT lambat
# Memory usage: 2GB+ (seharusnya < 500MB)
# CPU: 100% (garbage collection terus-menerus)
```

### **Solusi:**

```javascript
// ✅ Monitor memory
setInterval(() => {
  const used = process.memoryUsage();
  console.log(`📊 Memory: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);

  if (used.heapUsed > 1024 * 1024 * 1024) {
    // > 1GB
    console.warn("⚠️ High memory usage detected!");
  }
}, 5 * 60 * 1000); // Every 5 minutes
```

---

## 🎯 **PENYEBAB #7: NODEJS EVENT LOOP BLOCKED** ⚠️ **JARANG**

### **Masalah:**

```javascript
// ❌ Synchronous blocking operations
const data = fs.readFileSync("huge-file.json"); // Blocking
const sorted = hugeArray.sort(); // Blocking jika array besar

// Event loop blocked → Tidak bisa handle request baru
```

### **Skenario:**

1. Ada 1 request dengan operasi berat (sort 100k items)
2. Event loop busy → **Tidak bisa handle request lain**
3. User lain request → **Hang/timeout**
4. Operasi selesai → Normal kembali

### **Gejala:**

```
✅ Backend process jalan
❌ Tidak respond HTTP requests
⏰ Setelah operasi selesai → Normal
```

### **Solusi:**

```javascript
// ✅ Gunakan async operations
const data = await fs.promises.readFile("file.json");

// ✅ Offload ke worker threads
const { Worker } = require("worker_threads");
const worker = new Worker("./heavy-task.js");
```

---

## 🔍 **CARA DIAGNOSA: Step-by-Step**

### **1. Cek Rate Limiter** (Kemungkinan tertinggi)

```bash
# Buka browser console saat error terjadi:
# Network Tab → Response Headers:

X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0     # ❌ Sudah habis
X-RateLimit-Reset: 1234567890

# Response Body:
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

**Jika ini masalahnya:**

- ✅ Response header ada `X-RateLimit-*`
- ✅ Response body: "Too many requests"
- ✅ Setelah 15 menit normal lagi

---

### **2. Cek Connection Pool** (Kemungkinan tinggi)

```bash
# Backend terminal saat error terjadi:
# Seharusnya ada log:

📊 [DB POOL] Total: 50, Available: 0, In Use: 50/50
# ❌ Pool full!

# Error log:
SequelizeConnectionAcquireTimeoutError: Operation timeout
```

**Jika ini masalahnya:**

- ✅ Pool stats: Available = 0
- ✅ Error: "Connection acquisition timeout"
- ✅ Setelah beberapa detik normal (connections released)

---

### **3. Cek CORS Preflight**

```bash
# Network Tab:
OPTIONS /api/products   Status: (pending...)
GET /api/products       Status: (cancelled)

# Atau:
OPTIONS /api/products   Status: 404
GET /api/products       Status: (failed) - CORS error
```

**Jika ini masalahnya:**

- ✅ Preflight OPTIONS request timeout/failed
- ✅ Main request cancelled atau CORS error
- ✅ Console error: "CORS policy blocked"

---

### **4. Cek Timeout**

```bash
# Browser console:
Error: timeout of 15000ms exceeded
    at createError (axios.js:123)

# Backend log: TIDAK ADA ERROR
# (Karena request timeout di frontend sebelum backend selesai)
```

**Jika ini masalahnya:**

- ✅ Frontend error: "timeout exceeded"
- ✅ Backend log: Request masih processing
- ✅ Tidak ada error di backend

---

### **5. Cek MySQL Connection**

```bash
# Backend log:
Error: Connection lost: The server closed the connection
SequelizeConnectionError: Connection timeout

# Atau:
Error: read ECONNRESET
```

**Jika ini masalahnya:**

- ✅ Error message: "Connection lost"
- ✅ Terjadi setelah idle lama (pagi hari)
- ✅ Restart backend → Normal lagi

---

## 🛠️ **SOLUSI RECOMMENDED (PRIORITAS)**

### **Priority 1: Fix Rate Limiter** ⚡ **WAJIB**

```javascript
// app.js - Naikan limit atau hapus global limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Naik dari 100 ke 500
  skip: (req) => req.url.startsWith("/uploads/"),

  // ✅ Handler untuk rate limit
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit exceeded: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Terlalu banyak request. Silakan tunggu beberapa saat.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});
```

### **Priority 2: Fix Connection Pool** ⚡ **WAJIB**

```javascript
// database.js
pool: {
  max: 100,       // Naik ke 100
  min: 20,        // Naik ke 20
  acquire: 120000, // 2 menit
  idle: 30000,    // 30 detik
  evict: 10000,
  handleDisconnects: true,

  // ✅ Test connection before use
  validate: (connection) => {
    try {
      return connection &&
             connection.state !== 'disconnected' &&
             connection.threadId !== undefined;
    } catch (e) {
      return false;
    }
  },
},

dialectOptions: {
  connectTimeout: 60000,
  keepAlive: true,
  keepAliveInitialDelay: 10000,
},
```

### **Priority 3: Naikan Frontend Timeout** ⚡ **RECOMMENDED**

```javascript
// apiClient.js
const apiClient = axios.create({
  timeout: 30000, // 30 detik (naik dari 15)

  // ✅ Retry logic untuk network error
  retry: 3,
  retryDelay: 1000,
});
```

### **Priority 4: Monitoring** 📊 **RECOMMENDED**

```javascript
// server.js - Tambah monitoring
setInterval(() => {
  const pool = sequelize.connectionManager.pool;
  const memory = process.memoryUsage();

  console.log(`
📊 Server Stats:
   Memory: ${Math.round(memory.heapUsed / 1024 / 1024)}MB
   Pool: ${pool._availableObjects?.length || 0}/${
    pool._allObjects?.length || 0
  } available
  `);
}, 5 * 60 * 1000); // Every 5 minutes
```

---

## ✅ **KESIMPULAN & ACTION PLAN**

### **Kemungkinan Tertinggi (90%):**

1. ⚠️ **Rate Limiter terlalu ketat** (100 req/15min)
2. ⚠️ **Connection Pool exhausted** (50 connections)

### **Kemungkinan Sedang (10%):**

3. ⚠️ CORS preflight timeout
4. ⚠️ Frontend timeout 15 detik
5. ⚠️ MySQL connection timeout

### **Kemungkinan Rendah (<1%):**

6. ⚠️ Memory leak
7. ⚠️ Event loop blocked

### **Quick Fix (5 menit):**

```javascript
// 1. Hapus atau naikan global rate limiter
// app.js line 26-32
// max: 100 → max: 500

// 2. Naikan connection pool
// database.js line 35-42
// max: 50 → max: 100

// 3. Restart backend
npm run dev
```

### **Testing:**

```bash
# 1. Buka 10 tabs website
# 2. Refresh semua tabs bersamaan (Ctrl+Shift+R)
# 3. Cek Network tab → Semua request success
# 4. Cek backend log → Tidak ada error
```

---

**Last Updated:** 2025-11-30  
**Priority:** 🔴 CRITICAL - FIX IMMEDIATELY
