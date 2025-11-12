# 🎨 Landing Page Features - BaleTani Fresh Market

## 📋 Overview
Landing page BaleTani telah diperbaharui dengan fitur-fitur modern menggunakan **Framer Motion** untuk animasi yang smooth dan interaktif, serta mengambil data real-time dari API backend.

---

## ✨ Fitur Utama

### 1. **Hero Section dengan Parallax Effect**
- ✅ Animasi floating shapes di background
- ✅ Smooth entrance animation untuk text dan buttons
- ✅ Hover effects pada CTA buttons
- ✅ Responsive design untuk semua device

### 2. **Statistics Section dengan Counter Animation**
- ✅ Animated statistics cards
- ✅ Icon bounce animation saat scroll
- ✅ Hover lift effect
- ✅ Data achievements: Produk, Pelanggan, Layanan, Terpercaya

### 3. **Special Offer Banner**
- ✅ Gradient background dengan animated shapes
- ✅ Pulse animation untuk menarik perhatian
- ✅ Smooth scroll to products section

### 4. **🔥 Unlimited Product Carousel**
- ✅ **Auto-play**: Berganti slide otomatis setiap 5 detik
- ✅ **Infinite Loop**: Carousel unlimited sesuai jumlah produk
- ✅ **Navigation Controls**: Tombol prev/next dengan hover effects
- ✅ **Indicators**: Dot indicators untuk setiap produk
- ✅ **Slide Animation**: Smooth transition dengan Framer Motion
- ✅ **Responsive**: 3 produk di desktop, auto-adjust di mobile
- ✅ **Data dari API**: Fetch real-time dari `/api/public/products`

**Fitur Carousel:**
```javascript
- Auto-play interval: 5 detik
- Visible products: 3 cards per view (desktop)
- Transition: Slide with fade effect
- Loop: True (unlimited)
- Navigation: Arrow buttons + dot indicators
```

### 5. **Benefits Section**
- ✅ Staggered animation untuk setiap benefit card
- ✅ Hover effects dengan lift dan shadow
- ✅ Icon rotation animation saat hover
- ✅ 4 keunggulan utama BaleTani

### 6. **📦 Categories Section dengan API Integration**
- ✅ **Data Real-time**: Fetch dari `/api/public/categories`
- ✅ **Dynamic Icons**: Icon emoji sesuai kategori (🥬 🍎 🥩 🐟)
- ✅ **Product Count**: Menampilkan jumlah produk per kategori
- ✅ **Scale Animation**: Hover scale effect
- ✅ **Loading State**: Skeleton loading saat fetch data
- ✅ **Responsive Grid**: Auto-adjust layout

**Helper Function untuk Icon:**
```javascript
getCategoryIcon(categoryName)
- Sayuran → 🥬
- Buah → 🍎
- Daging/Unggas → 🥩
- Seafood/Ikan → 🐟
- Bumbu → 🌶️
- Susu → 🥛
- Default → 🛒
```

### 7. **Testimonials Section**
- ✅ Stagger animation untuk setiap testimonial card
- ✅ Star rating display
- ✅ Hover lift effect dengan enhanced shadow
- ✅ Customer photo, name, dan location

### 8. **About Section**
- ✅ Split layout dengan animated content
- ✅ Parallax effect untuk decorative elements
- ✅ Feature list dengan animated icons
- ✅ Brand tagline highlight

### 9. **CTA Section dengan Magnetic Effect**
- ✅ Animated background shapes
- ✅ Button hover magnetic effect
- ✅ Multiple CTA options (WhatsApp & Katalog)
- ✅ Gradient background animation

---

## 🎬 Animasi Framer Motion yang Digunakan

### **Scroll Animations**
```javascript
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
```

### **Hover Effects**
```javascript
whileHover={{ 
  y: -10,
  scale: 1.05,
  boxShadow: "0 20px 30px rgba(0,0,0,0.1)"
}}
```

