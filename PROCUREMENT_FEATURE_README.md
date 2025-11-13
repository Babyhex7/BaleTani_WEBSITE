# 📦 Procurement Management - BaleTani Fresh Market

## 🎯 Overview

Fitur **Procurement Management (Pengadaan Barang)** yang lengkap dengan workflow approval, soft delete, dan tracking stok otomatis. Sesuai dengan alur bisnis PRD BaleTani.

---

## ✨ Features

### ✅ Complete Features

1. **Procurement List**
   - Kode Procurement (auto-generated: PROC-YYYYMMDD-XXX)
   - Tanggal Pengadaan
   - Jenis (Online / Offline)
   - Supplier (opsional)
   - Total Nilai
   - Status (Pending / Approved / Rejected)
   - Dibuat oleh
   - Disetujui oleh (jika approved)

2. **Advanced Filters**
   - Search by kode procurement atau supplier
   - Filter by status (Pending, Approved, Rejected)
   - Filter by jenis (Online, Offline)
   - Filter by date range (dari - sampai tanggal)
   - Pagination dengan items per page

3. **Add/Edit Procurement**
   - Jenis Procurement (Online / Offline)
   - Supplier Name (opsional)
   - Tanggal Pengadaan
   - Item List (dinamis):
     - Nama Produk (dropdown dari Product List)
     - Quantity
     - Harga Beli per Unit
     - Tanggal Expiry (auto-calculated dari shelf_life_days atau manual input)
     - Subtotal (auto-calculated)
   - Total Amount (auto-calculated)

4. **Procurement Detail**
   - Informasi lengkap procurement
   - List item dengan detail produk
   - Timeline status approval
   - Catatan approval/rejection
   - Buttons: Approve / Reject / Edit / Delete / Restore

5. **Approval System**
   - Status flow: Pending → Approved/Rejected
   - Only Super Inventory Admin dapat approve/reject
   - Rejection memerlukan alasan
   - Approval/rejection tracking (who, when)

6. **Soft Delete & Restore**
   - Soft delete dengan alasan
   - Tracking deleted_by dan deleted_at
   - Restore capability untuk data yang terhapus
   - Log di soft_delete_logs table

7. **Stock Management Integration**
   - Auto update stock saat procurement dibuat
   - Auto update stock saat procurement diupdate
   - Reverse stock saat procurement ditolak
   - Stock movement tracking di stock_movements_reporting table

---

## 🗂️ File Structure

### Backend

```
backend/
├── scripts/
│   └── migrateProcurementTable.js        # Migration script
├── src/
│   ├── models/
│   │   ├── procurement.model.js          # Procurement model (updated)
│   │   ├── procurementItem.model.js      # Procurement items
│   │   ├── softDeleteLog.model.js        # Soft delete tracking
│   │   └── index.js                      # Model associations (updated)
│   ├── controllers/
│   │   └── adminProcurement.controller.js # Complete CRUD + approval
│   └── routes/
│       └── admin/
│           └── procurements.js           # All procurement routes
```

### Frontend

```
frontend/src/
├── components/ui_admin/
│   ├── ProcurementDetailModal.jsx        # Detail view modal
│   └── ProcurementFormModal.jsx          # Create/Edit form modal
└── pages/admin/
    └── ProcurementList.jsx               # Main procurement page (updated)
```

---

## 🚀 Installation & Setup

### 1. Run Database Migration

```bash
cd backend
node scripts/migrateProcurementTable.js
```

This will:
- Add `procurement_type` column (ENUM: 'online', 'offline')
- Add `deleted_at` column for soft delete
- Add `deleted_by` column for tracking
- Make `supplier_name` optional (nullable)
- Add performance indexes

### 2. Verify Database Schema

Check that `procurements` table has these columns:
```sql
- id (UUID, PK)
- procurement_number (VARCHAR, UNIQUE)
- procurement_type (ENUM: 'online', 'offline')
- supplier_name (VARCHAR, NULL)
- procurement_date (DATE)
- total_amount (DECIMAL)
- status (ENUM: 'pending', 'approved', 'rejected')
- notes (TEXT, NULL)
- created_by (UUID)
- approved_by (UUID, NULL)
- approved_at (DATETIME, NULL)
- rejected_by (UUID, NULL)
- rejected_at (DATETIME, NULL)
- rejection_reason (TEXT, NULL)
- created_at (DATETIME)
- updated_at (DATETIME)
- deleted_at (DATETIME, NULL)
- deleted_by (UUID, NULL)
```

### 3. Start Backend Server

