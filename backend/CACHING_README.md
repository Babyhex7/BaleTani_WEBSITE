# 🚀 Backend Caching Implementation - BaleTani Fresh Market

## 📌 Overview

Backend caching telah diimplementasikan menggunakan **node-cache** untuk meningkatkan performa aplikasi dan mengurangi beban database.

### Mengapa Pakai node-cache?

- ✅ **Gratis 100%** (MIT License)
- ✅ **Mudah setup** (tidak perlu Redis server)
- ✅ **Auto TTL** (cache expired otomatis)
- ✅ **In-memory** (sangat cepat, ~2-5ms)
- ✅ **Production-ready** untuk small-medium apps

---

## 📁 Struktur Folder

```
backend/src/cache/
├── nodeCacheClient.js    # Setup node-cache instance
├── cacheKeys.js          # Konstanta cache keys (customer & admin)
└── cacheService.js       # Helper functions (get, set, del, flush)
```

---

## 🔑 Cache Keys Structure

### Customer Cache Keys:

```javascript
customer:products:all:page:1              // All products page 1
customer:products:category:123:page:1     // Products by category
customer:product:456                      // Single product detail
customer:categories:list                  // All categories
customer:category:789                     // Single category detail
```

### Admin Cache Keys:

```javascript
admin:products:page:1                     // Admin products page 1
admin:products:category:123:page:1        // Admin products by category
admin:product:456                         // Admin product detail
admin:categories:list                     // Admin categories list
admin:permissions:user-uuid-123           // User permissions (untuk RBAC)
admin:dashboard:stats                     // Dashboard statistics
```

---

## ⏱️ Cache TTL (Time To Live)

| Data                | TTL                   | Alasan                         |
| ------------------- | --------------------- | ------------------------------ |
| **Products List**   | 600 detik (10 menit)  | Browsing sering, update jarang |
| **Product Detail**  | 900 detik (15 menit)  | Detail lebih stabil            |
| **Categories**      | 3600 detik (1 jam)    | Jarang berubah                 |
| **Permissions**     | 1800 detik (30 menit) | RBAC jarang berubah            |
| **Dashboard Stats** | 60 detik (1 menit)    | Perlu fresh data               |

---

## 🔄 Cara Kerja Cache

### 1. Request Pertama (Cache MISS)

```
Customer request /api/public/products
  ↓
Controller: Check cache → MISS (data tidak ada)
  ↓
Query database (50-100ms)
  ↓
Save to cache (TTL: 10 menit)
  ↓
Return response ke customer
```

### 2. Request Kedua (Cache HIT)

```
Customer request /api/public/products
  ↓
Controller: Check cache → HIT (data ada!)
  ↓
Return dari cache (2-5ms) ← 10-20x LEBIH CEPAT!
  ↓
Skip query database
```

### 3. Admin Update Product (Cache Invalidation)

```
Admin update product
  ↓
Controller: Update database
  ↓
Cache invalidation:
  - Delete customer:products:*
  - Delete admin:products:*
  - Delete categories cache (product_count berubah)
  ↓
Next customer request → Cache MISS → Fresh data
```

---

## 📝 File-File yang Di-Update

### ✅ Customer Side (dengan cache GET):

- `backend/src/controllers/publicProduct.controller.js`

  - `getAllProducts()` → Cache 10 menit
  - `getProductDetail()` → Cache 15 menit
  - `getFeaturedProducts()` → Cache 15 menit (NEW!)

- `backend/src/controllers/publicCategory.controller.js`

  - `getAllCategories()` → Cache 1 jam

- `backend/src/controllers/publicDiscount.controller.js` **(NEW!)**
  - `getAllDiscounts()` → Cache 30 menit
  - `getDiscountById()` → Cache 30 menit
  - `getDiscountProducts()` → Cache 30 menit

### ✅ Admin Side (dengan cache invalidation):

- `backend/src/controllers/adminProduct.controller.js`

  - `create()` → Clear products, categories & featured cache
  - `update()` → Clear products, categories & featured cache
  - `deleteProduct()` → Clear products, categories & featured cache

- `backend/src/controllers/adminCategory.controller.js`

  - `createCategory()` → Clear all categories cache
  - `updateCategory()` → Clear categories & products cache
  - `deleteCategory()` → Clear all categories cache

- `backend/src/controllers/adminDiscount.controller.js` **(NEW!)**
  - `createDiscount()` → Clear featured, products & discounts cache
  - `updateDiscount()` → Clear featured, products & discounts cache
  - `deleteDiscount()` → Clear featured, products & discounts cache
  - `toggleDiscountStatus()` → Clear featured, products & discounts cache

---

## 🧪 Testing Cache

### 1. Test Cache Hit/Miss

```bash
# Request pertama (Cache MISS)
curl http://localhost:5000/api/public/products

# Check console log:
[CACHE MISS] ❌ Key: customer:products:all:page:1 - Data tidak ada di cache
[DB QUERY] Products - Cache miss, querying database...
[CACHE SET] ✅ Key: customer:products:all:page:1 - TTL: 600s (10 menit)

# Request kedua (Cache HIT)
curl http://localhost:5000/api/public/products

# Check console log:
[CACHE HIT] ✅ Key: customer:products:all:page:1 - Data ditemukan di cache

# Response akan include flag "cached: true"
```

### 2. Test Cache Invalidation

```bash
# Step 1: Request products (cache akan dibuat)
curl http://localhost:5000/api/public/products

# Step 2: Admin update product
curl -X PUT http://localhost:5000/api/admin/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Updated Product"}'

# Check console log:
[CACHE INVALIDATION] Product updated (ID: 1) - Clearing cache
[CACHE DELETE PATTERN] ✅ Pattern: customer:products: - X cache dihapus

# Step 3: Request products lagi (cache MISS, data fresh)
curl http://localhost:5000/api/public/products
```

