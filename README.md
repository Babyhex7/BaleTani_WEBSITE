# BaleTani Fresh Market - Web Fullstack

> **"Dari kebun ke Balé, dari Balé ke rumahmu"**

Sistem web fullstack untuk BaleTani Fresh Market dengan fitur login/register menggunakan JWT, state management Zustand, dan RBAC (Role-Based Access Control).

## 🚀 Tech Stack

### Backend

- **Node.js** + **Express.js** - API Server
- **Sequelize ORM** - Database ORM
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password Hashing
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - Security Headers
- **Express Rate Limit** - Rate Limiting

### Frontend Customer

- **React 18** + **Vite** - Frontend Framework
- **React Router DOM** - Routing
- **Zustand** - State Management
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Framer Motion** - Animations (ready)

### Frontend Admin

- **React 18** + **Vite** - Admin Dashboard
- Struktur sama dengan frontend customer

## 📁 Struktur Folder

```
project-root/
├── backend/                 # API service (Node.js + Express + Sequelize)
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # Sequelize models
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Auth, error handling
│   │   ├── utils/          # Helper functions
│   │   ├── app.js         # Express app setup
│   │   └── server.js      # Server entry point
│   ├── .env               # Environment variables
│   └── package.json
│
├── frontend-customer/       # Web customer (React)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── layout/    # Navbar, Footer, Sidebar
│   │   │   └── ui/        # Button, Input, Modal
│   │   ├── pages/         # Main pages
│   │   ├── store/         # Zustand stores
│   │   ├── services/      # API handlers
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Helper functions
│   │   ├── styles/        # Global CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env               # Frontend environment
│   └── package.json
│
├── frontend-admin/          # Web admin/dashboard (React)
│   └── [Same structure as customer]
│
└── docs/                   # Documentation
    ├── README.md
    └── API_SPEC.md
```

## 🎨 Design System

### Warna Brand

- **Primary Green**: `#008000` (Deep Forest Green - Fresh & Natural)
- **Secondary Yellow**: `#FFD700` (Bright Golden Yellow - Healthy & Bright)
- **Accent Orange**: `#FFA500` (Vibrant Orange - Friendly & Energetic)
- **Gray Scale**: `#f9fafb` to `#030712`

### Typography

- **Font**: Inter (Google Fonts)
- **Display**: Inter 600-800 weight
- **Body**: Inter 400-500 weight

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or later)
- MySQL Server
- npm atau yarn

### 1. Clone Repository

```bash
git clone <repository-url>
cd BaleTani_WEBSITE
```

### 2. Setup Backend

```bash
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env file dengan database credentials Anda

# Start development server
npm run dev
```

### 3. Setup Frontend Customer

```bash
cd frontend-customer
npm install

# Start development server
npm run dev
```

### 4. Setup Frontend Admin (Opsional)

```bash
cd frontend-admin
npm install
npm run dev
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer','admin','staff') DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

[Schema lengkap tersedia di dokumentasi]

## 🔐 Authentication & Authorization

### JWT Implementation

- Access token dengan expiry 7 hari
- Token disimpan di localStorage menggunakan Zustand persist
- Automatic token refresh pada request API

### RBAC (Role-Based Access Control)

- **Customer**: Akses landing page, produk, cart, order
- **Admin**: Akses penuh ke admin dashboard
- **Staff**: Akses terbatas ke beberapa fitur admin

### State Management (Zustand)

```javascript
// Auth Store
const useAuthStore = create(
  persist((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: (userData, token) => {
      /* ... */
    },
    logout: () => {
      /* ... */
    },
    hasRole: (role) => {
      /* ... */
    },
  }))
);
```

## 📱 Fitur Utama

### Landing Page

- [x] Hero Section dengan CTA
- [x] Produk Unggulan
- [x] Kategori Produk
- [x] Testimoni Pelanggan
- [x] Tentang BaleTani
- [x] Integrasi WhatsApp

### Authentication

- [x] Register dengan validasi
- [x] Login dengan JWT
- [x] Password strength indicator
- [x] Form validation
- [x] Error handling

### Coming Soon

- [ ] Katalog Produk dengan Filter
- [ ] Shopping Cart
- [ ] Checkout Process
- [ ] Order Management
- [ ] Admin Dashboard
- [ ] Inventory Management
- [ ] Reports & Analytics

## 🌐 API Endpoints

### Authentication

```
POST /api/auth/register  # User registration
POST /api/auth/login     # User login
GET  /api/auth/profile   # Get user profile
```

### Products (Coming Soon)

```
GET    /api/products           # Get all products
GET    /api/products/:id       # Get product by ID
POST   /api/products           # Create product (admin)
PUT    /api/products/:id       # Update product (admin)
DELETE /api/products/:id       # Delete product (admin)
```

## 🎯 Development Status

### ✅ Completed

- [x] Backend API structure
- [x] Database models & configuration
- [x] Authentication system (JWT)
- [x] Frontend customer structure
- [x] Landing page design
- [x] Login/Register pages
- [x] Responsive design
- [x] State management (Zustand)
- [x] Error handling

### 🚧 In Progress

- [ ] Product management
- [ ] Shopping cart functionality
- [ ] Admin dashboard setup

### 📋 Backlog

- [ ] Order management
- [ ] Payment integration
- [ ] Email notifications
- [ ] Advanced search & filters
- [ ] Mobile app (React Native)

## 🛠️ Development Guidelines

### Code Style

- ESLint configuration untuk React
- Consistent naming conventions
- Component-based architecture
- Custom hooks untuk reusable logic

### Git Workflow

```bash
# Feature development
git checkout -b feature/nama-fitur
git commit -m "feat: implementasi fitur xyz"
git push origin feature/nama-fitur

# Commit conventions
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code refactoring
test: adding tests
```

## 📞 Support & Contact

- **Email**: info@baletani.com
- **WhatsApp**: +62 812-3456-7890
- **Instagram**: @baletani
- **Facebook**: BaleTani Fresh Market

---

**BaleTani Fresh Market** - Menyediakan produk segar berkualitas tinggi dengan harga terjangkau. Segar, cepat, dan terpercaya! 🥬🍎🐟
