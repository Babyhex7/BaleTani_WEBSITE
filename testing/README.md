# 🧪 TESTING DOCUMENTATION - BaleTani Fresh Market

## 📋 DAFTAR ISI

- [Overview](#overview)
- [Setup Testing](#setup-testing)
- [Customer Test Files](#customer-test-files)
- [Admin Test Files](#admin-test-files)
- [Cara Menggunakan](#cara-menggunakan)
- [Test Coverage](#test-coverage)
- [Troubleshooting](#troubleshooting)

---

## 🎯 OVERVIEW

Testing suite lengkap untuk BaleTani Fresh Market yang mencakup:

- ✅ **API Testing** (REST API endpoints)
- ✅ **Authentication Testing** (Login, Register, Token validation)
- ✅ **Authorization Testing** (RBAC permissions)
- ✅ **Business Logic Testing** (Cart, Order, Stock, Discount)
- ✅ **Security Testing** (SQL Injection, XSS, Rate Limiting)
- ✅ **Edge Cases Testing** (Invalid inputs, boundary conditions)

**Total Test Cases: 180+**

---

## 🛠️ SETUP TESTING

### 1. Install VS Code Extension

Install extension **"REST Client"** di VS Code:

```
Name: REST Client
Id: humao.rest-client
Publisher: Huachao Mao
```

### 2. Jalankan Backend Server

```bash
cd backend
npm install
npm run dev
```

Server akan berjalan di: `http://localhost:5000`

### 3. Setup Database

Pastikan database sudah di-setup dan seeder sudah dijalankan:

```bash
# Database seeder
npm run seed

# Admin & RBAC seeder (untuk testing admin)
npm run seed:rbac-permissions
npm run seed:rbac-admins
```

### 4. Verify Server Running

Test dengan command:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is running!",
  "timestamp": "..."
}
```

---

## 👥 CUSTOMER TEST FILES

### 📁 `customer-test/`

#### **1-customer-auth.http** (30+ tests)

**Deskripsi:** Test authentication untuk customer (register & login)

**Test Coverage:**

- ✅ Registrasi customer baru (berbagai format HP)
- ✅ Login customer dengan HP + password
- ✅ Validasi input (required fields, format)
- ✅ Token JWT generation & validation
- ✅ Protected routes access
- ✅ Rate limiting (anti brute force)
- ✅ Security (SQL injection, XSS prevention)

**Key Features:**

- Login pakai **NOMOR HP** (bukan email!)
- Format HP otomatis dinormalisasi (08xxx → 628xxx)
- Token expired: 24 jam

**Cara Test:**

```http
### 1. Registrasi
POST http://localhost:5000/api/customer/auth/register
Content-Type: application/json

{
  "phone_number": "081234567890",
  "full_name": "Budi Santoso",
  "password": "password123",
  "address": "Jl. Merdeka No. 45"
}

### 2. Login
POST http://localhost:5000/api/customer/auth/login
Content-Type: application/json

{
  "phone_number": "081234567890",
  "password": "password123"
}

### 3. Copy token dari response, gunakan untuk test berikutnya
```

---

#### **2-customer-cart.http** (35+ tests)

**Deskripsi:** Test operasi keranjang belanja customer

**Test Coverage:**

- ✅ Get cart (lihat keranjang)
- ✅ Add to cart (tambah item)
- ✅ Update cart (ubah quantity)
- ✅ Remove from cart (hapus item)
- ✅ Clear cart (kosongkan keranjang)
- ✅ Cart calculation (harga, discount)
- ✅ Cart isolation (per customer)
- ✅ Stock validation
- ✅ Edge cases (out of stock, deleted products)

**Key Features:**

- Cart persistent (tidak hilang setelah logout)
- Stock validation real-time
- Discount otomatis diterapkan
- Cart per customer (isolated)

**Cara Test:**

```http
### 1. Login dulu, ambil token

### 2. Tambah item ke cart
POST http://localhost:5000/api/customer/cart/add
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "product_id": "uuid-product-id",
  "quantity": 2
}

### 3. Lihat cart
GET http://localhost:5000/api/customer/cart
Authorization: Bearer YOUR_TOKEN
```

---

#### **3-customer-order.http** (40+ tests)

**Deskripsi:** Test pembuatan order dan checkout customer

**Test Coverage:**

- ✅ Checkout (berbagai payment & delivery method)
- ✅ Order validation (required fields, format)
- ✅ Order creation (online orders)
- ✅ Order history (list orders)
- ✅ Order detail (view specific order)
- ✅ Payment expiry (10 menit auto-cancel)
- ✅ Stock deduction & return
- ✅ WhatsApp link generation

**Key Features:**

- Payment method: Transfer Bank (BRI/BCA/MANDIRI), Cash, QRIS
- Delivery method: Delivery, Self Pickup
- Payment expiry: 10 menit (auto-cancel by cron)
- WhatsApp link ke admin setelah checkout

**Cara Test:**

```http
### 1. Login & isi cart dulu

### 2. Checkout
POST http://localhost:5000/api/customer/orders/checkout
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "customer_name": "Budi Santoso",
  "customer_phone": "081234567890",
  "delivery_method": "delivery",
  "delivery_address": "Jl. Merdeka No. 45",
  "payment_method": "transfer",
  "bank_name": "BRI",
  "items": [
    {
      "product_id": "uuid-product-id",
      "quantity": 2
    }
  ]
}

### 3. Lihat order history
GET http://localhost:5000/api/customer/orders/history
Authorization: Bearer YOUR_TOKEN
```

---

## 🔐 ADMIN TEST FILES

### 📁 `admin-test/`

#### **1-admin-auth.http** (35+ tests)

**Deskripsi:** Test authentication & authorization admin (RBAC)

**Test Coverage:**

- ✅ Login admin (berbagai role)
- ✅ Role-Based Access Control (RBAC)
- ✅ Permission validation per role
- ✅ Cross-authentication (customer vs admin)
- ✅ Token security
- ✅ Rate limiting

**Admin Roles:**

1. **Super Admin**: Full access semua endpoint
2. **Super Cashier**: Manage orders, products (limited)
3. **Cashier**: View orders, create offline orders
4. **WhatsApp Admin**: Manage orders, contacts
5. **Inventory Admin**: Manage products, stock
6. **Finance Admin**: View reports, financial data

**Key Features:**

- Login pakai **NOMOR HP** (sama seperti customer)
- Token berisi: userId, role, permissions
- RBAC enforcement di setiap endpoint

**Cara Test:**

```http
### 1. Login Super Admin
POST http://localhost:5000/api/admin/auth/login
Content-Type: application/json

{
  "phone_number": "081111111111",
  "password": "superadmin123"
}

### 2. Test akses endpoint
GET http://localhost:5000/api/admin/products
Authorization: Bearer ADMIN_TOKEN

### 3. Test RBAC (kasir tidak bisa akses user management)
GET http://localhost:5000/api/admin/users
Authorization: Bearer KASIR_TOKEN
# Expected: 403 Forbidden
```

---

#### **2-admin-products.http** (40+ tests)

**Deskripsi:** Test CRUD product management oleh admin

**Test Coverage:**

- ✅ Get all products (filters, search, pagination)
- ✅ Get product detail
- ✅ Create product (ready stock & pre-order)
- ✅ Update product (partial update)
- ✅ Delete product (soft delete)
- ✅ Upload product images
- ✅ Cache invalidation
- ✅ Permission validation

**Key Features:**

- Soft delete (data tidak hilang dari DB)
- Profit margin auto-calculated
- SKU auto-generated (optional)
- Image upload (max 5MB, jpg/png/webp)
- Cache auto-invalidate setelah CRUD

**Cara Test:**

```http
### 1. Login admin dengan permission "manage_products"

### 2. Create product
POST http://localhost:5000/api/admin/products
Content-Type: application/json
Authorization: Bearer ADMIN_TOKEN

{
  "name": "Tomat Segar Organik",
  "description": "...",
  "category_id": "uuid-category-id",
  "product_type": "ready_stock",
  "selling_price": 25000,
  "purchase_price": 18000,
  "total_stock": 100,
  "quantity_info": "1 kg"
}

### 3. Update product
PUT http://localhost:5000/api/admin/products/uuid-product-id
{
  "selling_price": 28000
}

### 4. Soft delete
DELETE http://localhost:5000/api/admin/products/uuid-product-id
```

---

#### **3-admin-orders.http** (40+ tests)

**Deskripsi:** Test order management oleh admin

**Test Coverage:**

- ✅ Get all orders (filters, search, pagination)
- ✅ Get order detail
- ✅ Update order status
- ✅ Update payment status
- ✅ Create offline orders (walk-in customers)
- ✅ Order statistics
- ✅ Role-based access per action

**Key Features:**

- Filter: status, payment, delivery, date range
- Update status: pending → processing → shipped → delivered
- Cancel order: stock otomatis dikembalikan
- Offline orders: langsung completed & paid
- Status history tercatat (audit trail)

**Cara Test:**

```http
### 1. Get all orders dengan filter
GET http://localhost:5000/api/admin/orders?order_status=pending&payment_method=transfer
Authorization: Bearer ADMIN_TOKEN

### 2. Update order status
PUT http://localhost:5000/api/admin/orders/uuid-order-id/status
Content-Type: application/json
Authorization: Bearer ADMIN_TOKEN

{
  "order_status": "processing",
  "notes": "Order sedang diproses"
}

### 3. Create offline order (kasir)
POST http://localhost:5000/api/admin/orders/offline
Content-Type: application/json
Authorization: Bearer ADMIN_TOKEN

{
  "customer_name": "Walk-in Customer",
  "customer_phone": "081234567890",
  "payment_method": "cash",
  "delivery_method": "self_pickup",
  "items": [
    {
      "product_id": "uuid-product-id",
      "quantity": 2
    }
  ]
}
```

---

## 🎯 CARA MENGGUNAKAN

### Step-by-Step Guide:

#### 1. **Buka File .http di VS Code**

```
testing/
├── customer-test/
│   ├── 1-customer-auth.http
│   ├── 2-customer-cart.http
│   └── 3-customer-order.http
└── admin-test/
    ├── 1-admin-auth.http
    ├── 2-admin-products.http
    └── 3-admin-orders.http
```

#### 2. **Update Variables di File**

Setiap file punya variables di bagian atas:

```http
@baseUrl = http://localhost:5000
@customerToken = YOUR_TOKEN_HERE
@productId = YOUR_PRODUCT_ID_HERE
```

#### 3. **Jalankan Test**

- Klik **"Send Request"** di atas setiap `###`
- Atau gunakan shortcut: `Ctrl+Alt+R` (Windows) / `Cmd+Alt+R` (Mac)

#### 4. **Verify Response**

Check assertions di comment:

```http
# ✅ Assertions:
# - Status: 200
# - Response has "success": true
# - Response has "token"
```

#### 5. **Copy Token untuk Test Berikutnya**

```http
### Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Copy token, paste ke @customerToken di line 9
```

---

## 📊 TEST COVERAGE

### Customer Tests (105+ tests)

| File                      | Tests | Coverage                                    |
| ------------------------- | ----- | ------------------------------------------- |
| **1-customer-auth.http**  | 30+   | ✅ Register, Login, Token, Security         |
| **2-customer-cart.http**  | 35+   | ✅ CRUD Cart, Stock validation, Calculation |
| **3-customer-order.http** | 40+   | ✅ Checkout, Payment, History, Expiry       |

### Admin Tests (115+ tests)

| File                      | Tests | Coverage                                 |
| ------------------------- | ----- | ---------------------------------------- |
| **1-admin-auth.http**     | 35+   | ✅ Login, RBAC, Permissions, Security    |
| **2-admin-products.http** | 40+   | ✅ CRUD Products, Images, Cache          |
| **3-admin-orders.http**   | 40+   | ✅ Manage Orders, Status, Offline Orders |

**Total: 220+ Test Cases** ✅

---

## 🔍 TESTING CHECKLIST

### Before Testing:

- [ ] Backend server running (`npm run dev`)
- [ ] Database seeded (`npm run seed`)
- [ ] Admin seeded (`npm run seed:rbac-admins`)
- [ ] REST Client extension installed

### During Testing:

- [ ] Jalankan test secara berurutan (auth → cart → order)
- [ ] Copy & save token setelah login
- [ ] Verify response status code & body
- [ ] Check database untuk data consistency

### After Testing:

- [ ] Verify di frontend (jika sudah integrate)
- [ ] Check console log (no errors)
- [ ] Test cross-browser (jika E2E test)
- [ ] Clean up test data (optional)

---

## 🐛 TROUBLESHOOTING

### ❌ Error: "Connection refused"

**Solusi:** Pastikan backend server running di port 5000

```bash
cd backend
npm run dev
```

### ❌ Error: "Token tidak valid"

**Solusi:** Token expired atau salah. Login ulang dan ambil token baru.

### ❌ Error: "Produk tidak ditemukan"

**Solusi:** Ganti `@productId` dengan product ID yang valid dari database.

### ❌ Error: "Anda tidak memiliki akses"

**Solusi:** User tidak punya permission. Gunakan token Super Admin atau role yang sesuai.

### ❌ Error: "Stok tidak mencukupi"

**Solusi:** Stock produk habis. Update stock di database atau pakai produk lain.

### ❌ Error: "Nomor telepon sudah terdaftar"

**Solusi:** Ganti nomor HP saat registrasi atau hapus data dummy di database.

---

## 📚 REFERENCES

### API Documentation

Lihat file: `API_DOCUMENTATION.md` untuk detail endpoint.

### Database Schema

Lihat file: `docs/DATABASE_SETUP.md` untuk struktur database.

### Security Implementation

Lihat file: `SECURITY_IMPLEMENTATION.md` untuk security measures.

### RBAC Permissions

Lihat file: `RBAC_IMPLEMENTATION.md` untuk role & permissions matrix.

---

## 🚀 NEXT STEPS

Setelah API Testing selesai, lanjut ke:

1. **E2E Testing** (Cypress/Playwright)

   - Test user journey dari browser
   - Test UI components
   - Test responsive design

2. **Performance Testing** (JMeter/k6)

   - Load testing (100+ concurrent users)
   - Stress testing
   - Response time validation

3. **Security Testing** (OWASP ZAP)

   - Vulnerability scanning
   - Penetration testing
   - Security audit

4. **Unit Testing** (Jest/Vitest)
   - Test utility functions
   - Test React components
   - Test business logic

---

## 👨‍💻 CONTRIBUTORS

- **Developer:** BaleTani Team
- **Testing:** Quality Assurance Team
- **Documentation:** Technical Writer

---

## 📞 SUPPORT

Jika ada pertanyaan atau issue:

- 📧 Email: support@baletani.com
- 📱 WhatsApp: 085885725027
- 🌐 Website: https://baletani.com

---

**Last Updated:** November 20, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing
