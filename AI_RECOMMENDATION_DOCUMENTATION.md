# 🧠 DOKUMENTASI AI RECOMMENDATION SYSTEM - BaleTani

**Versi**: 1.0.0  
**Tanggal**: 28 November 2025  
**Tipe**: Neural Content-Based Filtering (NCB)  
**Tech Stack**: Python 3.11, TensorFlow 2.15, FastAPI 0.108, Redis 7.2

---

## 📋 DAFTAR ISI

1. [Arsitektur Sistem](#arsitektur-sistem)
2. [Strategi Data](#strategi-data)
3. [Dataset Requirements](#dataset-requirements)
4. [Model Architecture](#model-architecture)
5. [API Endpoints](#api-endpoints)
6. [Deployment Strategy](#deployment-strategy)
7. [Integration dengan Backend Express](#integration)

---

## 🏗️ ARSITEKTUR SISTEM

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  - Product Detail Page (Similar Items)                       │
│  - Homepage (Trending Products)                              │
│  - Cart Page (Bundle Suggestions)                            │
│  - Search Results (Ranked by Relevance)                      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP REST API
┌────────────────────▼────────────────────────────────────────┐
│              BACKEND EXPRESS.JS (Node.js)                    │
│  - /api/customer/recommendations/* routes                    │
│  - Forward requests to ML Service                            │
│  - Cache responses (Node-Cache)                              │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP (Internal)
┌────────────────────▼────────────────────────────────────────┐
│           ML RECOMMENDATION SERVICE (Python)                 │
│  ┌──────────────────────────────────────────────────┐       │
│  │              FastAPI Server                       │       │
│  │  - /v1/recommendations/similar/{id}              │       │
│  │  - /v1/recommendations/trending                  │       │
│  │  - /v1/recommendations/bundle                    │       │
│  └──────────────────┬───────────────────────────────┘       │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────┐       │
│  │         Inference Engine                          │       │
│  │  - Load Trained Model (.h5)                      │       │
│  │  - Product Embeddings (32-dim vectors)           │       │
│  │  - Cosine Similarity Calculator                  │       │
│  └──────────────────┬───────────────────────────────┘       │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────┐       │
│  │           Redis Cache Layer                       │       │
│  │  - Cache recommendations (TTL: 1 hour)           │       │
│  │  - Cache embeddings (TTL: 24 hours)              │       │
│  └───────────────────────────────────────────────────┘       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    DATA SOURCES                              │
│  Phase 1: CSV Files (Development)                            │
│   - products.csv                                             │
│   - orders.csv                                               │
│   - customers.csv                                            │
│  Phase 2: MySQL Database (Production)                        │
│   - Direct query to BaleTani DB                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 STRATEGI DATA

### Phase 1: CSV-Based Development (Current)

**Alasan menggunakan CSV:**

- ✅ Cepat untuk prototyping dan testing
- ✅ Tidak perlu setup database connection di awal
- ✅ Mudah untuk version control dataset
- ✅ Portable untuk training di local machine
- ✅ Bisa generate dummy data dengan kontrol penuh

**Migration Path:**

```
CSV Files → SQLite (testing) → MySQL (production)
```

### Phase 2: Database Integration (Production)

**Akan menggunakan:**

- MySQL connection via SQLAlchemy
- Read-only access ke BaleTani database
- Scheduled data sync (daily) untuk refresh embeddings

---

## 📦 DATASET REQUIREMENTS

### 1. Products Dataset (`products.csv`)

**Kolom yang diperlukan (sesuai schema database):**

| Column            | Type    | Description         | Example                        |
| ----------------- | ------- | ------------------- | ------------------------------ |
| `product_id`      | INT     | Unique identifier   | 1, 2, 3                        |
| `name`            | STRING  | Nama produk         | "Udang sedang 1"               |
| `category`        | STRING  | Kategori produk     | "Protein Laut"                 |
| `product_type`    | ENUM    | Tipe produk         | "online" / "offline"           |
| `selling_price`   | DECIMAL | Harga jual (Rupiah) | 65000.0                        |
| `quantity_info`   | STRING  | Info quantity       | "1 kg"                         |
| `shelf_life_days` | INT     | Masa simpan (hari)  | 3                              |
| `total_stock`     | INT     | Stok tersedia       | 50                             |
| `description`     | STRING  | Deskripsi produk    | "Udang segar ukuran sedang..." |
| `is_active`       | BOOLEAN | Status aktif        | True                           |
| `created_at`      | DATE    | Tanggal dibuat      | 2025-01-15                     |

**Struktur CSV:**

```csv
product_id,name,category,product_type,selling_price,quantity_info,shelf_life_days,total_stock,description,is_active,created_at
1,Udang sedang 1,Protein Laut,online,65000,1 kg,3,50,Udang segar ukuran sedang kualitas premium,True,2025-01-15
2,Cabe Kriting,Bumbu,online,72000,1 kg,5,30,Cabai merah keriting pedas segar,True,2025-01-10
...
```

**Catatan Penting:**

- ❌ **Tidak ada kolom `sub_category`** - schema database hanya punya `category_id`
- ✅ Gunakan `selling_price` (bukan `price`)
- ✅ Gunakan `quantity_info` (bukan `unit`) - format: "1 kg", "1 ikat", "1 pcs"
- ✅ Tambahkan `shelf_life_days` - penting untuk recommendation (produk perishable vs non-perishable)
- ✅ Gunakan `total_stock` (bukan `stock`)

### 2. Orders Dataset (`orders.csv`)

**Kolom yang diperlukan:**

| Column         | Type     | Description       | Example     |
| -------------- | -------- | ----------------- | ----------- |
| `order_id`     | UUID/INT | Unique order ID   | ORD-001     |
| `customer_id`  | UUID/INT | Customer ID       | CUST-001    |
| `product_id`   | UUID/INT | Product purchased | 1           |
| `quantity`     | INT      | Jumlah dibeli     | 2           |
| `total_price`  | FLOAT    | Total harga       | 130000      |
| `order_date`   | DATE     | Tanggal order     | 2025-01-20  |
| `order_status` | STRING   | Status order      | "completed" |

**Struktur CSV:**

```csv
order_id,customer_id,product_id,quantity,total_price,order_date,order_status
ORD-001,CUST-001,1,2,130000,2025-01-20,completed
ORD-001,CUST-001,33,1,72000,2025-01-20,completed
ORD-002,CUST-002,7,3,129000,2025-01-21,completed
...
```

### 3. Customers Dataset (`customers.csv`)

**Kolom yang diperlukan:**

| Column         | Type     | Description        | Example      |
| -------------- | -------- | ------------------ | ------------ |
| `customer_id`  | UUID/INT | Unique customer ID | CUST-001     |
| `phone_number` | STRING   | Nomor telepon      | 628123456789 |
| `full_name`    | STRING   | Nama lengkap       | Sari Dewi    |
| `address`      | STRING   | Alamat             | Bandung      |
| `created_at`   | DATE     | Member since       | 2024-11-15   |

**Struktur CSV:**

```csv
customer_id,phone_number,full_name,address,created_at
CUST-001,628123456789,Sari Dewi,Bandung,2024-11-15
CUST-002,628987654321,Budi Santoso,Jakarta,2024-12-01
...
```

---

## 🧠 MODEL ARCHITECTURE

### Neural Content-Based Filtering (NCB)

**Model Name:** `ProductEncoder`

**Input Layer:**

```
┌─────────────────────────────────────────────┐
│ INPUT FEATURES (Multi-modal)                │
├─────────────────────────────────────────────┤
│ 1. Category (Embedding 16-dim)              │
│ 2. Product Type (One-hot 2-dim)            │
│ 3. Price Tier (One-hot 3-dim)              │
│ 4. Shelf Life Tier (One-hot 4-dim)         │
│ 5. Stock Level (Normalized 1-dim)          │
│ 6. Product Name (TF-IDF 32-dim)            │
│ 7. Popularity Score (Normalized 1-dim)     │
└─────────────────────────────────────────────┘
          │
          ▼ CONCAT → 59 dimensions
┌─────────────────────────────────────────────┐
│ DENSE LAYER 1                               │
│ - Units: 128                                │
│ - Activation: ReLU                          │
│ - Dropout: 0.3                              │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│ DENSE LAYER 2                               │
│ - Units: 64                                 │
│ - Activation: ReLU                          │
│ - Dropout: 0.3                              │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│ EMBEDDING LAYER (Output)                    │
│ - Units: 32                                 │
│ - Activation: None (Linear)                 │
│ - L2 Normalization                          │
└─────────────────────────────────────────────┘
          │
          ▼ Product Embedding (32-dim vector)
```

**Training Strategy:**

1. **Self-Supervised Learning** (No labels needed)
   - Positive pairs: Products dalam kategori sama
   - Negative pairs: Products dari kategori berbeda
2. **Loss Function:** Triplet Loss

   ```
   L = max(0, margin + d(anchor, negative) - d(anchor, positive))
   ```

   - margin = 0.2
   - distance metric = cosine distance

3. **Optimizer:** Adam

   - Learning rate: 0.001
   - β1: 0.9, β2: 0.999

4. **Training Parameters:**
   - Batch size: 32
   - Epochs: 50
   - Early stopping: patience=10 (monitor validation loss)

---

## 🔌 API ENDPOINTS

### Base URL

```
Development: http://localhost:8000
Production: http://ml-service.baletani.com
```

### 1. **Similar Products** (Product Detail Page)

**Endpoint:** `GET /v1/recommendations/similar/{product_id}`

**Parameters:**

- `product_id` (path): UUID/INT - Product yang ingin dicari similar items
- `limit` (query): INT - Jumlah rekomendasi (default: 4, max: 20)

**Response:**

```json
{
  "status": "success",
  "data": {
    "source_product": {
      "id": 1,
      "name": "Udang sedang 1",
      "price": 65000
    },
    "recommendations": [
      {
        "product_id": 2,
        "name": "Udang sedang 2",
        "price": 70000,
        "similarity_score": 0.95,
        "reason": "Kategori sama: Protein Laut"
      },
      {
        "product_id": 3,
        "name": "Udang besar",
        "price": 85000,
        "similarity_score": 0.92,
        "reason": "Sub-kategori sama: Udang"
      }
    ]
  },
  "meta": {
    "model_version": "ncb_v1.0",
    "latency_ms": 45
  }
}
```

---

### 2. **Trending Products** (Homepage)

**Endpoint:** `GET /v1/recommendations/trending`

**Parameters:**

- `limit` (query): INT - Jumlah produk (default: 10)
- `days` (query): INT - Periode trending (default: 7 days)

**Response:**

```json
{
  "status": "success",
  "data": {
    "trending_products": [
      {
        "product_id": 33,
        "name": "Cabe Kriting",
        "price": 72000,
        "trend_score": 0.88,
        "sales_last_7_days": 45
      }
    ]
  }
}
```

---

### 3. **Bundle Suggestions** (Cart Page)

**Endpoint:** `POST /v1/recommendations/bundle`

**Request Body:**

```json
{
  "cart_items": [1, 19, 33]
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "bundle_recommendations": [
      {
        "product_id": 32,
        "name": "Bawang putih",
        "price": 40000,
        "bundle_reason": "Sering dibeli bersama bumbu masak"
      }
    ]
  }
}
```

---

### 4. **Category-Based Recommendations**

**Endpoint:** `GET /v1/recommendations/category/{category_name}`

**Parameters:**

- `category_name` (path): STRING - Nama kategori
- `limit` (query): INT - Jumlah produk (default: 8)

**Response:**

```json
{
  "status": "success",
  "data": {
    "category": "Protein Laut",
    "recommendations": [...]
  }
}
```

---

### 5. **Search Ranking**

**Endpoint:** `GET /v1/recommendations/search`

**Parameters:**

- `query` (query): STRING - Keyword pencarian
- `limit` (query): INT - Jumlah hasil (default: 20)

**Response:**

```json
{
  "status": "success",
  "data": {
    "query": "udang",
    "results": [
      {
        "product_id": 1,
        "name": "Udang sedang 1",
        "relevance_score": 0.95
      }
    ]
  }
}
```

---

### 6. **Alternatives** (Out of Stock)

**Endpoint:** `GET /v1/recommendations/alternatives/{product_id}`

**Parameters:**

- `product_id` (path): UUID/INT
- `price_tolerance` (query): FLOAT - Toleransi harga ±% (default: 20)

**Response:**

```json
{
  "status": "success",
  "data": {
    "original_product": {
      "id": 1,
      "name": "Udang sedang 1",
      "price": 65000,
      "stock": 0
    },
    "alternatives": [
      {
        "product_id": 2,
        "name": "Udang sedang 2",
        "price": 70000,
        "price_diff_percent": 7.7,
        "similarity_score": 0.95
      }
    ]
  }
}
```

---

## 🚀 DEPLOYMENT STRATEGY

### Development Environment

```yaml
# docker-compose.dev.yml
version: "3.8"
services:
  ml-service:
    build: ./ml-recommendation-service
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=development
      - DATA_SOURCE=csv
    volumes:
      - ./ml-recommendation-service:/app
      - ./data:/app/data

  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
```

### Production Environment

```yaml
# docker-compose.prod.yml
version: "3.8"
services:
  ml-service:
    image: baletani/ml-recommendation:v1.0
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - DATA_SOURCE=mysql
      - MYSQL_HOST=${DB_HOST}
      - MYSQL_USER=${DB_USER}
      - MYSQL_PASSWORD=${DB_PASSWORD}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:7.2-alpine
    volumes:
      - redis-data:/data
```

---

## 🔗 INTEGRATION DENGAN BACKEND EXPRESS

### 1. Tambahkan Routes di Express

**File:** `backend/src/routes/customer/recommendations.routes.js`

```javascript
const express = require("express");
const axios = require("axios");
const router = express.Router();
const cacheService = require("../../cache/cacheService");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// Similar Products
router.get("/similar/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 4 } = req.query;

    // Check cache
    const cacheKey = `recommendations:similar:${productId}:${limit}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    // Call ML service
    const response = await axios.get(
      `${ML_SERVICE_URL}/v1/recommendations/similar/${productId}`,
      { params: { limit } }
    );

    // Cache for 1 hour
    await cacheService.set(cacheKey, response.data, 3600);

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Recommendation service error" });
  }
});

module.exports = router;
```

### 2. Register Routes

**File:** `backend/src/routes/index.js`

```javascript
const recommendationRoutes = require("./customer/recommendations.routes");

// ... existing routes
router.use("/customer/recommendations", recommendationRoutes);
```

---

## 📈 METRICS & MONITORING

### Key Performance Indicators (KPIs)

**Business Metrics:**

- Click-Through Rate (CTR): Target > 5%
- Conversion Rate: Target > 2%
- Average Order Value (AOV) Lift: Target > 15%
- Revenue from Recommendations: Track monthly

**Technical Metrics:**

- API Latency: Target < 100ms (p95)
- Cache Hit Rate: Target > 80%
- Model Inference Time: Target < 50ms
- Uptime: Target > 99.5%

**Model Quality Metrics:**

- Precision@K: Target > 0.6
- Recall@K: Target > 0.4
- NDCG@K: Target > 0.7
- Coverage: Target > 80% products recommended

---

## 🔄 MODEL RETRAINING SCHEDULE

**Training Frequency:**

- **Daily**: Incremental update (new products)
- **Weekly**: Full retraining (Sundays 2 AM)
- **Ad-hoc**: Triggered manually via admin API

**Retraining Triggers:**

- New products added > 10
- Significant sales pattern change (detected by drift monitor)
- Model performance degradation (precision drop > 10%)

---

## 🛠️ TECH STACK VERSIONS

| Component    | Version | Justification                                    |
| ------------ | ------- | ------------------------------------------------ |
| Python       | 3.11.5  | Stable, modern features, good TensorFlow support |
| TensorFlow   | 2.15.0  | LTS version, stable APIs, production-ready       |
| FastAPI      | 0.108.0 | Latest stable, excellent performance             |
| Pydantic     | 2.5.0   | Data validation, type safety                     |
| Scikit-learn | 1.3.2   | Feature preprocessing, metrics                   |
| Pandas       | 2.1.4   | Data manipulation                                |
| NumPy        | 1.26.2  | Numerical operations                             |
| Redis-py     | 5.0.1   | Caching client                                   |
| SQLAlchemy   | 2.0.23  | Future DB integration                            |
| Uvicorn      | 0.25.0  | ASGI server                                      |

**Why these versions?**

- ✅ All are **stable releases** (not beta/alpha)
- ✅ **Mutual compatibility** tested
- ✅ **Long-term support** (LTS where applicable)
- ✅ **Security patches** up-to-date
- ✅ **Performance optimized**

---

## 📚 REFERENSI

**Academic Papers:**

- "Deep Neural Networks for YouTube Recommendations" (Covington et al., 2016)
- "Two-Tower Models for Content-Based Recommendations" (Google Research, 2020)

**Production Examples:**

- Tokopedia Product Recommendations
- Shopee Similar Items Engine
- Bukalapak Smart Search

---

## 🎯 NEXT STEPS

### Phase 1: Foundation (Week 1-2)

- [x] Dokumentasi arsitektur ✓
- [ ] Setup folder structure
- [ ] Generate dummy CSV data
- [ ] Implement data loader

### Phase 2: Model Development (Week 3-4)

- [ ] Feature engineering pipeline
- [ ] Neural network implementation
- [ ] Model training & evaluation
- [ ] Hyperparameter tuning

### Phase 3: API Development (Week 5)

- [ ] FastAPI endpoints
- [ ] Redis caching
- [ ] Error handling & logging

### Phase 4: Integration (Week 6)

- [ ] Express.js routes
- [ ] Frontend components
- [ ] End-to-end testing

### Phase 5: Deployment (Week 7)

- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Monitoring setup
- [ ] Production launch

---

**Dibuat oleh:** AI Development Team  
**Last Updated:** 28 November 2025  
**Status:** ✅ Ready for Implementation
