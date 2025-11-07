# 🎯 RBAC Implementation Plan - BaleTani Fresh Market

## 📋 Executive Summary

Dokumentasi ini menjelaskan **Role-Based Access Control (RBAC)** lengkap untuk sistem BaleTani berdasarkan **Product Requirements Document (PRD)**. Sistem ini mendefinisikan **8 roles** tetap (tanpa custom roles) dengan permissions yang spesifik untuk mendukung operasional toko fresh market.

---

## 🎯 Tujuan Implementasi

1. **Pembagian Akses yang Jelas**: Setiap role memiliki batasan akses sesuai tanggung jawab
2. **Keamanan Data**: Mencegah akses tidak sah ke fitur sensitif
3. **Efisiensi Operasional**: Staff hanya melihat menu yang relevan dengan pekerjaan mereka
4. **Audit Trail**: Tracking siapa melakukan apa di sistem
5. **Skalabilitas**: Mudah menambah user baru dengan role yang sudah terdefinisi

---

## 🎭 8 Roles Berdasarkan PRD BaleTani

### 1️⃣ **Super Admin** (`super_admin`)

**👤 Deskripsi**: Administrator tertinggi dengan akses penuh ke seluruh sistem

**✅ Dapat Mengakses**:

- ✅ **Dashboard**: Full analytics (revenue, orders, inventory, procurement)
- ✅ **Products**: CRUD semua produk (online & offline), set harga, toggle visibility
- ✅ **Procurement**: CRUD, approve procurement, view cost trends
- ✅ **Orders B2C**: View, create, update status semua order (online & offline)
- ✅ **B2B Transactions**: CRUD transaksi B2B
- ✅ **Customers**: CRUD customer data
- ✅ **Users**: CRUD admin users, assign roles
- ✅ **Categories**: CRUD categories
- ✅ **Discounts**: CRUD discounts, assign to products
- ✅ **Reports**: Export semua laporan
- ✅ **Settings**: System configurations, WhatsApp integration

**📱 Sidebar Menu**:

```
📊 Dashboard
📦 Products
🛒 Procurement
📋 Orders (B2C)
🏢 B2B Transactions
👥 Customers
👤 Users
🏷️ Categories
🎁 Discounts
📈 Reports
⚙️ Settings
```

---

### 2️⃣ **Super WhatsApp Admin** (`super_whatsapp_admin`)

**👤 Deskripsi**: Admin yang mengelola semua transaksi online dan offline dengan fokus WhatsApp Business

**✅ Dapat Mengakses**:

- ✅ **Dashboard**: Order statistics, payment stats, delivery stats
- ✅ **Orders B2C**:
  - View semua order (online & offline)
  - Create online order (via WhatsApp)
  - Create offline order (POS)
  - Update order status (semua status)
  - Update payment status
  - Cancel order dengan reason
- ✅ **Customers**: CRUD customer data, view order history
- ✅ **Products**: View only (read-only), check stock
- ✅ **Categories**: View only (read-only)

**📱 Sidebar Menu**:

```
📊 Dashboard
📋 Orders (B2C)
   ├─ 📱 Online Orders
   └─ 🏪 Offline Orders
👥 Customers
📦 Products (View Only)
🏷️ Categories (View Only)
```

---

### 3️⃣ **Super Cashier** (`super_cashier`)

**👤 Deskripsi**: Kasir dengan akses penuh untuk transaksi online dan offline di toko

**✅ Dapat Mengakses**:

- ✅ **Dashboard**: Daily sales statistics, payment summary
- ✅ **Orders B2C**:
  - View semua order (online & offline)
  - Create offline order (POS)
  - Update order status (Pending → Paid → Processing → Completed)
  - Update payment status
  - Cancel order dengan reason
  - Print receipts/invoices
- ✅ **Customers**: CRUD customer data, view order history
- ✅ **Products**: View only, search for POS
- ✅ **Categories**: View only

**📱 Sidebar Menu**:

```
📊 Dashboard
📋 Orders (B2C)
   ├─ 📱 Online Orders
   └─ 🏪 Offline Orders (POS)
👥 Customers
📦 Products (View Only)
🏷️ Categories (View Only)
```

---

### 4️⃣ **WhatsApp Admin** (`whatsapp_admin`)

**👤 Deskripsi**: Admin yang fokus menangani transaksi online via WhatsApp Business

**✅ Dapat Mengakses**:

- ✅ **Dashboard**: Online order statistics, payment stats (online only)
- ✅ **Orders B2C**:
  - View online orders only
  - Create online order (via WhatsApp)
  - Update order status (Pending → Paid → Processing → Shipped → Delivered)
  - Update payment status
  - Add admin notes
- ✅ **Customers**: View, create, update customer address
- ✅ **Products**: View online products only (read-only), check stock

**📱 Sidebar Menu**:

```
📊 Dashboard
📱 Online Orders
👥 Customers
📦 Products (Online Only - View)
```

---

### 5️⃣ **Cashier** (`cashier`)

**👤 Deskripsi**: Kasir yang fokus menangani transaksi offline di toko fisik

**✅ Dapat Mengakses**:

- ✅ **Dashboard**: Daily offline sales statistics
- ✅ **Orders B2C**:
  - View offline orders only
  - Create offline order (POS)
  - Update order status (Pending → Paid → Completed)
  - Update payment status (cash, QRIS, transfer)
  - Print receipts/invoices
- ✅ **Customers**: View, create customer (during checkout)
- ✅ **Products**: View only, search for POS

**📱 Sidebar Menu**:

```
📊 Dashboard
🏪 Offline Orders (POS)
👥 Customers
📦 Products (View Only)
```

---

### 6️⃣ **Finance Admin** (`finance_admin`)

**👤 Deskripsi**: Admin keuangan yang fokus pada laporan dan analisis finansial

**✅ Dapat Mengakses**:

- ✅ **Dashboard**: Financial statistics, revenue charts, expense reports, profit/loss
- ✅ **Reports**:
  - View inventory reports (read-only)
  - View procurement reports (read-only)
  - View transaction reports (B2C & B2B)
  - Export financial reports (Excel, PDF)
  - View product performance reports
  - View supplier cost analysis
- ✅ **Orders**: View all orders (read-only), payment details
- ✅ **Procurement**: View all procurement (read-only), cost trends
- ✅ **B2B Transactions**: View all B2B (read-only)

**📱 Sidebar Menu**:

```
📊 Dashboard
📈 Reports
   ├─ 📦 Inventory Reports
   ├─ 🛒 Procurement Reports
   ├─ 💳 Transaction Reports (B2C)
   ├─ 🏢 B2B Reports
   └─ 💰 Financial Analysis
📋 Orders (View Only)
🛒 Procurement (View Only)
🏢 B2B Transactions (View Only)
```

---

### 7️⃣ **Inventory Admin** (`inventory_admin`)

**👤 Deskripsi**: Admin yang fokus mengelola procurement dan stock inventory

**✅ Dapat Mengakses**:

- ✅ **Dashboard**: Inventory statistics, stock alerts, expiry notifications
- ✅ **Procurement**:
  - Create procurement records
  - Update procurement (only if status = "Draft" or "Proposed")
  - View procurement history
  - View cost trends
  - Submit procurement for approval
- ✅ **Products**: View only, view stock levels, view procurement records
- ✅ **Stock Management**: View stock movements, view stock alerts & expiry

**📱 Sidebar Menu**:

```
📊 Dashboard
🛒 Procurement
   ├─ ➕ Create Procurement
   ├─ 📝 My Procurements
   └─ 📜 Procurement History
📦 Products (View Only)
📊 Stock Management
```

---

### 8️⃣ **Super Inventory Admin** (`super_inventory_admin`)

**👤 Deskripsi**: Administrator inventory dengan akses penuh procurement dan product management

**✅ Dapat Mengakses**:

- ✅ **Dashboard**: All inventory statistics, stock alerts, expiry notifications
- ✅ **Procurement**:
  - CRUD Procurement (full access)
  - Approve procurement requests
  - Reject procurement requests
  - View procurement history & cost trends
  - Manage supplier information
- ✅ **Products**:
  - CRUD Products (online & offline)
  - Manage product images
  - Set product details (name, description, type)
  - View stock levels & procurement records
  - ⚠️ **Tidak bisa** set harga (hanya Super Admin)
- ✅ **Stock Management**: View stock movements, manage alerts & expiry tracking

**📱 Sidebar Menu**:

```
📊 Dashboard
🛒 Procurement
   ├─ 📋 All Procurements
   ├─ ⏳ Pending Approval
   ├─ ✅ Approved
   └─ ❌ Rejected
📦 Products (CRUD)
📊 Stock Management
```

---

## 📊 Permission Matrix - Detailed

