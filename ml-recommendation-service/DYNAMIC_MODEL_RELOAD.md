# 🔄 DYNAMIC MODEL AUTO-RELOAD SYSTEM

## Overview

Sistem auto-reload model ML untuk mengenali produk baru secara otomatis tanpa restart server.

## 🚀 Features

### 1. **Auto-Reload on Product Changes**

Model akan otomatis reload setiap kali:

- ✅ Produk baru ditambahkan
- ✅ Produk existing di-update
- ✅ Produk dihapus

### 2. **Manual Reload Endpoint**

```http
POST /v1/admin/reload-model
```

**Response:**

```json
{
  "status": "success",
  "message": "Model reloaded with latest data",
  "indexed_products": 52,
  "reload_time_ms": 1245.67,
  "timestamp": "2025-12-11T18:00:00"
}
```

### 3. **Model Status Endpoint**

```http
GET /v1/admin/model-status
```

**Response:**

```json
{
  "status": "active",
  "model_version": "ncb_v4",
  "indexed_products": 52,
  "embedding_dimension": 32,
  "uptime_seconds": 3600.5,
  "is_trained": true,
  "data_source": "csv",
  "last_reload": "on_startup",
  "timestamp": "2025-12-11T18:00:00"
}
```

## 🔧 How It Works

### Backend Integration Flow:

```
1. Admin menambah produk baru
   ↓
2. adminProduct.controller.js
   - Save produk ke database
   - Trigger triggerModelReload()
   ↓
3. ml-webhook.service.js
   - HTTP POST ke ML service /v1/admin/reload-model
   ↓
4. ML Service (FastAPI)
   - Reload NCBModel dengan data terbaru
   - Re-index embeddings
   - Update similarity engine
   ↓
5. Model siap recognize produk baru ✅
```

### Files Modified:

**Backend:**

- `backend/src/services/ml-webhook.service.js` - NEW webhook service
- `backend/src/controllers/adminProduct.controller.js` - Added auto-reload triggers

**ML Service:**

- `ml-recommendation-service/api/main.py` - Added `/reload-model` & `/model-status` endpoints

## 📋 Usage Examples

### Example 1: Auto-Reload After Create Product

```javascript
// Backend automatically triggers reload after product creation
POST /api/admin/products
{
  "name": "Ikan Salmon Fresh",
  "category_id": "...",
  "selling_price": 150000
}

// Behind the scenes:
// 1. Product saved to DB
// 2. triggerModelReload() called
// 3. ML model reloads with new product
// 4. New product can be recommended immediately
```

### Example 2: Manual Reload via Admin Panel

```javascript
// Frontend admin panel can trigger manual reload
const reloadModel = async () => {
  const response = await fetch("http://localhost:8000/v1/admin/reload-model", {
    method: "POST",
  });

  const data = await response.json();
  console.log(`Model reloaded: ${data.indexed_products} products`);
};
```

### Example 3: Scheduled Reload (Cron Job)

```javascript
// backend/src/app.js or server startup
const { scheduleModelReload } = require("./services/ml-webhook.service");

// Reload every day at 2 AM
scheduleModelReload("0 2 * * *");
```

## ⚡ Performance Considerations

### Reload Time:

- **Small dataset (50-100 products):** ~1-2 seconds
- **Medium dataset (500-1000 products):** ~5-10 seconds
- **Large dataset (5000+ products):** ~30-60 seconds

### Best Practices:

1. **Non-blocking:** Reload happens asynchronously, doesn't block product creation
2. **Error handling:** Failed reload won't crash product operations
3. **Logging:** All reload events are logged for monitoring

### Trade-offs:

- ✅ **Pros:** Produk baru langsung bisa di-recommend
- ✅ **Pros:** No manual intervention needed
- ⚠️ **Cons:** Reload takes time (1-60s depending on dataset size)
- ⚠️ **Cons:** Slight delay before new product appears in recommendations

## 🐛 Troubleshooting

### Issue: Model reload takes too long

**Solution:** Consider using Redis/message queue for async reload

### Issue: Reload fails but product created

**Solution:** Model reload is non-blocking by design. Check ML service logs. Can manually trigger reload.

### Issue: New product not appearing in recommendations

**Solution:**

1. Check model reload was successful
2. Call `GET /v1/admin/model-status` to verify indexed_products count
3. Manually trigger `POST /v1/admin/reload-model`

## 🔐 Security

### Admin-Only Endpoints:

Tambahkan auth middleware untuk protect endpoints:

```javascript
// backend/src/routes/recommendation.routes.js
const { adminAuth } = require("../middlewares/auth.middleware");

router.post(
  "/admin/reload-model",
  adminAuth,
  recommendationController.reloadModel
);
```

## 📊 Monitoring

### Recommended Metrics to Track:

1. **Reload frequency:** Berapa kali model di-reload per hari
2. **Reload duration:** Berapa lama reload takes
3. **Reload success rate:** Percentage successful reloads
4. **Indexed products count:** Track pertumbuhan produk

### Logging Example:

```
[ML MODEL] Triggering model reload for new product
[ML MODEL] ✅ Model reloaded: 53 products indexed in 1245ms
[ML MODEL] ❌ Reload failed (non-blocking): Connection timeout
```

## 🚀 Future Enhancements

1. **Incremental Updates:** Update hanya produk baru tanpa full reload
2. **Redis Queue:** Gunakan message queue untuk async processing
3. **Webhook Events:** Real-time notifications saat reload complete
4. **A/B Testing:** Compare old vs new model performance
5. **Rollback Support:** Revert ke model version sebelumnya jika error

## 📚 Related Documentation

- [BRIEF_NCB_COMPLETE.md](./BRIEF_NCB_COMPLETE.md) - Technical architecture
- [AI_POWER_AUDIT.md](./AI_POWER_AUDIT.md) - Component analysis (94.5% ready)
- [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) - Full API reference

---

**Status:** ✅ Production Ready
**Last Updated:** December 11, 2025
**Maintainer:** AI Development Team
