# BRIEF MANUAL BOOK ADMIN

## Balétani Fresh Market - Panduan Administrator

**Versi:** 1.0  
**Tanggal:** 10 Desember 2025  
**Status:** Brief untuk Pengembangan Manual Book

---

## 📋 RINGKASAN FITUR YANG SUDAH TERIMPLEMENTASI

Berdasarkan analisis codebase FE-BE, berikut adalah fitur-fitur admin yang sudah aktif:

### ✅ **HALAMAN YANG SUDAH JADI:**

| No  | Halaman                  | URL                      | Status                 |
| --- | ------------------------ | ------------------------ | ---------------------- |
| 1   | Login Admin              | /admin/login             | ✅ Aktif               |
| 2   | Dashboard                | /admin/dashboard         | ✅ Aktif               |
| 3   | Manajemen Produk         | /admin/products          | ✅ Aktif               |
| 4   | Manajemen Kategori       | /admin/categories        | ✅ Aktif               |
| 5   | Manajemen Diskon         | /admin/discounts         | ✅ Aktif               |
| 6   | Manajemen Customer       | /admin/customers         | ✅ Aktif               |
| 7   | Manajemen Admin          | /admin/admins            | ✅ Aktif               |
| 8   | Manajemen Pesanan        | /admin/orders            | ✅ Aktif               |
| 9   | Manajemen Pengadaan      | /admin/procurements      | ✅ Aktif               |
| 10  | Manajemen FAQ            | /admin/faqs              | ✅ Aktif               |
| 11  | Manajemen Kontak         | /admin/contacts          | ✅ Aktif               |
| 12  | Laporan Penjualan        | /admin/reports/sales     | ✅ Aktif               |
| 13  | Laporan Inventori        | /admin/reports/inventory | ✅ Aktif               |
| 14  | User Management (Legacy) | /admin/users             | ⚠️ Partial (Mock Data) |

---

## 📖 STRUKTUR MANUAL BOOK ADMIN

### DAFTAR ISI YANG DIRENCANAKAN:

```
1. PENDAHULUAN
   1.1 Tentang Manual Book Admin
   1.2 Persyaratan Sistem
   1.3 Role dan Hak Akses (RBAC)

2. MEMULAI SEBAGAI ADMIN
   2.1 Login ke Dashboard Admin
   2.2 Memahami Layout Dashboard
   2.3 Sidebar Navigasi
   2.4 Header dan Notifikasi

3. DASHBOARD
   3.1 Statistik Utama
   3.2 Grafik Penjualan
   3.3 Pesanan Terbaru
   3.4 Produk Stok Rendah
   3.5 Quick Actions

4. MANAJEMEN PRODUK
   4.1 Daftar Produk
   4.2 Tambah Produk Baru
   4.3 Edit Produk
   4.4 Hapus Produk
   4.5 Upload Gambar Produk
   4.6 Manajemen Stok
   4.7 Filter dan Pencarian

5. MANAJEMEN KATEGORI
   5.1 Daftar Kategori
   5.2 Tambah Kategori
   5.3 Edit Kategori
   5.4 Hapus Kategori
   5.5 Aktifkan/Nonaktifkan Kategori

6. MANAJEMEN DISKON
   6.1 Daftar Diskon
   6.2 Membuat Diskon Baru
   6.3 Tipe Diskon (Persentase/Nominal)
   6.4 Assign Produk ke Diskon
   6.5 Periode Diskon
   6.6 Status Diskon (Aktif/Expired/Upcoming)

7. MANAJEMEN PESANAN
   7.1 Daftar Semua Pesanan
   7.2 Filter Pesanan (Status, Tipe, Tanggal)
   7.3 Detail Pesanan
   7.4 Update Status Pesanan
   7.5 Konfirmasi Pembayaran
   7.6 Pesanan Offline (Tambah Manual)
   7.7 Alur Status Pesanan

8. MANAJEMEN PENGADAAN (PROCUREMENT)
   8.1 Daftar Pengadaan
   8.2 Membuat Pengadaan Baru
   8.3 Detail Pengadaan
   8.4 Approve/Reject Pengadaan
   8.5 Update Stok dari Pengadaan

9. MANAJEMEN CUSTOMER
   9.1 Daftar Customer
   9.2 Detail Customer
   9.3 Edit Data Customer
   9.4 Aktifkan/Nonaktifkan Customer
   9.5 Riwayat Pesanan Customer

10. MANAJEMEN ADMIN & ROLE
    10.1 Daftar Admin
    10.2 Tambah Admin Baru
    10.3 Edit Admin
    10.4 Hapus Admin
    10.5 Role dan Permission (RBAC)

11. MANAJEMEN FAQ
    11.1 Daftar FAQ
    11.2 Tambah FAQ Baru
    11.3 Edit FAQ
    11.4 Hapus FAQ
    11.5 Kategori FAQ
    11.6 Status Aktif/Nonaktif

12. MANAJEMEN PESAN KONTAK
    12.1 Daftar Pesan Masuk
    12.2 Detail Pesan
    12.3 Update Status Pesan
    12.4 Balas Pesan

13. LAPORAN PENJUALAN
    13.1 Filter Periode
    13.2 Grafik Penjualan
    13.3 Statistik Summary
    13.4 Daftar Transaksi
    13.5 Export ke PDF

14. LAPORAN INVENTORI
    14.1 Status Stok Produk
    14.2 Filter Kategori
    14.3 Produk Low Stock
    14.4 Produk Out of Stock
    14.5 Nilai Inventori

15. KEAMANAN DAN LOGOUT
    15.1 Logout
    15.2 Session Management
    15.3 Token Auto-Check
```

