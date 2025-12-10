# FAQ - Produk Baru & Re-training Model

## ❓ Pertanyaan Penting

### 1. **Kalau integrate sama DB, model bakal auto-learning gak?**

**JAWABAN: TIDAK OTOMATIS**

Model **TIDAK akan auto-learning** setiap ada produk baru. Kenapa?

- Model neural network butuh **training process** yang butuh waktu (10-30 menit)
- Training butuh **computational resources** yang besar
- Tidak efisien kalau train setiap ada 1 produk baru

**Solusi yang lebih baik:**

- Training di-schedule secara berkala (misal: seminggu sekali, sebulan sekali)
- Atau manual re-training kalau sudah banyak produk baru (misal: 50+ produk baru)

---

### 2. **Gimana kalau ada produk baru di database?**

**2 SKENARIO:**

#### **Skenario A: Produk Baru BELUM di-training**

- API akan return **"No recommendations available"**
- **Fallback strategy** akan aktif:
  - Return produk dari kategori yang sama
  - Return produk populer/trending
  - Return produk baru (new arrivals)

Code sudah ada di: `inference/fallback_strategy.py`

#### **Skenario B: Produk Baru SUDAH di-training**

- Model bisa kasih recommendation normal
- Similarity score akurat

---

### 3. **Kapan harus re-training model?**

**TRIGGER RE-TRAINING:**

1. **Jumlah produk baru banyak:**

   - Ada 50+ produk baru yang belum masuk training data
   - Persentase produk baru > 10% dari total catalog

2. **Scheduled re-training:**

   - Seminggu sekali (recommended untuk e-commerce aktif)
   - Sebulan sekali (untuk catalog yang jarang berubah)

3. **Performance turun:**
   - Click-through rate recommendations turun
   - User feedback negatif

---

### 4. **Cara re-training model dengan data baru?**

**STEP BY STEP:**

```bash
# 1. Update dataset dengan produk baru dari database
cd ml-recommendation-service
python scripts/sync_from_database.py

# 2. Split data baru (train/val/test)
python -c "from data.data_splitter import DataSplitter; DataSplitter().split_data('data/raw/products_new.csv', 'data/splits/', train_ratio=0.7, val_ratio=0.15)"

# 3. Train model baru
python training/train_ncb_v4.py

# 4. Model tersimpan di models/saved_models/ncb_v4/
# API akan auto-load model terbaru
```

**IMPORTANT:**

- Model lama akan di-overwrite
- Backup model lama kalau perlu: `cp -r models/saved_models/ncb_v4 models/saved_models/ncb_v4_backup_YYYYMMDD`

---

### 5. **Bisa deteksi produk baru otomatis?**

**BISA, dengan sistem monitoring:**

```javascript
// Backend bisa track produk yang belum ada di ML index
async function trackNewProducts() {
  // Get semua product IDs dari database
  const dbProducts = await Product.find().select("id");

  // Get product IDs yang sudah di-index di ML model
  const mlHealth = await fetch("http://localhost:8000/health");
  const mlIndexedCount = mlHealth.total_indexed_products;

  // Kalau jumlah berbeda = ada produk baru
  if (dbProducts.length > mlIndexedCount) {
    const diff = dbProducts.length - mlIndexedCount;
    console.log(`⚠️  Ada ${diff} produk baru yang belum di-index`);

    // Trigger notification atau auto-schedule re-training
    if (diff >= 50) {
      await scheduleRetraining();
    }
  }
}
```

---

### 6. **Flow lengkap dengan database:**

```
USER BUAT PRODUK BARU
        ↓
    DATABASE
        ↓
Backend API (product created)
        ↓
    ┌─────────────────────┐
    │  Produk di DB       │
    │  Belum di ML model  │
    └─────────────────────┘
        ↓
┌───────────────────────────────────┐
│  Request recommendations          │
│  untuk produk baru?               │
└───────────────────────────────────┘
        ↓
    ┌───────┴───────┐
    │               │
  YES              NO
    │               │
    ↓               ↓
Fallback       Normal ML
Strategy      Recommendations
    │
    ↓
Return:
- Same category products
- Popular products
- New arrivals
```

**Setelah re-training berkala:**

```
SCHEDULED JOB (cron/scheduler)
        ↓
Sync DB → CSV/splits
        ↓
Train model (train_ncb_v4.py)
        ↓
Model tersimpan di ncb_v4/
        ↓
Restart API server
        ↓
All products termasuk produk baru
sudah bisa dapat recommendations!
```

---

### 7. **Apakah harus restart API setelah re-training?**

**YA, API harus di-restart** untuk load model baru.

**Cara restart tanpa downtime:**

1. **Blue-Green Deployment:**

   ```bash
   # Start API baru di port 8001 dengan model baru
   python -m uvicorn api.main:app --port 8001

   # Test port 8001
   curl http://localhost:8001/health

   # Kalau OK, switch load balancer dari 8000 → 8001
   # Lalu kill port 8000
   ```

2. **Auto-reload (development only):**

   ```bash
   # Pakai --reload flag
   python -m uvicorn api.main:app --reload --port 8000

   # Model akan auto-reload kalau file berubah
   # TAPI ini lambat, tidak recommended untuk production
   ```

---

### 8. **Recommendations untuk production:**

**BEST PRACTICES:**

1. **Monitoring Dashboard:**

   - Track jumlah produk baru
   - Track percentage produk yang ter-index
   - Alert kalau diff > threshold (misal 50 produk)

2. **Scheduled Re-training:**

   ```bash
   # Cron job setiap Minggu jam 2 pagi
   0 2 * * 0 /path/to/retrain.sh
   ```

3. **Fallback Strategy Always On:**

   - Jangan return error untuk produk baru
   - Always kasih recommendations (pakai fallback)
   - User experience tetap bagus

4. **A/B Testing:**

   - Test model baru vs model lama
   - Track metrics: CTR, conversion, revenue
   - Deploy model baru kalau performance lebih baik

5. **Model Versioning:**
   ```
   models/saved_models/
   ├── ncb_v4_20251210/  ← Model sekarang
   ├── ncb_v4_20251217/  ← Model minggu depan
   └── ncb_v4_20251224/  ← Model minggu berikutnya
   ```

---

## 📋 Summary

| Aspek               | Status              | Solusi                            |
| ------------------- | ------------------- | --------------------------------- |
| Auto-learning       | ❌ Tidak otomatis   | Schedule re-training berkala      |
| Produk baru         | ✅ Bisa handle      | Pakai fallback strategy           |
| Deteksi produk baru | ✅ Bisa             | Monitoring system                 |
| Re-training         | ✅ Manual/scheduled | `python training/train_ncb_v4.py` |
| Restart API         | ✅ Perlu            | Blue-green deployment             |

---

**Kesimpulan:**

- Model **bukan auto-learning real-time**
- Produk baru **tetap dapat recommendations** (via fallback)
- Re-training **berkala** lebih efisien daripada real-time
- Monitoring **penting** untuk track produk baru