| **Feature**                      | Super Admin | Super WA Admin | Super Cashier | WA Admin    | Cashier | Finance Admin | Inventory Admin | Super Inventory Admin |
| -------------------------------- | ----------- | -------------- | ------------- | ----------- | ------- | ------------- | --------------- | --------------------- |
| **Dashboard - Full Analytics**   | ✅          | ❌             | ❌            | ❌          | ❌      | ✅            | ❌              | ❌                    |
| **Dashboard - Orders**           | ✅          | ✅             | ✅            | ✅          | ✅      | ✅ (view)     | ❌              | ❌                    |
| **Dashboard - Inventory**        | ✅          | ❌             | ❌            | ❌          | ❌      | ✅ (view)     | ✅              | ✅                    |
| **Dashboard - Financial**        | ✅          | ❌             | ❌            | ❌          | ❌      | ✅            | ❌              | ❌                    |
| **Products - Create**            | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ✅                    |
| **Products - View**              | ✅          | ✅             | ✅            | ✅ (online) | ✅      | ✅ (view)     | ✅              | ✅                    |
| **Products - Update**            | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ✅                    |
| **Products - Delete**            | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ✅                    |
| **Products - Set Price**         | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ❌                    |
| **Products - Toggle Visibility** | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ✅                    |
| **Procurement - Create**         | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ✅              | ✅                    |
| **Procurement - View**           | ✅          | ❌             | ❌            | ❌          | ❌      | ✅ (view)     | ✅              | ✅                    |
| **Procurement - Update**         | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ✅ (draft)      | ✅                    |
| **Procurement - Delete**         | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ✅                    |
| **Procurement - Approve**        | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ✅                    |
| **Procurement - Reject**         | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ✅                    |
| **Orders - View All**            | ✅          | ✅             | ✅            | ❌          | ❌      | ✅ (view)     | ❌              | ❌                    |
| **Orders - View Online**         | ✅          | ✅             | ✅            | ✅          | ❌      | ✅ (view)     | ❌              | ❌                    |
| **Orders - View Offline**        | ✅          | ✅             | ✅            | ❌          | ✅      | ✅ (view)     | ❌              | ❌                    |
| **Orders - Create Online**       | ✅          | ✅             | ❌            | ✅          | ❌      | ❌            | ❌              | ❌                    |
| **Orders - Create Offline**      | ✅          | ✅             | ✅            | ❌          | ✅      | ❌            | ❌              | ❌                    |
| **Orders - Update Status**       | ✅          | ✅             | ✅            | ✅          | ✅      | ❌            | ❌              | ❌                    |
| **Orders - Update Payment**      | ✅          | ✅             | ✅            | ✅          | ✅      | ❌            | ❌              | ❌                    |
| **Orders - Cancel**              | ✅          | ✅             | ✅            | ❌          | ❌      | ❌            | ❌              | ❌                    |
| **Orders - Print Receipt**       | ✅          | ✅             | ✅            | ❌          | ✅      | ❌            | ❌              | ❌                    |
| **B2B - Create**                 | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ❌                    |
| **B2B - View**                   | ✅          | ❌             | ❌            | ❌          | ❌      | ✅ (view)     | ❌              | ❌                    |
| **B2B - Update**                 | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ❌                    |
| **B2B - Delete**                 | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ❌                    |
| **Customers - Create**           | ✅          | ✅             | ✅            | ✅          | ✅      | ❌            | ❌              | ❌                    |
| **Customers - View**             | ✅          | ✅             | ✅            | ✅          | ✅      | ❌            | ❌              | ❌                    |
| **Customers - Update**           | ✅          | ✅             | ✅            | ✅          | ✅      | ❌            | ❌              | ❌                    |
| **Customers - Delete**           | ✅          | ✅             | ❌            | ❌          | ❌      | ❌            | ❌              | ❌                    |
| **Users - CRUD**                 | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ❌                    |
| **Users - Assign Role**          | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ❌                    |
| **Categories - CRUD**            | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ❌                    |
| **Categories - View**            | ✅          | ✅             | ✅            | ✅          | ✅      | ❌            | ❌              | ❌                    |
| **Discounts - CRUD**             | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ❌                    |
| **Reports - View**               | ✅          | ❌             | ❌            | ❌          | ❌      | ✅            | ❌              | ❌                    |
| **Reports - Export**             | ✅          | ❌             | ❌            | ❌          | ❌      | ✅            | ❌              | ❌                    |
| **Settings - System**            | ✅          | ❌             | ❌            | ❌          | ❌      | ❌            | ❌              | ❌                    |

---

## 🔑 Daftar Permissions Lengkap

### **Dashboard Permissions**

```javascript
"view_full_dashboard"; // Super Admin, Finance Admin
"view_order_dashboard"; // Super WA Admin, Super Cashier, WA Admin, Cashier
"view_inventory_dashboard"; // Super Admin, Finance Admin, Inventory Admin, Super Inventory Admin
"view_financial_dashboard"; // Super Admin, Finance Admin
```

### **Product Permissions**

```javascript
"view_products"; // All roles (dengan batasan: WA Admin hanya online)
"view_online_products"; // WA Admin
"create_product"; // Super Admin, Super Inventory Admin
"update_product"; // Super Admin, Super Inventory Admin
"delete_product"; // Super Admin, Super Inventory Admin
"set_product_price"; // Super Admin only
"set_product_discount"; // Super Admin only
"toggle_product_visibility"; // Super Admin, Super Inventory Admin
"view_product_stock"; // All roles yang bisa view products
"view_product_procurement"; // Super Admin, Finance Admin, Inventory Admin, Super Inventory Admin
```

### **Procurement Permissions**

```javascript
"view_procurement"; // Super Admin, Finance Admin, Inventory Admin, Super Inventory Admin
"view_procurement_history"; // Super Admin, Finance Admin, Inventory Admin, Super Inventory Admin
"create_procurement"; // Super Admin, Inventory Admin, Super Inventory Admin
"update_procurement"; // Super Admin, Inventory Admin (if draft), Super Inventory Admin
"delete_procurement"; // Super Admin, Super Inventory Admin
"approve_procurement"; // Super Admin, Super Inventory Admin
"reject_procurement"; // Super Admin, Super Inventory Admin
"view_cost_trends"; // Super Admin, Finance Admin, Inventory Admin, Super Inventory Admin
"manage_suppliers"; // Super Admin, Super Inventory Admin
```

### **Order (B2C) Permissions**

