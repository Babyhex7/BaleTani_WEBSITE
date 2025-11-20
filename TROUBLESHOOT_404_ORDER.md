# 🚨 TROUBLESHOOTING: 404 NOT FOUND - Order Tests

## ❌ MASALAH: Semua Order Test Return 404

**User Report:** Test case `GET /api/customer/orders/{{orderId}}` selalu return **404 Not Found**

---

## 🔍 ROOT CAUSE ANALYSIS

### 1. **Backend Routing - ✅ SUDAH BENAR**

File: `backend/src/routes/customer/order.routes.js`

```javascript
// Route order SUDAH BENAR (spesifik dulu, generic belakangan):
router.get("/history/:id", authenticateCustomer, getOrderHistoryDetail); // Line 42
router.get("/:id", authenticateCustomer, getOrderDetail); // Line 79
```

**Status:** ✅ Route sudah registered, middleware sudah benar

---

### 2. **Controller - ✅ SUDAH ADA**

File: `backend/src/controllers/customerOrder.controller.js`

```javascript
const getOrderDetail = async (req, res) => {
  const { id } = req.params;
  const customerId = req.customer?.id;

  const order = await Order.findOne({
    where: {
      id: id,
      customer_id: customerId, // ✅ Hanya show order milik sendiri
    },
    include: [
      /* ... */
    ],
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order tidak ditemukan", // ✅ MESSAGE INI YANG MUNCUL
    });
  }

  return res.status(200).json({ success: true, data: order });
};
```

**Status:** ✅ Controller logic benar, return 404 jika order tidak ditemukan

---

### 3. **Variable `@orderId` - ❌ INI MASALAHNYA!**

File: `testing/customer-test/3-customer-order.http` (Line 10)

```http
@orderId = 4eb98bd9-4e07-4be2-9a4a-999398889afd  # ❌ UUID HARDCODED!
```

**PROBLEM:**

- UUID ini adalah **CONTOH/DUMMY**
- UUID ini **TIDAK ADA di database** user
- Setiap create order akan generate **UUID BARU yang unik**
- User **HARUS** copy order_id dari response TEST 1.1 ke variable ini

---

## ✅ SOLUSI & CARA BENAR TESTING

### **STEP BY STEP - URUTAN EKSEKUSI BENAR:**

#### **1️⃣ Login & Get Token**

```http
### STEP 0.1: Login Customer
POST {{baseUrl}}/api/customer/auth/login
Content-Type: application/json

{
  "phone_number": "081234567890",
  "password": "password123"
}

# 📝 RESPONSE:
# {
#   "success": true,
#   "token": "eyJhbG...",  # ← COPY TOKEN INI
#   "customer": {...}
# }

# ✅ PASTE ke @customerToken di line 9
```

---

#### **2️⃣ Add Item to Cart**

```http
### STEP 0.2: Tambah Produk ke Cart
POST {{baseUrl}}/api/customer/cart
Content-Type: application/json
Authorization: Bearer {{customerToken}}

{
  "product_id": "{{productId1}}",  # ← Harus product ID yang VALID dari DB
  "quantity": 2
}

# 📝 Check product_id dari:
# - Database: SELECT id FROM products WHERE is_active = true LIMIT 1;
# - Admin panel: GET /api/admin/products
# - Public API: GET /api/public/products
```

---

#### **3️⃣ Create Order (PALING PENTING!)**

```http
### TEST 1.1: Checkout - Delivery dengan Transfer Bank BRI
POST {{baseUrl}}/api/customer/orders/create
Content-Type: application/json
Authorization: Bearer {{customerToken}}

{
  "customer_name": "Budi Santoso",
  "customer_phone": "081234567890",
  "delivery_method": "delivery",
  "delivery_address": "Jl. Merdeka No. 45, Jakarta",
  "payment_method": "transfer",
  "bank_name": "BRI",
  "items": [
    {
      "product_id": "{{productId1}}",
      "quantity": 2
    }
  ]
}

# 📝 RESPONSE (201 Created):
# {
#   "success": true,
#   "message": "Order berhasil dibuat",
#   "data": {
#     "order_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",  # ← COPY UUID INI!
#     "order_number": "ORD-20241120-001",
#     "order_status": "pending_payment",
#     ...
#   }
# }

# ✅ PASTE order_id ke @orderId di line 10:
# @orderId = a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

#### **4️⃣ Test Order Detail (Baru Bisa Jalan!)**

```http
### TEST 4.1: Get Order Detail - Valid Order ID
GET {{baseUrl}}/api/customer/orders/{{orderId}}  # ← Sekarang UUID nya VALID!
Content-Type: application/json
Authorization: Bearer {{customerToken}}

# 📝 RESPONSE (200 OK):
# {
#   "success": true,
#   "data": {
#     "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
#     "order_number": "ORD-20241120-001",
#     "order_status": "pending_payment",
#     "orderItems": [...],
#     "payment": {...},
#     "statusHistory": [...]
#   }
# }
```

---

## 🎯 KENAPA 404 NOT FOUND?

### **Skenario 1: UUID Tidak Ada di Database** ❌

```http
@orderId = 4eb98bd9-4e07-4be2-9a4a-999398889afd  # ← UUID dummy/contoh

