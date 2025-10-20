# 📦 Product Management API - Testing Guide

## 🎯 Endpoint Summary

**Base URL:** `http://localhost:5000/api/admin/products`

| Method | Endpoint              | Description                     | Role Access                        |
| ------ | --------------------- | ------------------------------- | ---------------------------------- |
| GET    | `/`                   | Get all products (with filters) | Super Admin, Super Inventory Admin |
| GET    | `/:id`                | Get product detail              | Super Admin, Super Inventory Admin |
| POST   | `/`                   | Create new product              | Super Admin, Super Inventory Admin |
| PUT    | `/:id`                | Update product                  | Super Admin, Super Inventory Admin |
| DELETE | `/:id`                | Soft delete product             | Super Admin only                   |
| POST   | `/:id/restore`        | Restore deleted product         | Super Admin only                   |
| GET    | `/:id/images`         | Get product images              | Super Admin, Super Inventory Admin |
| POST   | `/:id/images`         | Upload images (max 5)           | Super Admin, Super Inventory Admin |
| PUT    | `/:id/images/reorder` | Reorder images                  | Super Admin, Super Inventory Admin |
| DELETE | `/images/:imageId`    | Delete image                    | Super Admin, Super Inventory Admin |

---

## 🔐 Authentication

Semua endpoint memerlukan JWT token di header:

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### Cara Mendapatkan Token:

1. Login sebagai Super Admin via `/api/admin/auth/login`
2. Copy token dari response
3. Gunakan di semua request

---

## 📝 Testing Steps

### 1. **Create Product**

```http
POST /api/admin/products
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Bayam Segar",
  "product_type": "online",
  "category_id": "UUID_KATEGORI",
  "description": "Bayam segar organik",
  "selling_price": 15000,
  "unit": "kg",
  "shelf_life_days": 3,
  "is_active": true
}
```

**Response Success (201):**

```json
{
  "success": true,
  "message": "Produk berhasil ditambahkan",
  "data": {
    "id": "uuid-product",
    "name": "Bayam Segar",
    "product_type": "online",
    "selling_price": "15000.00",
    "total_stock": "0.00",
    "category": { ... }
  }
}
```

---

### 2. **Get All Products (with Filters)**

```http
GET /api/admin/products?page=1&limit=10&product_type=online&is_active=true&search=bayam&stock_below=10
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**

- `page` (int): Halaman (default: 1)
- `limit` (int): Jumlah per halaman (default: 10)
- `search` (string): Cari di nama/deskripsi
- `product_type` (enum): `online` atau `offline`
- `category_id` (uuid): Filter by kategori
- `is_active` (boolean): `true` atau `false`
- `stock_below` (number): Stok di bawah nilai ini
- `sort_by` (string): Field untuk sort (default: `created_at`)
- `sort_order` (string): `ASC` atau `DESC` (default: `DESC`)

**Response Success (200):**

```json
{
  "success": true,
  "message": "Data produk berhasil diambil",
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Bayam Segar",
        "product_type": "online",
        "selling_price": 15000,
        "final_price": 12000,
        "total_stock": 50,
        "is_active": true,
        "category": { ... },
        "images": [ ... ],
        "active_discount": {
          "id": "uuid",
          "name": "Diskon 20%",
          "type": "percentage",
          "value": 20
        }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "total_pages": 3
    }
  }
}
```

---

### 3. **Get Product Detail**

```http
GET /api/admin/products/{product_id}
Authorization: Bearer YOUR_TOKEN
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Detail produk berhasil diambil",
  "data": {
    "id": "uuid",
    "name": "Bayam Segar",
    "product_type": "online",
    "description": "...",
    "selling_price": "15000.00",
    "unit": "kg",
    "shelf_life_days": 3,
    "total_stock": "50.00",
    "is_active": true,
    "category": { ... },
    "images": [ ... ],
    "discounts": [ ... ],
    "procurementItems": [ ... ],
    "orderItems": [ ... ]
  }
}
```

---

### 4. **Update Product**

```http
PUT /api/admin/products/{product_id}
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Bayam Segar Premium",
  "selling_price": 18000,
  "description": "Updated description"
}
```

**Note:** Hanya kirim field yang ingin diubah.

---

### 5. **Upload Product Images**

```http
POST /api/admin/products/{product_id}/images
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

Form Data:
- images: [file1.jpg, file2.jpg, file3.jpg] (max 5 files)
```

**File Requirements:**

- Format: JPEG, JPG, PNG, WEBP, GIF
- Max size: 5MB per file
- Max files: 5 per upload

**Response Success (201):**

```json
{
  "success": true,
  "message": "Berhasil mengupload 3 gambar",
  "data": {
    "product_id": "uuid",
    "images": [
      {
        "id": "uuid1",
        "image_url": "/uploads/products/filename1.jpg",
        "display_order": 1
      },
      {
        "id": "uuid2",
        "image_url": "/uploads/products/filename2.jpg",
        "display_order": 2
      }
    ]
  }
}
```

---

### 6. **Reorder Product Images**

```http
PUT /api/admin/products/{product_id}/images/reorder
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "images": [
    { "id": "image-uuid-1", "display_order": 2 },
    { "id": "image-uuid-2", "display_order": 1 },
    { "id": "image-uuid-3", "display_order": 3 }
  ]
}
```

---

### 7. **Delete Product Image**

```http
DELETE /api/admin/products/images/{image_id}
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "reason": "Gambar tidak sesuai standar"
}
```

---

### 8. **Soft Delete Product** (Super Admin Only)

```http
DELETE /api/admin/products/{product_id}
Content-Type: application/json
Authorization: Bearer SUPER_ADMIN_TOKEN

{
  "reason": "Produk sudah tidak dijual"
}
```

---

### 9. **Restore Product** (Super Admin Only)

```http
POST /api/admin/products/{product_id}/restore
Authorization: Bearer SUPER_ADMIN_TOKEN
```

---

## 🧪 Testing dengan Postman

1. Import file `product-api-tests.json` ke Postman
2. Set environment variable:
   - `baseUrl`: `http://localhost:5000/api/admin/products`
   - `authToken`: Token JWT dari login
3. Jalankan collection atau request individual

---

## 🧪 Testing dengan Thunder Client (VS Code)

1. Install extension Thunder Client di VS Code
2. Buat New Request
3. Copy endpoint dan body dari file test JSON
4. Set Authorization header dengan Bearer token
5. Send request

---

## ⚠️ Common Errors

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Akses ditolak. Token tidak tersedia."
}
```

**Solution:** Pastikan header `Authorization` ada dan token valid.

### 403 Forbidden

```json
{
  "success": false,
  "message": "Akses ditolak. Permissions tidak mencukupi."
}
```

**Solution:** Role tidak sesuai. Pastikan user memiliki role `super_admin` atau `super_inventory_admin`.

### 404 Not Found

```json
{
  "success": false,
  "message": "Produk tidak ditemukan"
}
```

**Solution:** Product ID tidak valid atau sudah dihapus (soft deleted).

### 400 Bad Request

```json
{
  "success": false,
  "message": "Data tidak lengkap. Field name, product_type, selling_price, unit, dan shelf_life_days wajib diisi"
}
```

**Solution:** Lengkapi semua field yang required.

### 400 Upload Error

```json
{
  "success": false,
  "message": "Ukuran file terlalu besar. Maksimal 5MB per file."
}
```

**Solution:** Compress atau resize gambar terlebih dahulu.

---

## 📊 Testing Checklist

- [ ] Login dan dapatkan JWT token
- [ ] Create product baru
- [ ] Get all products (tanpa filter)
- [ ] Get all products (dengan filter)
- [ ] Get product by ID
- [ ] Update product
- [ ] Upload 3 gambar produk
- [ ] Get product images
- [ ] Reorder images
- [ ] Delete 1 image
- [ ] Soft delete product (sebagai super admin)
- [ ] Coba akses deleted product (harus 404)
- [ ] Restore product
- [ ] Verify product restored successfully

---

## 🔗 Related Endpoints

- Login Admin: `POST /api/admin/auth/login`
- Dashboard Stats: `GET /api/admin/dashboard/stats`
- Categories: `GET /api/admin/categories`

---

**Happy Testing! 🚀**