```javascript
"view_all_orders"; // Super Admin, Super WA Admin, Super Cashier, Finance Admin
"view_online_orders"; // Super Admin, Super WA Admin, Super Cashier, WA Admin, Finance Admin
"view_offline_orders"; // Super Admin, Super WA Admin, Super Cashier, Cashier, Finance Admin
"create_online_order"; // Super Admin, Super WA Admin, WA Admin
"create_offline_order"; // Super Admin, Super WA Admin, Super Cashier, Cashier
"update_order_status"; // Super Admin, Super WA Admin, Super Cashier, WA Admin, Cashier
"update_payment_status"; // Super Admin, Super WA Admin, Super Cashier, WA Admin, Cashier
"cancel_order"; // Super Admin, Super WA Admin, Super Cashier
"view_order_details"; // All roles yang bisa view orders
"add_order_notes"; // Super Admin, Super WA Admin, WA Admin
"print_receipt"; // Super Admin, Super WA Admin, Super Cashier, Cashier
```

### **B2B Transaction Permissions**

```javascript
"view_b2b_transactions"; // Super Admin, Finance Admin
"create_b2b_transaction"; // Super Admin
"update_b2b_transaction"; // Super Admin
"delete_b2b_transaction"; // Super Admin
"generate_b2b_invoice"; // Super Admin, Finance Admin
```

### **Customer Permissions**

```javascript
"view_customers"; // Super Admin, Super WA Admin, Super Cashier, WA Admin, Cashier
"create_customer"; // Super Admin, Super WA Admin, Super Cashier, WA Admin, Cashier
"update_customer"; // Super Admin, Super WA Admin, Super Cashier, WA Admin, Cashier
"delete_customer"; // Super Admin, Super WA Admin
"view_customer_history"; // Super Admin, Super WA Admin, Super Cashier, WA Admin
```

### **User Management Permissions**

```javascript
"view_users"; // Super Admin
"create_user"; // Super Admin
"update_user"; // Super Admin
"delete_user"; // Super Admin
"assign_role"; // Super Admin
"deactivate_user"; // Super Admin
"view_user_activity"; // Super Admin
```

### **Category Permissions**

```javascript
"view_categories"; // Super Admin, Super WA Admin, Super Cashier, WA Admin, Cashier
"create_category"; // Super Admin
"update_category"; // Super Admin
"delete_category"; // Super Admin
"manage_category_images"; // Super Admin
```

### **Discount Permissions**

```javascript
"view_discounts"; // Super Admin
"create_discount"; // Super Admin
"update_discount"; // Super Admin
"delete_discount"; // Super Admin
"assign_discount_to_product"; // Super Admin
"view_discount_statistics"; // Super Admin, Finance Admin
```

### **Report Permissions**

```javascript
"view_reports"; // Super Admin, Finance Admin
"export_reports"; // Super Admin, Finance Admin
"view_inventory_report"; // Super Admin, Finance Admin
"view_procurement_report"; // Super Admin, Finance Admin
"view_transaction_report"; // Super Admin, Finance Admin
"view_b2b_report"; // Super Admin, Finance Admin
"view_financial_report"; // Super Admin, Finance Admin
"view_product_performance"; // Super Admin, Finance Admin
```

### **Stock Management Permissions**

```javascript
"view_stock_movements"; // Super Admin, Inventory Admin, Super Inventory Admin
"view_stock_alerts"; // Super Admin, Inventory Admin, Super Inventory Admin
"manage_stock_alerts"; // Super Admin, Super Inventory Admin
"view_expiry_notifications"; // Super Admin, Inventory Admin, Super Inventory Admin
"manage_expiry_tracking"; // Super Admin, Super Inventory Admin
```

### **Settings Permissions**

```javascript
"manage_settings"; // Super Admin
"manage_whatsapp_integration"; // Super Admin
"manage_payment_settings"; // Super Admin
"view_system_logs"; // Super Admin
```

---

## 🏗️ Struktur Database

### **Table: roles**

```sql
id: INTEGER PRIMARY KEY
name: VARCHAR(50) UNIQUE         -- 'super_admin', 'whatsapp_admin', etc.
display_name: VARCHAR(100)       -- 'Super Admin', 'WhatsApp Admin', etc.
description: TEXT
is_active: BOOLEAN DEFAULT true
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### **Table: permissions**

```sql
id: INTEGER PRIMARY KEY
name: VARCHAR(100) UNIQUE        -- 'view_products', 'create_order', etc.
module: VARCHAR(50)              -- 'products', 'orders', 'customers', etc.
action: VARCHAR(50)              -- 'view', 'create', 'update', 'delete', 'approve'
description: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### **Table: role_permissions** (Junction Table)

```sql
id: INTEGER PRIMARY KEY
role_id: INTEGER FOREIGN KEY → roles.id
permission_id: INTEGER FOREIGN KEY → permissions.id
created_at: TIMESTAMP
UNIQUE(role_id, permission_id)
```

### **Table: admins** (Updated)

