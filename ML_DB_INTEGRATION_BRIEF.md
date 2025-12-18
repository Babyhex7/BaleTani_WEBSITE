# 🔗 Brief: Integrasi ML Recommendation dengan Backend Database

**Tanggal:** 17 Desember 2025  
**Status:** Planning & Implementation Guide  
**Tujuan:** Mengganti data source ML dari CSV ke MySQL Database real-time

---

## 📋 Executive Summary

Saat ini ML recommendation service menggunakan **CSV files** untuk data products, orders, dan customers. Kita akan mengintegrasikannya dengan **MySQL Database** yang digunakan Backend, sehingga rekomendasi berdasarkan data real-time dari production database.

### Current State (CSV-based) ❌

```
Frontend → Backend API → ML Service (FastAPI)
                              ↓
                          CSV Files
                   (products.csv, orders.csv)
```

### Target State (Database-integrated) ✅

```
Frontend → Backend API → ML Service (FastAPI)
              ↓              ↓
           MySQL DB ←────────┘
        (Real-time data)
```

---

## 🎯 Goals & Benefits

### Goals

1. **Real-time Data**: Rekomendasi berdasarkan data produk terbaru
2. **Auto-sync**: Tidak perlu manual export CSV lagi
3. **Scalability**: Support data besar dengan query optimization
4. **Consistency**: Single source of truth (MySQL)

### Benefits

- ✅ Rekomendasi selalu update otomatis
- ✅ Menghapus CSV maintenance overhead
- ✅ Support collaborative filtering (based on real orders)
- ✅ Better accuracy dengan data real-time

---

## 🏗️ Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  - Product Detail Page (Similar Products)                   │
│  - Cart Page (Bundle Recommendations)                       │
│  - Homepage (Trending Products)                             │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP Request
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API (Node.js)                      │
│  Routes:                                                     │
│  - GET /api/recommendations/similar/:productId              │
│  - POST /api/recommendations/bundle                         │
│  - GET /api/recommendations/trending                        │
│                                                              │
│  Controller → Service → HTTP Client (Axios)                 │
└─────────────────────────┬───────────────────────────────────┘
                          │ Forward to ML Service
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              ML SERVICE (FastAPI + Python)                   │
│                                                              │
│  API Routes (FastAPI):                                      │
│  - /v1/recommendations/similar/{product_id}                 │
│  - /v1/recommendations/bundle                               │
│  - /v1/recommendations/trending                             │
│  - /v1/recommendations/personalized/{customer_id}           │
│                                                              │
│  Data Layer:                                                │
│  - DataLoader (load from MySQL)                             │
│  - Cache Layer (Redis optional)                             │
│                                                              │
│  ML Models:                                                 │
│  - NCB Model (Neural Content-Based)                         │
│  - Similarity Engine                                        │
└─────────────────────────┬───────────────────────────────────┘
                          │ SQL Queries
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    MySQL DATABASE                            │
│                                                              │
│  Tables:                                                    │
│  - products (57 items → growing)                            │
│  - orders (transaction history)                             │
│  - order_items (product quantities)                         │
│  - customers (user data)                                    │
│  - categories (product categories)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### 1. Similar Products Flow

```
User clicks product
    ↓
Frontend: fetch `/api/recommendations/similar/${productId}`
    ↓
Backend: Forward to ML Service with cache
    ↓
ML Service:
    - Query product from MySQL
    - Load NCB model
    - Calculate similarity scores
    - Return top K similar products
    ↓
Backend: Cache result (15 min) + return to Frontend
    ↓
Frontend: Display "Produk Serupa" section
```

### 2. Bundle Recommendations Flow

```
User adds products to cart
    ↓
Frontend: POST `/api/recommendations/bundle`
Body: { productIds: ['uuid1', 'uuid2'] }
    ↓
Backend: Forward to ML Service
    ↓
ML Service:
    - Query products from MySQL
    - Aggregate product features
    - Find complementary products
    - Return bundle suggestions
    ↓
Backend: Return to Frontend
    ↓
Frontend: "Lengkapi Belanjaan Anda" section
```

### 3. Trending Products Flow

```
Homepage loads
    ↓
Frontend: GET `/api/recommendations/trending`
    ↓
ML Service:
    - Query orders (last 30 days) from MySQL
    - Calculate popularity score:
        * Order frequency (40%)
        * Total quantity sold (30%)
        * Recency (20%)
        * Rating average (10%)
    - Return top 12 products
    ↓
Frontend: Display "Produk Terlaris" carousel
```

---

## 🗄️ Database Schema Integration

### Required Tables

#### 1. **products** (Already exists)

```sql
SELECT
    product_id,
    name,
    category_id,
    product_type,
    selling_price,
    quantity_info,
    shelf_life_days,
    total_stock,
    description,
    is_active,
    created_at,
    updated_at
FROM products
WHERE is_active = 1
```

#### 2. **categories** (Already exists)

```sql
SELECT
    category_id,
    name as category_name
FROM categories
WHERE is_deleted = 0
```

#### 3. **orders** + **order_items** (Already exists)

```sql
SELECT
    o.order_id,
    o.customer_id,
    o.order_date,
    o.order_status,
    oi.product_id,
    oi.quantity,
    oi.total_price
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status = 'completed'
AND o.order_date >= DATE_SUB(NOW(), INTERVAL 90 DAYS)
```

#### 4. **customers** (Already exists)

```sql
SELECT
    customer_id,
    phone_number,
    full_name,
    address,
    created_at
FROM customers
WHERE is_active = 1
```

### New Tables (Optional - for advanced features)

#### **product_views** (Track user behavior)

```sql
CREATE TABLE product_views (
    view_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    customer_id VARCHAR(36),
    product_id VARCHAR(36) NOT NULL,
    view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255),
    INDEX idx_customer_product (customer_id, product_id),
    INDEX idx_view_date (view_date),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

#### **recommendation_logs** (Track recommendation performance)

```sql
CREATE TABLE recommendation_logs (
    log_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    recommendation_type ENUM('similar', 'bundle', 'trending', 'personalized'),
    request_params JSON,
    response_products JSON,
    customer_id VARCHAR(36),
    computation_time_ms FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type_date (recommendation_type, created_at)
);
```

---

## 📁 Implementation Structure

### ML Service Updates

```
ml-recommendation-service/
├── config/
│   ├── database.py          # ✅ MySQL connection (UPDATE)
│   └── settings.py          # ✅ Add DB credentials
│
├── data/
│   ├── data_loader.py       # 🔄 Implement MySQL queries
│   ├── query_builder.py     # ✨ NEW: SQL query templates
│   └── db_cache.py          # ✨ NEW: Query result caching
│
├── models/
│   └── content_based/
│       └── ncb_model.py     # ✅ No change (model stays same)
│
├── inference/
│   ├── recommender.py       # 🔄 Use DB data instead of CSV
│   └── cache_manager.py     # ✨ NEW: Redis for caching
│
└── api/
    ├── main.py              # 🔄 Update to use DB loader
    └── routes/
        └── recommendations.py  # ✅ No API changes
```

### Backend Updates

```
backend/src/
├── services/
│   └── recommendation.service.js    # ✅ Already implemented
│
├── controllers/
│   └── recommendation.controller.js # ✅ Already implemented
│
└── routes/
    └── recommendation.routes.js     # ✅ Already implemented
```

### Frontend Updates

```
frontend/src/
├── services/
│   └── services_customer/
│       └── recommendationService.js  # ✨ NEW: API calls
│
├── components/
│   └── ui_customer/
│       ├── SimilarProducts.jsx      # ✨ NEW
│       ├── BundleRecommendations.jsx # ✨ NEW
│       └── TrendingCarousel.jsx     # ✨ NEW
│
└── pages/
    └── customer/
        └── ProductDetailPage.jsx    # 🔄 Add similar products
```

---

## 🛠️ Implementation Steps

### Phase 1: ML Service DB Integration (Priority: HIGH)

#### Step 1.1: Setup Database Connection

**File:** `ml-recommendation-service/config/database.py`

```python
from sqlalchemy import create_engine, pool
from sqlalchemy.orm import sessionmaker
import pymysql

# Connection string
MYSQL_URL = "mysql+pymysql://user:password@localhost:3306/baletani_db"