### **Stagger Animation**
```javascript
transition={{ delay: index * 0.1, duration: 0.5 }}
```

### **Floating Animation**
```javascript
animate={{ 
  y: [0, -20, 0],
  rotate: [0, 5, 0]
}}
transition={{ 
  duration: 4,
  repeat: Infinity,
  ease: "easeInOut"
}}
```

### **Carousel Transition**
```javascript
<AnimatePresence mode="wait">
  <motion.div
    key={currentSlide}
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
  />
</AnimatePresence>
```

---

## 🔌 API Integration

### **Products Endpoint**
```javascript
GET /api/public/products
Query Parameters:
- limit: 12 (default)
- sortBy: 'newest'

Response:
{
  success: true,
  data: {
    products: [...],
    pagination: {...}
  }
}
```

### **Categories Endpoint**
```javascript
GET /api/public/categories

Response:
{
  success: true,
  data: [
    {
      id: "uuid",
      category_name: "string",
      description: "string",
      product_count: number
    }
  ]
}
```

---

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3-4 columns)

### **Carousel Responsive**
- **Desktop**: 3 produk per view
- **Tablet**: 2 produk per view (auto-adjust)
- **Mobile**: 1 produk per view

---

## 🚀 Performance Optimizations

1. **Lazy Loading**: Animations trigger only `whileInView`
2. **Once Animation**: `viewport={{ once: true }}` untuk animasi 1x saja
3. **Optimized Images**: Placeholder images dengan lazy loading
4. **API Caching**: Backend cache untuk 10-60 menit
5. **Parallel Fetch**: Products dan Categories fetch bersamaan

---

## 🎯 User Experience Features

### **Loading States**
- ✅ Spinner saat fetch data
- ✅ Skeleton loading untuk categories
- ✅ Empty state handling

### **Interactive Elements**
- ✅ Smooth scroll to sections
- ✅ WhatsApp integration untuk quick order
- ✅ Link ke product detail pages
- ✅ Category filtering via URL params

### **Accessibility**
- ✅ Aria labels untuk navigation buttons
- ✅ Keyboard navigation support
- ✅ Alt text untuk images
- ✅ Color contrast WCAG compliant

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Animation**: Framer Motion 10
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: Zustand
- **Routing**: React Router DOM 6

---

## 📦 Dependencies

```json
{
  "framer-motion": "^10.16.4",
  "lucide-react": "^0.279.0",
  "react": "^18.2.0",
  "react-router-dom": "^6.15.0",
  "axios": "^1.5.0"
}
```

---

## 🎨 Design Principles

1. **Smooth Animations**: Natural, tidak berlebihan
2. **Performance First**: Animasi di-optimize untuk 60fps
3. **Mobile-First**: Responsive design dari mobile ke desktop
4. **Accessibility**: Semua interaksi keyboard-friendly
5. **Loading States**: User selalu tahu status aplikasi

---

## 🔄 Future Enhancements

- [ ] Touch swipe support untuk carousel
- [ ] Lazy loading images dengan blur placeholder
- [ ] Add to cart animation
- [ ] Wishlist toggle animation
- [ ] Product quick view modal
- [ ] Video testimonials
- [ ] Real-time stock updates
- [ ] Personalized product recommendations

---

## 📝 Notes

- **Auto-play carousel** dapat di-pause dengan hover (optional enhancement)
- **Kategori icons** dapat di-customize melalui fungsi `getCategoryIcon()`
- **Animation delays** dapat di-adjust untuk preferensi user
- **API endpoints** sudah di-cache di backend untuk performance

---

## 🎉 Result

Landing page sekarang memiliki:
- ✨ Animasi smooth & modern
- 🔄 Unlimited product carousel dengan auto-play
- 📊 Data real-time dari API
- 📱 Fully responsive
- ⚡ Optimized performance
- 🎯 Better user engagement

**Enjoy the new interactive landing page! 🚀**
