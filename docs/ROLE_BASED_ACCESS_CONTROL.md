# Role-Based Access Control System - BaleTani

## 📋 Daftar Role dan Permissions

Sistem BaleTani menggunakan 8 role admin dengan permission yang berbeda-beda sesuai dengan tugas dan tanggung jawab masing-masing.

### 1. Super Admin
**Akses:** Penuh ke seluruh sistem

**Permissions:**
- ✅ CRUD Products (Create, Read, Update, Delete)
- ✅ CRUD Orders (Online & Offline)
- ✅ CRUD Users & Roles
- ✅ Approve/Reject Procurement
- ✅ View All Reports (Finance, Inventory, Sales)
- ✅ Soft Delete & Restore Data

**Alur Kerja:**
1. Login → Dashboard utama
2. Mengelola user & roles
3. Mengelola produk (products, product_images, product_discounts)
4. Mengelola transaksi penjualan (orders online & offline)
5. Approve/Reject procurement
6. Melihat laporan keuangan & inventory

---

### 2. Super WhatsApp Admin
**Fokus:** Manajemen transaksi online & data pelanggan

**Permissions:**
- ✅ CRUD Orders (Online only)
- ✅ Update Order Status (Online)
- ✅ View & Update Customer Data
- ✅ WhatsApp Integration

**Alur Kerja:**
1. Login → Dashboard transaksi online
2. Membuat order online via WhatsApp
3. Update status: checkout → paid → processing → out_for_delivery → completed
4. Mengelola data pelanggan
5. Kirim notifikasi WhatsApp otomatis

**Status Flow Online:**
```
checkout → paid → processing → out_for_delivery → completed
                                                 ↓
                                            cancelled
```

---

### 3. Super Cashier
**Fokus:** Mengelola transaksi online & offline

**Permissions:**
- ✅ CRUD Orders (Online & Offline)
- ✅ Update Order Status
- ✅ View Products & Stock
- ✅ Cancel Orders

**Alur Kerja:**
1. Login → Dashboard kasir
2. Membuat transaksi offline/online
3. Update status transaksi
4. Melihat histori transaksi
5. Cek stok produk

**Status Flow Offline:**
```
checkout → paid → completed
                    ↓
                cancelled
```

---

### 4. WhatsApp Admin
**Fokus:** Transaksi online (tanpa akses penuh)

**Permissions:**
- ✅ Create Orders (Online only)
- ✅ View Orders (Online only)
- ✅ Update Order Status (Online)
- ✅ View Customer Data (Read only)

**Alur Kerja:**
1. Membuat transaksi online setelah customer checkout
2. Melihat daftar transaksi online
3. Update status order
4. Komunikasi via WhatsApp

---

### 5. Cashier
**Fokus:** Transaksi offline di toko

**Permissions:**
- ✅ Create Orders (Offline only)
- ✅ View Orders (Offline only)
- ✅ Update Order Status (Offline)
- ✅ View Products (Read only)

**Alur Kerja:**
1. Membuat transaksi offline langsung di toko
2. Input data pelanggan (opsional)
3. Pilih produk dan jumlah
4. Pilih metode pembayaran (cash/transfer/qris)
5. Sistem auto kurangi stok
6. Cetak nota (opsional)
7. Update status hingga completed

---

### 6. Finance Admin
**Fokus:** Laporan keuangan (Read only)

**Permissions:**
- ✅ View Orders (All)
- ✅ View Procurement
- ✅ View Finance Reports
- ✅ Export Reports

**Alur Kerja:**
1. Login → Dashboard keuangan
2. Melihat laporan transaksi penjualan
3. Melihat laporan pembelian (procurement)
4. Melihat laporan stock movements
5. Export data untuk akuntansi

---

### 7. Inventory Admin
**Fokus:** Pencatatan pengadaan barang

**Permissions:**
- ✅ Create Procurement
- ✅ View Procurement
- ✅ View Products (Read only)

**Alur Kerja:**
1. Login → Modul Procurement
2. Membuat record pengadaan baru (status: pending)
3. Input detail produk (nama, qty, harga, expiry date)
4. Submit untuk approval
5. Menunggu approval dari Super Inventory Admin
6. Lihat histori pengadaan

---

### 8. Super Inventory Admin
**Fokus:** Kontrol penuh procurement & stok

**Permissions:**
- ✅ CRUD Procurement
- ✅ Approve/Reject Procurement
- ✅ CRUD Products
- ✅ View Inventory Reports

**Alur Kerja:**
1. Menerima notifikasi procurement baru (status: pending)
2. Review detail barang di procurement_items
3. Approve atau Reject:
   - **Approve** → Stok bertambah otomatis + create stock movement
   - **Reject** → Status rejected, stok tidak berubah
4. Mengelola produk (CRUD)
5. Melihat semua laporan procurement & stok

---

## 🗄️ Database Schema

### Table: users
```sql
- id (PK)
- full_name
- email (unique)
- password
- role (ENUM: customer, super_admin, super_whatsapp_admin, super_cashier, 
         whatsapp_admin, cashier, finance_admin, inventory_admin, 
         super_inventory_admin)
- phone_number
- address
- created_at
- updated_at
```

### Table: orders
```sql
- id (PK)
- user_id (FK → users)
- customer_name
- transaction_type (ENUM: online, offline)
- order_status (ENUM: checkout, paid, processing, out_for_delivery, 
                      completed, cancelled)
- total_price
- shipping_address
- payment_method
- payment_status
- notes
- created_at
- updated_at
```