GET /api/customer/orders/4eb98bd9-4e07-4be2-9a4a-999398889afd
# ❌ 404: Order tidak ditemukan (karena UUID ini TIDAK ADA di DB)
```

**Fix:** Gunakan UUID dari response create order (TEST 1.1)

---

### **Skenario 2: Order Milik Customer Lain** ❌

```javascript
// Backend validation:
whereClause.customer_id = customerId; // ✅ Security: hanya show order sendiri

// Jika order_id valid tapi customer_id tidak match:
// ❌ 404: Order tidak ditemukan (bukan 403 untuk security reason)
```

**Fix:** Login sebagai customer yang membuat order tersebut

---

### **Skenario 3: Token Expired/Invalid** ❌

```http
Authorization: Bearer eyJhbG... (token expired)

# ❌ 401: Unauthorized (dari middleware authenticateCustomer)
```

**Fix:** Login ulang untuk dapat token baru (expired after 24 hours)

---

## 📋 CHECKLIST DEBUGGING

Jika masih 404, cek secara berurutan:

- [ ] **1. Token Valid?**

  ```bash
  # Test token:
  curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/customer/profile
  # Jika 401 → token expired/invalid
  ```

- [ ] **2. Product ID Valid?**

  ```sql
  SELECT id, name, is_active FROM products WHERE is_active = true LIMIT 5;
  -- Gunakan salah satu id untuk @productId1
  ```

- [ ] **3. Create Order Berhasil?**

  ```bash
  # Harus return 201, bukan 400/500
  # Copy order_id dari response
  ```

- [ ] **4. Order ID Benar-benar Ada?**

  ```sql
  SELECT id, order_number, customer_id, order_status
  FROM orders
  WHERE id = '4eb98bd9-4e07-4be2-9a4a-999398889afd';
  -- Harus return 1 row
  ```

- [ ] **5. Customer ID Match?**
  ```sql
  -- Decode JWT token untuk dapat customer_id
  -- Check apakah order.customer_id === token.userId
  SELECT customer_id FROM orders WHERE id = 'YOUR_ORDER_ID';
  ```

---

## 🔧 QUICK FIX INSTRUCTIONS

### **Option 1: Manual Update (Recommended)**

1. Jalankan **TEST 1.1** (Create Order)
2. **Copy** `data.order_id` dari response
3. **Paste** ke variable `@orderId` di line 10
4. Jalankan **TEST 4.1** (Get Order Detail)

### **Option 2: Query Database**

```sql
-- Get latest order untuk customer tertentu:
SELECT o.id, o.order_number, o.customer_id, c.phone_number
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE c.phone_number = '62812345678 90'  -- Sesuaikan dengan phone number login
ORDER BY o.created_at DESC
LIMIT 1;

-- COPY id ke @orderId
```

### **Option 3: Dynamic Variable (Advanced)**

Gunakan VS Code REST Client feature:

```http
### Create Order & Save ID
# @name createOrderTest
POST {{baseUrl}}/api/customer/orders/create
...

### Get Order Detail menggunakan ID dari request sebelumnya
@orderId = {{createOrderTest.response.body.data.order_id}}
GET {{baseUrl}}/api/customer/orders/{{orderId}}
```

---

## 📊 EXPECTED BEHAVIOR

| Test Case | Endpoint                           | Expected        | Actual Cause         |
| --------- | ---------------------------------- | --------------- | -------------------- |
| TEST 4.1  | `GET /orders/:id`                  | 200 OK          | 404 (UUID tidak ada) |
| TEST 4.2  | `GET /orders/00000000-...`         | 404 Not Found   | ✅ (intentional)     |
| TEST 4.3  | `GET /orders/:id` (other customer) | 404 Not Found   | ✅ (security)        |
| TEST 4.4  | `GET /orders/invalid-uuid`         | 400 Bad Request | Need validation      |

---

## ✅ FINAL SOLUTION

**Update test file dengan instruksi yang jelas:**

```http
###############################################
# ⚠️ PENTING: BACA SEBELUM TESTING!
###############################################

# 🔴 STEP 1: Login dulu (STEP 0.1) → COPY token
# 🔴 STEP 2: Tambah cart (STEP 0.2) → Pastikan success
# 🔴 STEP 3: Create order (TEST 1.1) → COPY order_id dari response!
# 🔴 STEP 4: PASTE order_id ke @orderId (line 10)
# 🔴 STEP 5: Baru jalankan TEST 4.1-4.4

# ❌ JANGAN langsung jalankan TEST 4.1 tanpa update @orderId!
# ❌ UUID di @orderId hanya CONTOH, bukan UUID real dari database!

@baseUrl = http://localhost:5000
@customerToken = <PASTE_TOKEN_DARI_LOGIN>
@orderId = <PASTE_ORDER_ID_DARI_CREATE_ORDER_RESPONSE>
@productId1 = <GET_FROM_DATABASE_OR_ADMIN_PANEL>
```

---

## 🎯 KESIMPULAN

**NOT FOUND bukan karena:**

- ❌ Route salah
- ❌ Controller tidak ada
- ❌ Middleware error

**NOT FOUND karena:**

- ✅ **UUID di `@orderId` tidak ada di database**
- ✅ **User belum create order atau belum update variable**
- ✅ **Expected behavior untuk dummy UUID**

**Fix:** Ikuti urutan testing yang benar (Login → Cart → Create → Get Detail)

---

**Status:** ✅ Backend BENAR, Test case butuh UPDATE VARIABLE dengan UUID REAL
