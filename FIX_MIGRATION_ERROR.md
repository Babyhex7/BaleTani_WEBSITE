# ⚠️ FIX ERROR: Key column 'payment_expired_at' doesn't exist

## 🔴 Problem

Server crash karena Sequelize mencoba membuat index untuk kolom yang belum ada di database.

## ✅ Solution (2 Langkah)

### STEP 1: Jalankan SQL Migration di Database

**Buka phpMyAdmin / MySQL Workbench**, pilih database `baletani`, lalu jalankan SQL ini:

```sql
-- Add kolom payment_expired_at
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_expired_at DATETIME DEFAULT NULL
COMMENT 'Waktu expired untuk pembayaran (10 menit dari created_at)';

-- Add index untuk performance cron job
CREATE INDEX IF NOT EXISTS idx_order_payment_expired
ON orders(order_status, payment_expired_at)
COMMENT 'Index untuk cron job auto-cancel expired orders';
```

**Verifikasi berhasil:**

```sql
-- Cek kolom sudah ada
SHOW COLUMNS FROM orders LIKE 'payment_expired_at';

-- Cek index sudah ada
SHOW INDEX FROM orders WHERE Key_name = 'idx_order_payment_expired';
```

### STEP 2: Start Backend Server

```bash
cd backend
npm start
```

**Expected Output:**

```
✅ Database models synchronized successfully.
✅ Server is ready to accept connections!
⏰ Starting order auto-cancel cron job...
[AUTO-CANCEL] Payment timeout: 10 detik
[AUTO-CANCEL] Cron job dimulai, interval: 30 detik
```

## 📋 Checklist

- [ ] SQL migration berhasil (kolom `payment_expired_at` ada di table `orders`)
- [ ] Index `idx_order_payment_expired` terbuat
- [ ] Backend server start tanpa error
- [ ] Console menampilkan "Starting order auto-cancel cron job"

## 🚀 Siap Testing

Setelah 2 langkah di atas, sistem auto-cancel sudah ready untuk ditest dengan timeout 10 detik!

Lanjut ke `AUTO_CANCEL_README.md` untuk instruksi testing lengkap.
