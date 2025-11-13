# 🧪 Quick Testing Guide - Procurement Feature

## 📋 Pre-requisites

1. ✅ Backend server running on `http://localhost:5000`
2. ✅ Frontend running on `http://localhost:5173`
3. ✅ Database migration completed
4. ✅ Login sebagai admin (any role)

---

## 🚀 Step-by-Step Testing

### 1. Run Database Migration

```bash
cd backend
node scripts/migrateProcurementTable.js
```

**Expected Output:**
```
🚀 Starting procurement table migration...
➕ Adding procurement_type column...
✅ procurement_type column added
➕ Adding deleted_at column...
✅ deleted_at column added
...
✨ Migration completed successfully!
```

---

### 2. Test Procurement List Page

1. Login ke admin dashboard
2. Navigate ke **Procurement Management** di sidebar
3. URL: `http://localhost:5173/admin/procurements`

**Expected:**
- ✅ Page loads without errors
- ✅ Stats cards showing: Total, Pending, Approved, Total Items
- ✅ Filter section with: Search, Status, Type, Date range
- ✅ Table with procurement list (atau "Belum ada data" jika kosong)
- ✅ "Buat Pengadaan" button di top-right

---

### 3. Test Create Procurement

1. Click **"Buat Pengadaan"** button
2. Modal form terbuka

**Fill the form:**
- Tanggal Pengadaan: Today's date
- Tipe Pengadaan: `Online`
- Supplier: `Test Supplier` (optional)
- Items:
  - Produk: Pilih produk dari dropdown
  - Jumlah: `10`
  - Harga/Unit: `50000`
  - Expiry: Leave empty (auto-calculate)

3. Click **"Buat Pengadaan"**

**Expected:**
- ✅ Toast: "Pengadaan berhasil dibuat"
- ✅ Modal closes
- ✅ New procurement appears in list
- ✅ Status: "Menunggu" (Pending)
- ✅ Kode: `PROC-20251113-XXX`

**Verify in Database:**
```sql
SELECT * FROM procurements ORDER BY created_at DESC LIMIT 1;
SELECT * FROM procurement_items WHERE procurement_id = 'xxx';
SELECT * FROM products WHERE id = 'xxx'; -- Check total_stock increased
SELECT * FROM stock_movements_reporting WHERE reference_type = 'procurement' ORDER BY created_at DESC LIMIT 1;
```

---

### 4. Test View Detail

1. Click **Eye icon** pada procurement yang baru dibuat
2. Modal detail terbuka

**Expected:**
- ✅ General info: Date, Type, Supplier, Status
- ✅ Created by: Your admin name
- ✅ Items table dengan list produk
- ✅ Total amount correct
- ✅ Action buttons:
  - If role = super_admin/super_inventory_admin: Approve, Reject, Edit, Delete
  - If other role: Edit, Delete only

---

### 5. Test Edit Procurement (Pending Only)

1. From detail modal, click **"Edit"**
2. Form modal terbuka dengan data existing

**Modify:**
- Change Supplier: `Updated Supplier`
- Change first item quantity: `15`
- Add new item row

3. Click **"Simpan Perubahan"**

**Expected:**
- ✅ Toast: "Pengadaan berhasil diupdate"
- ✅ Modal closes
- ✅ Detail updated in list
- ✅ Stock recalculated (old reversed, new added)

**Verify in Database:**
```sql
-- Check stock movements
SELECT * FROM stock_movements_reporting 
WHERE reference_id = 'procurement_id' 
ORDER BY created_at DESC;
-- Should see: adjustment (reverse) + procurement_in (new)
```

---

### 6. Test Approval System

#### A. Approve Procurement

**Login sebagai Super Inventory Admin atau Super Admin:**

1. View detail procurement yang masih Pending
2. Click **"Setujui"** button
3. Confirm dialog

**Expected:**
- ✅ Toast: "Pengadaan berhasil disetujui"
- ✅ Status badge changes to "Disetujui" (green)
- ✅ Approved by & approved at info appears
- ✅ Edit/Delete buttons hilang (read-only)

**Verify in Database:**
```sql
SELECT status, approved_by, approved_at 
FROM procurements 
WHERE id = 'xxx';
-- status = 'approved', approved_by = your admin_id, approved_at = now
```

#### B. Reject Procurement

1. Create new procurement (status: Pending)
2. View detail
3. Click **"Tolak"** button
4. Input rejection reason: `Harga terlalu mahal`

**Expected:**
- ✅ Toast: "Pengadaan berhasil ditolak"
- ✅ Status badge changes to "Ditolak" (red)
- ✅ Rejection reason displayed
- ✅ Stock dikurangi (reversed)

