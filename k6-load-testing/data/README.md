# Test Data Folder

Folder ini berisi data untuk load testing dalam format JSON.

## Files

- `customers.json` - 100 test customer accounts
- `products.json` - 500 products dari database
- `categories.json` - Product categories

## Generate Test Data

Untuk generate test data dari database:

```powershell
# Pastikan sudah install dependencies
npm install

# Run script generate
node scripts/generate-test-data.js
```

## Data Format

### customers.json
```json
[
  {
    "customer_id": "uuid",
    "phone_number": "6281000000001",
    "name": "Test Customer 1",
    "address": "Jl. Test No. 1, Jakarta",
    "password": "test123"
  }
]
```

### products.json
```json
[
  {
    "product_id": "uuid",
    "product_name": "Tomat Merah Segar",
    "price": 15000,
    "stock": 100,
    "category_id": "uuid"
  }
]
```

### categories.json
```json
[
  {
    "category_id": "uuid",
    "category_name": "Sayuran",
    "slug": "sayuran"
  }
]
```

## Notes

- File `customers.json` berisi plaintext password (`test123`) untuk kemudahan testing
- Data ini hanya untuk testing, **JANGAN** dipakai di production
- Re-generate data jika database berubah
