# 🔍 AUDIT SISTEM UPLOAD GAMBAR - BaleTani Admin

> **Tanggal**: 17 Desember 2025
>
> **Focus**: Upload gambar produk di Admin Panel

---

## ✅ YANG SUDAH BENAR

### **1. Backend Middleware** ✅

File: `backend/src/middlewares/upload.middleware.js`

**✔️ Security:**

- ✅ Blok file SVG (XSS vector)
- ✅ Hanya allow: JPEG, JPG, PNG, WEBP, GIF
- ✅ Validate MIME type dan extension
- ✅ Sanitize filename (remove special chars)

**✔️ Limits:**

- ✅ Max 5MB per file
- ✅ Max 5 files per request

**✔️ Storage:**

- ✅ Auto-create directory jika belum ada
- ✅ Unique filename: `sanitized-timestamp-random.ext`
- ✅ Upload path: `backend/public/uploads/products/`

**✔️ Error Handling:**

- ✅ Proper error messages
- ✅ HTTP status codes yang benar

---

### **2. Backend Controller** ✅

File: `backend/src/controllers/adminProductImage.controller.js`

**✔️ Upload Logic:**

- ✅ Check product exists sebelum upload
- ✅ Auto-increment `display_order`
- ✅ Store relative path: `/uploads/products/filename`
- ✅ Multiple upload support
- ✅ Return uploaded image data

**✔️ Cleanup:**

- ✅ Delete files jika product not found
- ✅ Delete files jika error during save

---

### **3. Backend Routes** ✅

File: `backend/src/routes/admin/adminProducts.js`

**✔️ Authorization:**

- ✅ Middleware authentication (JWT)
- ✅ Role-based access (super_admin, super_inventory_admin)

**✔️ Upload Routes:**

```javascript
// Create product dengan images
POST /api/admin/products
- upload.array("images", 5)
- handleMulterError
- productController.create

// Update product dengan images
PUT /api/admin/products/:id
- upload.array("images", 5)
- handleMulterError
- productController.update

// Upload additional images
POST /api/admin/products/:id/images
- upload.array("images", 5)
- handleMulterError
- productImageController.upload
```

---

### **4. Static File Serving** ✅

File: `backend/src/app.js`

**✔️ Express Static:**

```javascript
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
```

**✔️ Aksesible via:**

- `http://localhost:5000/uploads/products/filename.jpg`

**✔️ Logging:**

```javascript
app.use("/uploads", (req, res, next) => {
  console.log(`📁 [STATIC] Requesting: ${req.url}`);
  next();
});
```

---

### **5. Directory Structure** ✅

```
backend/
└── public/
    └── uploads/
        └── products/
            ├── .gitkeep ✅
            ├── foto_si_eca-1761380507096-852929262.jpg ✅
            ├── lampu-1763706242584-153596937.jpg ✅
            └── ... (39+ files uploaded) ✅
```

---

## ❌ MASALAH YANG DITEMUKAN

### **🔴 CRITICAL: Inconsistent File Size Limit**

**Frontend Validation:**

```jsx
// File: frontend/src/components/ui_admin/ProductFormModal.jsx (Line 139)
const oversizedFiles = files.filter((file) => file.size > 2 * 1024 * 1024);
//                                                          ^^^ 2MB

if (oversizedFiles.length > 0) {
  toast.error("Ukuran file maksimal 2MB per gambar"); // ❌ 2MB
  return;
}
```

**Backend Validation:**

```javascript
// File: backend/src/middlewares/upload.middleware.js (Line 58)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // ❌ 5MB max per file
    files: 5,
  },
});
```

**❌ DAMPAK:**

1. User tidak bisa upload file 3-5MB karena frontend reject
2. Backend sebenarnya bisa terima sampai 5MB
3. Inconsistency membingungkan user
4. Error message di frontend tidak match dengan capability backend

**✅ SOLUSI:**
Samakan limit di **frontend = 5MB** (sesuai backend)

---

### **🟡 MEDIUM: Image URL untuk Production**

**Current Implementation:**

```javascript
// Backend menyimpan relative path
const imageUrl = `/uploads/products/${file.filename}`;
// Result: /uploads/products/foto-123.jpg
```

**Frontend Display:**

```jsx
// Frontend langsung pakai URL dari backend
<img src={img.image_url} />
// Works di development (same origin)
// ❌ Gagal di production (beda domain)
```

**Skenario Production:**

- Frontend: `https://admin.baletani.com`
- Backend: `https://api.baletani.com`
- Image URL: `/uploads/products/foto.jpg`
- Browser request: `https://admin.baletani.com/uploads/products/foto.jpg` ❌
- Harusnya: `https://api.baletani.com/uploads/products/foto.jpg` ✅

**✅ SOLUSI:**