---

## 📝 DETAIL SETIAP BAGIAN

### 1. PENDAHULUAN

**1.1 Tentang Manual Book Admin**

- Tujuan: Panduan lengkap untuk administrator Balétani
- Target: Admin, Staff, Superadmin
- Scope: Semua fitur backend management

**1.2 Persyaratan Sistem**

- Browser: Chrome, Firefox, Edge versi terbaru
- Resolusi: Minimal 1280x720 (responsif)
- Koneksi: Internet stabil

**1.3 Role dan Hak Akses (RBAC)**

| Role                  | Keterangan                         |
| --------------------- | ---------------------------------- |
| super_admin           | Akses penuh ke semua fitur         |
| super_whatsapp_admin  | Admin WhatsApp dengan akses penuh  |
| super_cashier         | Kasir dengan akses penuh           |
| super_inventory_admin | Admin inventori dengan akses penuh |
| whatsapp_admin        | Admin WhatsApp standar             |
| cashier               | Kasir standar                      |
| finance_admin         | Admin keuangan                     |
| inventory_admin       | Admin inventori standar            |

---

### 2. MEMULAI SEBAGAI ADMIN

**2.1 Login ke Dashboard Admin**

**URL:** `/admin/login`

**Komponen Form:**
| Field | Validasi |
|-------|----------|
| Nomor Telepon | Wajib, format valid (08xx, 62xxx, +62xxx) |
| Password | Wajib |

**Fitur Keamanan:**

- Rate limiter (mencegah brute force)
- Token JWT dengan expiry
- Auto-logout saat token expired

**Alur Login (FE → BE):**

```
POST /api/admin/auth/login
Body: { phone_number, password }
Response: { token, admin: { id, name, phone_number, role, permissions } }
```

---

**2.2 Memahami Layout Dashboard**

**Layout Admin:**
| Posisi | Komponen |
|--------|----------|
| Kiri | Sidebar Navigasi (collapsible) |
| Atas | Header dengan Profile & Notifikasi |
| Tengah | Konten Halaman |

---

**2.3 Sidebar Navigasi**

**Menu Utama (Sesuai Implementasi Aktual):**

