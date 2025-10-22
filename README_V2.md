# 🌾 BaleTani - Role-Based Access Control System

> **Version 2.0.0** - Complete overhaul dengan Role-Based Access Control

---

## 🎯 What's New in Version 2.0

### ⭐ Main Features

1. **Manual Order Status Update** ✨
   - Update status order dengan dropdown selector yang intuitif
   - Real-time update tanpa reload halaman
   - Visual timeline untuk tracking progress order
   - Different status flow untuk online vs offline transactions

2. **Complete Role-Based Access Control** 🔐
   - 8 admin roles dengan permissions berbeda
   - Backend & frontend protection
   - Role-based menu filtering
   - Transaction type filtering (online/offline) berdasarkan role

3. **Smart Procurement System** 📦
   - Create procurement request dengan detail items
   - Approval workflow (pending → approved/rejected)
   - Auto stock update saat procurement di-approve
   - Stock movement tracking untuk audit trail

4. **Modern UI/UX** 🎨
   - Gradient backgrounds & smooth animations
   - Better color coding untuk status
   - Heroicons untuk visual consistency
   - Responsive design untuk semua devices
   - Toast notifications untuk feedback

---

## 📋 Admin Roles

| Role | Deskripsi | Key Permissions |
|------|-----------|-----------------|
| **Super Admin** | Full access ke semua fitur | CRUD semua data, Approve procurement |
| **Super WhatsApp Admin** | Manage online orders & customers | CRUD online orders, Update customers |
| **Super Cashier** | Manage online & offline orders | CRUD all orders, View products |
| **WhatsApp Admin** | Handle online orders only | Create/Update online orders |
| **Cashier** | Handle offline orders only | Create/Update offline orders |
| **Finance Admin** | View financial reports | View orders, procurement, reports |
| **Inventory Admin** | Create procurement requests | Create procurement, View products |
| **Super Inventory Admin** | Manage inventory & procurement | Approve procurement, CRUD products |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+ (atau MySQL 8+)
- npm atau yarn

### Installation

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd BaleTani_WEBSITE
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Copy .env.example to .env
   cp .env.example .env
   
   # Edit .env dengan database credentials Anda
   nano .env
   ```

3. **Setup Database**
   ```bash
   # ⚠️ BACKUP DATABASE TERLEBIH DAHULU!
   
   # Sync database (will create all tables)
   npm run sync-db
   
   # Seed admin users (optional)
   npm run seed
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Copy .env to configure API URL
   cp .env.example .env
   ```

5. **Run Development**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## 📖 Documentation

Dokumentasi lengkap tersedia di folder `docs/`:

- **[ROLE_BASED_ACCESS_CONTROL.md](docs/ROLE_BASED_ACCESS_CONTROL.md)** - Penjelasan lengkap tentang role dan permissions
- **[DATABASE_MIGRATION_GUIDE.md](docs/DATABASE_MIGRATION_GUIDE.md)** - Panduan migrasi database
- **[IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md)** - Summary implementasi fitur baru

---

## 🔑 Default Admin Credentials

Setelah run `npm run seed`, gunakan credentials berikut:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@baletani.com | admin123 |
| Inventory Admin | inventory@baletani.com | inventory123 |
| Cashier | cashier@baletani.com | cashier123 |

> ⚠️ **IMPORTANT:** Ganti password ini di production!

---

## 📊 Order Status Flow

### Online Transaction
```
checkout → paid → processing → out_for_delivery → completed
    ↓        ↓          ↓              ↓
cancelled cancelled cancelled     cancelled
```

### Offline Transaction
```
checkout → paid → completed
    ↓        ↓
