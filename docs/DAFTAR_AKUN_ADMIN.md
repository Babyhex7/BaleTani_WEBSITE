# Daftar Akun Admin BaleTani

Dokumen ini berisi informasi lengkap semua akun admin yang telah dibuat untuk testing dan development.

## 📋 Ringkasan

- **Total Akun**: 8
- **Total Role**: 8
- **Password Sementara**: `admin12345`

⚠️ **PENTING**: Ubah password semua akun setelah login pertama kali!

---

## 🔑 Daftar Lengkap Akun Admin

### 1️⃣ Super Admin
**Akses Full ke Semua Fitur**

| Field | Value |
|-------|-------|
| Nama | Super Admin |
| Phone | 6281234567890 |
| Role | super_admin |
| Password | admin12345 |
| Status | ✅ Aktif |

---

### 2️⃣ Super WhatsApp Admin
**Admin WhatsApp dengan Akses Penuh**

| Field | Value |
|-------|-------|
| Nama | Super WhatsApp Admin |
| Phone | 6282345678901 |
| Role | super_whatsapp_admin |
| Password | admin12345 |
| Status | ✅ Aktif |

---

### 3️⃣ Super Cashier
**Kasir dengan Akses Penuh**

| Field | Value |
|-------|-------|
| Nama | Super Cashier |
| Phone | 6283456789012 |
| Role | super_cashier |
| Password | admin12345 |
| Status | ✅ Aktif |

---

### 4️⃣ Super Inventory Admin
**Admin Inventori dengan Akses Penuh**

| Field | Value |
|-------|-------|
| Nama | Super Inventory Admin |
| Phone | 6284567890123 |
| Role | super_inventory_admin |
| Password | admin12345 |
| Status | ✅ Aktif |

---

### 5️⃣ WhatsApp Admin
**Admin WhatsApp Standar (Akses Terbatas)**

| Field | Value |
|-------|-------|
| Nama | WhatsApp Admin |
| Phone | 6285678901234 |
| Role | whatsapp_admin |
| Password | admin12345 |
| Status | ✅ Aktif |

---

### 6️⃣ Cashier
**Kasir Standar (Akses Terbatas)**

| Field | Value |
|-------|-------|
| Nama | Cashier |
| Phone | 6286789012345 |
| Role | cashier |
| Password | admin12345 |
| Status | ✅ Aktif |

---

### 7️⃣ Finance Admin
**Admin Keuangan**

| Field | Value |
|-------|-------|
| Nama | Finance Admin |
| Phone | 6287890123456 |
| Role | finance_admin |
| Password | admin12345 |
| Status | ✅ Aktif |

---

### 8️⃣ Inventory Admin
**Admin Inventori Standar (Akses Terbatas)**

| Field | Value |
|-------|-------|
| Nama | Inventory Admin |
| Phone | 6288901234567 |
| Role | inventory_admin |
| Password | admin12345 |
| Status | ✅ Aktif |

---

## 🧪 Cara Testing

### Login ke Admin Dashboard

1. Buka `http://localhost:5173/admin/login` (atau URL frontend Anda)
2. Pilih nomor telepon dari daftar di atas
3. Masukkan password: `admin12345`
4. Klik tombol Login

### Verifikasi Role dan Akses

- Setiap akun memiliki role yang berbeda
- Fitur yang dapat diakses tergantung dari role masing-masing
- Akun super_admin memiliki akses penuh ke semua fitur
- Akun standar (non-super) memiliki akses terbatas sesuai role

---

## 🔐 Keamanan

### Password Management

1. **Pertama Kali Login**: Gunakan password sementara `admin12345`
2. **Setelah Login**: Ubah password melalui menu profile/settings
3. **Password Baru**: Gunakan password yang kuat (minimal 8 karakter)

### Best Practices

- ✅ Ubah password setelah login pertama
- ✅ Gunakan password unik untuk setiap akun
- ✅ Jangan bagikan password ke orang lain
- ✅ Logout setelah selesai bekerja
- ✅ Gunakan HTTPS di production

---

## 📂 File Terkait

- **Role Seeder**: `backend/seeders/roleSeeder.js`
- **Admin Seeder**: `backend/seeders/adminSeeder.js`
- **Main Seeder**: `backend/seeders/index.js`

---

## 🚀 Menjalankan Seeder Ulang

Jika Anda ingin membuat ulang semua role dan admin (hapus yang lama terlebih dahulu):

```bash
# Hanya seed roles
npm run seed:roles

# Hanya seed admin untuk roles yang ada
npm run seed:admin

# Seed semua (roles + admin)
npm run seed
```

---

## ❓ FAQ

**Q: Bagaimana jika saya lupa password?**
A: Hubungi superadmin atau jalankan ulang seeder untuk reset ke password default.

**Q: Bisakah saya menambah role baru?**
A: Ya, edit file `backend/seeders/roleSeeder.js` dan jalankan ulang `npm run seed:roles`.

**Q: Bisakah saya menambah akun admin baru?**
A: Ya, edit file `backend/seeders/adminSeeder.js` di bagian `ADMIN_ACCOUNTS` dan jalankan ulang `npm run seed:admin`.

**Q: Apakah phone number harus unik?**
A: Ya, setiap admin harus punya nomor telepon yang unik.

---

**Last Updated**: March 31, 2026  
**Status**: ✅ Production Ready
