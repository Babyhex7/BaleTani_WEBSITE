# 📚 BaleTani Database Seeding Guide

## Ringkasan
Dokumentasi lengkap tentang proses seeding database BaleTani dengan data sample untuk development dan testing.

---

## 🎯 Data yang Telah Diseedkan

### 1. **Admin & Roles** ✅
- **Total Roles**: 8
  - `super_admin` - Admin utama dengan akses penuh
  - `super_whatsapp_admin` - Admin WhatsApp khusus
  - `super_cashier` - Kasir utama
  - `super_inventory_admin` - Admin inventory utama
  - `whatsapp_admin` - Admin WhatsApp
  - `cashier` - Kasir standar
  - `finance_admin` - Admin keuangan
  - `inventory_admin` - Admin inventory standar

- **Total Admin Accounts**: 8 (satu per role)
  - Password default: `admin12345`
  - Lihat: [DAFTAR_AKUN_ADMIN.md](./DAFTAR_AKUN_ADMIN.md)
  - Lihat: [TESTING_ADMIN_ACCOUNTS.md](./TESTING_ADMIN_ACCOUNTS.md)

### 2. **Products & Categories** ✅
- **Total Categories**: 9
  - Seafood (Ikan & Udang)
  - Daging & Ayam
  - Telur
  - Bumbu Dapur
  - Sayuran
  - Buah-buahan
  - Kacang-kacangan
  - Bahan Pokok
  - Olahan Kedelai

- **Total Products**: 60
  - Pricing: Rp 3,000 - Rp 85,000
  - Stock: Random 10-110 unit per produk
  - Shelf Life: Auto-calculated per kategori (Ikan: 3 hari, Bahan Pokok: 180 hari)

### 3. **Customers** ✅
- **Total Customers**: 10
  - Full names: Indonesian customer names
  - Phone numbers: Normalized format (628xxxxx)
  - Password default: `customer12345`
  - Addresses: Various cities (Jakarta, Bandung, Surabaya, dll)

**Sample Customers:**
| No | Nama | Phone | Kota | Status |
|----|------|-------|------|--------|
| 1 | Ibu Siti Nurhaliza | 6281234567890 | Jakarta | Active |
| 2 | Pak Ahmad Wijaya | 6282345678901 | Jakarta | Active |
| 3 | Ibu Rina Kartika | 6283456789012 | Bandung | Active |
| 4 | Pak Budi Santoso | 6284567890123 | Surabaya | Active |
| 5 | Ibu Dewi Lestari | 6285678901234 | Medan | Active |
| 6 | Pak Rudi Hermawan | 6286789012345 | Makassar | Active |
| 7 | Ibu Susi Wijayanti | 6287890123456 | Yogyakarta | Active |
| 8 | Pak Hendra Gunawan | 6288901234567 | Bekasi | Active |
| 9 | Ibu Lina Permata | 6289012345678 | Semarang | Active |
| 10 | Pak Yatno Sutrisno | 6280123456789 | Tangerang | Active |

### 4. **Discounts** ✅
- **Total Discounts**: 5

| Nama Diskon | Tipe | Nilai | Periode |
|------------|------|-------|---------|
| Diskon Ikan 20% | Percentage | 20% | Apr 1-30, 2026 |
| Diskon Sayuran Rp. 5000 | Fixed | Rp 5,000 | Apr 1-30, 2026 |
| Diskon Telur 15% | Percentage | 15% | Apr 15 - May 15, 2026 |
| Diskon Bahan Pokok Rp. 10000 | Fixed | Rp 10,000 | Apr 1 - May 31, 2026 |
| Promo Buah 25% | Percentage | 25% | Apr 20 - May 20, 2026 |

### 5. **FAQs (Frequently Asked Questions)** ✅
- **Total FAQs**: 8
  - Categories: Pemesanan, Pengiriman, Pembayaran, Produk, Keluhan, Program

**Topics:**
1. Bagaimana cara melakukan pemesanan?
2. Apakah ada biaya pengiriman?
3. Berapa lama waktu pengiriman?
4. Apa yang harus dilakukan jika produk rusak?
5. Metode pembayaran apa saja yang tersedia?
6. Apakah produk organik?
7. Bagaimana garansi kesegaran produk?
8. Apakah ada program member atau loyalty?

### 6. **Contact Messages** ✅
- **Total Contact Messages**: 5
  - 3 Resolved messages
  - 2 Pending messages

**Sample Messages:**
| Pengirim | Subject | Status |
|----------|---------|--------|
| Muhammadly Ahmad | Pertanyaan kualitas produk | Resolved |
| Sinta Wijaya | Komplain pengiriman | Resolved |
| Bobby Pratama | Feedback positif | Resolved |
| Cindy Santoso | Saran produk baru (Daging Sapi) | Pending |
| Dennis Wijaya | Pertanyaan harga grosir | Pending |

### 7. **Sample Orders** ✅
- **Total Sample Orders**: 5
- **Status Distribution**:
  - Pending: ~33%
  - Confirmed: ~33%
  - Completed: ~33%
- **Payment Status**: Mix of confirmed and pending
- **Order Items**: 1-3 items per order
- **Total Amount**: Random based on selected products

### 8. **Procurements** ✅
- **Total Procurements**: 3
- **Status Distribution**:
  - Pending: 1
  - Approved: 1
  - Completed: 1
- **Procurement Items**: 2-4 items per procurement
- **Cost Calculation**: 60% of selling price
- **Expiry Dates**: Random 10-40 days ahead

---

## 🚀 Cara Menjalankan Seeding