**Verify in Database:**
```sql
SELECT status, rejected_by, rejected_at, rejection_reason 
FROM procurements 
WHERE id = 'xxx';

-- Check stock movement
SELECT * FROM stock_movements_reporting 
WHERE reference_type = 'procurement_rejected' 
AND reference_id = 'xxx';
```

---

### 7. Test Soft Delete

1. Create new procurement (status: Pending)
2. View detail
3. Click **"Hapus"** button
4. Input reason: `Data duplikat` (or leave empty)

**Expected:**
- ✅ Toast: "Pengadaan berhasil dihapus"
- ✅ Procurement hilang dari list (filtered out)
- ✅ Stock tidak berubah (historis)

**Verify in Database:**
```sql
SELECT * FROM procurements WHERE id = 'xxx';
-- deleted_at NOT NULL

SELECT * FROM soft_delete_logs 
WHERE table_name = 'procurements' AND record_id = 'xxx';
-- Log entry exists
```

---

### 8. Test Restore

1. To view deleted procurement, run query:
```sql
SELECT * FROM procurements WHERE deleted_at IS NOT NULL;
```

2. Get the procurement ID
3. Use API directly or modify UI to show deleted:
```http
POST http://localhost:5000/api/admin/procurements/{id}/restore
Authorization: Bearer {your_token}
```

**Expected:**
- ✅ Response: "Pengadaan berhasil dipulihkan"
- ✅ Procurement appears in list again
- ✅ deleted_at = NULL

---

### 9. Test Filters

#### A. Search Filter
- Input: `PROC-2025` → Shows procurements with matching code
- Input: `Test Supplier` → Shows procurements with matching supplier

#### B. Status Filter
- Select: `Pending` → Shows only pending procurements
- Select: `Approved` → Shows only approved procurements
- Select: `Rejected` → Shows only rejected procurements

#### C. Type Filter
- Select: `Online` → Shows only online procurements
- Select: `Offline` → Shows only offline procurements

#### D. Date Range Filter
- From: `2025-11-01`, To: `2025-11-13`
- Shows procurements within date range

---

### 10. Test Role-Based Access

#### Super Admin / Super Inventory Admin
- ✅ Can create, edit, view, approve, reject, delete, restore
- ✅ Approve/Reject buttons visible in detail modal

#### Other Roles
- ✅ Can create, edit (own data), view, delete (own data)
- ❌ Cannot see Approve/Reject buttons

**Test:**
1. Login with different roles
2. Verify button visibility
3. Try API calls directly (should get 403 for restricted actions)

---

## 🎯 Expected Results Summary

| Action | Expected Result | Database Check |
|--------|----------------|----------------|
| Create Procurement | Success toast, new entry in list | procurements, procurement_items, stock increased |
| Edit Procurement | Success toast, data updated | procurement_items updated, stock adjusted |
| Approve Procurement | Status = Approved, read-only | approved_by, approved_at filled |
| Reject Procurement | Status = Rejected, stock reversed | rejected_by, rejected_at, rejection_reason filled |
| Delete Procurement | Entry hidden, soft deleted | deleted_at NOT NULL, soft_delete_logs entry |
| Restore Procurement | Entry visible again | deleted_at = NULL |
| Filter by Status | Only matching status shown | - |
| Filter by Type | Only matching type shown | - |
| Filter by Date | Only procurements in range shown | - |
| Search | Matching codes/suppliers shown | - |

---

## 🐛 Common Issues & Solutions

### Issue 1: "procurement_type column doesn't exist"
```bash
node backend/scripts/migrateProcurementTable.js
```

### Issue 2: "Cannot read property 'full_name' of undefined"
**Solution**: Check model associations in `backend/src/models/index.js`

### Issue 3: Products dropdown empty
**Solution**: Make sure products exist in database:
```sql
SELECT COUNT(*) FROM products WHERE is_active = 1;
```

### Issue 4: Approval buttons tidak muncul
**Solution**: Check user role in localStorage:
```javascript
// In browser console
JSON.parse(localStorage.getItem('baletani-admin-auth-storage'))
```

---

## ✅ Testing Checklist

- [ ] Migration script runs successfully
- [ ] Page loads without errors
- [ ] Create procurement works
- [ ] Edit procurement works
- [ ] View detail works
- [ ] Approve works (Super Inventory Admin)
- [ ] Reject works (Super Inventory Admin)
- [ ] Delete works (soft delete)
- [ ] Restore works
- [ ] Search filter works
- [ ] Status filter works
- [ ] Type filter works
- [ ] Date range filter works
- [ ] Stock auto-updates correctly
- [ ] Role-based access control works
- [ ] All toasts display correctly
- [ ] Pagination works

---

## 📞 Support

Jika ada issue saat testing:
1. Check browser console for errors
2. Check backend terminal for error logs
3. Verify database schema dengan migration script
4. Check API responses di Network tab

**Happy Testing! 🎉**
