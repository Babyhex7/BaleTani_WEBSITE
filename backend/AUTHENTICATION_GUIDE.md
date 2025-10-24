# 🔐 Authentication & Authorization Documentation

## Overview
BaleTani menggunakan JWT-based authentication dengan Role-Based Access Control (RBAC) yang lengkap.

---

## 🎭 User Roles

### 1. **Customer** (No admin access)
**Description:** Browse products, place orders, send details via WhatsApp, make payment, and track delivery

**Permissions:**
- ✅ Browse & search products
- ✅ Place orders
- ✅ Send order details via WhatsApp
- ✅ Make payments
- ✅ Track delivery status

**Authentication:**
- Register: `POST /api/customer/auth/register`
- Login: `POST /api/customer/auth/login`
- Token type: `"customer"`

---

### 2. **Super Admin** (Full system access)
**Description:** Full system access: manage users, products, transactions, and configurations

**Permissions:**
- ✅ **Full CRUD:** Users, Products, Categories, Discounts, Procurements
- ✅ **Manage:** All transactions (online & offline)
- ✅ **Approve:** Procurement proposals
- ✅ **Configure:** System settings
- ✅ **Access:** All reports and analytics
- ✅ **Create:** Other admin users with any role

**Authentication:**
- No registration (created by seeder or another super admin)
- Login: `POST /api/admin/auth/login`
- Token type: `"admin"`
- Default credentials: `6282111111111` / `admin123`

---

### 3. **Super WhatsApp Admin**
**Description:** Create, view, and update (status only) online/offline transactions; cancel orders; manage customer data

**Permissions:**
- ✅ Create online & offline transactions
- ✅ View all transactions
- ✅ Update transaction status
- ✅ Cancel orders
- ✅ CRUD customer data
- ❌ Cannot delete transactions
- ❌ Cannot change transaction amounts

---

### 4. **Super Cashier**
**Description:** Create, view, and update (status only) online/offline transactions; cancel orders; manage customer data

**Permissions:**
- ✅ Create online & offline transactions
- ✅ View all transactions
- ✅ Update transaction status
- ✅ Cancel orders
- ✅ CRUD customer data
- ❌ Cannot delete transactions
- ❌ Cannot change transaction amounts

---

### 5. **WhatsApp Admin**
**Description:** Create and view only online transactions; update order statuses

**Permissions:**
- ✅ Create online transactions only
- ✅ View online transactions
- ✅ Update order statuses
- ❌ Cannot create offline transactions
- ❌ Cannot cancel orders
- ❌ Cannot delete transactions

---

### 6. **Cashier**
**Description:** Create and view only offline transactions; update order statuses

**Permissions:**
- ✅ Create offline transactions only
- ✅ View offline transactions
- ✅ Update order statuses
- ❌ Cannot create online transactions
- ❌ Cannot cancel orders
- ❌ Cannot delete transactions

---

### 7. **Finance Admin**
**Description:** View inventory, procurement, and transaction reports

**Permissions:**
- ✅ View all reports (inventory, procurement, transactions)
- ✅ Export reports
- ✅ View analytics
- ❌ Cannot create/update/delete any data
- ❌ Read-only access

---

### 8. **Inventory Admin**
**Description:** Create, Update (until the procurement is proposed) procurement records

**Permissions:**
- ✅ Create procurement records
- ✅ Update procurement (before proposal)
- ✅ View inventory
- ✅ View stock movements
- ❌ Cannot approve procurement
- ❌ Cannot modify after proposal

---

### 9. **Super Inventory Admin**
**Description:** CRUD Procurement, CRUD Product, Approval Procurement

**Permissions:**
- ✅ **Full CRUD:** Products
- ✅ **Full CRUD:** Procurements (all stages)
- ✅ **Approve:** Procurement proposals
- ✅ Manage stock movements
- ✅ View inventory reports

---

## 🔑 Authentication Flow

### Customer Authentication Flow
```
1. Customer visits website
2. Register: POST /api/customer/auth/register
   Body: {
     phone_number: "08xxxxxxxxxx",
     full_name: "Customer Name",
     password: "password",
     address: "Address (optional)"
   }
3. Receive JWT token with type: "customer"
4. Store token in localStorage/cookie
5. Use token for authenticated requests
```

### Admin Authentication Flow
```
1. Admin opens admin panel
2. Super Admin creates admin user via:
   POST /api/admin/users
   Body: {
     phone_number: "08xxxxxxxxxx",
     full_name: "Admin Name",
     password: "password",
     role_id: "<uuid-of-role>"
   }
3. New admin logs in: POST /api/admin/auth/login
   Body: {
     phone_number: "08xxxxxxxxxx",
     password: "password"
   }
4. Receive JWT token with type: "admin" + role info
5. Store token in localStorage
6. Use token for authenticated requests
```

---

## 🛡️ Middleware Usage

### 1. **authenticateCustomer**
```javascript
// Customer routes only
router.post('/orders', authenticateCustomer, createOrder);
```

### 2. **authenticateAdmin**
```javascript
// Admin routes (any admin role)
router.get('/dashboard', authenticateAdmin, getDashboard);
```

### 3. **roleMiddleware**
```javascript
// Specific role requirements
const { authenticateAdmin, roleMiddleware } = require('../middleware/auth.middleware');

// Only super_admin can create users
router.post('/users', 
  authenticateAdmin, 
  roleMiddleware(['super_admin']), 
  createUser
);

// Multiple roles allowed
router.get('/reports', 
  authenticateAdmin, 
  roleMiddleware(['super_admin', 'finance_admin']), 
  getReports
);
```

---

## 📊 JWT Token Structure

### Customer Token
```json
{
  "id": "uuid",
  "phone_number": "6281234567890",
  "type": "customer",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Admin Token
```json
{
  "userId": "uuid",
  "type": "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 🔒 Password Security

### Hashing
- Algorithm: **bcryptjs**
- Salt rounds: **10**
- Auto-hashing on create/update via Sequelize hooks

### Password Requirements (Recommended)
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers
- Special characters recommended

---

## 🌐 API Configuration

### Backend
- **Port:** 5000
- **Base URL:** `http://localhost:5000/api`
- **Environment:** `.env` file

### Frontend
- **Customer:** Port 5173
- **Admin:** Port 5174 (if separate)
- **API Base URL:** `VITE_API_BASE_URL=http://localhost:5000/api`

---

## 📝 Example Requests

### Customer Registration
```bash
curl -X POST http://localhost:5000/api/customer/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "08123456789",
    "full_name": "John Doe",
    "password": "securepassword",
    "address": "Jl. Example No. 123"
  }'
```

### Customer Login
```bash
curl -X POST http://localhost:5000/api/customer/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "08123456789",
    "password": "securepassword"
  }'
```

### Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "6282111111111",
    "password": "admin123"
  }'
```

### Authenticated Request
```bash
curl -X GET http://localhost:5000/api/customer/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Akses ditolak. Token tidak tersedia."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Akses ditolak. Permissions tidak mencukupi."
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Nomor telepon dan password wajib diisi"
}
```

---

## ✅ Security Checklist

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens with expiration (7 days)
- ✅ CORS configured for specific origins
- ✅ Rate limiting enabled
- ✅ Helmet for security headers
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ Phone number normalization
- ✅ Soft delete for data retention
- ✅ Role-based access control (RBAC)

---

**Last Updated:** October 24, 2025  
**Version:** 2.0.0
