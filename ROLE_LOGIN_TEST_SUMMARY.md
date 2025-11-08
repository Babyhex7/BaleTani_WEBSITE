# 🎯 RBAC Testing Summary - BaleTani Admin Roles

## ✅ Status Implementasi

### Database Status:

- ✅ Admin Table: Ready
- ✅ Role Table: Ready
- ✅ 8 Admin Accounts Created
- ⚠️ 2 Admins have swapped roles (need fix)

---

## 📋 Test Accounts - READY TO TEST

| No  | Role                  | Phone Number                       | Password            | Status                                                 | Notes          |
| --- | --------------------- | ---------------------------------- | ------------------- | ------------------------------------------------------ | -------------- |
| 1   | **Super Admin**       | 6281234567808<br>atau 081234567808 | `admin123`          | ✅ READY                                               | Full access    |
| 2   | Super WhatsApp Admin  | 6281234567807<br>atau 081234567807 | `superwa123`        | ⚠️ **ROLE SALAH**<br>(saat ini: super_inventory_admin) | Perlu fix      |
| 3   | Super Inventory Admin | 6281234567806<br>atau 081234567806 | `superinventory123` | ⚠️ **ROLE SALAH**<br>(saat ini: super_whatsapp_admin)  | Perlu fix      |
| 4   | **Super Cashier**     | 6281234567805<br>atau 081234567805 | `supercashier123`   | ✅ READY                                               | Orders & POS   |
| 5   | **Finance Admin**     | 6281234567804<br>atau 081234567804 | `finance123`        | ✅ READY                                               | Reports only   |
| 6   | **Inventory Admin**   | 6281234567803<br>atau 081234567803 | `inventory123`      | ✅ READY                                               | Procurement    |
| 7   | **WhatsApp Admin**    | 6281234567802<br>atau 081234567802 | `wa123`             | ✅ READY                                               | Online orders  |
| 8   | **Kasir**             | 6281234567801<br>atau 081234567801 | `kasir123`          | ✅ READY                                               | Offline orders |

---

## 🧪 Cara Testing Login

### Method 1: Menggunakan REST Client (VSCode Extension)

1. Install extension "REST Client" di VSCode
2. Buka file: `api-tests/10-role-login-test.http`
3. Klik "Send Request" di atas setiap request
4. Lihat response di panel sebelah kanan

**Contoh Test:**

```http
### Test Super Admin
POST http://localhost:5000/api/admin/auth/login
Content-Type: application/json

{
  "phone_number": "081234567808",
  "password": "admin123"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "uuid...",
      "phone_number": "6281234567808",
      "full_name": "Admin Utama",
      "role": {
        "id": "uuid...",
        "name": "super_admin",
        "description": "..."
      },
      "permissions": [
        {
          "id": 1,
          "module": "products",
          "action": "view",
          ...
        },
        ...
      ]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Method 2: Menggunakan Postman

1. Buka Postman
2. Create New Request → POST
3. URL: `http://localhost:5000/api/admin/auth/login`
4. Headers: `Content-Type: application/json`
5. Body → raw → JSON:

```json
{
  "phone_number": "081234567808",
  "password": "admin123"
}
```

6. Click Send

---

### Method 3: Menggunakan cURL (Terminal)

```bash
# Test Super Admin
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "081234567808",
    "password": "admin123"
  }'

# Test Kasir
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "081234567801",
    "password": "kasir123"
  }'
```

---

## ✅ Testing Checklist

Silakan test login untuk setiap role dan centang jika berhasil:

### **Ready to Test (6 accounts):**

- [ ] **Super Admin** (081234567808 / admin123)

  - Expected: Login berhasil
  - Expected: role.name = "super_admin"
  - Expected: permissions array penuh (70+ permissions)

- [ ] **Super Cashier** (081234567805 / supercashier123)

  - Expected: Login berhasil
  - Expected: role.name = "super_cashier"
  - Expected: permissions untuk orders & customers

- [ ] **Finance Admin** (081234567804 / finance123)

  - Expected: Login berhasil
  - Expected: role.name = "finance_admin"
  - Expected: permissions untuk view reports only

