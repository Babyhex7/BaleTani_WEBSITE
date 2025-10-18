# 📦 DATABASE MODELS - Balétani Fresh Market

## ✅ Model yang Sudah Diupdate

### 1. **role.model.js** ✓
- Tabel: `roles`
- Primary Key: UUID
- Fitur: Soft delete (deleted_at, deleted_by)
- Relasi: One-to-Many dengan users

### 2. **admin.model.js (users table)** ✓
- Tabel: `users`
- Primary Key: UUID
- Fields: phone_number, full_name, role_id, password_hash, is_active
- Fitur: Password hashing, phone normalization, soft delete
- Relasi: BelongsTo Role

### 3. **customer.model.js** ✓
- Tabel: `customers`
- Primary Key: UUID
- Fields: phone_number, full_name, address
- **Perubahan**: Dihapus password_hash dan is_active sesuai skema baru
- Fitur: Phone normalization, soft delete

### 4. **category.model.js** ✓
- Tabel: `product_categories`
- Primary Key: UUID (diubah dari INTEGER)
- Fields: category_name, description, is_active
- **Perubahan**: UUID primary key, tambah is_active dan soft delete

### 5. **product.model.js** ✓
- Tabel: `products`
- Primary Key: UUID (diubah dari INTEGER)
- **Fields Baru**: 
  - product_type (ENUM: online, offline)
  - shelf_life_days
  - total_stock (DECIMAL 10,2)
  - selling_price (renamed from base_price)
- Fitur: Soft delete

### 6. **order.model.js** ✓
- Tabel: `orders`
- Primary Key: UUID
- **Fields Lengkap**:
  - order_number, customer_id
  - transaction_type (online/offline)
  - payment_method (cash/transfer/qris)
  - delivery_method (self_pickup/delivery)
  - delivery_address
  - item_subtotal, delivery_fee, discount_amount, total_amount
  - payment_status (pending/paid/failed)
  - order_status (checkout/paid/processing/out_for_delivery/completed/cancelled)
  - created_by, updated_by
- Fitur: Soft delete

## ✅ Model Baru yang Dibuat

### 7. **productImage.model.js** ✓
- Tabel: `product_images`
- Primary Key: UUID
- Fields: product_id, image_url, display_order
- Relasi: BelongsTo Product

### 8. **discount.model.js** ✓
- Tabel: `discounts`
- Primary Key: UUID
- Fields: discount_name, discount_type (percentage/fixed_amount), value, start_date, end_date, is_active
- Fitur: Soft delete

### 9. **productDiscount.model.js** ✓
- Tabel: `product_discounts`
- Primary Key: UUID
- **Junction Table** untuk Many-to-Many: Products ↔ Discounts
- Fields: product_id, discount_id
- Fitur: Soft delete

### 10. **procurement.model.js** ✓
- Tabel: `procurements`
- Primary Key: UUID
- Fields: 
  - procurement_number, supplier_name, procurement_date
  - total_amount, status (pending/approved/rejected), notes
  - created_by, approved_by, approved_at
  - rejected_by, rejected_at, rejection_reason
- Fitur: Approval workflow, soft delete

### 11. **procurementItem.model.js** ✓
- Tabel: `procurement_items`
- Primary Key: UUID
- Fields: procurement_id, product_id, quantity, unit, purchase_price_per_unit, subtotal, expiry_date
- Relasi: BelongsTo Procurement & Product
- Fitur: Soft delete

### 12. **cart.model.js** ✓
- Tabel: `carts`
- Primary Key: UUID
- Fields: customer_id, product_id, quantity
- **Junction Table** untuk Many-to-Many: Customers ↔ Products
- Fitur: Soft delete

### 13. **orderItem.model.js** ✓
- Tabel: `order_items`
- Primary Key: UUID
- Fields: order_id, product_id, quantity, unit, price_per_unit, discount_per_unit, subtotal
- Relasi: BelongsTo Order & Product
- Fitur: Soft delete

### 14. **softDeleteLog.model.js** ✓
- Tabel: `soft_delete_logs`
- Primary Key: UUID
- Fields: table_name, record_id, deleted_by, deleted_reason, deleted_at
- **Audit Trail** untuk semua soft delete

### 15. **stockMovement.model.js** ✓
- Tabel: `stock_movements_reporting`
- Primary Key: UUID
- Fields:
  - product_id, movement_type (procurement_in/sale_out/adjustment/expired)
  - quantity_change, stock_before, stock_after
  - reference_id, reference_type (procurement/order)
  - created_by
- **Reporting & Audit** untuk pergerakan stok
- Fitur: Soft delete

## 🔗 Relasi Database (index.js) ✓

### One-to-Many (1:N)
- ✅ Role → Users (Admin)
- ✅ Category → Products
- ✅ Product → ProductImages
- ✅ Product → ProcurementItems
- ✅ Product → OrderItems
- ✅ Customer → Orders
- ✅ Order → OrderItems
- ✅ Procurement → ProcurementItems
- ✅ User → Procurements (created_by, approved_by, rejected_by)
- ✅ User → Orders (created_by, updated_by)
- ✅ User → StockMovements (created_by)
- ✅ Product → StockMovements
- ✅ User → SoftDeleteLogs (deleted_by)

### Many-to-Many (M:N)
- ✅ Product ↔ Discount (via ProductDiscount)
- ✅ Customer ↔ Product (via Cart)

## 🎯 Konsistensi Skema

### ✅ Semua tabel utama memiliki:
- `id` UUID sebagai Primary Key
- `created_at` TIMESTAMP
- `deleted_at` TIMESTAMP (soft delete)
- `deleted_by` UUID FK → users.id

### ✅ ENUM Types:
- **product_type**: online, offline
- **discount_type**: percentage, fixed_amount
- **payment_method**: cash, transfer, qris
- **delivery_method**: self_pickup, delivery
- **payment_status**: pending, paid, failed
- **order_status**: checkout, paid, processing, out_for_delivery, completed, cancelled
- **procurement_status**: pending, approved, rejected
- **movement_type**: procurement_in, sale_out, adjustment, expired

## 📝 Catatan Penting

1. **Semua model menggunakan UUID** sebagai primary key untuk konsistensi
2. **Soft delete** sudah diimplementasikan di semua tabel (deleted_at, deleted_by)
3. **Timestamps manual** dengan `timestamps: false` untuk kontrol penuh
4. **Phone normalization** di customer dan admin untuk format Indonesia (62xxx)
5. **Password hashing** hanya di admin.model (users table)
6. **Relasi lengkap** sudah didefinisikan di index.js

## 🚀 Next Steps

1. Jalankan migration/sync database
2. Test setiap model dengan seeder
3. Implementasi controllers untuk CRUD operations
4. Setup middleware untuk soft delete logging
5. Implementasi stock movement triggers
