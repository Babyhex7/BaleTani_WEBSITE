# 🚀 QUICK START GUIDE - BaleTani Testing

## ⚡ 5 Menit Setup Testing

### 1. Install Extension (30 detik)

Di VS Code, install **REST Client**:

- Tekan `Ctrl+Shift+X`
- Search: "REST Client"
- Install extension dari **Huachao Mao**

### 2. Start Backend (1 menit)

```bash
cd backend
npm install
npm run dev
```

### 3. Setup Database (2 menit)

```bash
# Jalankan seeder
npm run seed
npm run seed:rbac-admins
```

### 4. Test Login Customer (1 menit)

Buka: `testing/customer-test/1-customer-auth.http`

Klik "Send Request" di atas:

```http
### Registrasi Customer
POST http://localhost:5000/api/customer/auth/register
Content-Type: application/json

{
  "phone_number": "081234567890",
  "full_name": "Test User",
  "password": "password123"
}
```

**Expected Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "customer": {
    "id": "...",
    "phone_number": "6281234567890",
    "full_name": "Test User"
  }
}
```

✅ **DONE! Anda sudah berhasil test pertama!**

---

## 📋 Testing Sequence (Urutan Test)

### Customer Flow:

```
1. customer-test/1-customer-auth.http
   ↓ (copy token)
2. customer-test/2-customer-cart.http
   ↓ (add items)
3. customer-test/3-customer-order.http
   ↓ (checkout)
```

### Admin Flow:

```
1. admin-test/1-admin-auth.http
   ↓ (copy admin token)
2. admin-test/2-admin-products.http
   ↓ (CRUD products)
3. admin-test/3-admin-orders.http
   ↓ (manage orders)
```

---

## 🎯 Test Priority (Urgent → Nice to Have)

### 🔴 URGENT (Harus Test Sebelum Launch)

1. ✅ **1-customer-auth.http** - Login/Register customer
2. ✅ **2-customer-cart.http** - Cart operations
3. ✅ **3-customer-order.http** - Checkout & payment
4. ✅ **1-admin-auth.http** - Admin login & RBAC
5. ✅ **3-admin-orders.http** - Order management

### 🟡 IMPORTANT (Test Setelah Urgent)

6. ✅ **2-admin-products.http** - Product CRUD

### 🟢 NICE TO HAVE

7. Security testing (SQL injection, XSS)
8. Performance testing (response time)
9. Edge cases testing

---

## 📝 Cheat Sheet Variables

### Customer Tests:

```http
@baseUrl = http://localhost:5000
@customerToken = eyJhbGci... (dari login)
@productId = uuid-dari-database
```

### Admin Tests:

```http
@baseUrl = http://localhost:5000
@adminToken = eyJhbGci... (dari admin login)
@productId = uuid-dari-database
@orderId = uuid-dari-database
```

### Default Admin Credentials (dari seeder):

```
Super Admin:
- Phone: 081111111111
- Password: superadmin123

Kasir:
- Phone: 081222222222
- Password: kasir123
```

---

## ✅ Quick Verification Checklist

Setelah jalankan semua test, verify:

### Customer Side:

- [ ] Customer bisa register dengan nomor HP
- [ ] Customer bisa login dan dapat token
- [ ] Customer bisa add/update/remove cart
- [ ] Customer bisa checkout dan buat order
- [ ] Order history tampil dengan benar

### Admin Side:

- [ ] Admin bisa login dengan role berbeda
- [ ] Super Admin bisa akses semua endpoint
- [ ] Kasir tidak bisa akses user management (403)
- [ ] Admin bisa CRUD products
- [ ] Admin bisa update order status
- [ ] Admin bisa create offline orders

### Database:

- [ ] Data tersimpan dengan benar
- [ ] Stock berkurang setelah checkout
- [ ] Stock kembali setelah order cancelled
- [ ] Status history tercatat

---

## 🐛 Common Issues & Quick Fix

| Issue                   | Quick Fix                           |
| ----------------------- | ----------------------------------- |
| ❌ Connection refused   | `npm run dev` di folder backend     |
| ❌ Token invalid        | Login ulang, copy token baru        |
| ❌ Product not found    | Ganti `@productId` dengan ID valid  |
| ❌ Access denied (403)  | Gunakan token Super Admin           |
| ❌ Stock tidak cukup    | Update stock produk di database     |
| ❌ Phone already exists | Ganti nomor HP atau hapus data test |

---

## 🎓 Tips & Best Practices

### DO ✅

- Jalankan test secara berurutan (auth → cart → order)
- Simpan token setelah login
- Verify response status & body
- Test dengan data realistic (bukan data random)

### DON'T ❌

- Jangan test tanpa backend running
- Jangan pakai expired token
- Jangan skip authentication test
- Jangan test di production database

---

## 📞 Need Help?

1. **Lihat README lengkap:** `testing/README.md`
2. **Lihat API Docs:** `API_DOCUMENTATION.md`
3. **Check console log:** Cari error message di backend terminal
4. **WhatsApp support:** 085885725027

---

**Happy Testing! 🚀**