### Option 1: Seed Semua Data (Recommended)
```bash
npm run seed:comprehensive
```
Menjalankan:
- ✅ 10 Customer accounts
- ✅ 5 Discounts dengan product mappings
- ✅ 8 FAQs
- ✅ 5 Contact messages
- ✅ 5 Sample orders dengan order items & payments
- ✅ 3 Procurements dengan items

### Option 2: Seed Basic Data (Admin + Roles + Products)
```bash
npm run seed
```
Menjalankan:
- ✅ 8 Roles
- ✅ 8 Admin accounts
- ✅ 60 Products dengan 9 Categories

### Option 3: Seed Admin Saja
```bash
npm run seed:admin
```
Hanya membuat 8 admin accounts dengan semua roles.

### Option 4: Full Data Seeder
```bash
npm run seed:all
```
Orchestrator yang menjalankan semua seeder dalam urutan yang tepat.

---

## 📊 Database Statistics

Setelah semua seeding dijalankan:

```
📈 Database Statistics:
   • Roles: 8
   • Admins: 8
   • Products: 60
   • Categories: 9
   • Customers: 10
   • Orders: 5
   • Order Items: ~8-10
   • Discounts: 5
   • FAQs: 8
   • Contact Messages: 5
   • Procurements: 3
   • Procurement Items: ~8-10
```

---

## 🧪 Testing dengan Sample Data

### 1. Test Customer Login
```bash
# Gunakan salah satu customer account
Phone: 6281234567890
Password: customer12345
```

### 2. Test Admin Login
```bash
# Gunakan salah satu admin account
Phone: 6281234567890 (Admin account)
Password: admin12345
```

Lihat [DAFTAR_AKUN_ADMIN.md](./DAFTAR_AKUN_ADMIN.md) untuk detail semua admin accounts.

### 3. Test Order Creation
1. Login sebagai customer
2. Check sample 60 products dari 9 categories
3. Buat order baru dengan produk sample
4. Admin bisa confirm dan track order

### 4. Test Discount Application
Admin bisa:
- Assign discount "Diskon Ikan 20%" ke semua ikan
- Apply percentage/fixed amount discounts
- Set date ranges untuk seasonal promotions

### 5. Test FAQ System
Customer bisa:
- View 8 FAQs tersedia
- Filter by category
- Admin bisa manage (add/edit/delete)

### 6. Test Contact Messages
Customer bisa:
- Submit contact message
- View 5 sample messages di admin
- Admin reply ke pending messages

---

## ⚠️ Important Notes

### Phone Number Format
- Format yang digunakan: `628xxxxx` (normalized)
- Format yang TIDAK digunakan: `+628xxxxx`, `08xxxxx`
- Semua phone numbers di-normalize otomatis oleh `normalizePhoneNumber()` helper

### Timestamps
- Semua data menggunakan UTC timezone
- created_at, updated_at di-set otomatis
- FAQ menggunakan `createdAt` dan `updatedAt` (camelCase)

### Idempotent Seeding
- Semua seeder menggunakan `findOrCreate()` pattern
- Aman untuk dijalankan berkali-kali
- Data existing tidak akan di-duplicate
- Jika customer sudah ada, akan di-skip

### Password Hashing
- Customer password: `customer12345` → di-hash dengan bcrypt
- Admin password: `admin12345` → di-hash dengan bcrypt
- Password tidak disimpan plaintext di database

---

## 🔄 Re-running Seeds

Jika ingin re-seed (clear dan populate ulang):

### Step 1: Drop semua tables
```bash
# Login ke MySQL console
mysql -u root -p

# Select database
USE baletani;

# Drop semua tables (caution!)
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS procurements, procurement_items;
DROP TABLE IF EXISTS orders, order_items, order_status_histories;
DROP TABLE IF EXISTS payments_detail;
DROP TABLE IF EXISTS discounts, products_discounts;
DROP TABLE IF EXISTS products, categories;
DROP TABLE IF EXISTS admins, roles;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS schema_migrations;

EXIT;
```

### Step 2: Re-run migrations
```bash
npm run migrate
```

### Step 3: Re-run seeds
```bash
npm run seed:comprehensive
```

---

## 📝 Seeding Scripts Location

- [backend/seeders/roleSeeder.js](../backend/seeders/roleSeeder.js) - Seeds 8 roles
- [backend/seeders/adminSeeder.js](../backend/seeders/adminSeeder.js) - Seeds 8 admin accounts
- [backend/seeders/comprehensiveDataSeeder.js](../backend/seeders/comprehensiveDataSeeder.js) - Seeds customers, discounts, FAQs, contacts, orders, procurements
- [backend/scripts/seedProducts.js](../backend/scripts/seedProducts.js) - Seeds 60 products & 9 categories
- [backend/seeders/index.js](../backend/seeders/index.js) - Main orchestrator
- [backend/seeders/fullDataSeeder.js](../backend/seeders/fullDataSeeder.js) - Full workflow seeder

---

## 🚀 Next Steps

1. **Start Backend**
   ```bash
   npm run dev
   ```
   Server akan run di `http://localhost:3000`

2. **Start Frontend** (dari folder frontend)
   ```bash
   npm run dev
   ```
   Frontend akan run di `http://localhost:5173`

3. **Login & Test**
   - Test dengan admin account untuk manage inventory
   - Test dengan customer account untuk order products
   - Check orders, discounts, FAQs, dan contact messages

4. **Explore Database**
   - All data in MySQL dengan proper relationships
   - Foreign keys terhubung dengan benar
   - Timestamps untuk audit trail

---

## 💡 Tips

- Gunakan postman untuk test API endpoints
- Check database relationship dengan MySQL Workbench
- Monitor logs di backend console
- Semua sample data menggunakan realistic Indonesian names dan scenarios
- Shelf life products sudah di-calculate sesuai kategori

**Database adalah NOW READY untuk development dan testing! 🎉**