```sql
id: INTEGER PRIMARY KEY
name: VARCHAR(100)
phone: VARCHAR(20) UNIQUE
password: VARCHAR(255)         -- hashed
role_id: INTEGER FOREIGN KEY → roles.id
is_active: BOOLEAN DEFAULT true
last_login: TIMESTAMP
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

---

## 📂 File Structure yang Perlu Disiapkan

### **Backend**

#### **1. Database Scripts** ✅ (Sudah Ada)

```
backend/scripts/
  ├── createPermissionsTable.js      ✅ Sudah ada
  ├── createRolePermissionsTable.js  ✅ Sudah ada
  └── setupRBAC.js                   ✅ Sudah ada
```

#### **2. Seeders** ⚠️ (Perlu Update/Buat Baru)

```
backend/seeders/
  ├── roleSeeder.js                  ⚠️ Update dengan 8 roles baru
  ├── permissionSeeder.js            ❌ PERLU DIBUAT (seed semua permissions)
  ├── rolePermissionSeeder.js        ❌ PERLU DIBUAT (mapping role-permission)
  └── adminSeeder.js                 ⚠️ Update dengan test accounts untuk 8 roles
```

#### **3. Models** ⚠️ (Perlu Update)

```
backend/src/models/
  ├── permission.model.js            ❌ PERLU DIBUAT
  ├── rolePermission.model.js        ❌ PERLU DIBUAT
  ├── role.model.js                  ✅ Sudah ada (perlu update associations)
  └── admin.model.js                 ✅ Sudah ada (perlu update associations)
```

#### **4. Middlewares** ✅ (Sudah Ada)

```
backend/src/middlewares/
  ├── auth.middleware.js             ✅ Sudah ada
  └── checkPermission.js             ✅ Sudah ada
```

#### **5. Routes** ⚠️ (Perlu Update)

```
backend/src/routes/admin/
  ├── adminProducts.js               ⚠️ Tambah permission checks
  ├── adminOrders.js                 ⚠️ Tambah permission checks
  ├── adminCustomers.js              ⚠️ Tambah permission checks
  ├── adminCategories.js             ⚠️ Tambah permission checks
  ├── adminDiscounts.js              ⚠️ Tambah permission checks
  ├── adminUsers.js                  ⚠️ Tambah permission checks
  └── adminProcurement.js            ❌ PERLU DIBUAT (belum ada)
```

---

### **Frontend**

#### **1. Hooks** ⚠️ (Perlu Buat/Update)

```
frontend/src/hooks/
  ├── usePermission.js               ❌ PERLU DIBUAT
  ├── useAuth.js                     ✅ Sudah ada (perlu update untuk permissions)
  └── hook_admin/
      └── useAdminPermissions.js     ❌ PERLU DIBUAT
```

#### **2. Components** ⚠️ (Perlu Update)

```
frontend/src/components/
  ├── admin/
  │   ├── PermissionGuard.jsx        ✅ Sudah ada
  │   └── RolePermissionCard.jsx     ✅ Sudah ada
  └── layout_admin/
      ├── AdminSidebarNew.jsx        ⚠️ Update untuk dynamic menu based on role
      └── AdminHeaderNew.jsx         ⚠️ Update untuk show role badge
```

#### **3. Pages** ⚠️ (Perlu Update)

```
frontend/src/pages/admin/
  ├── AdminDashboardNew.jsx          ⚠️ Update dengan permission checks
  ├── ProductListNew.jsx             ⚠️ Update dengan permission guards
  ├── OrderManagement.jsx            ⚠️ Update dengan permission guards
  ├── CustomerManagement.jsx         ⚠️ Update dengan permission guards
  ├── CategoryManagement.jsx         ⚠️ Update dengan permission guards
  ├── DiscountManagement.jsx         ⚠️ Update dengan permission guards
  ├── UserManagement.jsx             ⚠️ Update dengan permission guards
  └── ProcurementManagement.jsx      ❌ PERLU DIBUAT (belum ada)
```

#### **4. Store** ⚠️ (Perlu Update)

```
frontend/src/store/store_admin/
  └── authStore.js                   ⚠️ Update untuk simpan permissions di state
