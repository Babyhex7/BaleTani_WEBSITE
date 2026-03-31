# Panduan Migrasi Database ke MySQL

Panduan ini dipakai untuk memindahkan database aplikasi BaleTani ke MySQL lokal (XAMPP) atau server MySQL.

## 1) Siapkan database tujuan

Jalankan di MySQL:

```sql
CREATE DATABASE IF NOT EXISTS baletani_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

## 2) Konfigurasi environment backend

Pastikan file `backend/.env` berisi konfigurasi MySQL target:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

Contoh default lokal tersedia di `backend/.env.example`.

## 3) Jalankan migrasi SQL aplikasi

Dari folder `backend/`:

```bash
npm run migrate
```

Script ini akan:

- membaca semua file `.sql` di folder `backend/migrations`
- menjalankan migration yang belum pernah dieksekusi
- mencatat histori migration ke tabel `schema_migrations`

## 4) Inisialisasi tabel model Sequelize

Jalankan backend:

```bash
npm run dev
```

Saat startup, aplikasi melakukan `sequelize.sync()` untuk memastikan tabel model tersedia.

## 5) Migrasi data dari database lama (opsional)

Jika sumber data lama juga MySQL:

```bash
mysqldump -u SOURCE_USER -p --single-transaction --routines --triggers SOURCE_DB > backup_source.sql
mysql -u TARGET_USER -p baletani_db < backup_source.sql
```

Setelah import, jalankan lagi:

```bash
npm run migrate
```

Tujuannya untuk memastikan skema final mengikuti migration terbaru di folder `backend/migrations`.

## 6) Verifikasi

- Pastikan backend sukses connect ke database (log: Database connection established successfully)
- Cek tabel histori migration:

```sql
SELECT * FROM schema_migrations ORDER BY id;
```

- Cek API health endpoint: `GET /api/health`

## Catatan penting

- Selalu backup database sebelum migrasi.
- Jalankan migrasi di staging dulu sebelum production.
- Jika ada error SQL, perbaiki file migration terkait lalu jalankan ulang `npm run migrate`.
