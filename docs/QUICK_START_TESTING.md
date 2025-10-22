# 🚀 Quick Start - Testing New Features

## Fitur yang Bisa Langsung Dicoba

### ✨ 1. Manual Order Status Update

**Langkah Testing:**

1. **Start aplikasi**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

2. **Login sebagai Super Cashier**
   - Email: `cashier@baletani.com`
   - Password: `cashier123`

3. **Buka Order Management**
   - Navigate ke: `http://localhost:5173/admin/orders-new`
   - atau klik menu "Orders" di sidebar

4. **Test Update Status**
   - Lihat tabel orders
   - Di kolom "Status", klik dropdown pada salah satu order
   - Pilih status baru (misalnya dari "checkout" → "paid")
   - Status akan update otomatis tanpa reload!

5. **Lihat Detail Order**
   - Klik tombol "View" pada order
   - Modal akan muncul dengan:
     - Order timeline (visual progress)
     - Customer information
     - Order details
     - Update status dropdown
   - Coba update status dari modal juga

**Expected Result:**
- ✅ Status berubah langsung di tabel
- ✅ Timeline di modal update
- ✅ Tidak ada page reload
- ✅ Toast notification muncul

---

### 📦 2. Procurement Management

**Langkah Testing:**

1. **Login sebagai Inventory Admin**
   - Email: `inventory@baletani.com`
   - Password: `inventory123`

2. **Buka Procurement Management**
   - Navigate ke: `http://localhost:5173/admin/procurement-new`

3. **Create Procurement (Coming Soon - perlu tambah form)**
   - Untuk saat ini, bisa test via Postman:
   ```json
   POST http://localhost:5000/api/admin/procurements
   Headers: 
     Authorization: Bearer {your_token}
   Body:
   {
     "items": [
       {
         "product_id": 1,
         "quantity": 100,
         "unit_price": 50000
       }
     ],
     "notes": "Restocking benih padi"
   }
   ```

4. **Approve Procurement**
   - Logout dari Inventory Admin
   - Login sebagai Super Admin: `admin@baletani.com` / `admin123`
   - Buka procurement list
   - Klik "View" pada procurement yang pending
   - Klik tombol "Approve"
   - Stock produk akan bertambah otomatis!

**Expected Result:**
- ✅ Procurement created dengan status "pending"
- ✅ Super Admin bisa approve/reject
- ✅ Saat approve, stock produk bertambah
- ✅ Stock movement record tercatat

---

### 🔐 3. Role-Based Access Control

**Langkah Testing:**

1. **Test WhatsApp Admin (Online Only)**
   - Buat user dengan role `whatsapp_admin`
   - Login
   - Buka Orders page
   - Hanya akan melihat order dengan `transaction_type = 'online'`
   - Coba akses offline order → akan di-block

2. **Test Cashier (Offline Only)**
   - Login dengan role `cashier`
   - Buka Orders page  
   - Hanya akan melihat order dengan `transaction_type = 'offline'`
   - Coba akses online order → akan di-block

3. **Test Finance Admin (Read Only)**
   - Login dengan role `finance_admin`
   - Bisa lihat orders dan procurement
   - Tapi tidak bisa create/update/delete
   - Menu di sidebar akan filtered

**Expected Result:**
- ✅ Menu sidebar berbeda per role
- ✅ Data di-filter sesuai role
- ✅ API endpoint di-protect
- ✅ 403 error jika akses tanpa permission

---

### 🎨 4. UI/UX Improvements

**Yang Bisa Dilihat:**

1. **Sidebar Baru**
   - Gradient background hijau
   - Icons dari Heroicons
   - Badge untuk role-specific features
   - Better hover effects
   - Active state indicator

2. **Order Status Components**
   - `OrderStatusBadge` - Badge dengan warna & icon
   - `OrderStatusSelector` - Dropdown untuk update
   - `OrderStatusTimeline` - Visual progress bar

3. **Modern Tables**
   - Better spacing
   - Hover effects
   - Loading states
   - Empty states

4. **Modals**
   - Smooth animations
   - Better layout
   - Action buttons grouped

---

## 🧪 Testing via Postman

