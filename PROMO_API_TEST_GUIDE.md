# 🎁 Public Discount/Promo API - Quick Test Guide

## 📌 Overview

Public Discount API memungkinkan customer melihat promo aktif tanpa authentication.

**Base URL:** `http://localhost:5000/api/public/discounts`

---

## 🚀 API Endpoints

### 1️⃣ Get All Active Discounts

**Endpoint:** `GET /api/public/discounts`

**Description:** Mendapatkan semua promo/discount yang aktif

**Cache:** 30 menit (1800 detik)

**Request Example:**

```bash
# Browser
http://localhost:5000/api/public/discounts

# cURL
curl http://localhost:5000/api/public/discounts

# JavaScript (Fetch)
fetch('http://localhost:5000/api/public/discounts')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Response Example:**

```json
{
  "success": true,
  "message": "Active discounts fetched successfully",
  "cached": false,
  "data": [
    {
      "id": 1,
      "name": "Flash Sale Sayuran Segar",
      "type": "percentage",
      "value": 20,
      "maxDiscount": 50000,
      "startDate": "2025-11-01T00:00:00.000Z",
      "endDate": "2025-11-30T23:59:59.000Z",
      "productsCount": 15,
      "description": "Diskon 20% untuk semua sayuran segar"
    },
    {
      "id": 2,
      "name": "Potongan Rp 10.000",
      "type": "fixed_amount",
      "value": 10000,
      "maxDiscount": null,
      "startDate": "2025-11-01T00:00:00.000Z",
      "endDate": "2025-11-15T23:59:59.000Z",
      "productsCount": 8,
      "description": "Potongan langsung Rp 10.000"
    }
  ]
}
```

---

### 2️⃣ Get Discount Detail

**Endpoint:** `GET /api/public/discounts/:id`

**Description:** Mendapatkan detail promo termasuk produk yang eligible

**Cache:** 30 menit (1800 detik)

**Request Example:**

```bash
# Browser
http://localhost:5000/api/public/discounts/1

# cURL
curl http://localhost:5000/api/public/discounts/1

# JavaScript (Fetch)
fetch('http://localhost:5000/api/public/discounts/1')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Response Example:**

```json
{
  "success": true,
  "message": "Discount detail fetched successfully",
  "cached": false,
  "data": {
    "id": 1,
    "name": "Flash Sale Sayuran Segar",
    "type": "percentage",
    "value": 20,
    "maxDiscount": 50000,
    "startDate": "2025-11-01T00:00:00.000Z",
    "endDate": "2025-11-30T23:59:59.000Z",
    "description": "Diskon 20% untuk semua sayuran segar",
    "productsCount": 15,
    "products": [
      {
        "id": 5,
        "name": "Bayam Segar",
        "price": 8000,
        "originalPrice": 8000,
        "discountedPrice": 6400,
        "stock": 50,
        "category": "Sayuran",
        "image": "/uploads/products/bayam.jpg"
      },
      {
        "id": 7,
        "name": "Kangkung Organik",
        "price": 5000,
        "originalPrice": 5000,
        "discountedPrice": 4000,
        "stock": 100,
        "category": "Sayuran",
        "image": "/uploads/products/kangkung.jpg"
      }
    ]
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Discount not found or not active"
}
```

---

### 3️⃣ Get Products by Discount (Paginated)

**Endpoint:** `GET /api/public/discounts/:id/products`

**Description:** Mendapatkan produk dalam promo tertentu dengan pagination

**Cache:** 30 menit (1800 detik)

**Query Parameters:**

- `page` (optional, default: 1) - Halaman ke berapa
- `limit` (optional, default: 12) - Jumlah item per halaman

**Request Example:**