| Ikon | Menu               | Sub-menu            | URL                                   |
| ---- | ------------------ | ------------------- | ------------------------------------- | --- |
| 🏠   | Dashboard          | -                   | /admin/dashboard                      |
| 📦   | Inventory          | Product List        | /admin/products                       |
|      |                    | Stock Overview      | /admin/stock-overview _(Coming Soon)_ |
|      |                    | Discount Management | /admin/discounts                      |
|      |                    | Category Management | /admin/categories                     |
| 🚚   | Procurement        | Procurement List    | /admin/procurements                   |
| 🛒   | Orders             | -                   | /admin/orders                         |
| 👥   | User Management    | Customer Management | /admin/customers                      |
|      |                    | Admin Management    | /admin/admins                         |
| 💬   | Customer Support   | FAQ Management      | /admin/faqs                           |
|      |                    | Contact Messages    | /admin/contacts                       |
| 📊   | Reports & Insights | Sales Report        | /admin/reports/sales                  |
|      |                    | Inventory Report    | /admin/reports/inventory              |     |

---

### 3. DASHBOARD

**URL:** `/admin/dashboard`

**3.1 Statistik Utama (StatCard)**

| No  | Statistik           | Ikon                         | Warna                  |
| --- | ------------------- | ---------------------------- | ---------------------- |
| 1   | Pendapatan Hari Ini | 💰 BanknotesIcon             | Hijau (bg-green-100)   |
| 2   | Transaksi Hari Ini  | 🛒 ShoppingCartIcon          | Ungu (bg-purple-100)   |
| 3   | Total Pelanggan     | 👥 UsersIcon                 | Biru (bg-blue-100)     |
| 4   | Produk Aktif        | 📦 CubeIcon                  | Indigo (bg-indigo-100) |
| 5   | Pengadaan Pending   | 📋 ClipboardDocumentListIcon | Teal (bg-teal-100)     |
| 6   | Pembayaran Pending  | ⏳ ClockIcon                 | Orange (bg-orange-100) |

**Catatan:** Produk Stok Rendah dan Pesan Belum Dibaca TIDAK ada dalam StatCard, tetapi ditampilkan di section terpisah.

**3.2 Section Recent Orders & Low Stock**