### 1. Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@baletani.com",
  "password": "admin123"
}
```

**Save the token!**

### 2. Get Orders
```http
GET http://localhost:5000/api/admin/orders
Authorization: Bearer {your_token}
```

### 3. Update Order Status
```http
PATCH http://localhost:5000/api/admin/orders/1/status
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "order_status": "processing",
  "notes": "Order is being prepared"
}
```

### 4. Create Procurement
```http
POST http://localhost:5000/api/admin/procurements
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 100,
      "unit_price": 50000
    }
  ],
  "notes": "Monthly restocking"
}
```

### 5. Approve Procurement
```http
PATCH http://localhost:5000/api/admin/procurements/1/approve
Authorization: Bearer {your_token}
```

---

## 📊 Check Database Changes

### 1. Check New Tables
```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should include:
-- - users (updated)
-- - orders (updated)
-- - procurements (new)
-- - procurement_items (new)
-- - stock_movements_reporting (new)
```

### 2. Check User Roles
```sql
SELECT id, full_name, email, role FROM users;
```

### 3. Check Order Status
```sql
SELECT id, order_status, transaction_type, total_price 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

### 4. Check Procurement
```sql
SELECT p.id, p.procurement_number, p.status, p.total_cost,
       u.full_name as created_by_name
FROM procurements p
LEFT JOIN users u ON p.created_by = u.id
ORDER BY p.created_at DESC;
```

### 5. Check Stock Movements
```sql
SELECT sm.id, sm.movement_type, sm.quantity,
       p.name as product_name,
       u.full_name as created_by_name
FROM stock_movements_reporting sm
LEFT JOIN products p ON sm.product_id = p.id
LEFT JOIN users u ON sm.created_by = u.id
ORDER BY sm.created_at DESC;
```

---

## ✅ Checklist Testing

### Backend
- [ ] Server starts without errors
- [ ] Database connection works
- [ ] All models sync correctly
- [ ] Login endpoint works
- [ ] JWT authentication works
- [ ] Order endpoints work
- [ ] Procurement endpoints work
- [ ] Role-based access control works
- [ ] Stock updates on procurement approval

### Frontend
- [ ] App starts without errors
- [ ] Login page works
- [ ] Admin dashboard loads
- [ ] Sidebar shows correct menus per role
- [ ] Order Management page loads
- [ ] Order status dropdown works
- [ ] Status updates without reload
- [ ] Order detail modal works
- [ ] Procurement page loads
- [ ] Approve/Reject buttons work
- [ ] Toast notifications appear
- [ ] Responsive design works

### Database
- [ ] All tables exist
- [ ] Foreign keys set correctly
- [ ] Indexes created
- [ ] Seed data loaded
- [ ] Triggers work (if any)

### Security
- [ ] JWT tokens required for admin routes
- [ ] Role permissions enforced
- [ ] Password hashing works
- [ ] CORS configured correctly
- [ ] SQL injection prevented
- [ ] XSS prevented

---

## 🐛 Common Issues

### Issue: "Cannot read property 'role' of undefined"
**Solution:** User not logged in atau token expired. Login ulang.

### Issue: "403 Forbidden"
**Solution:** User tidak punya permission. Check role dan endpoint requirements.

### Issue: "Order status not updating"
**Solution:** 
1. Check network tab - apakah API call success?
2. Check console - ada error?
3. Verify user role allows updating that transaction type

### Issue: "Procurement approval tidak update stock"
**Solution:**
1. Check product_id valid
2. Check database transaction committed
3. Verify stock_movements record created

---

## 🎯 Next Testing Steps

1. **Load Testing**
   - Test dengan banyak orders
   - Test dengan banyak concurrent users

2. **Error Handling**
   - Test invalid data input
   - Test network failures
   - Test database errors

3. **Edge Cases**
   - Order dengan 0 items
   - Procurement dengan 100+ items
   - Very long customer names
   - Special characters in notes

4. **Performance**
   - Page load time
   - API response time
   - Database query optimization

---

## 📞 Need Help?

Jika ada masalah saat testing:

1. Check console logs (browser & terminal)
2. Check network tab untuk API calls
3. Verify database state
4. Read error messages carefully
5. Check documentation di `docs/`

---

**Happy Testing! 🎉**
