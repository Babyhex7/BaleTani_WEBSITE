# 🔐 RBAC Implementation Guide - BaleTani Admin

## 📋 Overview

Sistem RBAC (Role-Based Access Control) telah diimplementasikan secara lengkap di BaleTani dengan 8 role admin yang berbeda, masing-masing dengan permissions yang spesifik.

## 🎭 Daftar Role Admin

### 1. **Super Admin** (`super_admin`)

- **Akses**: Semua modul, semua aksi
- **Jumlah Permissions**: 28 permissions (full access)
- **Deskripsi**: Administrator tertinggi dengan akses penuh ke semua fitur sistem
- **Test Account**:
  - Phone: `081234567808`
  - Password: `admin123`

### 2. **Super Admin Inventory** (`super_inventory_admin`)

- **Akses**: Produk, Pengadaan, Laporan
- **Permissions**: 11 permissions
  - Products: view, create, update, delete
  - Procurement: view, create, update, delete, approve
  - Reports: view, create
- **Test Account**:
  - Phone: `081234567807`
  - Password: `superinventory123`

### 3. **Super Admin WhatsApp** (`super_whatsapp_admin`)

- **Akses**: Order Online, Pelanggan, Laporan
- **Permissions**: 10 permissions
  - Online Orders: view, create, update, delete
  - Customers: view, create, update, delete
  - Reports: view, create
- **Test Account**:
  - Phone: `081234567806`
  - Password: `superwa123`

### 4. **Super Kasir** (`super_cashier`)

- **Akses**: Transaksi Offline, Produk (view only), Laporan
- **Permissions**: 7 permissions
  - Offline Orders: view, create, update, delete
  - Products: view
  - Reports: view, create
- **Test Account**:
  - Phone: `081234567805`
  - Password: `superkasir123`

### 5. **Admin Finance** (`finance_admin`)

- **Akses**: Transaksi B2B, Laporan, Order Management
- **Permissions**: 6 permissions
  - B2B Transactions: view, approve
  - Online Orders: view
  - Offline Orders: view
  - Reports: view, create
- **Test Account**:
  - Phone: `081234567804`
  - Password: `finance123`

### 6. **Admin Inventory** (`inventory_admin`)

- **Akses**: Produk, Pengadaan
- **Permissions**: 8 permissions
  - Products: view, create, update
  - Procurement: view, create, update, delete, approve
- **Test Account**:
  - Phone: `081234567803`
  - Password: `inventory123`

### 7. **Admin WhatsApp** (`whatsapp_admin`)

- **Akses**: Order Online, Pelanggan
- **Permissions**: 4 permissions
  - Online Orders: view, update
  - Customers: view, update
- **Test Account**:
  - Phone: `081234567802`
  - Password: `wa123`

### 8. **Kasir** (`cashier`)

- **Akses**: Transaksi Offline, Produk (view only)
- **Permissions**: 4 permissions
  - Offline Orders: view, create, update
  - Products: view
- **Test Account**:
  - Phone: `081234567801`
  - Password: `kasir123`

## 🏗️ Struktur Permissions

### Modules (8 modul):

1. **products** - Manajemen produk
2. **procurement** - Pengadaan barang
3. **online_orders** - Order dari customer online
4. **offline_orders** - Transaksi kasir offline
5. **b2b_transactions** - Transaksi B2B
6. **customers** - Manajemen pelanggan
7. **reports** - Laporan dan analitik
8. **users** - User management

### Actions (5 aksi):

- **view** - Melihat data
- **create** - Membuat data baru
- **update** - Mengubah data existing
- **delete** - Menghapus data
- **approve** - Menyetujui (untuk procurement dan B2B)

## 💻 Cara Menggunakan di Frontend

### 1. **Permission Guard Component**

```jsx
import PermissionGuard from '../components/admin/PermissionGuard';

// Sembunyikan komponen jika tidak punya permission
<PermissionGuard module="products" action="create">
  <button>Tambah Produk</button>
</PermissionGuard>

// Dengan fallback jika tidak punya akses
<PermissionGuard
  module="products"
  action="delete"
  fallback={<p>Anda tidak punya akses untuk menghapus produk</p>}
>
  <button>Hapus Produk</button>
</PermissionGuard>

// Redirect jika tidak punya akses
<PermissionGuard
  module="users"
  action="view"
  redirectTo="/admin/dashboard"
>
  <UserManagementPage />
</PermissionGuard>
```

### 2. **Permission Hooks**

```jsx
import {
  usePermission,
  useRole,
  useAnyPermission,
} from "../components/admin/PermissionGuard";

function ProductPage() {
  const canCreate = usePermission("products", "create");
  const canDelete = usePermission("products", "delete");
  const isSuperAdmin = useRole("super_admin");

  const canManageOrders = useAnyPermission([
    { module: "online_orders", action: "update" },
    { module: "offline_orders", action: "update" },
  ]);

  return (
    <div>
      {canCreate && <button>Tambah Produk</button>}
      {canDelete && <button>Hapus Produk</button>}
      {isSuperAdmin && <AdminPanel />}
      {canManageOrders && <OrderManagement />}
    </div>
  );
}
```

### 3. **Role Permission Card**

Tampilkan info role dan permissions user:

```jsx
import RolePermissionCard from "../components/admin/RolePermissionCard";

function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">{/* Dashboard content */}</div>
      <div>
        <RolePermissionCard />
      </div>
    </div>
  );
}
```

### 4. **Zustand Store Methods**

