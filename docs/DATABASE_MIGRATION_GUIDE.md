# Database Migration Guide - Role-Based Access Control

## ⚠️ PENTING: Backup Database Terlebih Dahulu!

Sebelum melakukan migration, **WAJIB backup database** Anda terlebih dahulu.

```bash
# Untuk PostgreSQL
pg_dump -U your_username -d baletani_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Untuk MySQL
mysqldump -u your_username -p baletani_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 🔄 Migration Steps

### Step 1: Pull Latest Code
```bash
git pull origin branch_Haryo_UIX
```

### Step 2: Install Dependencies
```bash
cd backend
npm install
```

### Step 3: Update .env File
Pastikan file `.env` sudah dikonfigurasi dengan benar:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=baletani_db
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Step 4: Run Database Migration

**Option A: Force Sync (⚠️ Menghapus semua data)**
```bash
npm run sync-db
```

**Option B: Alter Sync (Lebih aman, tapi mungkin ada error)**
```bash
# Edit syncDatabase.js, ganti:
await sequelize.sync({ force: true });
# Menjadi:
await sequelize.sync({ alter: true });

# Lalu jalankan:
npm run sync-db
```

### Step 5: Seed Admin Users (Optional)
```bash
npm run seed
```

Default admin users yang akan dibuat:
- Super Admin: `admin@baletani.com` / `admin123`
- Inventory Admin: `inventory@baletani.com` / `inventory123`
- Cashier: `cashier@baletani.com` / `cashier123`

### Step 6: Verify Database
```bash
npm run check-db
```

---

## 📋 Manual SQL Migration (Alternative)

Jika Anda ingin migration secara manual, berikut SQL statements yang diperlukan:

### 1. Update Users Table
```sql
-- Backup existing users table
CREATE TABLE users_backup AS SELECT * FROM users;

-- Add new columns to users table
ALTER TABLE users 
  ADD COLUMN phone_number VARCHAR(20),
  ADD COLUMN address TEXT;

-- Update role enum
ALTER TABLE users 
  ALTER COLUMN role TYPE VARCHAR(50);

-- If using PostgreSQL, you might need to drop and recreate the enum
-- Or just use VARCHAR as shown above
```

### 2. Update Orders Table
```sql
-- Backup existing orders table
CREATE TABLE orders_backup AS SELECT * FROM orders;

-- Rename column
ALTER TABLE orders 
  RENAME COLUMN status TO order_status;

-- Add new column
ALTER TABLE orders 
  ADD COLUMN transaction_type VARCHAR(20) DEFAULT 'online';

-- Update order_status values if needed
UPDATE orders SET order_status = 'checkout' WHERE order_status = 'pending';
```

### 3. Create Procurements Table
```sql
CREATE TABLE procurements (
  id SERIAL PRIMARY KEY,
  procurement_number VARCHAR(50) UNIQUE NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejected_by INTEGER REFERENCES users(id),
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  total_cost DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Create Procurement Items Table
```sql
CREATE TABLE procurement_items (
  id SERIAL PRIMARY KEY,
  procurement_id INTEGER NOT NULL REFERENCES procurements(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Create Stock Movements Table
```sql
CREATE TABLE stock_movements_reporting (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  movement_type VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  reference_type VARCHAR(20),
  reference_id INTEGER,
  notes TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing Database Changes

### Test 1: Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'orders', 'procurements', 'procurement_items', 'stock_movements_reporting');
```

### Test 2: Check User Roles
```sql
SELECT id, full_name, email, role 
FROM users;
```

### Test 3: Check Order Columns
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';
```

### Test 4: Check Procurement Tables
```sql
SELECT COUNT(*) FROM procurements;
SELECT COUNT(*) FROM procurement_items;
SELECT COUNT(*) FROM stock_movements_reporting;
```

---

## 🔄 Rollback Strategy

Jika terjadi masalah, Anda dapat rollback dengan cara:

### Option 1: Restore from Backup
```bash
# PostgreSQL
psql -U your_username -d baletani_db < backup_20251022_120000.sql

# MySQL
mysql -u your_username -p baletani_db < backup_20251022_120000.sql
```

### Option 2: Manual Rollback
```sql
-- Restore users table
DROP TABLE users;
ALTER TABLE users_backup RENAME TO users;

-- Restore orders table
DROP TABLE orders;
ALTER TABLE orders_backup RENAME TO orders;

-- Drop new tables
DROP TABLE IF EXISTS stock_movements_reporting;
DROP TABLE IF EXISTS procurement_items;
DROP TABLE IF EXISTS procurements;
```

---

## 📊 Data Migration Tips

### Migrate Existing User Roles
```sql
-- Update old admin roles to super_admin
UPDATE users 
SET role = 'super_admin' 
WHERE role = 'admin';

-- Update old staff roles to cashier
UPDATE users 
SET role = 'cashier' 
WHERE role = 'staff';
```

### Migrate Existing Order Status
```sql
-- Update order status to new format
UPDATE orders SET order_status = 'checkout' WHERE order_status = 'pending';
UPDATE orders SET order_status = 'out_for_delivery' WHERE order_status = 'shipped';
UPDATE orders SET order_status = 'completed' WHERE order_status = 'delivered';
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Column already exists"
```bash
# Solution: Drop the column first
ALTER TABLE users DROP COLUMN IF EXISTS phone_number;
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
```

### Issue 2: "Enum type conflict"
```bash
# Solution: Use VARCHAR instead of ENUM
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50);
```

### Issue 3: "Foreign key constraint fails"
```bash
# Solution: Disable foreign key checks temporarily
SET CONSTRAINTS ALL DEFERRED; -- PostgreSQL
# Or
SET FOREIGN_KEY_CHECKS = 0;    -- MySQL
```

### Issue 4: "Table does not exist"
```bash
# Solution: Run sync database script
npm run sync-db
```

---

## ✅ Post-Migration Checklist

- [ ] Database backup created
- [ ] All new tables created successfully
- [ ] Existing data migrated correctly
- [ ] User roles updated
- [ ] Order statuses updated
- [ ] Admin users seeded
- [ ] Backend server starts without errors
- [ ] Frontend can connect to backend
- [ ] Login functionality works
- [ ] Order management works
- [ ] Procurement management works

---

## 📞 Support

Jika mengalami masalah saat migration, silakan:
1. Check error logs: `backend/logs/error.log`
2. Check console output
3. Verify .env configuration
4. Contact development team

---

**Last Updated:** October 22, 2025
**Version:** 2.0.0