- Layout: **Two Column** (admin-two-col)
- Recent Orders: Table dengan 5 pesanan terbaru (order#, pelanggan, total, status)
- Low Stock Products: Table dengan 5 produk stok rendah (nama, stok, status)
- Masing-masing section ada tombol "Lihat Semua"

**3.3 No Grafik Penjualan**
Berdasarkan implementasi, TIDAK ada grafik/chart di Dashboard.

**3.4 Quick Actions**

- Tombol "Lihat Semua →" pada Recent Orders
- Tombol "Lihat Semua →" pada Low Stock Products
- Tombol "Coba Lagi" jika ada error loading

**Alur Data (FE → BE):**

```
GET /api/admin/dashboard/stats
GET /api/admin/dashboard/recent-orders?limit=5
GET /api/admin/dashboard/low-stock?limit=5
GET /api/admin/dashboard/notifications
```

---

### 4. MANAJEMEN PRODUK

**URL:** `/admin/products`

**4.1 Daftar Produk**

**Layout:**
| Posisi | Elemen |
|--------|--------|
| Header | Judul "Daftar Produk", Tombol "Tambah Produk" (hijau) |
| Statistik | 4 StatCard: Total Produk, Produk Aktif, Stok Rendah, Stok Habis |
| Filter | Search, Kategori (dropdown), Status, Product Type |
| Tabel | Daftar produk dengan pagination |

**4 Statistik Produk (ProductListNew.jsx):**
| No | Statistik | Ikon | Warna |
|----|-----------|------|-------|
| 1 | Total Produk | 📦 CubeIcon | Biru (bg-blue-100) |
| 2 | Produk Aktif | ✅ CheckCircleIcon | Hijau (bg-green-100) |
| 3 | Stok Rendah | ⚠️ ExclamationCircleIcon | Kuning (bg-yellow-100) |
| 4 | Stok Habis | ⚠️ ExclamationCircleIcon | Merah (bg-red-100) |

**Kolom Tabel:**
| No | Kolom | Keterangan |
|----|-------|------------|
| 1 | Gambar | Thumbnail produk |
| 2 | Nama Produk | Nama lengkap |
| 3 | Kategori | Kategori produk |
| 4 | Harga | Harga jual |
| 5 | Stok | Jumlah stok tersedia |
| 6 | Status | Aktif/Nonaktif |
| 7 | Aksi | View, Edit, Delete |

---

**4.2 Tambah Produk Baru**

**Form Fields:**
| Field | Tipe | Validasi |
|-------|------|----------|
| Nama Produk | Text | Wajib, min 3 karakter |
| Kategori | Dropdown | Wajib |
| Tipe Produk | Dropdown | Standar/Paket/Promo |
| Harga | Number | Wajib, min 0 |
| Stok | Number | Wajib, min 0 |
| Satuan | Text | Wajib (kg, pcs, ikat, dll) |
| Deskripsi | Textarea | Opsional |
| Gambar | File Upload | JPG/PNG, max 5MB |
| Status | Toggle | Aktif/Nonaktif |

**Alur Data:**

```
POST /api/admin/products
Body: FormData (termasuk file gambar)
```

---

**4.3 Edit Produk**

- Modal form sama dengan tambah
- Data pre-filled dari produk yang dipilih
- Bisa ganti gambar atau pertahankan yang lama

```
PUT /api/admin/products/:id
Body: FormData
```

---

**4.4 Hapus Produk**

- Konfirmasi modal sebelum hapus
- Soft delete (tidak benar-benar dihapus dari database)
- Produk dengan pesanan aktif tidak bisa dihapus

```
DELETE /api/admin/products/:id
```

---

**4.5 Upload Gambar Produk**

**Spesifikasi:**

- Format: JPG, PNG, JPEG
- Ukuran Max: 5MB
- Dimensi Disarankan: 500x500px
- Multiple Images: Didukung

**Path Penyimpanan:** `/public/uploads/products/`

---

### 5. MANAJEMEN KATEGORI

**URL:** `/admin/categories`

**5.1 Daftar Kategori**

**Statistik:**

- Total Kategori
- Kategori Aktif
- Kategori Nonaktif

**Kolom Tabel:**
| No | Kolom | Keterangan |
|----|-------|------------|
| 1 | Nama | Nama kategori |
| 2 | Deskripsi | Deskripsi singkat |
| 3 | Jumlah Produk | Total produk dalam kategori |
| 4 | Status | Aktif/Nonaktif |
| 5 | Aksi | View, Edit, Delete |

---

**5.2 Tambah Kategori**

**Form Fields:**
| Field | Tipe | Validasi |
|-------|------|----------|
| Nama Kategori | Text | Wajib, unik |
| Deskripsi | Textarea | Opsional |
| Status | Toggle | Aktif/Nonaktif |

```
POST /api/admin/categories
```

---

### 6. MANAJEMEN DISKON

**URL:** `/admin/discounts`

**6.1 Daftar Diskon**

**Statistik:**

- Total Diskon
- Diskon Aktif
- Diskon Expired
- Diskon Upcoming

**Status Diskon:**
| Status | Warna | Keterangan |
|--------|-------|------------|
| Active | Hijau | Diskon sedang berlaku |
| Expired | Merah | Diskon sudah berakhir |
| Upcoming | Biru | Diskon belum dimulai |
| Inactive | Abu-abu | Dinonaktifkan manual |

---

**6.2 Membuat Diskon Baru**

**Form Fields:**
| Field | Tipe | Validasi |
|-------|------|----------|
| Nama Diskon | Text | Wajib |
| Tipe | Dropdown | percentage / fixed_amount |
| Nilai | Number | Wajib |
| Tanggal Mulai | Date | Wajib |
| Tanggal Selesai | Date | Wajib, > Tanggal Mulai |
| Status | Toggle | Aktif/Nonaktif |

**Tipe Diskon:**

- `percentage`: Diskon dalam persen (contoh: 20%)
- `fixed_amount`: Diskon nominal tetap (contoh: Rp 50.000)

---

**6.3 Assign Produk ke Diskon**

- Modal terpisah untuk memilih produk
- Multiple selection dengan checkbox
- Bisa search produk
- Tampilkan harga asli dan harga setelah diskon

```
POST /api/admin/discounts/:id/products
Body: { product_ids: [1, 2, 3] }
```

---

### 7. MANAJEMEN PESANAN

**URL:** `/admin/orders`

**7.1 Daftar Semua Pesanan**

**Filter Tersedia:**
| Filter | Opsi |
|--------|------|
| Status Pesanan | pending_payment, paid, processing, ready_for_pickup, out_for_delivery, completed, cancelled |
| Status Pembayaran | pending, paid, failed, refunded |
| Tipe Pesanan | online, offline |
| Metode Pembayaran | transfer, qris, cash |
| Metode Pengiriman | self_pickup, delivery |
| Rentang Tanggal | Date picker |
| Search | No. Order, Nama, No. HP |

---

**7.2 Detail Pesanan**

**Modal Detail Menampilkan:**

| Section    | Informasi                              |
| ---------- | -------------------------------------- |
| Header     | No. Order, Tanggal, Status Badge       |
| Customer   | Nama, No. HP                           |
| Pengiriman | Metode, Alamat, Catatan                |
| Produk     | List item dengan qty, harga, subtotal  |
| Pembayaran | Metode, Bank, Status, Bukti (jika ada) |
| Total      | Subtotal, Ongkir, Total Akhir          |
| Timeline   | Riwayat perubahan status               |

---

**7.3 Update Status Pesanan**

**Alur Status:**

```
pending_payment → paid → processing → ready_for_pickup/out_for_delivery → completed
                                       ↘ cancelled (dapat dilakukan kapan saja sebelum completed)
```

**Modal Update Status:**

- Dropdown pilihan status
- Catatan admin (opsional)
- Validasi status progression

```
PUT /api/admin/orders/:id/status
Body: { order_status, payment_status, notes }
```

---

**7.4 Pesanan Offline (Tambah Manual)**

**Modal "Add Offline Order":**
| Field | Tipe |
|-------|------|
| Nama Customer | Text |
| No. Telepon | Text |
| Pilih Produk | Multi-select |
| Quantity per Produk | Number |
| Metode Pembayaran | Dropdown |
| Catatan | Textarea |

**Fitur:**

- Auto-calculate subtotal
- Kurangi stok otomatis
- Status langsung "paid" jika cash

---

### 8. MANAJEMEN PENGADAAN (PROCUREMENT)

**URL:** `/admin/procurements`

**8.1 Daftar Pengadaan**

**Statistik:**

- Total Pengadaan
- Pending
- Approved
- Rejected
- Total Nilai

**Status Pengadaan:**
| Status | Warna | Keterangan |
|--------|-------|------------|
| Pending | Kuning | Menunggu persetujuan |
| Approved | Hijau | Disetujui, stok ditambah |
| Rejected | Merah | Ditolak |

---

**8.2 Membuat Pengadaan Baru**

**Form Fields:**
| Field | Tipe |
|-------|------|
| Tanggal Pengadaan | Date |
| Supplier | Text |
| Items | Multi-input (Produk, Qty, Harga Beli) |
| Catatan | Textarea |

```
POST /api/admin/procurements
```

---

**8.3 Approve/Reject Pengadaan**

**Tombol Aksi:**

- ✅ Approve → Stok otomatis bertambah
- ❌ Reject → Catatan alasan penolakan

```
PUT /api/admin/procurements/:id/approve
PUT /api/admin/procurements/:id/reject
```

---

### 9. MANAJEMEN CUSTOMER

**URL:** `/admin/customers`

**9.1 Daftar Customer**

**Statistik:**

- Total Customer
- Customer Aktif
- Customer Nonaktif
- Total Pesanan (semua customer)

**Kolom Tabel:**
| Kolom | Keterangan |
|-------|------------|
| Nama | Nama lengkap customer |
| No. Telepon | Nomor HP terdaftar |
| Total Pesanan | Jumlah pesanan |
| Status | Aktif/Nonaktif |
| Bergabung | Tanggal registrasi |
| Aksi | View, Edit, Delete |

---

**9.2 Detail Customer**

**Modal Detail:**

- Informasi Profil (Nama, No. HP, Alamat)
- Statistik Pesanan
- Riwayat Pesanan Terakhir
- Tombol Edit

---

**9.3 Edit Customer**

**Field yang Bisa Diedit:**

- Nama Lengkap
- Alamat
- Status Aktif/Nonaktif

**Catatan:** No. HP tidak bisa diubah oleh admin

---

### 10. MANAJEMEN ADMIN & ROLE

**URL:** `/admin/admins`

**10.1 Daftar Admin**

**Statistik:**

- Total Admin
- Admin Aktif
- Admin Nonaktif
- Total Role

**Kolom Tabel:**
| Kolom | Keterangan |
|-------|------------|
| Nama | Nama admin |
| Username | Username login |
| Role | Role yang dimiliki |
| Status | Aktif/Nonaktif |
| Last Login | Terakhir login |
| Aksi | View, Edit, Delete |

---

**10.2 Tambah Admin Baru**

**Form Fields:**
| Field | Validasi |
|-------|----------|
| Nama Lengkap | Wajib |
| Username | Wajib, unik |
| Password | Wajib, min 8 karakter |
| Role | Wajib (dropdown roles) |
| Status | Aktif/Nonaktif |

```
POST /api/admin/users
```

---

**10.3 Role dan Permission (RBAC)**

**Role Tersedia:**
| Role | Permission |
|------|------------|
| Superadmin | Full Access |
| Admin | Semua kecuali manage_admin |
| Staff | View only di beberapa modul |

**Permission List:**

- manage_products
- manage_categories
- manage_discounts
- manage_orders
- manage_procurements
- manage_customers
- manage_admins
- view_reports
- manage_faqs
- manage_contacts

---

### 11. MANAJEMEN FAQ

**URL:** `/admin/faqs`

**11.1 Daftar FAQ**

**Statistik:**

- Total FAQ
- FAQ Aktif
- FAQ Nonaktif

**Filter:**

- Search (pertanyaan/jawaban)
- Kategori
- Status

---

**11.2 Tambah FAQ**

**Form Fields:**
| Field | Tipe | Validasi |
|-------|------|----------|
| Pertanyaan | Text | Wajib |
| Jawaban | Textarea/Editor | Wajib |
| Kategori | Dropdown | Wajib |
| Urutan | Number | Opsional |
| Status | Toggle | Aktif/Nonaktif |

**Kategori FAQ:**

- Pemesanan
- Pembayaran
- Pengiriman
- Produk
- Akun
- Umum

---

### 12. MANAJEMEN PESAN KONTAK

**URL:** `/admin/contacts`

**12.1 Daftar Pesan**

**Statistik:**

- Total Pesan
- Pending
- Replied
- Resolved

**Status Pesan:**
| Status | Warna | Keterangan |
|--------|-------|------------|
| Pending | Kuning | Belum dibaca/dibalas |
| Replied | Biru | Sudah dibalas |
| Resolved | Hijau | Sudah selesai |

---

**12.2 Detail Pesan**

**Informasi:**

- Nama Pengirim
- Email
- No. Telepon (jika ada)
- Subjek
- Isi Pesan
- Tanggal Kirim
- Status

**Aksi:**

- Update Status (Pending → Replied → Resolved)
- Catatan Admin

---

### 13. LAPORAN PENJUALAN

**URL:** `/admin/reports/sales`

**13.1 Filter Laporan**

| Filter            | Tipe                         |
| ----------------- | ---------------------------- |
| Tanggal Mulai     | Date Picker                  |
| Tanggal Selesai   | Date Picker                  |
| Group By          | Hari / Minggu / Bulan        |
| Metode Pembayaran | All / Transfer / QRIS / Cash |
| Tipe Pesanan      | All / Online / Offline       |

---

**13.2 Statistik Summary**

| Stat                | Keterangan                 |
| ------------------- | -------------------------- |
| Total Penjualan     | Jumlah order dalam periode |
| Total Pendapatan    | Total revenue              |
| Rata-rata per Order | Average order value        |
| Produk Terjual      | Jumlah item terjual        |

---

**13.3 Grafik Penjualan**

- Tipe: Bar Chart / Line Chart
- Axis X: Tanggal/Periode
- Axis Y: Jumlah Penjualan / Revenue

---

**13.4 Daftar Transaksi**

**Tabel Detail:**
| Kolom | Keterangan |
|-------|------------|
| No. Order | Nomor pesanan |
| Tanggal | Waktu transaksi |
| Customer | Nama pembeli |
| Total | Nilai transaksi |
| Metode | Pembayaran |
| Status | Status pesanan |

---

**13.5 Export ke PDF**

- Tombol "Download PDF"
- Format: Laporan dengan header Balétani
- Isi: Summary + Tabel Transaksi
- Library: jsPDF + autoTable

---

### 14. LAPORAN INVENTORI

**URL:** `/admin/reports/inventory`

**14.1 Filter Laporan**

| Filter      | Opsi                                      |
| ----------- | ----------------------------------------- |
| Kategori    | Semua / Per kategori                      |
| Tipe Produk | Standar / Paket / Promo                   |
| Status Stok | Semua / Low Stock / Out of Stock / Normal |
| Tanggal     | Rentang waktu                             |

---

**14.2 Statistik Summary**

| Stat                | Keterangan                 |
| ------------------- | -------------------------- |
| Total Produk        | Jumlah semua produk        |
| Nilai Inventori     | Total value (stok × harga) |
| Produk Low Stock    | Stok ≤ 10                  |
| Produk Out of Stock | Stok = 0                   |

---

**14.3 Tabel Produk**

| Kolom       | Keterangan             |
| ----------- | ---------------------- |
| Nama Produk | Nama lengkap           |
| Kategori    | Kategori produk        |
| Stok        | Jumlah saat ini        |
| Harga       | Harga jual             |
| Nilai       | Stok × Harga           |
| Status      | Badge (Normal/Low/Out) |

---

### 15. KEAMANAN DAN LOGOUT

**15.1 Logout**

**Cara Logout:**

1. Klik profil di header
2. Klik "Logout"
3. Token dihapus, redirect ke /admin/login

---

**15.2 Session Management**

| Fitur       | Keterangan                         |
| ----------- | ---------------------------------- |
| Token JWT   | Autentikasi berbasis token         |
| Expiry Time | Token kadaluarsa setelah X jam     |
| Auto-Check  | Pengecekan validitas token berkala |
| Auto-Logout | Logout otomatis saat expired       |

---

**15.3 Keamanan Sistem**

| Fitur              | Keterangan                |
| ------------------ | ------------------------- |
| Rate Limiter       | Batasi percobaan login    |
| Password Hash      | bcrypt hashing            |
| Input Sanitization | Cegah XSS                 |
| RBAC               | Role-based access control |
| Permission Guard   | Cek permission per route  |

---

## 📚 LAMPIRAN

### A. Daftar API Endpoint Admin

| Method | Endpoint                            | Keterangan             |
| ------ | ----------------------------------- | ---------------------- |
| POST   | /api/admin/auth/login               | Login admin            |
| GET    | /api/admin/dashboard/stats          | Statistik dashboard    |
| GET    | /api/admin/products                 | Daftar produk          |
| POST   | /api/admin/products                 | Tambah produk          |
| PUT    | /api/admin/products/:id             | Edit produk            |
| DELETE | /api/admin/products/:id             | Hapus produk           |
| GET    | /api/admin/categories               | Daftar kategori        |
| POST   | /api/admin/categories               | Tambah kategori        |
| PUT    | /api/admin/categories/:id           | Edit kategori          |
| DELETE | /api/admin/categories/:id           | Hapus kategori         |
| GET    | /api/admin/discounts                | Daftar diskon          |
| POST   | /api/admin/discounts                | Tambah diskon          |
| PUT    | /api/admin/discounts/:id            | Edit diskon            |
| DELETE | /api/admin/discounts/:id            | Hapus diskon           |
| POST   | /api/admin/discounts/:id/products   | Assign produk          |
| GET    | /api/admin/orders                   | Daftar pesanan         |
| GET    | /api/admin/orders/:id               | Detail pesanan         |
| PUT    | /api/admin/orders/:id/status        | Update status          |
| POST   | /api/admin/orders/offline           | Tambah pesanan offline |
| GET    | /api/admin/procurements             | Daftar pengadaan       |
| POST   | /api/admin/procurements             | Tambah pengadaan       |
| PUT    | /api/admin/procurements/:id/approve | Approve                |
| PUT    | /api/admin/procurements/:id/reject  | Reject                 |
| GET    | /api/admin/customers                | Daftar customer        |
| PUT    | /api/admin/customers/:id            | Edit customer          |
| GET    | /api/admin/users                    | Daftar admin           |
| POST   | /api/admin/users                    | Tambah admin           |
| PUT    | /api/admin/users/:id                | Edit admin             |
| DELETE | /api/admin/users/:id                | Hapus admin            |
| GET    | /api/admin/faqs                     | Daftar FAQ             |
| POST   | /api/admin/faqs                     | Tambah FAQ             |
| PUT    | /api/admin/faqs/:id                 | Edit FAQ               |
| DELETE | /api/admin/faqs/:id                 | Hapus FAQ              |
| GET    | /api/admin/contacts                 | Daftar pesan           |
| PUT    | /api/admin/contacts/:id             | Update status          |
| GET    | /api/admin/reports/sales            | Laporan penjualan      |
| GET    | /api/admin/reports/inventory        | Laporan inventori      |

---

### B. Glosarium Admin

| Istilah     | Definisi                             |
| ----------- | ------------------------------------ |
| Dashboard   | Halaman utama admin dengan statistik |
| CRUD        | Create, Read, Update, Delete         |
| RBAC        | Role-Based Access Control            |
| Procurement | Pengadaan/pembelian stok baru        |
| Soft Delete | Penghapusan yang tidak permanen      |
| JWT         | JSON Web Token untuk autentikasi     |
| Permission  | Hak akses untuk fitur tertentu       |
| Badge       | Label visual untuk status            |
| Modal       | Pop-up window untuk form/detail      |
| Pagination  | Pembagian data per halaman           |

---

### C. Status Order Lengkap

| Status           | Label Indonesia     | Warna  | Keterangan                 |
| ---------------- | ------------------- | ------ | -------------------------- |
| pending_payment  | Menunggu Pembayaran | Kuning | Customer belum bayar       |
| paid             | Terbayar            | Biru   | Pembayaran dikonfirmasi    |
| processing       | Diproses            | Biru   | Pesanan sedang disiapkan   |
| ready_for_pickup | Siap Diambil        | Ungu   | Self pickup ready          |
| out_for_delivery | Dalam Pengiriman    | Ungu   | Sedang dikirim ke customer |
| completed        | Selesai             | Hijau  | Transaksi selesai          |
| cancelled        | Dibatalkan          | Merah  | Pesanan dibatalkan         |

**Status Pembayaran (payment_status):**
| Status | Label | Warna |
|--------|-------|-------|
| pending | Menunggu | Kuning |
| paid | Terbayar | Hijau |
| failed | Gagal | Merah |
| refunded | Dikembalikan | Abu-abu |

---

### D. Tips Penggunaan

| No  | Tips                                               |
| --- | -------------------------------------------------- |
| 1   | Gunakan filter untuk mencari data dengan cepat     |
| 2   | Cek notifikasi untuk pesanan baru dan stok rendah  |
| 3   | Lakukan backup data secara berkala                 |
| 4   | Konfirmasi pesanan segera setelah pembayaran masuk |
| 5   | Update stok produk setelah procurement disetujui   |
| 6   | Balas pesan customer dalam 1x24 jam                |
| 7   | Cek laporan penjualan harian untuk monitoring      |
| 8   | Logout setelah selesai bekerja                     |

---

**Brief ini dibuat sebagai panduan pengembangan Manual Book Admin Balétani**

**Status:** Siap dikembangkan menjadi Manual Book lengkap  
**Tanggal:** 10 Desember 2025