```bash
cd backend
npm install
npm run dev
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### List Procurements
```http
GET /api/admin/procurements
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - q: string (search by procurement_number or supplier)
  - status: 'pending' | 'approved' | 'rejected'
  - type: 'online' | 'offline'
  - date_from: YYYY-MM-DD
  - date_to: YYYY-MM-DD
  - sort_by: string (default: 'created_at')
  - sort_order: 'ASC' | 'DESC' (default: 'DESC')
```

### Get Procurement Detail
```http
GET /api/admin/procurements/:id
```

### Create Procurement
```http
POST /api/admin/procurements
Body: {
  "procurement_date": "YYYY-MM-DD",
  "procurement_type": "online" | "offline",
  "supplier_name": "string" | null,
  "items": [
    {
      "product_id": "uuid",
      "quantity": number,
      "unit_price": number,
      "expiry_date": "YYYY-MM-DD" | null
    }
  ]
}
```

### Update Procurement (Pending Only)
```http
PUT /api/admin/procurements/:id
Body: {
  "procurement_date": "YYYY-MM-DD",
  "procurement_type": "online" | "offline",
  "supplier_name": "string" | null,
  "items": [...]
}
```

### Approve Procurement
```http
PUT /api/admin/procurements/:id/approve
Body: {
  "notes": "string" (optional)
}
```

### Reject Procurement
```http
PUT /api/admin/procurements/:id/reject
Body: {
  "rejection_reason": "string" (required)
}
```

### Soft Delete Procurement
```http
DELETE /api/admin/procurements/:id
Body: {
  "reason": "string" (optional)
}
```

### Restore Procurement
```http
POST /api/admin/procurements/:id/restore
```

---

## 🎭 Role-Based Access Control

### Super Admin & Super Inventory Admin
- ✅ Create procurement
- ✅ Edit procurement (pending only)
- ✅ View all procurements
- ✅ Approve procurement
- ✅ Reject procurement
- ✅ Delete procurement
- ✅ Restore procurement

### Other Roles
- ✅ Create procurement
- ✅ Edit procurement (pending only, own data)
- ✅ View all procurements
- ❌ Cannot approve/reject
- ✅ Delete procurement (own data)

---

## 🔄 Procurement Workflow

### 1. Create Procurement
```
Admin → Buat Pengadaan → Pilih Produk → Input Quantity & Harga
→ System auto-calculate Total & Expiry Date
→ Stock otomatis bertambah
→ Status: Pending
```

### 2. Approval Process
```
Pending → Super Inventory Admin Review
  → Approve: Status = Approved, Stock tetap
  → Reject: Status = Rejected, Stock dikembalikan