1. **Option 1** (Recommended): Frontend prepend base URL saat display
2. **Option 2**: Backend return full URL (tambah BASE_URL di env)

---

### **🟡 MEDIUM: Nginx Configuration untuk Production**

**Saat deployment ke VPS:**

```nginx
# ❌ MISSING: Serve uploaded files via Nginx (lebih cepat dari Express)

# ✅ HARUS DITAMBAHKAN:
location /uploads/ {
    alias /var/www/baletani/backend/public/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";

    # Optional: Add CORS headers
    add_header Access-Control-Allow-Origin "*";
}
```

**Tanpa ini:**

- Express handle static files (slower)
- No caching optimization
- Higher memory usage

---

### **🟢 MINOR: Missing Image Optimization**

**Current:**

- Upload original file as-is
- Bisa jadi file 4-5MB untuk foto high-res

**Ideal:**

- Resize/compress saat upload
- Generate thumbnail untuk list view
- WebP conversion untuk file size lebih kecil

**Contoh dengan Sharp:**

```javascript
const sharp = require("sharp");

// Resize dan compress
await sharp(file.path)
  .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
  .jpeg({ quality: 85 })
  .toFile(outputPath);

// Generate thumbnail
await sharp(file.path)
  .resize(300, 300, { fit: "cover" })
  .jpeg({ quality: 80 })
  .toFile(thumbnailPath);
```

---

### **🟢 MINOR: No Image Cleanup untuk Deleted Products**

**Skenario:**

1. Admin upload 5 gambar untuk product A
2. Admin delete product A
3. Files masih ada di `uploads/products/`

**Problem:**

- Wasted disk space
- Orphaned files
- No automatic cleanup

**✅ SOLUSI:**
Add cleanup di delete controller:

```javascript
// When deleting product
const images = await ProductImage.findAll({ where: { product_id } });
images.forEach((img) => {
  const filePath = path.join(__dirname, "../../public", img.image_url);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
});
```

---

## 🔧 FIXES YANG HARUS DILAKUKAN

### **Fix #1: Samakan File Size Limit (CRITICAL)**

**File:** `frontend/src/components/ui_admin/ProductFormModal.jsx`

**Line 139:** Ganti dari 2MB ke 5MB

```jsx
// BEFORE ❌
const oversizedFiles = files.filter((file) => file.size > 2 * 1024 * 1024); // 2MB
if (oversizedFiles.length > 0) {
  toast.error("Ukuran file maksimal 2MB per gambar");
  return;
}

// AFTER ✅
const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024); // 5MB
if (oversizedFiles.length > 0) {
  toast.error("Ukuran file maksimal 5MB per gambar");
  return;
}
```

---

### **Fix #2: Image URL Helper untuk Production**

**File:** `frontend/src/utils/imageUtils.js` (CREATE NEW atau UPDATE)

```javascript
/**
 * Get full image URL based on environment
 * @param {string} relativePath - Path dari backend: /uploads/products/foto.jpg
 * @returns {string} Full URL untuk display
 */
export const getImageUrl = (relativePath) => {
  if (!relativePath) return "/placeholder.png";

  // Jika sudah full URL (http/https), return as-is
  if (
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://")
  ) {
    return relativePath;
  }

  // Development: Ambil dari backend API
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Pastikan tidak ada double slash
  const cleanPath = relativePath.startsWith("/")
    ? relativePath
    : `/${relativePath}`;
  const cleanBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${cleanBase}${cleanPath}`;
};

/**
 * Example usage:
 * const imageUrl = getImageUrl(product.image_url);
 * <img src={imageUrl} alt={product.name} />
 */
```

**Update di Component:**

```jsx
import { getImageUrl } from "../../utils/imageUtils";

// Saat display image
<img
  src={getImageUrl(img.image_url)}
  alt="Product"
  className="w-full h-24 object-cover rounded-lg"
/>;
```

---

### **Fix #3: Add Cleanup untuk Deleted Products**

**File:** `backend/src/controllers/adminProduct.controller.js`

**Update deleteProduct function:**

```javascript
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id: id },
      include: [{ model: ProductImage, as: "images" }],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    // ✅ DELETE ASSOCIATED IMAGE FILES
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        const filePath = path.join(__dirname, "../../public", img.image_url);

        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted image file: ${filePath}`);
          } catch (err) {
            console.error(`❌ Error deleting file ${filePath}:`, err);
          }
        }
      });
    }

    // Delete from database (cascade akan delete images record)
    await product.destroy();

    return res.status(200).json({
      success: true,
      message: "Produk dan gambar berhasil dihapus",
      data: { id },
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus produk",
      error: error.message,
    });
  }
};
```

---

### **Fix #4: Nginx Production Config**

**File:** `HOSTING_DEPLOYMENT_GUIDE.md` (ALREADY COVERED)

Pastikan Nginx config include:

```nginx
# Serve uploaded files directly (bypass Express)
location /uploads/ {
    alias /var/www/baletani/backend/public/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";

    # CORS headers untuk cross-origin requests
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
}
```

---

## 📊 SUMMARY

| Item                           | Status          | Priority    | Action Required          |
| ------------------------------ | --------------- | ----------- | ------------------------ |
| Backend Upload Middleware      | ✅ OK           | -           | None                     |
| Backend Controller Logic       | ✅ OK           | -           | None                     |
| Backend Routes & Auth          | ✅ OK           | -           | None                     |
| Static File Serving            | ✅ OK           | -           | None                     |
| Directory & Permissions        | ✅ OK           | -           | Check permissions di VPS |
| **File Size Limit Mismatch**   | ❌ ISSUE        | 🔴 CRITICAL | Fix frontend (2MB → 5MB) |
| **Image URL untuk Production** | ⚠️ WARNING      | 🟡 MEDIUM   | Add getImageUrl helper   |
| **File Cleanup saat Delete**   | ⚠️ WARNING      | 🟡 MEDIUM   | Add cleanup logic        |
| **Nginx Config**               | ⚠️ TODO         | 🟡 MEDIUM   | Setup saat deployment    |
| **Image Optimization**         | 💡 NICE-TO-HAVE | 🟢 LOW      | Future enhancement       |

---

## 🎯 ACTION PLAN

### **Immediate (Sebelum Testing):**

1. ✅ Fix file size limit di frontend (2MB → 5MB)
2. ✅ Create `imageUtils.js` helper function
3. ✅ Update components untuk pakai `getImageUrl()`

### **Before Production Deployment:**

4. ✅ Add file cleanup di delete controller
5. ✅ Test upload/delete flow lengkap
6. ✅ Setup Nginx static file serving
7. ✅ Update `.env.production` dengan VITE_API_BASE_URL

### **Future Enhancement:**

8. 💡 Add Sharp untuk image optimization
9. 💡 Generate thumbnails otomatis
10. 💡 WebP conversion
11. 💡 Add image gallery lightbox di frontend

---

## 🧪 TESTING CHECKLIST

**Upload Flow:**

- [ ] Upload 1 image (< 1MB)
- [ ] Upload 5 images sekaligus
- [ ] Upload file 4MB (seharusnya berhasil setelah fix)
- [ ] Upload file 6MB (seharusnya ditolak)
- [ ] Upload file non-image (seharusnya ditolak)
- [ ] Upload SVG file (seharusnya ditolak - security)

**Display:**

- [ ] Image tampil di product list
- [ ] Image tampil di product detail
- [ ] Image tampil saat edit product
- [ ] Image dengan URL full path berfungsi

**Delete:**

- [ ] Delete single image dari product
- [ ] Delete product dengan multiple images
- [ ] Verify files terhapus dari disk

**Error Handling:**

- [ ] Upload tanpa login (401)
- [ ] Upload sebagai role lain (403)
- [ ] Upload ke product yang tidak ada (404)
- [ ] Upload saat server error (500)

---

## 📝 NOTES

### **Why 5MB per file is OK:**

- ✅ Smartphone photos biasanya 2-4MB
- ✅ High-res product photos bisa 3-5MB
- ✅ 5 images × 5MB = 25MB total (reasonable)
- ✅ Express body limit sudah 10MB

### **Why SVG is Blocked:**

```javascript
// SVG bisa contain malicious scripts
<svg xmlns="http://www.w3.org/2000/svg">
  <script>alert('XSS')</script> // ❌ XSS Attack Vector
</svg>
```

### **Upload Flow Diagram:**

```
Frontend (ProductFormModal)
    │
    ├─ Validate: type, size (5MB), count (5)
    │
    ├─ Create FormData
    │   ├─ name, description, price, etc.
    │   └─ images[] (File objects)
    │
    ├─ POST /api/admin/products
    │
    ▼
Backend (upload.middleware.js)
    │
    ├─ Authenticate JWT
    ├─ Check Role Permission
    ├─ Multer Process:
    │   ├─ Validate MIME type
    │   ├─ Validate extension
    │   ├─ Sanitize filename
    │   ├─ Save to disk
    │   └─ Add file info to req.files
    │
    ├─ productController.create
    │   ├─ Create Product record
    │   ├─ Create ProductImage records
    │   └─ Return success
    │
    ▼
Response to Frontend
    │
    ├─ Success: Show toast, refresh list
    └─ Error: Show error message
```

---

**🎉 Kesimpulan:**

Sistem upload gambar **sudah 90% correct**! Hanya perlu:

1. 🔴 Fix file size limit mismatch (CRITICAL)
2. 🟡 Add image URL helper untuk production (MEDIUM)
3. 🟡 Add cleanup logic saat delete (MEDIUM)

Setelah 3 fix ini, sistem upload siap production! 🚀