- [ ] **Inventory Admin** (081234567803 / inventory123)

  - Expected: Login berhasil
  - Expected: role.name = "inventory_admin"
  - Expected: permissions untuk procurement

- [ ] **WhatsApp Admin** (081234567802 / wa123)

  - Expected: Login berhasil
  - Expected: role.name = "whatsapp_admin"
  - Expected: permissions untuk online orders only

- [ ] **Kasir** (081234567801 / kasir123)
  - Expected: Login berhasil
  - Expected: role.name = "cashier"
  - Expected: permissions untuk offline orders only

### **Need Fix (2 accounts):**

- [ ] **Super WhatsApp Admin** (081234567807 / superwa123)

  - Current Issue: Role tertukar dengan Super Inventory Admin
  - Need: Update role_id di database

- [ ] **Super Inventory Admin** (081234567806 / superinventory123)
  - Current Issue: Role tertukar dengan Super WhatsApp Admin
  - Need: Update role_id di database

---

## 🔧 How to Fix Wrong Roles

Run SQL query ini untuk fix 2 roles yang tertukar:

```sql
-- Get role IDs first
SELECT id, role_name FROM roles WHERE role_name IN ('super_whatsapp_admin', 'super_inventory_admin');

-- Update admin 081234567807 → super_whatsapp_admin
UPDATE users
SET role_id = (SELECT id FROM roles WHERE role_name = 'super_whatsapp_admin')
WHERE phone_number = '6281234567807';

-- Update admin 081234567806 → super_inventory_admin
UPDATE users
SET role_id = (SELECT id FROM roles WHERE role_name = 'super_inventory_admin')
WHERE phone_number = '6281234567806';
```

**Atau buat script fix:**

```bash
node scripts/fixSwappedRoles.js
```

---

## 📊 What to Check in Response

Ketika login berhasil, pastikan response berisi:

1. ✅ **success: true**
2. ✅ **token** (JWT string panjang)
3. ✅ **data.user.id** (UUID)
4. ✅ **data.user.phone_number** (format 62...)
5. ✅ **data.user.full_name**
6. ✅ **data.user.role.name** (sesuai role yang diexpect)
7. ✅ **data.user.permissions** (array of permissions)

**Token Structure** (decode di jwt.io):

```json
{
  "userId": "uuid...",
  "type": "admin",
  "iat": 1699...,
  "exp": 1700...
}
```

---

## 🚨 Common Errors & Solutions

### Error 1: "Nomor telepon atau password salah"

**Cause:** Wrong phone number or password
**Solution:**

- Cek phone number (bisa pakai 08 atau 628)
- Cek password (case sensitive)
- Pastikan admin exist di database

### Error 2: "Akses ditolak. Anda bukan admin."

**Cause:** Role tidak ada dalam adminRoles array
**Solution:** Check controller adminAuth - pastikan role_name ada di array

### Error 3: 401 Unauthorized

**Cause:** Password salah atau admin tidak aktif
**Solution:**

- Cek password
- Cek is_active = true di database

### Error 4: 500 Internal Server Error

**Cause:** Database connection issue atau missing associations
**Solution:**

- Pastikan MySQL running
- Cek .env DB\_\* variables
- Restart backend server

---

## 🎯 Next Steps After Login Works

Setelah semua 8 admin bisa login:

1. ✅ Test `/api/admin/auth/me` endpoint (get profile)
2. ✅ Verify token contains role information
3. ✅ Test permission-protected endpoints
4. ✅ Create Permission seeder (70+ permissions)
5. ✅ Create Role-Permission mapping seeder
6. ✅ Update frontend to show different menu per role
7. ✅ Test unauthorized access (403 Forbidden)

---

## 📞 Report Results

Setelah testing, report:

- ✅ Berapa admin yang berhasil login? (target: 6/8, after fix: 8/8)
- ✅ Apakah response berisi role & permissions?
- ✅ Apakah token valid?
- ❌ Errors yang ditemukan?

---

**Status terakhir:** 6/8 admin ready, 2 admin perlu fix role. Silakan test login! 🚀