```

### 3. Edit Procurement (Pending Only)
```
Admin → Edit Procurement (status masih Pending)
→ System reverse stock lama
→ Input data baru
→ System update stock baru
```

### 4. Soft Delete
```
Admin → Delete Procurement
→ Input alasan (optional)
→ Data di-soft delete (deleted_at set)
→ Log di soft_delete_logs
→ Stock tidak berubah (data historis)
```

### 5. Restore
```
Admin → View Deleted Procurement
→ Restore
→ Data kembali aktif
→ deleted_at = NULL
```

---

## 🎨 UI Components

### ProcurementList (Main Page)
- **Stats Cards**: Total, Pending, Approved, Total Items
- **Filters**: Search, Status, Type, Date Range
- **Table**: Sortable columns, pagination
- **Actions**: View Detail, Edit, Delete

### ProcurementDetailModal
- **General Info**: Date, Type, Supplier, Status
- **Creator Info**: Who created, when
- **Approval Info**: Approver, approval date, notes
- **Rejection Info**: Rejector, rejection date, reason
- **Soft Delete Info**: Deleter, deleted date, reason
- **Items Table**: Product, Quantity, Price, Subtotal, Expiry
- **Actions**: Approve, Reject, Edit, Delete, Restore, Close

### ProcurementFormModal
- **General Form**: Date, Type, Supplier
- **Dynamic Items**: Add/Remove rows
- **Product Select**: Dropdown with all products
- **Auto Calculate**: Subtotal, Total Amount
- **Validation**: Required fields, min values
- **Actions**: Submit, Cancel

---

## 💾 Database Schema

### Procurements Table
```sql
CREATE TABLE procurements (
  id CHAR(36) PRIMARY KEY,
  procurement_number VARCHAR(50) UNIQUE NOT NULL,
  procurement_type ENUM('online', 'offline') NOT NULL DEFAULT 'online',
  supplier_name VARCHAR(150) NULL,
  procurement_date DATE NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  notes TEXT NULL,
  created_by CHAR(36) NOT NULL,
  approved_by CHAR(36) NULL,
  approved_at DATETIME NULL,
  rejected_by CHAR(36) NULL,
  rejected_at DATETIME NULL,
  rejection_reason TEXT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  deleted_by CHAR(36) NULL,
  INDEX idx_procurement_type (procurement_type),
  INDEX idx_status (status),
  INDEX idx_deleted_at (deleted_at),
  FOREIGN KEY (created_by) REFERENCES admins(id),
  FOREIGN KEY (approved_by) REFERENCES admins(id),
  FOREIGN KEY (rejected_by) REFERENCES admins(id),
  FOREIGN KEY (deleted_by) REFERENCES admins(id)
);
```

### Procurement Items Table
```sql
CREATE TABLE procurement_items (
  id CHAR(36) PRIMARY KEY,
  procurement_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  purchase_price_per_unit DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  expiry_date DATE NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (procurement_id) REFERENCES procurements(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 🧪 Testing Checklist

### Backend API
- [ ] GET /api/admin/procurements (list with filters)
- [ ] GET /api/admin/procurements/:id (detail)
- [ ] POST /api/admin/procurements (create)
- [ ] PUT /api/admin/procurements/:id (update)
- [ ] PUT /api/admin/procurements/:id/approve (approve)
- [ ] PUT /api/admin/procurements/:id/reject (reject)
- [ ] DELETE /api/admin/procurements/:id (soft delete)
- [ ] POST /api/admin/procurements/:id/restore (restore)

### Frontend
- [ ] View procurement list with stats
- [ ] Apply filters (search, status, type, date)
- [ ] Create new procurement
- [ ] Edit existing procurement (pending only)
- [ ] View procurement detail
- [ ] Approve procurement (Super Inventory Admin)
- [ ] Reject procurement (Super Inventory Admin)
- [ ] Delete procurement
- [ ] Restore deleted procurement
- [ ] Stock auto-update on create/edit/reject

### Stock Integration
- [ ] Create procurement → Stock bertambah
- [ ] Edit procurement → Stock update (reverse old + add new)
- [ ] Reject procurement → Stock dikurangi
- [ ] Delete procurement → Stock tidak berubah (historis)
- [ ] Check stock_movements_reporting table

---

## 📝 Notes

### Product Stock Management
- Stock **HANYA bisa diupdate** melalui fitur **Procurement**
- Di Product List, kolom "total_stock" adalah **read-only**
- Stock movement tercatat di `stock_movements_reporting` table dengan:
  - `movement_type`: 'procurement_in', 'adjustment', dll
  - `reference_id`: procurement_id
  - `reference_type`: 'procurement', 'procurement_rejected', dll

### Procurement Number Format
- Pattern: `PROC-YYYYMMDD-XXX`
- Example: `PROC-20251113-001`
- Auto-generated saat create

### Expiry Date Calculation
- Jika tidak diisi manual: `procurement_date + product.shelf_life_days`
- Bisa diisi manual untuk override

### Supplier Name
- Optional field (bisa kosong)
- Berguna untuk tracking source procurement

---

## 🎯 Future Enhancements

1. **Email Notification**: Notif ke Super Inventory Admin saat ada pending procurement
2. **Bulk Import**: Upload CSV untuk multiple items
3. **Price History**: Track perubahan harga beli dari supplier
4. **Supplier Management**: Master data supplier dengan contact info
5. **Procurement Report**: Export to Excel, PDF
6. **Low Stock Alert**: Auto-suggest procurement berdasarkan stock minimum

---

## 🐛 Troubleshooting

### Issue: "procurement_type column doesn't exist"
**Solution**: Run migration script
```bash
node backend/scripts/migrateProcurementTable.js
```

### Issue: "Cannot update stock"
**Solution**: Check product exists and total_stock column is not null

### Issue: "Approval button tidak muncul"
**Solution**: 
- Check user role: hanya super_admin & super_inventory_admin
- Check procurement status: hanya 'pending' yang bisa di-approve

### Issue: "Edit tidak berfungsi"
**Solution**: Hanya procurement dengan status 'pending' yang bisa diedit

---

## ✅ Completion Status

- ✅ Backend: Procurement Model (with soft delete & type)
- ✅ Backend: Complete CRUD Controller
- ✅ Backend: Approval/Rejection Logic
- ✅ Backend: Stock Integration
- ✅ Backend: Soft Delete & Restore
- ✅ Backend: API Routes
- ✅ Frontend: ProcurementList Component
- ✅ Frontend: ProcurementDetailModal
- ✅ Frontend: ProcurementFormModal
- ✅ Frontend: Role-Based UI
- ✅ Database: Migration Script
- ✅ Documentation: Complete README

**Status**: ✨ READY FOR TESTING & PRODUCTION ✨

---

**Author**: GitHub Copilot  
**Date**: November 13, 2025  
**Version**: 1.0.0
