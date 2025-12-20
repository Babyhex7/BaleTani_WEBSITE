# 🧠 ML Recommendation Service - BaleTani

Sistem rekomendasi berbasis Neural Content-Based Filtering untuk platform e-commerce BaleTani.

## 📁 Struktur Folder

```
ml-recommendation-service/
├── config/              # Konfigurasi aplikasi
│   ├── settings.py      # Environment variables & settings
│   ├── database.py      # Database connection (MySQL/CSV)
│   └── logging_config.py # Logging setup
│
├── data/                # Data management
│   ├── raw/             # CSV data mentah
│   │   ├── products.csv
│   │   ├── orders.csv
│   │   └── customers.csv
│   ├── processed/       # Data yang sudah diproses
│   ├── data_loader.py   # Load data dari CSV/MySQL
│   ├── data_preprocessor.py  # Preprocessing & cleaning
│   └── feature_extractor.py  # Feature engineering
│
├── models/              # Model architectures
│   ├── content_based/   # Neural Content-Based Filtering
│   ├── collaborative/   # [FUTURE] Collaborative Filtering
│   └── hybrid/          # [FUTURE] Hybrid Models
│
├── training/            # Training scripts
│   ├── train_ncb.py     # Train NCB model
│   ├── evaluate.py      # Model evaluation
│   └── hyperparameter_tuning.py
│
├── inference/           # Inference engine
│   ├── recommender.py   # Main recommendation logic
│   ├── cache_manager.py # Redis caching
│   └── fallback_strategy.py
│
├── api/                 # FastAPI application
│   ├── routes/          # API endpoints
│   ├── schemas/         # Pydantic schemas
│   └── middleware/      # Auth, rate limiting, etc.
│
├── utils/               # Utility functions
├── tests/               # Unit tests
├── notebooks/           # Jupyter notebooks (EDA)
├── models_artifacts/    # Saved models (.h5, .pkl)
└── logs/                # Application logs
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ml-recommendation-service
pip install -r requirements.txt
```

### 2. Setup Environment Variables

```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env sesuai kebutuhan
notepad .env
```

### 3. Generate Dummy Data (Development)

```bash
cd data
python generate_orders.py
```

### 4. Test Data Loader

```bash
python -c "from data.data_loader import data_loader; products, orders, customers = data_loader.load_all_data(); print(f'Products: {len(products)}, Orders: {len(orders)}, Customers: {len(customers)}')"
```

## 📊 Dataset

### Products (57 items)

- **Kategori:** Protein Laut, Protein Daging, Protein Telur, Bumbu, Sayur, Buah, Bahan Kering
- **Price Range:** Rp 500 - Rp 85,000
- **Shelf Life:** 2 hari (ikan) sampai 365 hari (bahan kering)

### Orders (500 orders, ~1500 items)

- **Pattern:** 70% bundle orders, 30% random
- **Bundles:** seafood_combo, bumbu_masak, ayam_paket, sayur_sup, fruit_basket, dll
- **Status:** 95% completed, 5% cancelled

### Customers (20 customers)

- **Distribusi:** Jakarta, Bandung, Surabaya, Yogyakarta, dll
- **Registration:** November 2024 - December 2024

## 🎯 Next Steps

1. ✅ Setup folder structure
2. ✅ Generate dummy data
3. ✅ Implement data loader
4. ⏳ Feature engineering
5. ⏳ Model development
6. ⏳ API endpoints
7. ⏳ Integration dengan Express backend

## 📚 Dokumentasi Lengkap

Lihat [AI_RECOMMENDATION_DOCUMENTATION.md](../AI_RECOMMENDATION_DOCUMENTATION.md) untuk dokumentasi arsitektur lengkap.

## 🔧 Tech Stack

- **Python:** 3.11.5
- **ML Framework:** TensorFlow 2.15.0
- **API Framework:** FastAPI 0.108.0
- **Data Processing:** Pandas 2.1.4, NumPy 1.26.2
- **Caching:** Redis 7.2
- **Database:** MySQL (production) / CSV (development)

## 📝 Data Schema Alignment

Dataset CSV sudah disesuaikan dengan schema database BaleTani:

| CSV Column      | DB Column       | Type          | Description       |
| --------------- | --------------- | ------------- | ----------------- |
| product_id      | id              | INT           | Product ID        |
| name            | name            | TEXT          | Product name      |
| category        | category_id     | UUID → name   | Category via join |
| product_type    | product_type    | ENUM          | online/offline    |
| selling_price   | selling_price   | DECIMAL(12,2) | Harga jual        |
| quantity_info   | quantity_info   | STRING(100)   | Unit info         |
| shelf_life_days | shelf_life_days | INTEGER       | Masa simpan       |
| total_stock     | total_stock     | INTEGER       | Stock tersedia    |
| is_active       | is_active       | BOOLEAN       | Status aktif      |

## 🐛 Troubleshooting

### Error: "Products CSV not found"

```bash
# Generate data terlebih dahulu
cd data
python generate_orders.py
```

### Error: "Module not found"

```bash
# Install dependencies
pip install -r requirements.txt
```

### Redis connection error

```bash
# Pastikan Redis running (optional untuk development)
# Atau set REDIS_HOST="" di .env untuk disable caching
```

## 📞 Contact

Untuk pertanyaan atau issue, hubungi AI Development Team BaleTani.

---

**Last Updated:** 28 November 2025
