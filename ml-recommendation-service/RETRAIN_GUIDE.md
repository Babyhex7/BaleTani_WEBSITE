# Retrain Model dari MySQL Database

## Status Sekarang ✅

- **Model Aktif**: ncb_v4_test (700 produk dari CSV training)
- **Database**: 64 produk real dari MySQL
- **Strategi**: On-the-fly encoding untuk produk baru
- **API**: Berjalan dengan dynamic encoding

## Cara Kerja On-The-Fly Encoding

```
┌─────────────────────────────────────────────────┐
│  Request: Product ID dari Database              │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
       ┌───────────────────────┐
       │  Cek ID di Index?     │
       └───────┬───────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼ Ya            ▼ Tidak (Produk Baru)
   ┌────────┐     ┌────────────────────────┐
   │ Fast   │     │ Encode On-The-Fly:     │
   │ Lookup │     │ 1. Preprocessor        │
   └────────┘     │ 2. Text Extractor      │
                  │ 3. Neural Encoder      │
                  │ 4. Get Embedding       │
                  └────────────────────────┘
                            │
                            ▼
                  ┌────────────────────────┐
                  │  Similarity Search     │
                  │  (vs 700 indexed)      │
                  └────────────────────────┘
                            │
                            ▼
                  ┌────────────────────────┐
                  │  Get Metadata dari DB  │
                  └────────────────────────┘
                            │
                            ▼
                  ┌────────────────────────┐
                  │  Return Recommendations│
                  └────────────────────────┘
```

## Kenapa Recommendations Kosong?

**Problem**: Model punya 700 produk dengan UUID berbeda dari database (64 produk).

**Hasil**:

- On-the-fly encoding ✅ berhasil
- Similarity search ✅ jalan (cari di 700 embeddings)
- Metadata lookup ❌ gagal (UUID tidak match)

## Solusi: Retrain Model

### Script Training Sudah Disiapkan

File: `training/train_from_mysql.py`

**Yang Perlu Diperbaiki**:
Training process NCB Model sangat kompleks. Perlu:

1. Data preprocessing
2. Feature extraction
3. Build encoder architecture
4. Create contrastive pairs
5. Training loop dengan TensorFlow
6. Save model & index

### Opsi Lebih Mudah: Manual Training

1. **Export 64 produk ke CSV untuk splits**:

```python
cd ml-recommendation-service
python scripts/export_db_to_csv.py
```

2. **Run training standard**:

```python
python training/train_ncb_v4.py
```

3. **Update .env model version**:

```
MODEL_VERSION=ncb_v4_mysql
```

## Alternatif: Keep Current Setup

**Kelebihan model 700 produk**:

- ✅ Model sudah trained dengan baik
- ✅ Pola similarities sudah dipelajari
- ✅ On-the-fly encoding kerja untuk produk baru
- ✅ Bisa recommend produk lain yang mirip secara semantic

**Kekurangan**:

- ❌ Tidak bisa return produk yang exact match dari database
- ❌ Recommendations based on similarity ke 700 produk lama
- ❌ Perlu fallback strategy untuk produk baru

## Recommendation: Hybrid Approach

### Implementasi Fallback Strategy

File sudah ada: `inference/fallback_strategy.py`

**Update API** untuk gunakan fallback saat on-the-fly encoding:

```python
# Di API main.py
if not similar_results or len(similar_results) == 0:
    # Gunakan fallback: same category products
    from inference.fallback_strategy import FallbackStrategy
    fallback = FallbackStrategy(products_df=data_loader.load_products())
    similar_results = fallback.get_same_category_products(
        product_id=product_id,
        top_k=top_k
    )
```

## Next Steps

**Short Term** (Sekarang):

1. ✅ On-the-fly encoding sudah jalan
2. ⏳ Implement fallback untuk produk baru
3. ⏳ Return same-category products sebagai recommendations

**Long Term** (Setelah production):

1. Retrain model dengan produk database yang sudah stabil
2. Schedule periodic retraining (weekly/monthly)
3. A/B testing: ML recommendations vs rule-based

## Testing

Server sudah jalan di: `http://localhost:8000`

### Test Endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Similar products (dengan on-the-fly encoding)
curl http://localhost:8000/v1/recommendations/similar/{product_id}?top_k=5

# Bundle recommendations
curl -X POST http://localhost:8000/v1/recommendations/bundle?top_k=5 \
  -H "Content-Type: application/json" \
  -d '{"productIds":["uuid1","uuid2"]}'
```

## Status Integrasi

✅ Database MySQL connected
✅ Model loaded (700 products indexed)
✅ On-the-fly encoding working
✅ API endpoints responding (200 OK)
⚠️ Metadata matching (need fallback implementation)
⏳ Frontend integration (next step)