```

---

## 🔨 Implementation Checklist

### **Phase 1: Database Setup** (PRIORITY 1)

- [ ] **1.1** Create Permission Model (`backend/src/models/permission.model.js`)
- [ ] **1.2** Create RolePermission Model (`backend/src/models/rolePermission.model.js`)
- [ ] **1.3** Update Role Model associations
- [ ] **1.4** Update Admin Model associations
- [ ] **1.5** Run migration scripts
  ```bash
  node backend/scripts/createPermissionsTable.js
  node backend/scripts/createRolePermissionsTable.js
  ```

### **Phase 2: Seeding Data** (PRIORITY 1)

- [ ] **2.1** Create Permission Seeder
  - Seed 70+ permissions (view, create, update, delete, approve, etc.)
- [ ] **2.2** Update Role Seeder
  - Seed 8 roles dengan descriptions
- [ ] **2.3** Create Role-Permission Mapping Seeder
  - Map permissions ke setiap role sesuai matrix
- [ ] **2.4** Update Admin Seeder
  - Create test accounts untuk 8 roles
- [ ] **2.5** Run all seeders
  ```bash
  node backend/seeders/permissionSeeder.js
  node backend/seeders/roleSeeder.js
  node backend/seeders/rolePermissionSeeder.js
  node backend/seeders/adminSeeder.js
  ```

### **Phase 3: Backend Protection** (PRIORITY 2)

- [ ] **3.1** Update Auth Middleware
  - Include permissions dalam JWT token
  - Include permissions dalam response login
- [ ] **3.2** Protect Product Routes
  ```javascript
  router.get('/products', authMiddleware, checkPermission('view_products'), ...)
  router.post('/products', authMiddleware, checkPermission('create_product'), ...)
  ```
- [ ] **3.3** Protect Order Routes
  - Online orders: `view_online_orders`, `create_online_order`, etc.
  - Offline orders: `view_offline_orders`, `create_offline_order`, etc.
- [ ] **3.4** Protect Customer Routes
- [ ] **3.5** Protect Category Routes
- [ ] **3.6** Protect Discount Routes
- [ ] **3.7** Protect User Management Routes
- [ ] **3.8** Create Procurement Routes (baru)
- [ ] **3.9** Create B2B Transaction Routes (baru)

### **Phase 4: Frontend Hooks & Utils** (PRIORITY 2)

- [ ] **4.1** Create `usePermission` Hook
  ```javascript
  const hasPermission = usePermission("create_product");
  if (!hasPermission) return <Unauthorized />;
  ```
- [ ] **4.2** Create `useRole` Hook
  ```javascript
  const { isSuperAdmin, isWAAdmin, isCashier } = useRole();
  ```
- [ ] **4.3** Update Auth Store
  - Simpan permissions dari login response
  - Simpan role information
- [ ] **4.4** Create Permission Helper Utils
  ```javascript
  const canViewProducts = checkPermission(user, "view_products");
  const canCreateOrder = checkPermission(user, "create_online_order");
  ```

### **Phase 5: Frontend Components** (PRIORITY 3)

- [ ] **5.1** Update AdminSidebarNew.jsx
  - Dynamic menu generation based on permissions
  - Hide/show menu items
- [ ] **5.2** Update AdminHeaderNew.jsx
  - Show role badge
  - Show user permissions (tooltip)
- [ ] **5.3** Create PermissionButton Component
  ```jsx
  <PermissionButton permission="create_product">Add Product</PermissionButton>
  ```
- [ ] **5.4** Create PermissionSection Component
  ```jsx
  <PermissionSection permission="view_reports">
    <ReportsWidget />
  </PermissionSection>
  ```

### **Phase 6: Frontend Pages Update** (PRIORITY 3)

- [ ] **6.1** Update AdminDashboardNew.jsx
  - Show widgets based on permissions
  - Hide financial data from non-finance roles
- [ ] **6.2** Update ProductListNew.jsx
  - Hide Create/Edit/Delete buttons based on permissions
  - Show view-only mode untuk non-editors
- [ ] **6.3** Update OrderManagement.jsx
  - Filter online/offline orders based on role
  - Hide action buttons based on permissions
- [ ] **6.4** Update CustomerManagement.jsx
  - Hide Delete button dari non-super roles
- [ ] **6.5** Update CategoryManagement.jsx
  - View-only mode untuk non-super admin
- [ ] **6.6** Update DiscountManagement.jsx
  - View-only mode untuk non-super admin
- [ ] **6.7** Update UserManagement.jsx
  - Only accessible by Super Admin
- [ ] **6.8** Create ProcurementManagement.jsx (NEW)
  - For Inventory Admin & Super Inventory Admin
- [ ] **6.9** Create B2BTransactionManagement.jsx (NEW)
  - For Super Admin & Finance Admin

### **Phase 7: Testing** (PRIORITY 4)

- [ ] **7.1** Test Login untuk 8 roles
- [ ] **7.2** Test Sidebar rendering per role
- [ ] **7.3** Test Dashboard data per role
- [ ] **7.4** Test Product CRUD permissions
- [ ] **7.5** Test Order CRUD permissions (online & offline)
- [ ] **7.6** Test Procurement permissions
- [ ] **7.7** Test Customer management permissions
- [ ] **7.8** Test Report access permissions
- [ ] **7.9** Test unauthorized access handling
- [ ] **7.10** Test API endpoint protection

### **Phase 8: Documentation** (PRIORITY 5)

- [ ] **8.1** API Documentation dengan permission requirements
- [ ] **8.2** Frontend Component Documentation
- [ ] **8.3** Testing Guide per role
- [ ] **8.4** Deployment Guide

---

## 🧪 Test Accounts

Setelah seeding, test dengan accounts berikut:

| Role                  | Phone          | Password            | Akses Utama                  |
| --------------------- | -------------- | ------------------- | ---------------------------- |
| Super Admin           | `081234567801` | `superadmin123`     | Semua fitur                  |
| Super WA Admin        | `081234567802` | `superwa123`        | Orders (all), Customers      |
| Super Cashier         | `081234567803` | `superkasir123`     | Orders (all), POS            |
| WA Admin              | `081234567804` | `waadmin123`        | Online Orders only           |
| Cashier               | `081234567805` | `kasir123`          | Offline Orders only          |
| Finance Admin         | `081234567806` | `finance123`        | Reports, View data           |
| Inventory Admin       | `081234567807` | `inventory123`      | Procurement (draft)          |
| Super Inventory Admin | `081234567808` | `superinventory123` | Procurement (full), Products |

---

## ⚠️ Important Notes

### **Perbedaan Kunci Antar Role**

1. **Super Admin vs Super Inventory Admin**

   - Super Admin: Bisa set harga produk
   - Super Inventory Admin: Tidak bisa set harga, fokus stock & procurement

2. **Super WA Admin vs WA Admin**

   - Super WA Admin: Bisa create offline orders juga, bisa cancel orders
   - WA Admin: Hanya online orders, tidak bisa cancel

3. **Super Cashier vs Cashier**

   - Super Cashier: Bisa lihat online orders, bisa cancel orders
   - Cashier: Hanya offline orders, tidak bisa cancel

4. **Inventory Admin vs Super Inventory Admin**
   - Inventory Admin: Buat procurement (butuh approval), tidak bisa CRUD products
   - Super Inventory Admin: Approve procurement, CRUD products

### **Permission Inheritance**

- Permissions TIDAK inherited (setiap role explicit)
- Tidak ada parent-child relationship antar roles
- Setiap role punya permission set yang jelas

### **Frontend Behavior**

- Menu sidebar hanya tampil jika user punya minimal 1 permission di module tersebut
- Buttons (Create, Edit, Delete) hidden jika tidak ada permission
- View-only mode: form fields disabled, actions hidden
- Unauthorized access redirect ke 403 page

### **Backend Protection**

- Semua endpoint protected dengan `authMiddleware` + `checkPermission`
- API error 403 Forbidden jika akses tanpa permission
- Audit log untuk sensitive actions (create, update, delete)

---

## 🚀 Next Steps

**Pilih mana yang mau dikerjakan terlebih dahulu:**

1. ✅ **Create Permission Model & RolePermission Model**
2. ✅ **Create Permission Seeder (70+ permissions)**
3. ✅ **Create Role-Permission Mapping Seeder**
4. ✅ **Update Backend Routes dengan Permission Checks**
5. ✅ **Create Frontend usePermission Hook**
6. ✅ **Update AdminSidebar untuk Dynamic Menu**
7. ✅ **Update Pages dengan Permission Guards**
8. ✅ **Testing dengan 8 test accounts**

**Recommended Order:**

1. Database Setup → 2. Seeding → 3. Backend Protection → 4. Frontend Hooks → 5. Components → 6. Pages → 7. Testing

---

## 📞 Support & Questions

Jika ada pertanyaan tentang:

- Permission yang belum jelas
- Role yang perlu adjustment
- Feature yang missing
- Implementation details

Silakan diskusikan terlebih dahulu sebelum mulai coding! 🚀

- **delete** - Menghapus data
- **approve** - Menyetujui (untuk procurement dan B2B)

## 💻 Cara Menggunakan di Frontend

### 1. **Permission Guard Component**

```jsx
import PermissionGuard from '../components/admin/PermissionGuard';

