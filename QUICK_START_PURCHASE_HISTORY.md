# 🚀 Quick Start Guide - Purchase History Feature

## ✅ Sudah Selesai

### 1. Database

✅ Tabel `payment_details` sudah dibuat
✅ Tabel `orders` sudah diupdate dengan field baru
✅ Tabel `order_status_history` sudah dibuat
✅ Indexes sudah ditambahkan

### 2. Backend

✅ Model `PaymentDetail` sudah dibuat
✅ Controller `customerOrderHistory` sudah dibuat dengan endpoints:

- GET `/api/customer/orders/history` - List orders dengan filter
- GET `/api/customer/orders/history/:id` - Detail order
- POST `/api/customer/orders/:id/reorder` - Beli lagi
- PUT `/api/customer/orders/:id/cancel` - Batalkan order

✅ Routes sudah dikonfigurasi

### 3. Frontend

✅ Components sudah dibuat:

- `OrderStats.jsx` - Statistik cards
- `OrderFilters.jsx` - Filter & search
- `OrderCard.jsx` - Card single order
- `OrderDetailModal.jsx` - Modal detail lengkap

✅ Page `PurchaseHistory.jsx` sudah dibuat
✅ Route `/purchase-history` sudah ditambahkan
✅ Navigation di ProfilePage sudah ditambahkan

---

## 🎯 Cara Mengakses

### Customer:

1. Login sebagai customer
2. Klik pada nama/avatar di navbar
3. Akan muncul dropdown, pilih "Pesanan Saya"
4. Atau langsung akses: `http://localhost:5173/purchase-history`

### Atau dari Profile:

1. Login sebagai customer
2. Klik "Profile" di navbar
3. Di halaman profile, klik tab "Pesanan Saya"

---

## 🔧 Fitur yang Tersedia

### Filter & Search

- Search by order number atau nama produk
- Filter by status (Pending, Processing, Completed, dll)
- Filter by date range (7 hari, 30 hari, 90 hari)
- Sort by (Terbaru, Terlama, Harga Tertinggi, Terendah)

### Statistics

- Total Pesanan
- Total Belanja (Rupiah)
- Pesanan Selesai
- Pesanan Pending

### Order Card

- Menampilkan info order
- Status badge berwarna
- Preview produk (max 3 items)
- Total amount
- Button "Lihat Detail" dan "Beli Lagi"

### Order Detail Modal

- Info lengkap order
- Timeline status order
- Info pengiriman
- List produk lengkap dengan gambar
- Rincian pembayaran
- Virtual Account (jika bank transfer)
- Button "Hubungi Penjual" (WhatsApp)
- Button "Beli Lagi"
- Button "Batalkan Pesanan" (jika status pending/paid)

---

## 💳 Virtual Account

### Format VA:

- **BRI**: `002[timestamp][random]`
- **BCA**: `014[timestamp][random]`
- **MANDIRI**: `008[timestamp][random]`

### Contoh:

`00220251106123456789012`

### Expiry:

- 24 jam dari waktu order dibuat
- Ditampilkan di detail modal

---

## 📱 Testing

### 1. Buat Order Dummy (Manual)

Untuk testing, insert dummy data ke database:

```sql
-- Insert dummy order
INSERT INTO orders (
  id, order_number, customer_id, customer_name, customer_phone,
  transaction_type, payment_method, delivery_method,
  item_subtotal, delivery_fee, discount_amount, total_amount,
  payment_status, order_status, created_at
) VALUES (
  UUID(), 'BLT-2025-11-001', '[YOUR_CUSTOMER_ID]', 'Test Customer', '081234567890',
  'online', 'transfer', 'delivery',
  150000, 10000, 0, 160000,
  'paid', 'processing', NOW()
);

-- Insert dummy order items
INSERT INTO order_items (
  id, order_id, product_id, product_name, quantity,
  price_per_unit, subtotal, unit, product_image
) VALUES (
  UUID(), '[ORDER_ID_ABOVE]', '[PRODUCT_ID]', 'Udang Sedang', 2,
  75000, 150000, 'kg', 'udang.jpg'
);

-- Insert payment detail with VA
INSERT INTO payment_details (
  order_id, payment_method, bank_name, virtual_account,
  payment_status, amount, expired_at
) VALUES (
  (SELECT id FROM orders WHERE order_number = 'BLT-2025-11-001'),
  'bank_transfer', 'BCA', '01420251106123456789012',
  'pending', 160000, DATE_ADD(NOW(), INTERVAL 24 HOUR)
);

-- Insert status history
INSERT INTO order_status_history (
  order_id, old_status, new_status, notes
) VALUES (
  (SELECT id FROM orders WHERE order_number = 'BLT-2025-11-001'),
  'pending_payment', 'paid', 'Pembayaran dikonfirmasi'
);
```

### 2. Test Flow:

1. ✅ Login as customer
2. ✅ Access purchase history page
3. ✅ See statistics cards
4. ✅ See order list
5. ✅ Use filters (search, status, date range)
6. ✅ Click "Lihat Detail"
7. ✅ See full order detail with VA
8. ✅ Click "Beli Lagi" (check cart)
9. ✅ Click "Hubungi Penjual" (opens WhatsApp)
10. ✅ Click "Batalkan Pesanan" (if allowed)

---

## 🐛 Known Issues & Solutions

### Issue 1: Orders not loading

**Solution**: Check if:

- Backend server is running
- Customer is logged in
- Token is valid
- Database has orders for this customer

### Issue 2: Images not showing

**Solution**:

- Check image URLs in database
- Verify image path configuration
- Check CORS settings

### Issue 3: Reorder not working

**Solution**:

- Check if products still exist
- Check if products have stock
- Verify cart API is working

---

## 📝 TODO untuk Production

### Security

- [ ] Add rate limiting on endpoints
- [ ] Validate order ownership
- [ ] Sanitize search inputs
- [ ] Add CSRF protection

### Performance

- [ ] Add caching for stats
- [ ] Optimize queries with eager loading
- [ ] Add database indexes
- [ ] Implement pagination limit

### Features

- [ ] Add download invoice/receipt
- [ ] Add order rating & review
- [ ] Add live order tracking
- [ ] Add push notifications
- [ ] Add order export (CSV/Excel)

### UI/UX

- [ ] Add skeleton loaders
- [ ] Add animations
- [ ] Improve mobile experience
- [ ] Add accessibility features

---

## 📞 Need Help?

Check:

1. `PURCHASE_HISTORY_README.md` - Full documentation
2. Backend logs - `backend/src/server.js`
3. Browser console - Frontend errors
4. Database - Check data exists

---

## 🎉 Success!

Jika semua berjalan lancar, Anda sekarang memiliki:

- ✅ Purchase history page yang lengkap
- ✅ Filter & search yang powerful
- ✅ Detail modal dengan timeline
- ✅ Virtual Account integration
- ✅ Reorder functionality
- ✅ Order cancellation
- ✅ WhatsApp integration

**Happy Coding! 🚀**