### 3. Test Cache Statistics

```javascript
// Di controller atau route khusus untuk monitoring
const cacheService = require('./src/cache/cacheService');

// Endpoint untuk check cache stats
app.get('/api/admin/cache/stats', (req, res) => {
  const stats = cacheService.getStats();
  res.json({
    success: true,
    data: {
      totalKeys: stats.keys,
      cacheHits: stats.hits,
      cacheMisses: stats.misses,
      hitRatio: ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + '%',
    },
  });
});

// Response:
{
  "success": true,
  "data": {
    "totalKeys": 25,
    "cacheHits": 450,
    "cacheMisses": 50,
    "hitRatio": "90.00%"
  }
}
```

---

## 📊 Performance Improvement

### Before Cache:

```
GET /api/public/products
  └─ Query database: 80ms
  └─ Total: 100ms

100 concurrent requests:
  └─ 100 database queries
  └─ Database overload ⚠️
```

### After Cache:

```
GET /api/public/products (first request)
  └─ Query database: 80ms
  └─ Save to cache
  └─ Total: 100ms

GET /api/public/products (subsequent requests)
  └─ Load from cache: 2ms ← 40x FASTER! 🚀
  └─ Total: 5ms

100 concurrent requests:
  └─ 1 database query (cache miss)
  └─ 99 cache hits
  └─ Database happy 😊
```

---

## 🛠️ Cache Management Functions

### Get Data dari Cache

```javascript
const cacheService = require("./cache/cacheService");
const { CUSTOMER } = require("./cache/cacheKeys");

// Get products list
const cacheKey = CUSTOMER.PRODUCTS_LIST("all", 1);
const cachedData = cacheService.get(cacheKey);

if (cachedData) {
  // Cache hit - return langsung
  return res.json({ data: cachedData, cached: true });
}

// Cache miss - query database
const products = await Product.findAll();
```

### Save Data ke Cache

```javascript
// Save dengan TTL default (600 detik)
cacheService.set(cacheKey, products);

// Save dengan custom TTL (1 jam)
cacheService.set(cacheKey, categories, 3600);
```

### Delete Cache (Invalidation)

```javascript
const { PATTERNS } = require("./cache/cacheKeys");

// Delete 1 cache
cacheService.del("customer:product:123");

// Delete banyak cache dengan pattern
cacheService.delPattern(PATTERNS.CUSTOMER_PRODUCTS);
// Akan hapus semua cache yang mulai dengan "customer:products:"
```

### Flush All Cache (Emergency)

```javascript
// HATI-HATI! Hapus SEMUA cache
cacheService.flush();
```

---

## 🚨 Troubleshooting

### Cache tidak terhapus setelah admin update product

**Problem:** Customer masih lihat data lama

**Solusi:**

1. Check console log saat admin update:
   ```
   [CACHE INVALIDATION] Product updated (ID: 1) - Clearing cache
   ```
2. Pastikan pattern key match:

   ```javascript
   // BENAR
   cacheService.delPattern("customer:products:");

   // SALAH (missing colon)
   cacheService.delPattern("customer:products");
   ```

### Cache memory terlalu besar

**Problem:** Server RAM penuh

**Solusi:**

1. Reduce TTL (cache expired lebih cepat)
2. Limit cache hanya untuk data yang sering diakses
3. Clear cache periodik dengan cron job

### Cache tidak konsisten antar server

**Problem:** Load balancer dengan multiple backend instance

**Solusi:**
Upgrade ke **Redis** (external cache server yang bisa di-share antar instance)

---

## 🔮 Future Improvements

### 1. Upgrade ke Redis (untuk scaling)

```bash
# Install Redis
npm install ioredis

# Update cache client
// Ganti nodeCacheClient.js dengan redisClient.js
// Semua function lain tetap sama (karena modular)
```

### 2. Add Cache Warming (Preload)

```javascript
// Saat server start, load cache untuk data populer
async function warmupCache() {
  const products = await Product.findAll();
  cacheService.set(CUSTOMER.PRODUCTS_LIST("all", 1), products, 3600);
  console.log("[CACHE WARMUP] Products cache ready");
}

// Di server.js
app.listen(PORT, async () => {
  await warmupCache();
  console.log(`Server running on port ${PORT}`);
});
```

### 3. Add Cache Monitoring Dashboard

```javascript
// Endpoint untuk admin monitoring cache
app.get("/api/admin/cache/stats", (req, res) => {
  const stats = cacheService.getStats();
  res.json({
    totalKeys: stats.keys,
    hitRatio:
      ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + "%",
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 + " MB",
  });
});
```

---

## ✅ Checklist Implementation

- [x] Install node-cache package
- [x] Create cache folder & files
- [x] Implement cache in publicProduct controller
- [x] Implement cache in publicCategory controller
- [x] Implement cache invalidation in adminProduct controller
- [x] Implement cache invalidation in adminCategory controller
- [x] Test cache hit/miss
- [x] Test cache invalidation
- [ ] Monitor cache statistics (TODO: future)
- [ ] Setup cache warmup (TODO: future)
- [ ] Add cache dashboard (TODO: future)

---

## 📞 Support

Jika ada masalah atau pertanyaan tentang caching:

1. Check console log untuk `[CACHE]` messages
2. Test dengan flag `cached: true/false` di response
3. Monitor cache stats dengan `cacheService.getStats()`

---

**Happy Caching! 🚀**