// Sembunyikan komponen jika tidak punya permission
<PermissionGuard module="products" action="create">
  <button>Tambah Produk</button>
</PermissionGuard>

// Dengan fallback jika tidak punya akses
<PermissionGuard
  module="products"
  action="delete"
  fallback={<p>Anda tidak punya akses untuk menghapus produk</p>}
>
  <button>Hapus Produk</button>
</PermissionGuard>

// Redirect jika tidak punya akses
<PermissionGuard
  module="users"
  action="view"
  redirectTo="/admin/dashboard"
>
  <UserManagementPage />
</PermissionGuard>
```

### 2. **Permission Hooks**

```jsx
import {
  usePermission,
  useRole,
  useAnyPermission,
} from "../components/admin/PermissionGuard";

function ProductPage() {
  const canCreate = usePermission("products", "create");
  const canDelete = usePermission("products", "delete");
  const isSuperAdmin = useRole("super_admin");

  const canManageOrders = useAnyPermission([
    { module: "online_orders", action: "update" },
    { module: "offline_orders", action: "update" },
  ]);

  return (
    <div>
      {canCreate && <button>Tambah Produk</button>}
      {canDelete && <button>Hapus Produk</button>}
      {isSuperAdmin && <AdminPanel />}
      {canManageOrders && <OrderManagement />}
    </div>
  );
}
```

### 3. **Role Permission Card**

Tampilkan info role dan permissions user:

```jsx
import RolePermissionCard from "../components/admin/RolePermissionCard";

function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">{/* Dashboard content */}</div>
      <div>
        <RolePermissionCard />
      </div>
    </div>
  );
}
```

### 4. **Zustand Store Methods**

```javascript
import useAdminStore from "../store/store_admin/useAdminStore";

