# Testing Admin Accounts - Quick Start Guide

Panduan cepat untuk testing semua akun admin yang sudah dibuat di BaleTani.

## 🚀 Quick Start

### 1. Pastikan Backend Running

```bash
cd backend
npm run dev
```

Tunggu sampai melihat output:
```
✅ Database connection established successfully
🔵 Port 5000
```

### 2. Akses Login Admin

Buka di browser:
```
http://localhost:5173/admin/login
```

(Ganti 5173 dengan port frontend Anda jika berbeda)

## 🧪 Testing Setiap Role

### Role 1: Super Admin
- **Phone**: `6281234567890` atau `08-1234567890` atau `+6281234567890`
- **Password**: `admin12345`
- **Akses**: Full access ke semua fitur
- **Test**: Coba ke menu Products, Orders, Reports, dll

### Role 2: Super WhatsApp Admin
- **Phone**: `6282345678901` atau `08-2345678901`
- **Password**: `admin12345`
- **Akses**: WhatsApp management + Full access
- **Test**: Cari menu WhatsApp jika ada

### Role 3: Super Cashier
- **Phone**: `6283456789012` atau `08-3456789012`
- **Password**: `admin12345`
- **Akses**: Cashier + Full access
- **Test**: Coba menu Orders dan Payment

### Role 4: Super Inventory Admin
- **Phone**: `6284567890123` atau `08-4567890123`
- **Password**: `admin12345`
- **Akses**: Inventory + Full access
- **Test**: Coba menu Products dan Procurements

### Role 5: WhatsApp Admin (Limited)
- **Phone**: `6285678901234` atau `08-5678901234`
- **Password**: `admin12345`
- **Akses**: WhatsApp management only
- **Test**: Hanya menu WhatsApp yang visible

### Role 6: Cashier (Limited)
- **Phone**: `6286789012345` atau `08-6789012345`
- **Password**: `admin12345`
- **Akses**: Order & Payment management only
- **Test**: Hanya menu Orders dan Payment yang visible

### Role 7: Finance Admin
- **Phone**: `6287890123456` atau `08-7890123456`
- **Password**: `admin12345`
- **Akses**: Financial reports and data
- **Test**: Coba menu Reports dan check financials

### Role 8: Inventory Admin (Limited)
- **Phone**: `6288901234567` atau `08-8901234567`
- **Password**: `admin12345`
- **Akses**: Inventory management only
- **Test**: Hanya menu Products dan Procurements yang visible

## ✅ Checklist Testing

Untuk setiap akun, cek:

- [ ] Login berhasil
- [ ] Dashboard tampil dengan sesuai
- [ ] Sidebar menampilkan menu sesuai role
- [ ] Akses menu yang sesuai role
- [ ] Akses menu yang tidak sesuai role redirect/hidden
- [ ] Dapat logout
- [ ] Session expired setelah timeout

## 🔐 Mengubah Password

Setelah login dengan akun sementara:

1. Klik menu Profile / Settings (biasanya ada di top-right)
2. Cari opsi "Change Password"
3. Masukkan password lama: `admin12345`
4. Masukkan password baru (minimal 8 karakter)
5. Konfirmasi password baru
6. Simpan

## 🐛 Troubleshooting

### Login Gagal
- Pastikan backend running (`npm run dev` di backend folder)
- Pastikan phone number format benar (bisa `08xxx`, `62xxx`, atau `+62xxx`)
- Pastikan password benar: `admin12345`
- Check browser console untuk error message

### Akun Tidak Ada di Database
- Jalankan seeder: `npm run seed`
- Atau jalankan langsung: `npm run seed:admin`

### Role/Permission Tidak Bekerja
- Cek apakah role ada di database:
  ```sql
  SELECT * FROM roles;
  ```
- Cek apakah admin punya role yang benar:
  ```sql
  SELECT * FROM users JOIN roles ON users.role_id = roles.id;
  ```

## 📊 Verifikasi via Database

Login ke MySQL dan run queries:

```sql
-- Lihat semua role
SELECT id, role_name, description FROM roles;

-- Lihat semua admin
SELECT id, phone_number, full_name, role_id, is_active FROM users WHERE role_id = (SELECT id FROM roles LIMIT 1);

-- Lihat detail satu admin
SELECT u.id, u.phone_number, u.full_name, r.role_name 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.phone_number = '6281234567890';
```

## 🎯 Test Cases & Expected Results

### Test Case 1: Login dengan Super Admin
**Input**: 
- Phone: `6281234567890`
- Password: `admin12345`

**Expected**:
- ✅ Login success
- ✅ Dashboard menampilkan semua menu
- ✅ Dapat akses Products, Orders, Reports, etc

### Test Case 2: Login dengan Cashier (Limited)
**Input**:
- Phone: `6286789012345`
- Password: `admin12345`

**Expected**:
- ✅ Login success
- ✅ Dashboard menampilkan hanya menu Orders
- ✅ Tidak bisa akses Products, Reports, dll
- ✅ Redirect ke 403 jika coba akses URL forbidden

### Test Case 3: Password Change
**Input**:
- Old Password: `admin12345`
- New Password: `MyNewPassword123!`

**Expected**:
- ✅ Password change success
- ✅ Dapat login dengan password baru
- ✅ Login gagal dengan password lama

## 🔗 Related Documentation

- [Daftar Akun Admin](DAFTAR_AKUN_ADMIN.md) - Full account details
- [Admin Manual](BRIEF_MANUAL_BOOK_ADMIN.md) - Complete admin guide
- [Database Setup](MIGRASI_DATABASE_MYSQL.md) - Database migration guide

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check console browser (F12)
2. Check backend logs
3. Check MySQL error logs
4. Verify database integrity

---

**Last Updated**: March 31, 2026  
**Status**: ✅ Ready for Testing