cancelled cancelled
```

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **Sequelize** - ORM for database
- **PostgreSQL** / **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **React Hot Toast** - Notifications

---

## 📁 Project Structure

```
BaleTani_WEBSITE/
├── backend/
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Business logic
│   │   ├── middlewares/    # Auth & error handling
│   │   ├── models/         # Database models
│   │   └── routes/         # API endpoints
│   ├── scripts/            # Database scripts
│   └── seeders/            # Seed data
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── layout_admin/    # Admin layouts
│   │   │   ├── ui_admin/        # Admin UI components
│   │   │   └── ui/              # Customer UI components
│   │   ├── pages/          # Page components
│   │   │   ├── admin/           # Admin pages
│   │   │   └── customer/        # Customer pages
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── utils/          # Helper functions
│   └── public/             # Static assets
│
└── docs/                   # Documentation
```

---

## 🔧 Environment Variables

### Backend (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=baletani_db
DB_USER=your_username
DB_PASSWORD=your_password
DB_DIALECT=postgres  # or 'mysql'

# JWT Configuration
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS (optional)
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login
GET    /api/auth/profile     - Get user profile
```

### Orders (Admin)
```
GET    /api/admin/orders              - Get all orders
GET    /api/admin/orders/stats        - Order statistics
GET    /api/admin/orders/:id          - Get single order
POST   /api/admin/orders              - Create order
PATCH  /api/admin/orders/:id/status   - Update order status ⭐
PATCH  /api/admin/orders/:id/cancel   - Cancel order
```

### Procurements (Admin)
```
GET    /api/admin/procurements              - Get all procurements
GET    /api/admin/procurements/stats        - Procurement stats
GET    /api/admin/procurements/:id          - Get single procurement
POST   /api/admin/procurements              - Create procurement
PATCH  /api/admin/procurements/:id/approve  - Approve procurement
PATCH  /api/admin/procurements/:id/reject   - Reject procurement
```

### Products (Admin)
```
GET    /api/admin/products         - Get all products
GET    /api/admin/products/:id     - Get single product
POST   /api/admin/products         - Create product
PUT    /api/admin/products/:id     - Update product
DELETE /api/admin/products/:id     - Delete product
```

---

## 🧪 Testing

### Manual Testing Order Status Update

1. Login sebagai **Super Cashier** atau **Cashier**
2. Navigate ke `/admin/orders-new`
3. Find an order in "checkout" status
4. Click dropdown di kolom "Status"
5. Select "paid"
6. Verify status updated automatically
7. Click "View" untuk lihat detail
8. Check status timeline shows correct progress

### Manual Testing Procurement

1. Login sebagai **Inventory Admin**
2. Navigate ke `/admin/procurement-new`
3. Click "New Procurement"
4. Add items dan submit
5. Logout
6. Login sebagai **Super Inventory Admin**
7. Go to procurement list
8. Click "View" pada procurement yang baru dibuat
9. Click "Approve"
10. Verify stock produk bertambah

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Verify .env credentials
cat backend/.env | grep DB_
```

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change PORT in .env
PORT=5001
```

### Cannot Update Order Status
- Check user role dan permissions
- Verify order belongs to correct transaction type
- Check console for error messages

---

## 📝 Development Guidelines

### Adding New Role

1. Add role to `backend/src/models/user.model.js`
2. Define permissions in `backend/src/middlewares/auth.middleware.js`
3. Add role to frontend `utils/rolePermissions.js`
4. Update documentation

### Creating New Protected Route

```javascript
// Backend
router.get('/endpoint', 
  authMiddleware,
  roleMiddleware(['super_admin', 'other_role']),
  controller.method
);

// Frontend
import { hasPermission, PERMISSIONS } from '../utils/rolePermissions';

const Component = () => {
  const { user } = useAuthStore();
  
  if (!hasPermission(user.role, PERMISSIONS.VIEW_SOMETHING)) {
    return <Unauthorized />;
  }
  
  return <YourComponent />;
};
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Team

- **Haryo** - UI/UX & Frontend Development
- **Development Team** - Backend & System Architecture

---

## 📞 Support

Untuk bantuan dan pertanyaan:
- Create issue di GitHub
- Contact development team

---

## 🎉 Acknowledgments

- React team untuk amazing framework
- Sequelize team untuk ORM
- Tailwind CSS untuk utility-first CSS
- Heroicons untuk beautiful icons

---

**Last Updated:** October 22, 2025  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