### Table: procurements
```sql
- id (PK)
- procurement_number (unique)
- created_by (FK → users)
- status (ENUM: pending, approved, rejected)
- approved_by (FK → users)
- approved_at
- rejected_by (FK → users)
- rejected_at
- rejection_reason
- total_cost
- notes
- created_at
- updated_at
```

### Table: procurement_items
```sql
- id (PK)
- procurement_id (FK → procurements)
- product_id (FK → products)
- quantity
- unit_price
- total_price
- expiry_date
- created_at
- updated_at
```

### Table: stock_movements_reporting
```sql
- id (PK)
- product_id (FK → products)
- movement_type (ENUM: procurement_in, sale_out, adjustment)
- quantity
- reference_type (ENUM: procurement, order, manual)
- reference_id
- notes
- created_by (FK → users)
- created_at
- updated_at
```

---

## 🚀 Setup & Installation

### 1. Update Database Models
```bash
cd backend
npm install
```

### 2. Sync Database (⚠️ Warning: This will delete all existing data!)
```bash
npm run sync-db
```

### 3. Seed Admin Users (Optional)
```bash
npm run seed
```

### 4. Start Backend
```bash
npm run dev
```

### 5. Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### Order Management
```
GET    /api/admin/orders              - Get all orders
GET    /api/admin/orders/stats        - Get order statistics
GET    /api/admin/orders/:id          - Get single order
POST   /api/admin/orders              - Create new order
PATCH  /api/admin/orders/:id/status   - Update order status
PATCH  /api/admin/orders/:id/cancel   - Cancel order
```

### Procurement Management
```
GET    /api/admin/procurements              - Get all procurements
GET    /api/admin/procurements/stats        - Get procurement stats
GET    /api/admin/procurements/:id          - Get single procurement
POST   /api/admin/procurements              - Create procurement
PATCH  /api/admin/procurements/:id/approve  - Approve procurement
PATCH  /api/admin/procurements/:id/reject   - Reject procurement
```

---

## 🎨 Frontend Components

### New Components Created:
1. **OrderStatus.jsx**
   - `OrderStatusBadge` - Badge untuk menampilkan status
   - `OrderStatusSelector` - Dropdown untuk update status manual
   - `OrderStatusTimeline` - Timeline progress order

2. **OrderManagementNew.jsx**
   - Halaman manajemen order dengan update status manual
   - Filter by status & transaction type
   - Role-based access control

3. **ProcurementManagementNew.jsx**
   - Halaman manajemen procurement
   - Approve/Reject functionality
   - Stock auto-update on approval

### New Services:
1. **orderService.js** - API calls untuk order management
2. **procurementService.js** - API calls untuk procurement

### New Utils:
1. **rolePermissions.js** - Helper functions untuk role-based access

---

## 🔧 How to Update Order Status Manually

### Via UI (OrderManagementNew.jsx):
1. Go to Order Management page
2. Find the order you want to update
3. Click on the status dropdown in the "Status" column
4. Select the new status
5. Status will be updated automatically

### Via API:
```javascript
PATCH /api/admin/orders/:id/status
Body: {
  "order_status": "processing",
  "notes": "Order is being prepared"
}
```

---

## 📊 Order Status Flow

### Online Transaction:
```
checkout → paid → processing → out_for_delivery → completed
  ↓         ↓          ↓               ↓
cancelled cancelled cancelled     cancelled
```

### Offline Transaction:
```
checkout → paid → completed
  ↓         ↓
cancelled cancelled
```

---

## 🔐 Role-Based Access Examples

### Example 1: WhatsApp Admin trying to access offline order
```javascript
// Will be blocked with 403 Forbidden
GET /api/admin/orders/123
Response: {
  "success": false,
  "message": "You can only access online orders"
}
```

### Example 2: Inventory Admin creating procurement
```javascript
POST /api/admin/procurements
Body: {
  "items": [
    {
      "product_id": 1,
      "quantity": 100,
      "unit_price": 50000,
      "expiry_date": "2025-12-31"
    }
  ],
  "notes": "Restocking benih padi"
}
// Status will be "pending", waiting for Super Inventory Admin approval
```

### Example 3: Super Inventory Admin approving procurement
```javascript
PATCH /api/admin/procurements/1/approve
// Stock will be automatically updated
// Stock movement record will be created
```

---

## 📝 Notes

1. **Order Status Update** sudah bisa dilakukan manual via dropdown di UI
2. **Role-based filtering** sudah diterapkan di backend dan frontend
3. **Procurement approval** akan otomatis update stok produk
4. **Stock movements** tercatat otomatis saat procurement di-approve
5. Semua endpoint sudah di-protect dengan authentication & authorization

---

## 🐛 Testing

### Test Order Status Update:
1. Login as Super Cashier
2. Create offline order
3. Update status from "checkout" → "paid" → "completed"
4. Verify stock is deducted

### Test Procurement Flow:
1. Login as Inventory Admin
2. Create new procurement
3. Logout and login as Super Inventory Admin
4. Approve the procurement
5. Verify stock is increased

---

## 🎯 Next Steps

1. ✅ Implement Order Items (order_items table)
2. ✅ Add stock deduction on order completion
3. ✅ Add WhatsApp notification integration
4. ✅ Create detailed reports for Finance Admin
5. ✅ Add user management for Super Admin

---

**Last Updated:** October 22, 2025
**Version:** 2.0.0
