# 🚀 Quick Start Guide - REST Client

## ⚡ Super Cepat (5 Menit)

### 1. Install Extension (1 menit)

```
VS Code → Extensions (Ctrl+Shift+X) → Search "REST Client" → Install
```

### 2. Start Backend (1 menit)

```bash
cd backend
npm run dev
```

### 3. Test Public API (1 menit)

```
1. Buka: api-tests/1-public-api.http
2. Klik "Send Request" di line pertama
3. Lihat response di panel kanan ✅
```

### 4. Test Customer (2 menit)

```
1. Buka: api-tests/2-customer-auth.http
2. Klik "Send Request" di "Login Customer"
3. Copy token dari response
4. Paste ke @customerToken (baris 7)
5. Test cart di 3-customer-cart.http
```

---

## 📁 File Apa Aja?

| File                      | Untuk Apa?              | Auth?  |
| ------------------------- | ----------------------- | ------ |
| `1-public-api.http`       | Public endpoints        | ❌ No  |
| `2-customer-auth.http`    | Login/Register customer | ❌ No  |
| `3-customer-cart.http`    | Operasi cart            | ✅ Yes |
| `4-admin-auth.http`       | Login admin             | ❌ No  |
| `5-admin-products.http`   | Manage products         | ✅ Yes |
| `6-admin-categories.http` | Manage categories       | ✅ Yes |
| `7-admin-discounts.http`  | Manage discounts        | ✅ Yes |

---

## 🎯 Cara Pakai Token

### Step 1: Login

```http
POST {{baseUrl}}/api/customer/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Step 2: Copy Token dari Response

```json
{
  "data": {
    "token": "eyJhbGc..."  ← Copy ini
  }
}
```

### Step 3: Paste ke Variable

```http
@customerToken = eyJhbGc...  ← Paste di sini (baris 7)
```

### Step 4: Use Token

```http
GET {{baseUrl}}/api/customer/cart
Authorization: Bearer {{customerToken}}  ← Auto pakai token
```

---

## 🔑 Credentials Default

### Customer Test Account

```
Email: john.doe@example.com
Password: password123
```

_(Buat dulu via Register di 2-customer-auth.http)_

### Admin Account

```
Email: admin@baletani.com
Password: admin123
```

_(Sudah ada dari seeder)_

---

## ⌨️ Shortcuts

| Tombol           | Fungsi                |
| ---------------- | --------------------- |
| `Ctrl + Alt + R` | Send request saat ini |
| `Ctrl + Alt + K` | Send semua requests   |
| `Ctrl + Alt + C` | Cancel request        |

---

## 🐛 Error? Cek Ini!

### ❌ "Failed to connect"

```
→ Backend belum running
→ Solusi: npm run dev di folder backend
```

### ❌ "Unauthorized" (401)

```
→ Token salah/expired
→ Solusi: Login ulang, copy token baru
```

### ❌ "Not Found" (404)

```
→ ID salah
→ Solusi: Copy ID yang benar dari response API
```

---

## 📊 Response Format

### ✅ Success

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### ❌ Error

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

---

## 🎬 Video Tutorial

### Public API

```
1. Buka 1-public-api.http
2. Klik "Send Request" di "Get All Products"
3. Scroll response untuk lihat data produk
4. Copy product ID dari salah satu produk
5. Paste ke endpoint "Get Product Detail"
6. Klik "Send Request" lagi
7. Lihat detail produk lengkap ✅
```

### Customer Cart

```
1. Login di 2-customer-auth.http
2. Copy token
3. Buka 3-customer-cart.http
4. Paste token ke @customerToken
5. Get product ID dari 1-public-api.http
6. Paste ke @productId
7. Klik "Add to Cart"
8. Klik "Get Cart" untuk verifikasi
9. Cart berisi produk! ✅
```

### Admin Product

```
1. Login admin di 4-admin-auth.http
2. Copy token
3. Get category di 6-admin-categories.http
4. Copy category ID
5. Buka 5-admin-products.http
6. Paste admin token dan category ID
7. Klik "Create Product"
8. Produk baru berhasil dibuat! ✅
```

---

## 💡 Pro Tips

### 1. Save Variable

```http
# Save di baris atas
@productId = abc-123-def

# Pakai di banyak request
GET {{baseUrl}}/api/products/{{productId}}
PUT {{baseUrl}}/api/products/{{productId}}
DELETE {{baseUrl}}/api/products/{{productId}}
```

### 2. Comment for Clarity

```http
### Get All Products
# Mengambil semua produk dengan pagination
# Bisa filter by category, search, price range
GET {{baseUrl}}/api/public/products
```

### 3. Test in Sequence

```
Public API → Customer Auth → Customer Cart
     ↓
Admin Auth → Admin Categories → Admin Products
```

---

## 🎉 You're Ready!

Sekarang kamu sudah siap untuk:

- ✅ Test semua API endpoints
- ✅ Debug backend issues
- ✅ Develop frontend dengan confidence
- ✅ Share API tests dengan tim

**Happy Coding!** 🚀

---

**Need Help?**

- 📖 Full docs: `README.md`
- 🔧 Backend guide: `backend/AUTHENTICATION_GUIDE.md`
- 💬 Check response error messages