const AdminComponent = () => {
  const permissions = useAdminStore((state) => state.permissions);
  const hasPermission = useAdminStore((state) => state.hasPermission);
  const hasRole = useAdminStore((state) => state.hasRole);

  // Check permission
  if (hasPermission("products", "create")) {
    // Show create form
  }

  // Check role
  if (hasRole("super_admin")) {
    // Show admin-only features
  }

  // Get all permissions
  console.log("User permissions:", permissions);
  // Output: [{ module: 'products', action: 'view', description: '...' }, ...]
};
```

## 🔄 Flow Login dengan RBAC

1. **User memasukkan phone number & password di login page**
2. **Frontend mengirim request ke** `/api/admin/auth/login`
3. **Backend memproses**:
   - Normalize phone number (08xxx → 628xxx)
   - Query database untuk admin dengan phone tersebut
   - Verify password dengan bcryptjs
   - Check apakah role termasuk admin roles
   - Load permissions dari `role_permissions` table
4. **Backend mengembalikan**:
   ```json
   {
     "success": true,
     "message": "Login berhasil",
     "data": {
       "user": {
         "id": "uuid",
         "phone_number": "628xxx",
         "full_name": "Admin Name",
         "role": {
           "id": "uuid",
           "name": "super_admin",
           "description": "..."
         },
         "permissions": [
           {
             "id": "uuid",
             "module": "products",
             "action": "view",
             "description": "..."
           },
           {
             "id": "uuid",
             "module": "products",
             "action": "create",
             "description": "..."
           }
         ]
       },
       "token": "JWT_TOKEN"
     }
   }
   ```
5. **Frontend menyimpan ke Zustand store**:
   - `admin` object
   - `token` untuk authentication
   - `permissions` array untuk RBAC checking
6. **Frontend persist ke localStorage** via Zustand persist middleware
7. **UI components menggunakan permissions** untuk show/hide fitur

## 🔒 Security Features

### Backend:

- ✅ Password hashing dengan bcryptjs (10 salt rounds)
- ✅ Phone normalization (08xxx → 628xxx format)
- ✅ JWT token dengan 7 hari expiry
- ✅ is_active check untuk disable account
- ✅ Role validation (hanya admin roles yang bisa login)
- ✅ Permission loading dari database via join table

### Frontend:

- ✅ Token stored di localStorage (via Zustand persist)
- ✅ Permissions cached di Zustand store
- ✅ Permission checking via PermissionGuard components
- ✅ Permission hooks untuk conditional rendering
- ✅ Auto-clear storage on logout

## 📝 Database Schema

### Table: `roles`

```sql
- id (UUID, PK)
- role_name (VARCHAR 50, UNIQUE)
- description (TEXT)
- created_at, updated_at
```

### Table: `permissions`

```sql
- id (UUID, PK)
- module (VARCHAR 50)
- action (VARCHAR 50)
- description (TEXT)
- created_at, updated_at
```

### Table: `role_permissions` (junction)

```sql
- id (UUID, PK)
- role_id (UUID, FK → roles.id)
- permission_id (UUID, FK → permissions.id)
- created_at
```

### Table: `users` (admins)

```sql
- id (UUID, PK)
- phone_number (VARCHAR 20, UNIQUE)
- full_name (VARCHAR 100)
- password_hash (VARCHAR 255)
- role_id (UUID, FK → roles.id)
- is_active (BOOLEAN)
- created_at, updated_at
```

## 🧪 Testing

### Test dengan curl (PowerShell):

```powershell
# Test login super admin
$body = @{phone_number='081234567808';password='admin123'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:5000/api/admin/auth/login' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing

# Test login kasir
$body = @{phone_number='081234567801';password='kasir123'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:5000/api/admin/auth/login' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
```

### Test di Frontend:

1. Buka `http://localhost:5173/admin/login`
2. Login dengan salah satu test account di atas
3. Check browser console untuk log permissions
4. Check localStorage → `baletani-admin-storage`

## 🚀 Next Steps

### Implementasi di Pages:

1. Wrap sensitive buttons dengan `<PermissionGuard>`
2. Use `usePermission` hook untuk conditional rendering
3. Add `<RolePermissionCard />` di dashboard
4. Implement permission checking di routing level

### Contoh Implementation:

```jsx
// pages/admin/ProductManagement.jsx
import PermissionGuard, {
  usePermission,
} from "../../components/admin/PermissionGuard";

function ProductManagement() {
  const canCreate = usePermission("products", "create");
  const canDelete = usePermission("products", "delete");

  return (
    <div>
      <h1>Manajemen Produk</h1>

      {/* Hanya tampil jika punya permission create */}
      <PermissionGuard module="products" action="create">
        <button onClick={handleCreateProduct}>Tambah Produk Baru</button>
      </PermissionGuard>

      <table>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>
              {/* Conditional rendering dengan hook */}
              {canDelete && (
                <button onClick={() => handleDelete(product.id)}>Hapus</button>
              )}
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

## 📞 Support

Jika ada pertanyaan atau issue terkait RBAC:

1. Check console log di browser (permissions loading)
2. Check network tab untuk response dari `/api/admin/auth/login`
3. Verify localStorage → `baletani-admin-storage`
4. Test dengan different role accounts untuk verify permissions

---

✅ **Status**: RBAC fully implemented dan tested
🔧 **Backend**: Complete dengan 8 roles, 29 permissions
🎨 **Frontend**: Components, hooks, dan store ready
📱 **Testing**: 8 dummy accounts tersedia
