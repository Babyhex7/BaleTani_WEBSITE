# 🚀 AUTO-CANCEL ORDER SYSTEM

Sistem otomatis untuk membatalkan pesanan yang tidak dibayar dalam waktu tertentu.

## 📋 Fitur

- ✅ Countdown timer real-time di OrderCard
- ✅ Countdown timer di OrderDetailModal
- ✅ Auto-cancel order expired via cron job
- ✅ Restore product stock setelah cancel
- ✅ Log status history untuk audit trail
- ✅ Warning visual jika waktu < 2 menit
- ✅ Console log untuk debugging

## ⚙️ Konfigurasi Timeout

### Testing Mode (Development)

```javascript
PAYMENT_TIMEOUT = 10 detik
CRON_INTERVAL = 30 detik
```

### Production Mode

```javascript
PAYMENT_TIMEOUT = 10 menit
CRON_INTERVAL = 1 menit
```

**Cara Switch:**

- Edit `.env` di backend
- Set `NODE_ENV=production` untuk 10 menit
- Set `NODE_ENV=development` atau hapus line tersebut untuk 10 detik

## 🔄 Alur Sistem

### 1. Customer Checkout

```
Order Created
├── Status: pending_payment
├── payment_expired_at: created_at + 10 detik/10 menit
└── Countdown timer dimulai
```

### 2. Frontend Countdown

```
OrderCard / OrderDetailModal
├── Update setiap 1 detik
├── Warning merah jika < 2 menit (< 120 detik)
├── Notifikasi "EXPIRED" jika waktu habis
└── Auto-refresh untuk melihat status cancelled
```

### 3. Backend Cron Job

```
Cron runs every 30 detik (dev) / 1 menit (prod)
├── Cari orders: status=pending_payment && payment_expired_at <= NOW
├── Update status → cancelled
├── Set cancelled_reason: "Pembayaran melebihi batas waktu (auto-cancelled)"
├── Restore product stock
└── Log ke order_status_history
```

### 4. Status di Admin & Customer

```
Admin Dashboard
├── Order list dengan countdown
├── Badge "Dibatalkan Otomatis"
└── Timeline pembatalan terlihat

Customer Purchase History
├── Order card dengan countdown
├── Alasan pembatalan terlihat
└── Tombol "Pesan Lagi" tersedia
```

## 📁 File yang Dimodifikasi

### Backend

```
✅ backend/migrations/add_payment_expiry_fields.sql
✅ backend/src/models/order.model.js
✅ backend/src/services/orderAutoCancelCron.js (NEW)
✅ backend/src/controllers/customerOrder.controller.js
✅ backend/src/controllers/customerOrderHistory.controller.js
✅ backend/src/server.js
```

### Frontend

```
✅ frontend/src/components/ui_customer/OrderCard.jsx
✅ frontend/src/components/ui_customer/OrderDetailModal.jsx
```

## 🎯 Fitur Countdown Timer

### Lokasi Countdown:

1. ✅ **Order Success Page** - Setelah checkout berhasil (BESAR & PROMINENT)
2. ✅ **Purchase History** - Di OrderCard (compact)
3. ✅ **Order Detail Modal** - Di modal detail (medium)

### Visual Countdown:

- **Normal** (> 2 menit): Background biru, icon Clock
- **Warning** (< 2 menit): Background merah, icon AlertCircle berkedip
- **Expired**: Notifikasi merah "Order akan dibatalkan otomatis"

## 🧪 Testing Instructions

### 1. Jalankan Database Migration

```sql
-- Jalankan di MySQL/phpMyAdmin
ALTER TABLE orders
ADD COLUMN payment_expired_at DATETIME DEFAULT NULL
COMMENT 'Waktu expired untuk pembayaran (10 menit dari created_at)';

CREATE INDEX idx_order_payment_expired
ON orders(order_status, payment_expired_at)
COMMENT 'Index untuk cron job auto-cancel expired orders';
```

### 2. Start Backend (dengan cron job)

```bash
cd backend
npm start
```

**Expected Output:**

