# 🚀 QUICK START GUIDE - AI Recommendation System

## 📋 Prerequisites

- ✅ Python 3.11+ installed
- ✅ Node.js 18+ installed
- ✅ Backend MySQL database running
- ✅ All dependencies installed

---

## 🎯 Step-by-Step Setup

### **1. Start ML Service (FastAPI)**

```powershell
# Terminal 1 - ML Service
cd ml-recommendation-service
python api/main.py
```

✅ **Expected Output**:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
🔄 Loading NCB model...
✅ Model loaded successfully! Indexed 52 products
```

✅ **Check Health**: http://localhost:8000/health

✅ **Swagger Docs**: http://localhost:8000/api/docs

---

### **2. Start Express Backend**

```powershell
# Terminal 2 - Express Backend
cd backend
npm run dev
```

✅ **Expected Output**:

```
[nodemon] starting `node src/server.js`
✅ Connected to MySQL database
🚀 Server running on port 3000
```

✅ **Check API**: http://localhost:3000/api/health

---

### **3. Test Recommendations**

#### **A. Get Similar Products**

Ambil UUID product dari `ml-recommendation-service/data/raw/products.csv`:

```powershell
# PowerShell
$productId = "550e8400-e29b-41d4-a716-446655440001"
Invoke-RestMethod "http://localhost:3000/api/recommendations/similar/$productId?top_k=5"
```

**cURL**:

```bash
curl "http://localhost:3000/api/recommendations/similar/550e8400-e29b-41d4-a716-446655440001?top_k=5"
```

✅ **Expected Response**:

```json
{
  "success": true,
  "data": {
    "product_id": "550e8400-...",
    "product_name": "Udang sedang 1",
    "recommendations": [
      {
        "product_id": "550e8400-...",
        "product_name": "Udang sedang 2",
        "similarity_score": 0.9987,
        "percentage": "99.87%"
      }
    ],
    "computation_time_ms": 12.5
  }
}
```

---

#### **B. Get Bundle Recommendations**

```powershell
# PowerShell
$body = @{
    product_ids = @(
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002"
    )
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/recommendations/bundle?top_k=8" `
  -ContentType "application/json" `
  -Body $body
```

**cURL**:

```bash
curl -X POST http://localhost:3000/api/recommendations/bundle \
  -H "Content-Type: application/json" \
  -d '{
    "product_ids": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ]
  }'
```

---

#### **C. Get Trending Products**

```powershell
# PowerShell - All categories
Invoke-RestMethod "http://localhost:3000/api/recommendations/trending?top_k=12"

# Specific category
$categoryId = "660e8400-e29b-41d4-a716-446655440001"
Invoke-RestMethod "http://localhost:3000/api/recommendations/trending?category_id=$categoryId&top_k=10"
```

**cURL**:

```bash
curl "http://localhost:3000/api/recommendations/trending?top_k=12"
```

---

#### **D. Get Category Top Products**

```powershell
# PowerShell
$categoryId = "660e8400-e29b-41d4-a716-446655440001"
Invoke-RestMethod "http://localhost:3000/api/recommendations/category/$categoryId?top_k=10"
```

**cURL**:

```bash
curl "http://localhost:3000/api/recommendations/category/660e8400-e29b-41d4-a716-446655440001?top_k=10"
```

---

## 📊 Available UUIDs (from CSV)

### **Category UUIDs**:

```
Protein Laut:   660e8400-e29b-41d4-a716-446655440001
Protein Daging: 660e8400-e29b-41d4-a716-446655440002
Protein Telur:  660e8400-e29b-41d4-a716-446655440003
Bumbu:          660e8400-e29b-41d4-a716-446655440004
Sayur:          660e8400-e29b-41d4-a716-446655440005
Buah:           660e8400-e29b-41d4-a716-446655440006
Bahan Kering:   660e8400-e29b-41d4-a716-446655440007
```

### **Sample Product UUIDs**:

Check: `ml-recommendation-service/data/raw/products.csv`

Format:

```csv
id,name,category_id,category_name,...
550e8400-...,Udang sedang 1,660e8400-...,Protein Laut,...
```

---

## 🔧 Troubleshooting

### **Problem**: ML Service not starting

**Solution**:

```powershell
cd ml-recommendation-service
pip install -r requirements.txt
python api/main.py
```

---

### **Problem**: Backend cannot connect to ML service

**Check**:

1. ML service running? → `curl http://localhost:8000/health`
2. `.env` configured? → Check `ML_SERVICE_URL=http://localhost:8000`

**Fix**:

```powershell
# In backend/.env
ML_SERVICE_URL=http://localhost:8000
```

---

### **Problem**: 404 Product not found

**Check**:

1. Use correct UUID from CSV
2. UUID format valid? → Must be: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**Test UUID**:

```powershell
# PowerShell - Check product exists
Get-Content ml-recommendation-service/data/raw/products.csv | Select-String "550e8400"
```

---

### **Problem**: Cache not working

**Clear cache**:

```javascript
// In backend, add endpoint atau run in console
const recommendationService = require("./services/recommendation.service");
recommendationService.clearCache(); // Clear all
recommendationService.clearCache("similar"); // Clear specific
```

---

## 📝 API Endpoint Summary

| Endpoint                           | Method | Purpose            | Cache TTL |
| ---------------------------------- | ------ | ------------------ | --------- |
| `/v1/recommendations/similar/:id`  | GET    | Similar products   | 15 min    |
| `/v1/recommendations/bundle`       | POST   | Bundle suggestions | 15 min    |
| `/v1/recommendations/trending`     | GET    | Trending products  | 2 hours   |
| `/v1/recommendations/category/:id` | GET    | Category top       | 1 hour    |
| `/health`                          | GET    | Service health     | No cache  |

---

## 🧪 Postman Collection

Import ke Postman:

1. Open Postman
2. Import → Raw Text
3. Paste from: `ml-recommendation-service/API_TESTING_GUIDE.py`
4. Collection ready!

Variables:

- `BASE_URL`: `http://localhost:3000`
- `ML_URL`: `http://localhost:8000`

---

## 📈 Performance Expectations

| Operation              | Response Time | Cache Hit Rate |
| ---------------------- | ------------- | -------------- |
| Similar Products       | ~12ms         | ~70%           |
| Bundle Recommendations | ~18ms         | ~50%           |
| Trending               | ~8ms          | ~90%           |
| Category Top           | ~6ms          | ~80%           |

---

## 🎯 Integration Checklist

### **Backend**:

- ✅ Routes registered di `backend/src/routes/index.js`
- ✅ Service layer implemented
- ✅ Controller dengan validation
- ✅ Axios dependency installed
- ✅ `.env` configured

### **ML Service**:

- ✅ Model trained dengan UUID data
- ✅ FastAPI endpoints live
- ✅ Swagger docs available
- ✅ Health check working

### **Data**:

- ✅ 52 products dengan UUID
- ✅ 20 customers dengan UUID
- ✅ 1514 order items dengan UUID relationships

---

## 🚀 Production Deployment

### **ML Service**:

```powershell
# Install uvicorn for production
pip install uvicorn[standard]

# Run with multiple workers
uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### **Backend**:

```powershell
# Production mode
NODE_ENV=production npm start
```

### **Environment Variables** (Production):

```env
# Backend .env
ML_SERVICE_URL=https://ml.baletani.com
NODE_ENV=production
REDIS_URL=redis://localhost:6379

# ML Service .env
DATA_SOURCE=mysql
DATABASE_URL=mysql://user:pass@host:3306/baletani
```

---

## 📞 Support

**Documentation**:

- API Docs: http://localhost:8000/api/docs
- Implementation: `AI_RECOMMENDATION_IMPLEMENTATION_COMPLETE.md`
- Testing Guide: `API_TESTING_GUIDE.py`

**Logs**:

- ML Service: Console output
- Backend: `backend/logs/` (if configured)

---

**✅ Everything Ready! Happy Testing! 🎉**