```bash
# Browser
http://localhost:5000/api/public/discounts/1/products?page=1&limit=12

# cURL
curl "http://localhost:5000/api/public/discounts/1/products?page=1&limit=12"

# JavaScript (Fetch)
fetch('http://localhost:5000/api/public/discounts/1/products?page=1&limit=12')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Response Example:**

```json
{
  "success": true,
  "message": "Discount products fetched successfully",
  "cached": false,
  "data": {
    "products": [
      {
        "id": 5,
        "name": "Bayam Segar",
        "description": "Bayam segar organik dari petani lokal",
        "price": 8000,
        "originalPrice": 8000,
        "discountedPrice": 6400,
        "stock": 50,
        "category": "Sayuran",
        "image": "/uploads/products/bayam.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "discount": {
      "id": 1,
      "name": "Flash Sale Sayuran Segar",
      "type": "percentage",
      "value": 20
    }
  }
}
```

---

## 🧪 Testing Cache Behavior

### Test 1: Cache MISS → Cache HIT

```bash
# Request pertama (Cache MISS - dari database)
curl http://localhost:5000/api/public/discounts

# Check console backend:
[DB QUERY] Discounts - Cache miss, querying database...
[CACHE SET] ✅ Key: customer:discounts:list - TTL: 1800s (30 menit)

# Response: "cached": false

# Request kedua dalam 30 menit (Cache HIT - dari cache)
curl http://localhost:5000/api/public/discounts

# Check console backend:
[CACHE HIT] ✅ Key: customer:discounts:list - Data ditemukan di cache

# Response: "cached": true ← 10-20x LEBIH CEPAT!
```

---

### Test 2: Cache Invalidation (Admin CRUD)

```bash
# Step 1: Customer request discounts (cache akan dibuat)
curl http://localhost:5000/api/public/discounts
# Response: "cached": false (pertama kali)

# Step 2: Request lagi (seharusnya cached)
curl http://localhost:5000/api/public/discounts
# Response: "cached": true ✅

# Step 3: Admin create/update/delete discount
curl -X POST http://localhost:5000/api/admin/discounts \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Check console backend:
[CACHE CLEAR] 🗑️ Featured, Products & Discounts cache - Discount created

# Step 4: Customer request lagi (cache sudah clear, fetch fresh data)
curl http://localhost:5000/api/public/discounts
# Response: "cached": false ← Fresh data dari database!
```

---

## 📊 Cache Statistics

Gunakan endpoint monitoring untuk cek cache performance:

```bash
# Get cache stats
curl http://localhost:5000/api/cache/stats

# Response:
{
  "success": true,
  "data": {
    "summary": {
      "totalKeys": 8,
      "totalHits": 45,
      "totalMisses": 12,
      "hitRatio": "78.95%",  ← Cache hit 78.95%!
      "totalRequests": 57
    },
    "keys": {
      "count": 8,
      "list": [
        "customer:discounts:list",
        "customer:discount:1",
        "customer:discount:1:products:page:1",
        "customer:featured:products",
        "customer:products:all:page:1"
      ]
    }
  }
}
```

---

## 🎯 Use Cases

### Use Case 1: Tampilkan Banner Promo di Homepage

```javascript
// Frontend: HomePage.jsx
useEffect(() => {
  fetch('http://localhost:5000/api/public/discounts')
    .then(res => res.json())
    .then(data => {
      // Show promo banners
      setPromos(data.data);
    });
}, []);
```

---

### Use Case 2: Halaman Detail Promo

```javascript
// Frontend: PromoDetailPage.jsx
const { id } = useParams();

useEffect(() => {
  fetch(`http://localhost:5000/api/public/discounts/${id}`)
    .then(res => res.json())
    .then(data => {
      setPromo(data.data);
      setProducts(data.data.products);
    });
}, [id]);
```

---

### Use Case 3: Browse Products dalam Promo

```javascript
// Frontend: PromoProductsPage.jsx
const { id } = useParams();
const [page, setPage] = useState(1);

useEffect(() => {
  fetch(`http://localhost:5000/api/public/discounts/${id}/products?page=${page}&limit=12`)
    .then(res => res.json())
    .then(data => {
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    });
}, [id, page]);
```

---

## ✅ Summary

**Endpoints Created:**

1. ✅ `GET /api/public/discounts` - List promo aktif
2. ✅ `GET /api/public/discounts/:id` - Detail promo
3. ✅ `GET /api/public/discounts/:id/products` - Produk dalam promo

**Cache Strategy:**

- ✅ Cache 30 menit (1800 detik) untuk semua endpoint
- ✅ Auto invalidation saat admin CRUD discount
- ✅ Hanya show promo yang aktif (is_active=true, not expired)

**Performance:**

- ✅ Cache HIT: ~2-5ms (sangat cepat!)
- ✅ Cache MISS: ~50-100ms (query database)
- ✅ Cache hit ratio target: >70%

**Security:**

- ✅ No authentication required (public access)
- ✅ Customer hanya lihat promo aktif (admin lihat semua)
- ✅ No sensitive data exposed