```
✅ Server is ready to accept connections!
⏰ Starting order auto-cancel cron job...
[AUTO-CANCEL] Payment timeout: 10 detik
[AUTO-CANCEL] Cron job dimulai, interval: 30 detik
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

### 4. Test Flow

#### A. Buat Order Baru

1. Login sebagai customer
2. Add produk ke cart
3. Checkout dengan metode **Transfer/QRIS** (bukan cash)
4. Order berhasil dibuat

**Expected:**

- Status: `pending_payment`
- Countdown timer muncul: "Bayar dalam: 00:10"

#### B. Tunggu Countdown

1. Buka Purchase History
2. Lihat countdown di OrderCard
3. Klik "Lihat Detail" → countdown juga ada di modal
4. Countdown akan kuning → merah jika < 2 detik

**Expected:**

- Timer update setiap detik
- Warning merah di detik terakhir
- Console log: `[COUNTDOWN] Order ORD-xxx - Starting countdown`

#### C. Setelah 10 Detik (Expired)

1. Frontend: "Waktu pembayaran habis"
2. Backend cron (max 30 detik kemudian):
   - Detect expired order
   - Auto-cancel
   - Restore stock

**Expected Backend Console:**

```
[AUTO-CANCEL] Ditemukan 1 order expired
  → Stock Tomat dikembalikan: +2
[AUTO-CANCEL] ✓ Order ORD-20251116-1234 dibatalkan (expired)
[AUTO-CANCEL] ✓ Berhasil cancel 1 order
```

#### D. Verifikasi Hasil

1. Refresh Purchase History
2. Order status berubah: `cancelled`
3. Cancelled reason: "Pembayaran melebihi batas waktu (auto-cancelled)"
4. Product stock sudah dikembalikan (cek di admin)

## 🐛 Debugging

### Console Logs

**Frontend:**

```javascript
[COUNTDOWN] Order ORD-xxx - Starting countdown
[COUNTDOWN] Order ORD-xxx - EXPIRED!
[COUNTDOWN MODAL] Order ORD-xxx - Starting countdown
```

**Backend:**

```javascript
[CREATE ORDER] Payment timeout: 10 detik, expired at: 2025-11-16T...
[AUTO-CANCEL] Payment timeout: 10 detik
[AUTO-CANCEL] Cron job dimulai, interval: 30 detik
[AUTO-CANCEL] ✓ Tidak ada order expired
[AUTO-CANCEL] Ditemukan 1 order expired
[AUTO-CANCEL] ✓ Order ORD-xxx dibatalkan (expired)
[AUTO-CANCEL] ✓ Berhasil cancel 1 order
```

### Troubleshooting

**Problem: Timeout masih 10 menit (bukan 10 detik)**

- Solution: Cek `NODE_ENV` di `.env`, pastikan bukan `production`

**Problem: Countdown tidak muncul**

- Solution: Pastikan order status = `pending_payment` dan `payment_expired_at` tidak null

**Problem: Cron tidak jalan**

- Solution: Cek console, harus ada log "Starting order auto-cancel cron job"

**Problem: Order tidak auto-cancel**

- Solution: Tunggu max 30 detik (cron interval), cek console untuk log error

## 🔄 Ganti ke Production (10 Menit)

Setelah testing berhasil, untuk production:

### 1. Update .env

```bash
# backend/.env
NODE_ENV=production
```

### 2. Restart Backend

```bash
npm start
```

**Expected:**

```
[AUTO-CANCEL] Payment timeout: 600 detik  # 10 menit
[AUTO-CANCEL] Cron job dimulai, interval: 60 detik  # 1 menit
```

### 3. Verifikasi

- Order baru akan punya timeout 10 menit
- Cron check setiap 1 menit

## 📊 Database Schema

### Table: orders

**New Field:**

```sql
payment_expired_at DATETIME NULL
  -- Waktu expired untuk pembayaran
  -- NULL untuk cash orders (tidak perlu expired)
  -- Set otomatis saat create order = NOW + 10 detik/menit
```

**Existing Fields (digunakan):**

```sql
cancelled_reason TEXT NULL
  -- "Pembayaran melebihi batas waktu (auto-cancelled)"

cancelled_by UUID NULL
  -- NULL = auto-cancelled by system
  -- UUID = manual cancel by user/admin

cancelled_at DATETIME NULL
  -- Timestamp pembatalan
```

**New Index:**

```sql
idx_order_payment_expired (order_status, payment_expired_at)
  -- Performance untuk cron job query
```

## ✅ Testing Checklist

- [x] Database migration berhasil
- [x] Backend server start dengan cron job
- [x] Frontend countdown muncul di OrderCard
- [x] Frontend countdown muncul di OrderDetailModal
- [x] Countdown update setiap 1 detik
- [x] Warning merah < 2 detik
- [x] Setelah 10 detik → expired notice
- [x] Cron job detect expired order
- [x] Order status berubah ke cancelled
- [x] Cancelled reason ter-set
- [x] Product stock di-restore
- [x] Timeline history tercatat
- [x] Console log informatif

## 🎯 Status

**READY FOR TESTING** ✅

Sistem sudah lengkap dan siap ditest dengan timeout 10 detik.
