# 🎨 PANDUAN UPLOAD LOGO & ASSETS BALETANI

## 📂 Folder Structure Sudah Dibuat:
```
frontend/src/assets/
├── images/
│   ├── logos/ ← **TARUH LOGO DISINI!**
│   ├── products/ ← Foto produk
│   ├── hero/ ← Gambar hero section
│   ├── categories/ ← Gambar kategori
│   └── icons/ ← Icon tambahan
└── README.md ← Panduan lengkap
```

## 🚀 LANGKAH UPLOAD LOGO:

### 1. Siapkan Logo dalam Format:
- **logo-main.png** (200x80px) - Logo utama untuk header
- **logo-small.png** (64x64px) - Logo kecil 
- **logo-white.png** - Logo putih untuk dark background
- **favicon.ico** - Icon website

### 2. Upload ke Folder:
Taruh semua file logo ke:
```
D:\nnnnssssffffwwww\BaleTani_WEBSITE\frontend\src\assets\images\logos\
```

### 3. Aktifkan Logo di Navbar:
Setelah upload, edit file:
```
frontend/src/components/layout/Navbar.jsx
```

Uncomment line ini (hapus /* dan */):
```jsx
<img src="/src/assets/images/logos/logo-main.png" alt="BaleTani" className="w-8 h-8" />
```

Dan comment/hapus line ini:
```jsx
<span className="text-white font-bold text-lg">🌾</span>
```

## 📷 FOTO PRODUK YANG DIBUTUHKAN:

### Sayuran (4 produk):
- **sayuran-bayam-1.jpg** - Bayam segar organik
- **sayuran-tomat-cherry-1.jpg** - Tomat cherry premium  
- **sayuran-kangkung-1.jpg** - Kangkung hidroponik
- **sayuran-sawi-1.jpg** - Sawi hijau fresh

### Buah (3 produk):
- **buah-apel-fuji-1.jpg** - Apel Fuji import
- **buah-pisang-cavendish-1.jpg** - Pisang Cavendish
- **buah-jeruk-pontianak-1.jpg** - Jeruk Pontianak

### Daging & Unggas (2 produk):
- **daging-ayam-kampung-1.jpg** - Ayam kampung segar
- **daging-sapi-premium-1.jpg** - Daging sapi premium

### Seafood (2 produk):
- **seafood-salmon-fillet-1.jpg** - Ikan salmon fillet
- **seafood-udang-vaname-1.jpg** - Udang vaname jumbo

## 🖼️ GAMBAR TAMBAHAN:

### Hero Section:
- **hero-main.jpg** (1200x600px) - Landing page utama
- **hero-about.jpg** (800x500px) - About section

### Kategori:
- **kategori-sayuran.jpg** (400x300px)
- **kategori-buah.jpg** (400x300px) 
- **kategori-daging.jpg** (400x300px)
- **kategori-seafood.jpg** (400x300px)

## ✅ CHECKLIST AFTER UPLOAD:

1. [ ] Logo uploaded ke `/logos/`
2. [ ] Navbar updated (uncomment img tag)
3. [ ] Test logo muncul di website
4. [ ] Favicon updated di `public/favicon.ico`
5. [ ] Product photos uploaded ke `/products/`
6. [ ] Hero images uploaded ke `/hero/`
7. [ ] Category images uploaded ke `/categories/`

## 🔧 TIPS:
- **Format**: PNG untuk logo (transparan), JPG untuk foto
- **Size**: Logo < 100KB, Photos < 500KB
- **Quality**: High resolution, good lighting
- **Style**: Consistent, clean, fresh, natural

## 📞 NEED HELP?
Contact developer jika ada masalah dengan upload atau integration! 🚀

---

**Happy Designing! 🎨**