# Create engine with connection pooling
engine = create_engine(
    MYSQL_URL,
    poolclass=pool.QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(bind=engine)

def get_db():
    """Dependency untuk FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### Step 1.2: Update DataLoader with MySQL Queries

**File:** `ml-recommendation-service/data/data_loader.py`

```python
def _load_products_from_mysql(self) -> pd.DataFrame:
    """Load products dari MySQL"""
    query = """
    SELECT
        p.product_id,
        p.name,
        c.name as category_name,
        p.product_type,
        p.selling_price,
        p.quantity_info,
        p.shelf_life_days,
        p.total_stock,
        p.description,
        p.is_active,
        p.created_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE p.is_active = 1
    AND p.is_deleted = 0
    ORDER BY p.created_at DESC
    """

    with engine.connect() as conn:
        df = pd.read_sql(query, conn)

    return df

def _load_orders_from_mysql(self) -> pd.DataFrame:
    """Load orders dari MySQL (last 90 days)"""
    query = """
    SELECT
        o.order_id,
        o.customer_id,
        o.order_date,
        o.order_status,
        oi.product_id,
        oi.quantity,
        oi.price as unit_price,
        oi.total_price
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'completed'
    AND o.order_date >= DATE_SUB(NOW(), INTERVAL 90 DAYS)
    ORDER BY o.order_date DESC
    """

    with engine.connect() as conn:
        df = pd.read_sql(query, conn)

    return df
```

#### Step 1.3: Add Environment Variables

**File:** `ml-recommendation-service/.env`

```bash
# Data Source Configuration
DATA_SOURCE=mysql  # Change from 'csv' to 'mysql'

# MySQL Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=baletani_db

# Redis Cache (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL=900  # 15 minutes
```

#### Step 1.4: Test Database Connection

**File:** `ml-recommendation-service/test_db_connection.py` (NEW)

```python
"""Test database connection"""
from data.data_loader import DataLoader
from config.database import engine

def test_connection():
    print("Testing MySQL connection...")

    # Test engine
    try:
        with engine.connect() as conn:
            result = conn.execute("SELECT 1")
            print("✅ Engine connection successful")
    except Exception as e:
        print(f"❌ Engine connection failed: {e}")
        return

    # Test DataLoader
    loader = DataLoader(data_source='mysql')

    # Load products
    products = loader.load_products()
    print(f"✅ Loaded {len(products)} products")
    print(products.head())

    # Load orders
    orders = loader.load_orders()
    print(f"✅ Loaded {len(orders)} orders")
    print(orders.head())

    # Load customers
    customers = loader.load_customers()
    print(f"✅ Loaded {len(customers)} customers")

if __name__ == "__main__":
    test_connection()
```

Run test:

```bash
cd ml-recommendation-service
python test_db_connection.py
```

---

### Phase 2: Frontend Integration (Priority: MEDIUM)

#### Step 2.1: Create Recommendation Service

**File:** `frontend/src/services/services_customer/recommendationService.js` (NEW)

```javascript
import apiClient from "../../utils/apiClient";

const recommendationService = {
  /**
   * Get similar products for a product
   * @param {string} productId - UUID of product
   * @param {number} limit - Number of recommendations (default: 6)
   */
  async getSimilarProducts(productId, limit = 6) {
    const response = await apiClient.get(
      `/recommendations/similar/${productId}`,
      { params: { top_k: limit } }
    );
    return response.data;
  },

  /**
   * Get bundle recommendations for cart items
   * @param {string[]} productIds - Array of product UUIDs
   * @param {number} limit - Number of recommendations (default: 4)
   */
  async getBundleRecommendations(productIds, limit = 4) {
    const response = await apiClient.post(
      "/recommendations/bundle",
      { productIds },
      { params: { top_k: limit } }
    );
    return response.data;
  },

  /**
   * Get trending products
   * @param {number} limit - Number of products (default: 12)
   */
  async getTrendingProducts(limit = 12) {
    const response = await apiClient.get("/recommendations/trending", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get personalized recommendations for logged-in user
   * @param {number} limit - Number of recommendations (default: 8)
   */
  async getPersonalizedRecommendations(limit = 8) {
    const response = await apiClient.get("/recommendations/personalized", {
      params: { limit },
    });
    return response.data;
  },
};

export default recommendationService;
```

#### Step 2.2: Create Similar Products Component

**File:** `frontend/src/components/ui_customer/SimilarProducts.jsx` (NEW)

```jsx
import React, { useEffect, useState } from "react";
import ProductCard from "../ui/ProductCard";
import recommendationService from "../../services/services_customer/recommendationService";

const SimilarProducts = ({ productId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        const response = await recommendationService.getSimilarProducts(
          productId,
          6
        );

        if (response.success) {
          setRecommendations(response.data.recommendations || []);
        }
      } catch (err) {
        console.error("Error fetching similar products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSimilarProducts();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">Produk Serupa</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Produk Serupa</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((rec) => (
          <ProductCard
            key={rec.product_id}
            product={{
              product_id: rec.product_id,
              name: rec.product_name,
              category_name: rec.category_name,
              selling_price: rec.selling_price,
              image_url: rec.image_url,
            }}
            showSimilarity={true}
            similarityScore={rec.percentage}
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
```

#### Step 2.3: Add to Product Detail Page

**File:** `frontend/src/pages/customer/ProductDetailPage.jsx`

```jsx
import SimilarProducts from "../../components/ui_customer/SimilarProducts";

// Inside component JSX, after product details:
<div className="container mx-auto px-4">
  {/* Existing product detail content */}

  {/* Add Similar Products Section */}
  {productId && <SimilarProducts productId={productId} />}
</div>;
```

---

### Phase 3: Testing & Validation

#### Test Cases

**1. ML Service Unit Tests**

```bash
cd ml-recommendation-service
pytest tests/test_data_loader.py -v
pytest tests/test_recommendations.py -v
```

**2. API Integration Tests**

```bash
# Test similar products
curl http://localhost:8000/v1/recommendations/similar/550e8400-e29b-41d4-a716-446655440001

# Test bundle recommendations
curl -X POST http://localhost:8000/v1/recommendations/bundle \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["uuid1", "uuid2"]}'
```

**3. Backend Tests**

```bash
cd backend
npm test -- recommendation.controller.test.js
```

**4. E2E Tests**

```bash
cd e2e-tests
npm run test:recommendations
```

---

## 📊 Performance Optimization

### Caching Strategy

```
┌─────────────────────────────────────┐
│         Request Flow                │
└─────────────────────────────────────┘

1. Request arrives at Backend
   ↓
2. Check Node.js in-memory cache (15 min TTL)
   - HIT: Return cached result ⚡
   - MISS: Continue to step 3
   ↓
3. Forward to ML Service
   ↓
4. ML Service checks Redis cache (1 hour TTL)
   - HIT: Return cached embeddings ⚡
   - MISS: Continue to step 5
   ↓
5. Query MySQL Database
   ↓
6. Compute recommendations
   ↓
7. Cache result in Redis + return
   ↓
8. Backend caches result + return to Frontend
```

### Database Query Optimization

```sql
-- Add indexes for faster queries
CREATE INDEX idx_products_active ON products(is_active, is_deleted);
CREATE INDEX idx_orders_date_status ON orders(order_date, order_status);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

---

## 🚀 Deployment Checklist

### Before Go-Live

- [ ] **Database Setup**

  - [ ] Verify MySQL connection from ML service
  - [ ] Run index creation scripts
  - [ ] Test query performance (< 100ms)

- [ ] **ML Service**

  - [ ] Update .env with production DB credentials
  - [ ] Restart service with `DATA_SOURCE=mysql`
  - [ ] Verify model loading works
  - [ ] Test all endpoints

- [ ] **Backend**

  - [ ] Update ML_SERVICE_URL in .env
  - [ ] Deploy recommendation routes
  - [ ] Test integration with ML service

- [ ] **Frontend**

  - [ ] Deploy recommendation components
  - [ ] Test UI rendering
  - [ ] Verify API calls work

- [ ] **Monitoring**
  - [ ] Setup logging for recommendation requests
  - [ ] Monitor API response times
  - [ ] Track recommendation click-through rate

---

## 📈 Success Metrics

### Technical Metrics

- ✅ API Response Time: < 200ms (p95)
- ✅ Database Query Time: < 100ms
- ✅ Cache Hit Rate: > 70%
- ✅ Model Inference Time: < 50ms

### Business Metrics

- 📊 Recommendation Click-Through Rate (CTR): Target > 5%
- 📊 Add-to-Cart from Recommendations: Target > 3%
- 📊 Order Conversion from Recommendations: Target > 1%

---

## 🔮 Future Enhancements

### Phase 4: Advanced Features

1. **Collaborative Filtering**

   - User-based recommendations
   - "Customers who bought this also bought..."
   - Require significant order history data

2. **Personalized Recommendations**

   - Based on user browsing history
   - Consider user preferences
   - Location-based recommendations

3. **A/B Testing**

   - Test different recommendation algorithms
   - Compare NCB vs Collaborative vs Hybrid
   - Measure impact on conversion rate

4. **Real-time Model Updates**
   - Retrain model daily/weekly
   - Incorporate new products automatically
   - Adapt to seasonal trends

---

## 📞 Support & Resources

### Documentation

- Backend API: `/API_DOCUMENTATION.md`
- ML Service: `/ml-recommendation-service/README.md`
- Database Schema: Backend `/src/models/`

### Key Files

- ML DataLoader: `ml-recommendation-service/data/data_loader.py`
- Backend Service: `backend/src/services/recommendation.service.js`
- Frontend Service: `frontend/src/services/services_customer/recommendationService.js`

### Commands

```bash
# Start ML Service
cd ml-recommendation-service
python start_server.py

# Start Backend
cd backend
npm run dev

# Start Frontend
cd frontend
npm run dev

# Test ML Service
cd ml-recommendation-service
python test_api.py
```

---

## ✅ Next Actions

1. **Implement Phase 1** (ML Service DB Integration)

   - Update database.py with connection
   - Implement MySQL queries in data_loader.py
   - Test with test_db_connection.py

2. **Test ML Service Independently**

   - Verify all endpoints work with DB data
   - Check performance metrics
   - Validate recommendation quality

3. **Implement Phase 2** (Frontend Integration)

   - Create recommendation service
   - Build UI components
   - Integrate with pages

4. **Deploy & Monitor**
   - Deploy all services
   - Monitor metrics
   - Gather user feedback

---

**Status:** Ready for Implementation 🚀  
**Estimated Timeline:** 2-3 days for Phase 1 & 2  
**Risk Level:** Low (DB integration is straightforward)  
**Impact:** High (Real-time recommendations)
