# 📚 REST Client API Testing - BaleTani

## 📋 Daftar Isi

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Struktur File](#struktur-file)
- [Cara Menggunakan](#cara-menggunakan)
- [Testing Workflow](#testing-workflow)
- [Tips & Tricks](#tips--tricks)

---

## 🔧 Prerequisites

1. **VS Code** - Text editor
2. **REST Client Extension** - VS Code extension by Huachao Mao
3. **Backend Server** - Harus running di `http://localhost:5000`

### Install REST Client Extension

```
1. Buka VS Code
2. Tekan Ctrl+Shift+X (Extensions)
3. Cari "REST Client"
4. Install yang dari "Huachao Mao"
5. Reload VS Code
```

---

## 📁 Struktur File

```
api-tests/
├── README.md                    ← Dokumentasi ini
├── environment.http             ← Environment variables
├── 1-public-api.http           ← Public endpoints (no auth)
├── 2-customer-auth.http        ← Customer authentication
├── 3-customer-cart.http        ← Customer cart operations
├── 4-admin-auth.http           ← Admin authentication
├── 5-admin-products.http       ← Admin product management
├── 6-admin-categories.http     ← Admin category management
└── 7-admin-discounts.http      ← Admin discount management
```

---

## 🚀 Setup

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Backend akan running di `http://localhost:5000`

### 2. Verifikasi Server

Buka browser dan akses: `http://localhost:5000`

Jika muncul response dari server, berarti backend sudah siap.

---

## 📖 Cara Menggunakan

### 1. Buka File .http

Buka file yang ingin di-test, misalnya `1-public-api.http`

### 2. Klik "Send Request"

Di atas setiap HTTP request, akan muncul link **"Send Request"**:

```http
### 1. Get All Products
GET {{baseUrl}}/api/public/products    ← Klik "Send Request" di sini
```

### 3. Lihat Response

Response akan muncul di panel sebelah kanan dengan format JSON yang rapi.

### 4. Copy Data dari Response

Untuk testing lanjutan, copy data penting seperti:

- `token` dari login
- `id` produk/kategori/dll

### 5. Paste ke Variable

Paste data ke variable di bagian atas file:

```http
@baseUrl = http://localhost:5000
@customerToken = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ← Paste token di sini
```

---

## 🔄 Testing Workflow

### A. Public API Testing (No Auth)

**File:** `1-public-api.http`

```
1. ✅ Get All Products
2. ✅ Get Product Detail (copy product ID dari step 1)
3. ✅ Get Promo Products
4. ✅ Get All Categories
```

**Tidak perlu authentication!**

---

### B. Customer Flow

#### Step 1: Register & Login

**File:** `2-customer-auth.http`

```
1. Register Customer
   - Klik "Send Request" di "Register New Customer"
   - Lihat response: customer berhasil dibuat

2. Login Customer
   - Klik "Send Request" di "Login Customer"
   - Copy token dari response:
     {
       "data": {
         "token": "eyJhbGc..."  ← Copy ini
       }
     }

3. Paste Token
   - Paste ke @customerToken di baris 7
   - Sekarang bisa akses protected routes
```

#### Step 2: Cart Operations

**File:** `3-customer-cart.http`

```
1. Get Product ID
   - Buka 1-public-api.http
   - Get All Products
   - Copy ID produk yang mau ditambahkan
   - Paste ke @productId di 3-customer-cart.http

2. Add to Cart
   - Klik "Send Request" di "Add Product to Cart"
   - Product akan masuk ke cart

3. Get Cart
   - Klik "Send Request" di "Get Cart"
   - Lihat semua items di cart
   - Copy cart_item_id untuk update/delete

4. Update Quantity
   - Paste cart_item_id ke @cartItemId
   - Klik "Send Request" di "Update Cart Item"

5. Remove Item
   - Klik "Send Request" di "Remove Item from Cart"
```

---

### C. Admin Flow

#### Step 1: Admin Login

**File:** `4-admin-auth.http`

```
1. Login Admin
   - Klik "Send Request" di "Login Admin"
   - Default credentials:
     Email: admin@baletani.com
     Password: admin123

2. Copy Token
   - Copy token dari response
   - Paste ke @adminToken di semua admin files
```

#### Step 2: Category Management

**File:** `6-admin-categories.http`

```
1. Get All Categories
   - Klik "Send Request"
   - Copy category ID

2. Create Category
   - Klik "Send Request" di "Create New Category"
   - Copy category ID dari response
   - Gunakan ID ini untuk create product

3. Update Category
   - Paste category ID ke @categoryId
   - Klik "Send Request" di "Update Category"

4. Delete Category
   - Klik "Send Request" di "Delete Category"
```

#### Step 3: Product Management

**File:** `5-admin-products.http`

```
1. Get Category ID
   - Dari 6-admin-categories.http
   - Copy category ID
   - Paste ke @categoryId di 5-admin-products.http

2. Create Product
   - Klik "Send Request" di "Create New Product"
   - Copy product ID dari response

3. Update Product
   - Paste product ID ke @productId
   - Klik "Send Request" di "Update Product"

4. Delete Product
   - Klik "Send Request" di "Delete Product"
```

#### Step 4: Discount Management

**File:** `7-admin-discounts.http`

```
1. Get All Discounts
   - Klik "Send Request"

2. Create Discount
   - Klik "Send Request" di "Create New Discount"
   - Copy discount ID

3. Update Discount
   - Paste discount ID ke @discountId
   - Klik "Send Request"

4. Delete Discount
   - Klik "Send Request"
```

---

## 💡 Tips & Tricks

### 1. Keyboard Shortcuts

| Shortcut         | Fungsi                    |
| ---------------- | ------------------------- |
| `Ctrl + Alt + R` | Send request              |
| `Ctrl + Alt + K` | Send all requests in file |
| `Ctrl + Alt + C` | Cancel request            |
| `Ctrl + Alt + E` | Switch environment        |

### 2. Menyimpan Response

Klik kanan di response panel → **Save Response** → Pilih format (JSON/HTML/etc)

### 3. History

REST Client menyimpan history semua request di:

- Click "History" tab di panel bawah
- Bisa re-run request lama

### 4. Gunakan Variables

Selalu gunakan variables untuk data yang sering berubah:

```http
@baseUrl = http://localhost:5000
@productId = 123-abc-456

GET {{baseUrl}}/api/products/{{productId}}
```

### 5. Comment pada Request

Tambahkan komentar untuk dokumentasi:

```http
### Get Product Detail
# Endpoint ini untuk mendapatkan detail produk
# Membutuhkan ID produk yang valid
GET {{baseUrl}}/api/public/products/{{productId}}
```

### 6. Multiple Environments

Buat file terpisah untuk dev/staging/prod:

**environment.dev.http:**

```http
@baseUrl = http://localhost:5000
```

**environment.prod.http:**

```http
@baseUrl = https://api.baletani.com
```

---

## 🐛 Troubleshooting

### Error: "Failed to connect"

**Solusi:**

```
✅ Check backend server sudah running
✅ Check port 5000 tidak dipakai aplikasi lain
✅ Check @baseUrl sudah benar
```

### Error: "Unauthorized" (401)

**Solusi:**

```
✅ Check token sudah di-paste ke variable
✅ Check token belum expired
✅ Re-login untuk dapat token baru
✅ Check Authorization header format: Bearer <token>
```

### Error: "Not Found" (404)

**Solusi:**

```
✅ Check endpoint URL sudah benar
✅ Check ID yang digunakan valid (copy dari response API)
✅ Check backend route sudah terdaftar
```

### Error: "Validation Error" (400)

**Solusi:**

```
✅ Check request body sesuai format yang diminta
✅ Check semua required fields sudah diisi
✅ Check tipe data sudah sesuai (string/number/boolean)
```

---

## 📊 Response Format

Semua response API menggunakan format standar:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Data hasil operasi
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## 🔐 Authentication Flow

### Customer Authentication

```
1. Register → Get token
2. Login → Get token
3. Store token di @customerToken
4. Use token untuk cart operations
```

### Admin Authentication

```
1. Login → Get token
2. Store token di @adminToken
3. Use token untuk semua admin operations
```

---

## 📝 Best Practices

### 1. Organize Your Tests

- Pisahkan per module (auth, cart, products, dll)
- Beri nomor urut di nama file
- Gunakan komentar yang jelas

### 2. Use Descriptive Names

```http
### Get All Products with Pagination ✅
GET {{baseUrl}}/api/public/products?page=1&limit=12

### get products ❌ (kurang jelas)
```

### 3. Save Important IDs

```http
# Setelah create product, save ID-nya
@productId = 1fbda520-6dce-4131-bb42-23d37cffe5b2

# Gunakan di request lain
PUT {{baseUrl}}/api/admin/products/{{productId}}
```

### 4. Test in Order

Ikuti urutan testing yang logis:

```
1. Public APIs (no auth needed)
2. Authentication (get tokens)
3. Protected APIs (use tokens)
```

---

## 🎯 Common Workflows

### Workflow 1: Test Public API

```
1. Buka 1-public-api.http
2. Test Get All Products
3. Copy product ID
4. Test Get Product Detail
5. Test Get Promo Products
6. Test Get Categories
```

### Workflow 2: Test Customer Features

```
1. Register di 2-customer-auth.http
2. Login dan copy token
3. Get products di 1-public-api.http
4. Add to cart di 3-customer-cart.http
5. Get cart untuk verifikasi
6. Update quantity
7. Remove item
```

### Workflow 3: Test Admin Features

```
1. Login admin di 4-admin-auth.http
2. Create category di 6-admin-categories.http
3. Create product dengan category ID
4. Create discount di 7-admin-discounts.http
5. Verify di public API
```

---

## 📞 Support

Jika ada pertanyaan atau masalah:

1. Check dokumentasi backend: `backend/AUTHENTICATION_GUIDE.md`
2. Check response error message
3. Check browser console (jika ada CORS issue)

---

## 🚀 Quick Start

**Untuk mulai testing:**

1. Install REST Client extension
2. Start backend server (`npm run dev`)
3. Buka `1-public-api.http`
4. Klik "Send Request" di "Get All Products"
5. Lihat response ✅

**Happy Testing!** 🎉

---

**Last Updated:** January 27, 2025  
**Version:** 1.0.0