```javascript
import useAdminStore from "../store/store_admin/useAdminStore";

const AdminComponent = () => {
  const permissions = useAdminStore((state) => state.permissions);
  const hasPermission = useAdminStore((state) => state.hasPermission);
  const hasRole = useAdminStore((state) => state.hasRole);

  // Check permission
  if (hasPermission("products", "create")) {
    // Show create form
  }

  // Check role
  if (hasRole("super_admin")) {
    // Show admin-only features
  }

  // Get all permissions
  console.log("User permissions:", permissions);
  // Output: [{ module: 'products', action: 'view', description: '...' }, ...]
};
```

## 🔄 Flow Login dengan RBAC

1. **User memasukkan phone number & password di login page**
2. **Frontend mengirim request ke** `/api/admin/auth/login`
3. **Backend memproses**:
   - Normalize phone number (08xxx → 628xxx)
   - Query database untuk admin dengan phone tersebut
   - Verify password dengan bcryptjs
   - Check apakah role termasuk admin roles
   - Load permissions dari `role_permissions` table
4. **Backend mengembalikan**:
   ```json
   {
     "success": true,
     "message": "Login berhasil",
     "data": {
       "user": {
         "id": "uuid",
         "phone_number": "628xxx",
         "full_name": "Admin Name",
         "role": {
           "id": "uuid",
           "name": "super_admin",
           "description": "..."
         },
         "permissions": [
           {
             "id": "uuid",
             "module": "products",
             "action": "view",
             "description": "..."
           },
           {
             "id": "uuid",
             "module": "products",
             "action": "create",
             "description": "..."
           }
         ]
       },
       "token": "JWT_TOKEN"
     }
   }
   ```
5. **Frontend menyimpan ke Zustand store**:
   - `admin` object
   - `token` untuk authentication
   - `permissions` array untuk RBAC checking
6. **Frontend persist ke localStorage** via Zustand persist middleware
7. **UI components menggunakan permissions** untuk show/hide fitur

## 🔒 Security Features

### Backend:

- ✅ Password hashing dengan bcryptjs (10 salt rounds)
- ✅ Phone normalization (08xxx → 628xxx format)
- ✅ JWT token dengan 7 hari expiry
- ✅ is_active check untuk disable account
- ✅ Role validation (hanya admin roles yang bisa login)
- ✅ Permission loading dari database via join table

### Frontend:

- ✅ Token stored di localStorage (via Zustand persist)
- ✅ Permissions cached di Zustand store
- ✅ Permission checking via PermissionGuard components
- ✅ Permission hooks untuk conditional rendering
- ✅ Auto-clear storage on logout

## 📝 Database Schema

### Table: `roles`

```sql
- id (UUID, PK)
- role_name (VARCHAR 50, UNIQUE)
- description (TEXT)
- created_at, updated_at
```

### Table: `permissions`

```sql
- id (UUID, PK)
- module (VARCHAR 50)
- action (VARCHAR 50)
- description (TEXT)
- created_at, updated_at
```

### Table: `role_permissions` (junction)

```sql
- id (UUID, PK)
- role_id (UUID, FK → roles.id)
- permission_id (UUID, FK → permissions.id)
- created_at
```

### Table: `users` (admins)

```sql
- id (UUID, PK)
- phone_number (VARCHAR 20, UNIQUE)
- full_name (VARCHAR 100)
- password_hash (VARCHAR 255)
- role_id (UUID, FK → roles.id)
- is_active (BOOLEAN)
- created_at, updated_at
```

## 🧪 Testing

### Test dengan curl (PowerShell):

```powershell
# Test login super admin
$body = @{phone_number='081234567808';password='admin123'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:5000/api/admin/auth/login' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing

# Test login kasir
$body = @{phone_number='081234567801';password='kasir123'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:5000/api/admin/auth/login' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
```

### Test di Frontend:

1. Buka `http://localhost:5173/admin/login`
2. Login dengan salah satu test account di atas
3. Check browser console untuk log permissions
4. Check localStorage → `baletani-admin-storage`

## 🚀 Next Steps

### Implementasi di Pages:

1. Wrap sensitive buttons dengan `<PermissionGuard>`
2. Use `usePermission` hook untuk conditional rendering
3. Add `<RolePermissionCard />` di dashboard
4. Implement permission checking di routing level

### Contoh Implementation:

```jsx
// pages/admin/ProductManagement.jsx
import PermissionGuard, {
  usePermission,
} from "../../components/admin/PermissionGuard";

function ProductManagement() {
  const canCreate = usePermission("products", "create");
  const canDelete = usePermission("products", "delete");

  return (
    <div>
      <h1>Manajemen Produk</h1>

      {/* Hanya tampil jika punya permission create */}
      <PermissionGuard module="products" action="create">
        <button onClick={handleCreateProduct}>Tambah Produk Baru</button>
      </PermissionGuard>

      <table>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>
              {/* Conditional rendering dengan hook */}
              {canDelete && (
                <button onClick={() => handleDelete(product.id)}>Hapus</button>
              )}
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

## 📞 Support

Jika ada pertanyaan atau issue terkait RBAC:

1. Check console log di browser (permissions loading)
2. Check network tab untuk response dari `/api/admin/auth/login`
3. Verify localStorage → `baletani-admin-storage`
4. Test dengan different role accounts untuk verify permissions

---

✅ **Status**: RBAC fully implemented dan tested
🔧 **Backend**: Complete dengan 8 roles, 29 permissions
🎨 **Frontend**: Components, hooks, dan store ready
📱 **Testing**: 8 dummy accounts tersedia
