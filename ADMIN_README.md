# BaleTani Admin Interface

Sistem manajemen admin modern dan responsif untuk BaleTani dengan RBAC (Role-Based Access Control) yang terintegrasi dengan customer interface.

## 🚀 Fitur Admin yang Sudah Siap

### ✅ Dashboard Admin

- **Statistik Real-time**: Total orders, revenue, pending orders, low stock alerts
- **Recent Orders**: 5 pesanan terakhir dengan status
- **Low Stock Products**: Produk dengan stok menipis (≤10 unit)
- **Monthly Growth**: Persentase pertumbuhan orders dan revenue
- **Quick Actions**: Shortcut ke fitur utama admin

### ✅ Inventory Management

- **CRUD Produk**: Create, Read, Update, Delete produk
- **CRUD Kategori**: Manajemen kategori produk
- **Stock Management**: Update stok manual dan otomatis
- **Search & Filter**: Pencarian dan filter berdasarkan kategori, status stok
- **Pagination**: Navigasi halaman yang efisien
- **Stock Alerts**: Notifikasi produk dengan stok menipis/habis

### ✅ User Management

- **CRUD Users**: Kelola semua pengguna (admin, staff, customer)
- **Role Management**: Ubah role pengguna dengan RBAC
- **Password Reset**: Reset password untuk pengguna
- **User Statistics**: Statistik jumlah admin, staff, dan customer
- **Search & Filter**: Pencarian berdasarkan nama/email dan filter role

### ✅ RBAC Security

- **Multi-Role Support**: Admin, Staff, Customer dengan akses berbeda
- **Protected Routes**: Route protection berdasarkan role
- **Auto Redirect**: Redirect otomatis sesuai role setelah login
- **Access Control**: Kontrol akses granular untuk setiap fitur

## 🎨 UI/UX Features

### Komponen Reusable

- **Table**: Tabel dengan sorting, pagination, dan actions
- **SearchFilter**: Component search dan filter yang fleksibel
- **Pagination**: Navigasi halaman yang responsive
- **Modal**: Modal untuk form dan konfirmasi
- **StatCard**: Card statistik dengan trend indicator
- **Alert & Badge**: Notifikasi dan status indicator

### Modern Design

- **Responsive**: Optimized untuk desktop, tablet, dan mobile
- **Clean UI**: Design minimalist dan professional
- **Dark/Light**: Ready untuk dark mode (belum implementasi)
- **Loading States**: Indicator loading yang smooth
- **Empty States**: Handling untuk kondisi data kosong

## 🛠 Setup dan Instalasi

### 1. Backend Setup

```bash
cd backend
npm install

# Setup database (MySQL)
# Update .env dengan konfigurasi database Anda

# Run migrations dan seed data
npm run seed:admin

# Start backend server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start frontend development server
npm run dev
```

### 3. Test Accounts

Setelah running seed, gunakan akun berikut untuk testing:

**Admin Account:**

- Email: `admin@baletani.com`
- Password: `admin123`
- Access: Full admin dashboard

**Staff Account:**

- Email: `staff@baletani.com`
- Password: `staff123`
- Access: Limited admin features

**Customer Account:**

- Email: `customer@baletani.com`
- Password: `customer123`
- Access: Customer interface only

## 📂 Struktur Admin Code

```
frontend/src/
├── components/
│   ├── layout_admin/
│   │   ├── AdminLayout.jsx      # Main admin layout
│   │   ├── AdminSidebar.jsx     # Navigation sidebar
│   │   └── AdminHeader.jsx      # Top header with breadcrumb
│   ├── ui_admin/
│   │   ├── Table.jsx            # Reusable table component
│   │   ├── SearchFilter.jsx     # Search and filter component
│   │   ├── Pagination.jsx       # Pagination component
│   │   ├── StatCard.jsx         # Statistics card
│   │   ├── ModalAdmin.jsx       # Modal components
│   │   └── CommonComponents.jsx # Badge, Alert, Loading, etc.
│   └── auth/
│       └── ProtectedRoute.jsx   # RBAC route protection
├── pages/admin/
│   ├── AdminDashboard.jsx       # Dashboard page
│   ├── InventoryManagement.jsx  # Product & category management
│   └── UserManagement.jsx       # User & role management
├── services/services_admin/
│   ├── dashboardService.js      # Dashboard API calls
│   ├── inventoryService.js      # Inventory API calls
│   └── userService.js           # User management API calls
└── store/store_admin/
    └── useAdminStore.js         # Admin state management
```

## 🔄 API Endpoints Ready

### Dashboard APIs

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/recent-orders` - Recent orders
- `GET /api/admin/dashboard/low-stock` - Low stock products

### User Management APIs

- `GET /api/admin/users` - Get users with pagination/filter
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `PATCH /api/admin/users/:id/role` - Update user role

### Inventory APIs

- `GET /api/admin/inventory/products` - Get products
- `POST /api/admin/inventory/products` - Create product
- `PUT /api/admin/inventory/products/:id` - Update product
- `DELETE /api/admin/inventory/products/:id` - Delete product
- `GET /api/admin/inventory/categories` - Get categories
- `POST /api/admin/inventory/categories` - Create category

## 🎯 Coming Soon Features

### 🛒 Order Management (Coming Soon)

- Daftar dan filter orders
- Update status pesanan
- Print invoice PDF
- WhatsApp integration untuk orders
- Stock reduction otomatis

### 💰 Akuntansi & Keuangan (Coming Soon)

- Cash flow tracking
- Profit & loss reports
- Transaction logging
- Financial analytics

### 📊 Reports & Analytics (Coming Soon)

- Sales reports (daily, monthly, yearly)
- Inventory reports
- User activity reports
- Export to PDF/Excel

## 🎨 Customization

### Colors & Theme

The admin interface menggunakan color scheme yang konsisten:

- Primary: Green (`green-600`)
- Secondary: Blue, Yellow, Red untuk status
- Neutral: Gray scale untuk background dan text

### Component Extension

Semua komponen dibuat reusable dan mudah diextend:

```jsx
// Contoh penggunaan Table component
<Table
  columns={columns}
  data={data}
  actions={actions}
  onSort={handleSort}
  isLoading={loading}
/>
```

## 🔐 Security Features

- **JWT Authentication**: Token-based auth dengan expiry
- **Role-based Access**: Granular permission per role
- **Input Validation**: Server-side validation untuk semua input
- **CORS Protection**: Configured untuk multiple frontend domains
- **Rate Limiting**: API rate limiting untuk security
- **Password Hashing**: bcrypt untuk password security

## 🚀 Deployment Ready

- **Environment Variables**: Proper env configuration
- **Database Migration**: Sequelize ORM dengan migrations
- **Error Handling**: Comprehensive error handling
- **Logging**: Structured logging untuk debugging
- **Health Check**: API health check endpoint

---

**BaleTani Admin Interface** - Modern, Responsive, Secure Admin Dashboard untuk Pertanian Indonesia 🌾
